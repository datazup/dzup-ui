/**
 * useParallax + DzParallax — the depth-field input primitive and its layer
 * stage (docs/landing-v2.md TASK-LV2-02).
 *
 * Same testing boundary as `directives/directives.spec.ts`, and for the same
 * structural reason: the composable gates on
 * `matchMedia('(hover: hover) and (pointer: fine)')` and
 * `(prefers-reduced-motion: reduce)`, so a blanket `matches: false` stub would
 * silently disable it and every assertion downstream of `attach()` would be
 * vacuous. `stubMedia()` answers per query; rects are stubbed because jsdom has
 * no layout; rAF is captured so the one-write-per-frame collapse is the thing
 * actually asserted, not assumed.
 */

import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import DzParallax from './components/DzParallax.vue'
import { useParallax } from './useParallax.ts'

function stubMedia({ reduced = false, hover = true } = {}): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : hover,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
}

/** Capture rAF callbacks so tests drive frames explicitly. */
function stubFrames(): { flush: () => void, pending: () => number } {
  const frames: FrameRequestCallback[] = []
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
  vi.stubGlobal('cancelAnimationFrame', () => {})
  return {
    flush: () => {
      const batch = frames.splice(0)
      batch.forEach(cb => cb(0))
    },
    pending: () => frames.length,
  }
}

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

function move(el: EventTarget, clientX: number, clientY: number): void {
  el.dispatchEvent(new MouseEvent('pointermove', { clientX, clientY, bubbles: true }))
}

/** Mount a host that runs useParallax on its own element. */
function mountParallax(options: Parameters<typeof useParallax>[1] = {}) {
  let handle!: ReturnType<typeof useParallax>
  const wrapper = mount(defineComponent({
    setup() {
      const host = ref<HTMLElement | null>(null)
      handle = useParallax(host, options)
      return () => h('div', { ref: host })
    },
  }))
  return { wrapper, handle, el: wrapper.element as HTMLElement }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useParallax', () => {
  it('normalises the pointer to -1..1 across the host box', async () => {
    stubMedia()
    const frames = stubFrames()
    const { handle, el } = mountParallax()
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 0) // right edge, top edge
    frames.flush()
    expect(handle.x.value).toBe(1)
    expect(handle.y.value).toBe(-1)

    move(el, 100, 50) // dead centre
    frames.flush()
    expect(handle.x.value).toBe(0)
    expect(handle.y.value).toBe(0)
  })

  it('clamps pointers outside the box to the -1..1 range', async () => {
    stubMedia()
    const frames = stubFrames()
    const { handle, el } = mountParallax()
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 1000, -400)
    frames.flush()
    expect(handle.x.value).toBe(1)
    expect(handle.y.value).toBe(-1)
  })

  it('collapses any number of pointer events into one write per frame', async () => {
    stubMedia()
    const frames = stubFrames()
    const { handle, el } = mountParallax()
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 20, 20)
    move(el, 60, 60)
    move(el, 150, 75)
    expect(frames.pending()).toBe(1)
    frames.flush()
    // Only the LAST position survives the frame.
    expect(handle.x.value).toBe(0.5)
    expect(handle.y.value).toBe(0.5)
  })

  it('returns to rest on pointerleave', async () => {
    stubMedia()
    const frames = stubFrames()
    const { handle, el } = mountParallax()
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 100)
    frames.flush()
    expect(handle.x.value).toBe(1)

    el.dispatchEvent(new Event('pointerleave'))
    frames.flush()
    expect(handle.x.value).toBe(0)
    expect(handle.y.value).toBe(0)
  })

  it('never attaches under OS reduced motion', async () => {
    stubMedia({ reduced: true })
    const frames = stubFrames()
    const { handle, el } = mountParallax()
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 100)
    expect(frames.pending()).toBe(0)
    expect(handle.x.value).toBe(0)
  })

  it('never attaches on a coarse-pointer (touch) device', async () => {
    stubMedia({ hover: false })
    const frames = stubFrames()
    const { handle, el } = mountParallax()
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 100)
    expect(frames.pending()).toBe(0)
    expect(handle.x.value).toBe(0)
  })

  it('detaches and resets when the reactive disabled option turns on', async () => {
    stubMedia()
    const frames = stubFrames()
    const off = ref(false)
    const { handle, el } = mountParallax({ disabled: off })
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 100)
    frames.flush()
    expect(handle.x.value).toBe(1)

    off.value = true
    await nextTick()
    expect(handle.x.value).toBe(0)
    move(el, 200, 100)
    expect(frames.pending()).toBe(0)

    // ...and re-attaches when it turns back off.
    off.value = false
    await nextTick()
    move(el, 200, 100)
    frames.flush()
    expect(handle.x.value).toBe(1)
  })

  it('removes its listeners on unmount', async () => {
    stubMedia()
    stubFrames()
    const { wrapper, el } = mountParallax()
    const removed = vi.spyOn(el, 'removeEventListener')
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    wrapper.unmount()
    const events = removed.mock.calls.map(call => call[0])
    expect(events).toContain('pointermove')
    expect(events).toContain('pointerleave')
  })

  it('normalises against the viewport when source is "viewport"', async () => {
    stubMedia()
    const frames = stubFrames()
    vi.stubGlobal('innerWidth', 1000)
    vi.stubGlobal('innerHeight', 500)
    let handle!: ReturnType<typeof useParallax>
    mount(defineComponent({
      setup() {
        const host = ref<HTMLElement | null>(null)
        handle = useParallax(host, { source: 'viewport' })
        return () => h('div', { ref: host })
      },
    }))
    await nextTick()

    move(window, 1000, 0)
    frames.flush()
    expect(handle.x.value).toBe(1)
    expect(handle.y.value).toBe(-1)
  })
})

describe('dzParallax', () => {
  it('is aria-hidden — the decoration-only contract', () => {
    stubMedia()
    stubFrames()
    const wrapper = mount(DzParallax)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.classes()).toContain('dz-parallax')
  })

  it('exposes the pointer position to CSS as unitless custom properties', async () => {
    stubMedia()
    const frames = stubFrames()
    const wrapper = mount(DzParallax)
    const el = wrapper.element as HTMLElement
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 100)
    frames.flush()
    await nextTick()
    expect(el.style.getPropertyValue('--dz-parallax-x')).toBe('1')
    expect(el.style.getPropertyValue('--dz-parallax-y')).toBe('1')
  })

  it('writes nothing under reduced motion — layers stay at rest', async () => {
    stubMedia({ reduced: true })
    stubFrames()
    const wrapper = mount(DzParallax)
    const el = wrapper.element as HTMLElement
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 100)
    await nextTick()
    expect(el.style.getPropertyValue('--dz-parallax-x')).toBe('')
  })

  it('stops responding when :disabled turns on (page-level toggle)', async () => {
    stubMedia()
    const frames = stubFrames()
    const wrapper = mount(DzParallax, { props: { disabled: false } })
    const el = wrapper.element as HTMLElement
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })
    await nextTick()

    move(el, 200, 100)
    frames.flush()
    await nextTick()
    expect(el.style.getPropertyValue('--dz-parallax-x')).toBe('1')

    await wrapper.setProps({ disabled: true })
    await nextTick()
    expect(el.style.getPropertyValue('--dz-parallax-x')).toBe('0')
  })
})
