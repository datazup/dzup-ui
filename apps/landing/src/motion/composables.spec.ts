/**
 * The motion layer's scroll/timeline composables and its capability detectors
 * (TASK-FREE3-12).
 *
 * `useScrollProgress`, `useSticky`, `useTextDecode` and `useViewTransition` are
 * pure logic behind a thin DOM surface — normalising a scroll position to 0→1,
 * scrambling a string, deciding whether the platform can cross-fade — and every
 * one of them shipped with its edge paths unexecuted. The detectors are the
 * sharpest case: `startViewTransition` is the ONLY thing standing between the
 * theme switch and a browser that has no View Transitions API, and its fallback
 * branch (the one that must still run the DOM update) had never been taken in a
 * test.
 *
 * jsdom provides neither layout nor the View Transitions API, so this suite
 * supplies both: rects are stubbed on the element under test, and
 * `document.startViewTransition` / `CSS.supports` are stubbed per test. That
 * boundary is deliberate — the arithmetic and the branch selection are the units
 * here; the browser's animation is not, and pretending otherwise is what the
 * task's honesty rule warns about.
 */

import type { Ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { enterStyle } from './useEnter.ts'
import { useScrollProgress } from './useScrollProgress.ts'
import { useSticky } from './useSticky.ts'
import { useTextDecode } from './useTextDecode.ts'
import {
  startViewTransition,
  supportsInterpolateSize,
  supportsPopover,
  supportsScrollTimeline,
  supportsStartingStyle,
  supportsViewTransitions,
} from './useViewTransition.ts'

/** Give an element a real box — jsdom's own rect is all zeros. */
function stubRect(el: Element, rect: { left: number, top: number, width: number, height: number }): void {
  el.getBoundingClientRect = () => ({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => rect,
  }) as DOMRect
}

/**
 * Mount a host that hands its own element to `composable` and exposes the
 * resulting progress ref. Both composables read the element through a template
 * ref and start observing in `onMounted`, so they can only be driven mounted.
 */
function mountProgress(composable: (el: Ref<HTMLElement | null>) => Ref<number>) {
  const progress = ref(0)
  const target = ref<HTMLElement | null>(null)
  const wrapper = mount(defineComponent({
    setup() {
      const el = ref<HTMLElement | null>(null)
      const value = composable(el)
      // Republish outward so the test can read both without a wrapper API.
      return () => {
        target.value = el.value
        progress.value = value.value
        return h('div', { ref: el })
      }
    },
  }))
  return { wrapper, progress, el: wrapper.element as HTMLElement }
}

let frames: FrameRequestCallback[] = []

/** Run the frames a scroll event scheduled (both composables are rAF-throttled). */
function flushFrames(): void {
  const pending = frames
  frames = []
  for (const cb of pending) cb(0)
}

beforeEach(() => {
  frames = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = []
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useScrollProgress', () => {
  it('clamps to [0, 1] and tracks the element through the viewport', async () => {
    vi.stubGlobal('innerHeight', 1000)
    const { wrapper, progress, el } = mountProgress(useScrollProgress)

    stubRect(el, { left: 0, top: 1200, width: 100, height: 200 })
    window.dispatchEvent(new Event('scroll'))
    flushFrames()
    await nextTick()
    expect(progress.value).toBe(0)

    stubRect(el, { left: 0, top: 400, width: 100, height: 200 })
    window.dispatchEvent(new Event('scroll'))
    flushFrames()
    await nextTick()
    // (1000 - 400) / (1000 + 200) = 0.5
    expect(progress.value).toBeCloseTo(0.5, 5)

    stubRect(el, { left: 0, top: -900, width: 100, height: 200 })
    window.dispatchEvent(new Event('scroll'))
    flushFrames()
    await nextTick()
    expect(progress.value).toBe(1)

    wrapper.unmount()
    // Unmounted means unlistened: a scroll after teardown must schedule nothing.
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(0)
  })

  it('coalesces a burst of scrolls into a single frame', async () => {
    vi.stubGlobal('innerHeight', 1000)
    const { wrapper, el } = mountProgress(useScrollProgress)
    stubRect(el, { left: 0, top: 500, width: 100, height: 100 })

    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    // One frame for three events — the throttle that keeps a parallax off the
    // main-thread budget.
    expect(frames).toHaveLength(1)

    flushFrames()
    await nextTick()
    wrapper.unmount()
  })
})

describe('useSticky', () => {
  it('reports how far its own scroller has travelled, clamped', async () => {
    const { wrapper, progress, el } = mountProgress(useSticky)
    Object.defineProperty(el, 'scrollHeight', { value: 1000, configurable: true })
    Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true })

    el.scrollTop = 250
    el.dispatchEvent(new Event('scroll'))
    flushFrames()
    await nextTick()
    expect(progress.value).toBeCloseTo(0.5, 5)

    // Past the end (elastic overscroll) clamps rather than exceeding 1.
    el.scrollTop = 900
    el.dispatchEvent(new Event('scroll'))
    flushFrames()
    await nextTick()
    expect(progress.value).toBe(1)

    wrapper.unmount()
  })

  it('reports 0 when the container does not overflow at all', async () => {
    const { wrapper, progress, el } = mountProgress(useSticky)
    // Nothing to scroll: max = 0 would divide by zero.
    Object.defineProperty(el, 'scrollHeight', { value: 400, configurable: true })
    Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true })

    el.scrollTop = 0
    el.dispatchEvent(new Event('scroll'))
    flushFrames()
    await nextTick()
    expect(progress.value).toBe(0)
    wrapper.unmount()
  })
})

describe('useTextDecode', () => {
  it('resolves left-to-right and preserves whitespace throughout', () => {
    vi.useFakeTimers()
    const host = mount(defineComponent({
      setup() {
        const decode = useTextDecode('ab cd', { frameMs: 10, framesPerChar: 1, charset: 'X' })
        return { decode, render: () => h('div') }
      },
      render: () => h('div'),
    }))
    const { display, run, resolve } = host.vm.decode as ReturnType<typeof useTextDecode>

    run()
    // Frame 0: everything scrambled except the space — the word shape (and so
    // the box width) never changes, which is the no-layout-shift guarantee.
    expect(display.value).toBe('XX XX')

    vi.advanceTimersByTime(10)
    expect(display.value).toBe('aX XX')
    vi.advanceTimersByTime(10)
    expect(display.value).toBe('ab XX')
    vi.advanceTimersByTime(30)
    // Fully revealed, and the interval has stopped: no timer outlives the effect.
    expect(display.value).toBe('ab cd')
    expect(vi.getTimerCount()).toBe(0)

    run()
    expect(display.value).toBe('XX XX')
    // The reduced-motion path callers use instead of `run`.
    resolve()
    expect(display.value).toBe('ab cd')
    expect(vi.getTimerCount()).toBe(0)

    host.unmount()
  })

  it('stops its timer when the host unmounts', () => {
    vi.useFakeTimers()
    const host = mount(defineComponent({
      setup() {
        const decode = useTextDecode('hello', { frameMs: 10 })
        return { decode }
      },
      render: () => h('div'),
    }))
    ;(host.vm.decode as ReturnType<typeof useTextDecode>).run()
    expect(vi.getTimerCount()).toBe(1)

    host.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('enterStyle', () => {
  it('emits only the custom properties it was given, with sane units', () => {
    // Partial vectors must stay partial: each unset prop is left to the
    // orthogonal `.dz-fade-in` / `.dz-slide-in-from-*` utility that sets it.
    expect(enterStyle({ y: 12, opacity: 0 })).toEqual({
      '--dz-enter-y': '12px',
      '--dz-enter-opacity': '0',
    })
    expect(enterStyle()).toEqual({})
  })

  it('passes strings through verbatim so any CSS unit works', () => {
    expect(enterStyle({ x: '2rem', rotate: '0.25turn', scale: 0.95 })).toEqual({
      '--dz-enter-x': '2rem',
      '--dz-enter-rotate': '0.25turn',
      '--dz-enter-scale': '0.95',
    })
    // Numbers take the documented default unit: px for offsets, deg for rotate.
    expect(enterStyle({ x: -8, rotate: 4 })).toEqual({
      '--dz-enter-x': '-8px',
      '--dz-enter-rotate': '4deg',
    })
  })
})

describe('view-transition capability detectors', () => {
  it('reports the API as absent when the document has no startViewTransition', () => {
    expect(supportsViewTransitions()).toBe(false)
  })

  it('reports it present once the document exposes it', () => {
    ;(document as unknown as { startViewTransition?: unknown }).startViewTransition = () => ({
      updateCallbackDone: Promise.resolve(),
    })
    try {
      expect(supportsViewTransitions()).toBe(true)
    }
    finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
    }
  })

  it('asks CSS.supports for the CSS-level capabilities', () => {
    const supports = vi.fn((property: string) => property === 'transition-behavior')
    vi.stubGlobal('CSS', { supports })

    expect(supportsStartingStyle()).toBe(true)
    expect(supportsScrollTimeline()).toBe(false)
    expect(supportsInterpolateSize()).toBe(false)
    expect(supports).toHaveBeenCalledWith('animation-timeline', 'scroll()')
  })

  it('reports every CSS capability absent when CSS.supports is missing', () => {
    // Old engines / non-browser environments: the detectors must answer false,
    // never throw, because callers use them to pick a fallback path.
    vi.stubGlobal('CSS', undefined)
    expect(supportsStartingStyle()).toBe(false)
    expect(supportsScrollTimeline()).toBe(false)
    expect(supportsInterpolateSize()).toBe(false)
  })

  it('detects the popover API off HTMLElement.prototype', () => {
    // jsdom's support tracks the real platform here, so assert the detector
    // agrees with the environment rather than asserting a fixed answer.
    expect(supportsPopover()).toBe('popover' in HTMLElement.prototype)
  })
})

describe('startViewTransition', () => {
  it('still runs the update when the API is absent — content is never withheld', async () => {
    const update = vi.fn()
    await startViewTransition(update)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('skips the transition on request but keeps the update', async () => {
    // This is the reduced-motion path: the theme still swaps, it just does not
    // cross-fade.
    const start = vi.fn()
    ;(document as unknown as { startViewTransition?: unknown }).startViewTransition = start
    try {
      const update = vi.fn()
      await startViewTransition(update, { skip: true })
      expect(update).toHaveBeenCalledTimes(1)
      expect(start).not.toHaveBeenCalled()
    }
    finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
    }
  })

  it('routes the update through the API when it exists, and resolves on DOM update', async () => {
    let captured: (() => void | Promise<void>) | null = null
    let resolveDone: () => void = () => {}
    const done = new Promise<void>((resolve) => {
      resolveDone = resolve
    })
    ;(document as unknown as { startViewTransition?: unknown }).startViewTransition = (cb: () => void) => {
      captured = cb
      return { updateCallbackDone: done }
    }
    try {
      const update = vi.fn()
      const promise = startViewTransition(update)
      expect(captured).toBeTypeOf('function')
      captured!()
      expect(update).toHaveBeenCalledTimes(1)
      resolveDone()
      await expect(promise).resolves.toBeUndefined()
    }
    finally {
      delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
    }
  })
})
