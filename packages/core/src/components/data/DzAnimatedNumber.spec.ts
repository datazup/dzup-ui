/**
 * DzAnimatedNumber — Unit / behavior tests.
 *
 * `requestAnimationFrame` and `performance.now` are stubbed so the tween can be
 * driven frame-by-frame deterministically.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DzAnimatedNumber from './DzAnimatedNumber.vue'
import { createEasing, formatNumber, interpolate, sampleTween } from './DzAnimatedNumber.tween.ts'

// ---------------------------------------------------------------------------
// rAF / clock harness
// ---------------------------------------------------------------------------

let rafCallback: FrameRequestCallback | null = null
let rafSeq = 0
const cancelSpy = vi.fn()
/** Fixed tween start time; frames are driven with absolute timestamps. */
const START = 1000

/** Invoke the most-recently-scheduled frame with an absolute timestamp. */
function frame(ts: number): void {
  const cb = rafCallback
  rafCallback = null
  cb?.(ts)
}

function setReducedMotion(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

beforeEach(() => {
  rafCallback = null
  rafSeq = 0
  cancelSpy.mockClear()
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafCallback = cb
    return ++rafSeq
  })
  vi.stubGlobal('cancelAnimationFrame', cancelSpy)
  vi.spyOn(performance, 'now').mockReturnValue(START)
  setReducedMotion(false)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function mountNumber(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzAnimatedNumber, {
    props: { value: 100, from: 0, duration: 100, startOnView: false, locale: 'en-US', ...props },
    ...options,
  })
}

const figureText = (w: ReturnType<typeof mountNumber>): string =>
  w.find('[aria-hidden="true"]').text()
const srText = (w: ReturnType<typeof mountNumber>): string =>
  w.find('[aria-live="polite"]').text()

// ---------------------------------------------------------------------------
// Pure tween helper
// ---------------------------------------------------------------------------

describe('tween helper', () => {
  it('interpolates linearly', () => {
    expect(interpolate(0, 100, 0)).toBe(0)
    expect(interpolate(0, 100, 0.5)).toBe(50)
    expect(interpolate(0, 100, 1)).toBe(100)
  })

  it('snaps to target for non-positive duration', () => {
    expect(sampleTween({ from: 0, to: 100, elapsed: 0, duration: 0 })).toEqual({
      value: 100,
      progress: 1,
      done: true,
    })
  })

  it('reports done once elapsed reaches duration', () => {
    const mid = sampleTween({ from: 0, to: 100, elapsed: 50, duration: 100, easing: 'linear' })
    expect(mid.done).toBe(false)
    expect(mid.value).toBeCloseTo(50)
    const end = sampleTween({ from: 0, to: 100, elapsed: 100, duration: 100 })
    expect(end).toEqual({ value: 100, progress: 1, done: true })
  })

  it('pins easing endpoints to 0 and 1', () => {
    for (const name of ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'bounce'] as const) {
      const ease = createEasing(name)
      expect(ease(0)).toBe(0)
      expect(ease(1)).toBe(1)
    }
  })

  it('formats via Intl and falls back gracefully', () => {
    expect(formatNumber(1234.5, { style: 'currency', currency: 'USD' }, 'en-US')).toBe('$1,234.50')
    // An invalid currency code throws inside Intl — helper falls back to String().
    expect(formatNumber(42, { style: 'currency', currency: 'NOPE' })).toBe('42')
  })
})

// ---------------------------------------------------------------------------
// Component behaviour
// ---------------------------------------------------------------------------

describe('dzAnimatedNumber', () => {
  it('animates from `from` to the target across frames', async () => {
    const wrapper = mountNumber({ value: 100, from: 0, easing: 'linear' })
    // onMounted started the tween from 0.
    expect(wrapper.emitted('start')).toHaveLength(1)

    frame(START) // elapsed 0
    await nextTick()
    expect(figureText(wrapper)).toBe('0')

    frame(START + 50) // elapsed 50 → halfway (linear)
    await nextTick()
    expect(figureText(wrapper)).toBe('50')

    frame(START + 100) // elapsed 100 → done
    await nextTick()
    expect(figureText(wrapper)).toBe('100')
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('rounds mid-tween frames to whole numbers when no format is given', async () => {
    const wrapper = mountNumber({ value: 10, from: 0, duration: 100, easing: 'linear' })
    frame(START) // elapsed 0 → 0
    frame(START + 33) // elapsed 33 → interpolate(0, 10, 0.33) = 3.3 → rounded to 3
    await nextTick()
    // Without rounding the default Intl formatter would render "3.3".
    expect(figureText(wrapper)).toBe('3')

    frame(START + 100) // settles exactly on the integer target
    await nextTick()
    expect(figureText(wrapper)).toBe('10')
  })

  it('keeps fractional frames when the format requests fraction digits', async () => {
    const wrapper = mountNumber({
      value: 10,
      from: 0,
      duration: 100,
      easing: 'linear',
      format: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
    })
    frame(START) // 0.0
    frame(START + 33) // 3.3 — fractional formatting preserved (not rounded to "3.0")
    await nextTick()
    expect(figureText(wrapper)).toBe('3.3')
  })

  it('formats every frame with the given Intl options', async () => {
    const wrapper = mountNumber({
      value: 1234,
      from: 0,
      format: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
    })
    frame(START + 100)
    await nextTick()
    expect(figureText(wrapper)).toContain('$1,234')
  })

  it('snaps to the final value under prefers-reduced-motion (no tween)', async () => {
    setReducedMotion(true)
    const wrapper = mountNumber({ value: 100, from: 0, duration: 1000 })
    await nextTick()
    expect(figureText(wrapper)).toContain('100')
    expect(wrapper.emitted('start')).toBeUndefined()
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('restarts cleanly from the current figure on a mid-flight value change', async () => {
    const wrapper = mountNumber({ value: 100, from: 0, easing: 'linear' })
    frame(START) // 0
    frame(START + 50) // ~50

    await wrapper.setProps({ value: 200 })
    await nextTick()
    // A new tween began (start emitted twice) and the previous frame was cancelled.
    expect(wrapper.emitted('start')).toHaveLength(2)
    expect(cancelSpy).toHaveBeenCalled()

    frame(START + 100) // drive the new tween to completion
    await nextTick()
    expect(figureText(wrapper)).toContain('200')
    // Only the second tween reached completion.
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('always announces the settled final value to screen readers', async () => {
    const wrapper = mountNumber({ value: 100, from: 0, ariaLabel: 'Revenue' })
    frame(START) // figure shows 0…
    await nextTick()
    expect(figureText(wrapper)).toBe('0')
    // …but the SR live region already reads the final, labelled value.
    expect(srText(wrapper)).toBe('Revenue: 100')
  })

  it('exposes displayValue and displayText via template ref', async () => {
    const wrapper = mountNumber({ value: 100, from: 0, easing: 'linear' })
    frame(START + 100)
    await nextTick()
    const vm = wrapper.vm as unknown as { displayValue: number, displayText: string }
    expect(vm.displayValue).toBe(100)
    expect(vm.displayText).toContain('100')
  })
})

// ---------------------------------------------------------------------------
// startOnView (IntersectionObserver)
// ---------------------------------------------------------------------------

describe('dzAnimatedNumber — startOnView', () => {
  let ioCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null
  const observeSpy = vi.fn()
  const disconnectSpy = vi.fn()

  class IOStub {
    constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
      ioCallback = cb
    }

    observe = observeSpy
    disconnect = disconnectSpy
    unobserve(): void {}
    takeRecords(): [] { return [] }
  }

  beforeEach(() => {
    ioCallback = null
    observeSpy.mockClear()
    disconnectSpy.mockClear()
    vi.stubGlobal('IntersectionObserver', IOStub)
  })

  function intersect(isIntersecting: boolean): void {
    ioCallback?.([{ isIntersecting }])
  }

  it('holds at `from` until scrolled into view, then animates', async () => {
    const wrapper = mountNumber({ value: 100, from: 0, easing: 'linear', startOnView: true })
    // Observing, not yet animating.
    expect(observeSpy).toHaveBeenCalled()
    expect(wrapper.emitted('start')).toBeUndefined()
    expect(figureText(wrapper)).toContain('0')

    intersect(true)
    await nextTick()
    expect(wrapper.emitted('start')).toHaveLength(1)
    expect(disconnectSpy).toHaveBeenCalled() // observer released after first trigger

    frame(START + 100)
    await nextTick()
    expect(figureText(wrapper)).toContain('100')
  })

  it('ignores non-intersecting entries', async () => {
    const wrapper = mountNumber({ value: 100, from: 0, startOnView: true })
    intersect(false)
    await nextTick()
    expect(wrapper.emitted('start')).toBeUndefined()
  })

  it('disconnects the observer on unmount', () => {
    const wrapper = mountNumber({ value: 100, startOnView: true })
    disconnectSpy.mockClear()
    wrapper.unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })
})
