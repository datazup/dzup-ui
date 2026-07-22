/**
 * The four motion directives — `v-tilt`, `v-glare`, `v-magnetic` and
 * `v-animate-on-scroll` (TASK-FREE3-12).
 *
 * These carry the landing's most consequential motion invariants — the
 * reduced-motion and touch gates, and "content is never left hidden" — and
 * before this suite not one of their handlers had ever run: `animateOnScroll.ts`
 * measured 0 of 8 functions, `tilt.ts` 7 of 14, all three pointer directives
 * attached to nothing.
 *
 * They were invisible to the gallery's demo suite for a structural reason worth
 * recording: every pointer directive gates on
 * `matchMedia('(hover: hover) and (pointer: fine)')`, and the gallery's jsdom
 * stub answers `matches: false` to every query. So the demos mount, the
 * directives correctly decline to attach on what looks like a touch device, and
 * nothing downstream of `attach()` is ever exercised. Testing them means driving
 * `matchMedia` per query — which is what `stubMedia()` below does.
 *
 * jsdom has no layout, so `getBoundingClientRect()` returns zeros; each test
 * that asserts on transform maths stubs a real rect on its host. That is honest:
 * the maths is the unit under test, the layout engine is not.
 */

import type { Directive } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { vAnimateOnScroll } from './animateOnScroll.ts'
import { vGlare } from './glare.ts'
import { vMagnetic } from './magnetic.ts'
import { vReveal } from './reveal.ts'
import { vTilt } from './tilt.ts'

/**
 * Answer `matchMedia` per query. The directives ask two questions — reduced
 * motion and hover capability — and their whole gate is which answers come back,
 * so a blanket `matches: false` stub (what the other landing suites install)
 * silently disables every one of them.
 */
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

/** A controllable IntersectionObserver: tests drive `trigger()` themselves. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
  constructor(public cb: (entries: { isIntersecting: boolean, target: Element }[]) => void) {
    FakeIntersectionObserver.instances.push(this)
  }

  trigger(target: Element, isIntersecting: boolean): void {
    this.cb([{ isIntersecting, target }])
  }
}

/** Give a host a real box — jsdom's own rect is all zeros. */
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

/** Mount a single `<div>` carrying `directive`, bound to a reactive value. */
function mountHost(name: string, directive: Directive, value?: unknown) {
  const bound = ref(value)
  const host = defineComponent({
    setup: () => () => h('div', { class: 'host' }),
    directives: { [name]: directive },
  })
  // `withDirectives` via the runtime-compiled template keeps the binding
  // reactive, so `updated()` — the reduced-motion toggle path — is reachable.
  const wrapper = mount(
    defineComponent({
      components: { Host: host },
      directives: { [name]: directive },
      setup: () => ({ bound }),
      template: `<div v-${name}="bound" class="host" />`,
    }),
  )
  return { wrapper, bound, el: wrapper.element as HTMLElement }
}

/**
 * A pointer move at (x, y), followed by the frame it scheduled — the directives
 * only write `transform` from inside the frame. `pointerType` defaults to a real
 * mouse; pass `'touch'` for the ignored-input path.
 */
function pointerMove(el: Element, x: number, y: number, pointerType = 'mouse'): void {
  const event = new Event('pointermove', { bubbles: true }) as PointerEvent & {
    clientX: number
    clientY: number
    pointerType: string
  }
  Object.assign(event, { clientX: x, clientY: y, pointerType })
  el.dispatchEvent(event)
  flushFrames()
}

/** Pending rAF callbacks, flushed explicitly by {@link flushFrames}. */
let frames: FrameRequestCallback[] = []

/**
 * Run the frames a pointer move scheduled.
 *
 * Deferred, not inline: all three pointer directives collapse a burst of moves
 * into one frame with `if (!state.frame) state.frame = requestAnimationFrame(…)`,
 * and `applyFrame` clears `state.frame` as its first act. A stub that invokes the
 * callback *before* returning the id would leave a stale non-zero id behind, and
 * every subsequent move in the test would be silently coalesced into a frame that
 * never comes — the tests would pass on the first assertion and lie on the rest.
 */
function flushFrames(): void {
  const pending = frames
  frames = []
  for (const cb of pending) cb(0)
}

beforeEach(() => {
  FakeIntersectionObserver.instances = []
  frames = []
  stubMedia()
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb))
  vi.stubGlobal('cancelAnimationFrame', () => {
    frames = []
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('v-tilt', () => {
  it('rotates toward the pointer, around the host centre', () => {
    const { el, wrapper } = mountHost('tilt', vTilt, { max: 10 })
    stubRect(el, { left: 0, top: 0, width: 200, height: 100 })

    // Pointer at the top-right corner: rotateX positive (leaning back from the
    // top edge), rotateY positive (turning toward the right edge).
    pointerMove(el, 200, 0)
    expect(el.style.transform).toBe('perspective(600px) rotateX(10deg) rotateY(10deg) scale(1)')

    // Dead centre is the neutral pose — no rotation on either axis.
    pointerMove(el, 100, 50)
    expect(el.style.transform).toBe('perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)')

    wrapper.unmount()
  })

  it('springs back to rest and drops the GPU hint on pointerleave', () => {
    const { el, wrapper } = mountHost('tilt', vTilt, {})
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 100, 100)
    expect(el.style.willChange).toBe('transform')

    el.dispatchEvent(new Event('pointerleave'))
    expect(el.style.transform).toBe('perspective(600px) rotateX(0deg) rotateY(0deg) scale(1)')
    // will-change is held until the spring-back transition finishes — an
    // always-on compositor layer is the perf bug this avoids.
    expect(el.style.willChange).toBe('transform')
    el.dispatchEvent(new Event('transitionend'))
    expect(el.style.willChange).toBe('')

    wrapper.unmount()
  })

  it('ignores touch pointers so a tap never tilts', () => {
    const { el, wrapper } = mountHost('tilt', vTilt, {})
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 100, 100, 'touch')
    expect(el.style.transform).toBe('')
    wrapper.unmount()
  })

  it('does not attach at all under reduced motion or on a touch device', () => {
    stubMedia({ reduced: true })
    const reducedHost = mountHost('tilt', vTilt, {})
    stubRect(reducedHost.el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(reducedHost.el, 100, 100)
    expect(reducedHost.el.style.transform).toBe('')
    reducedHost.wrapper.unmount()

    stubMedia({ hover: false })
    const touchHost = mountHost('tilt', vTilt, {})
    stubRect(touchHost.el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(touchHost.el, 100, 100)
    expect(touchHost.el.style.transform).toBe('')
    touchHost.wrapper.unmount()
  })

  it('detaches when the page-level toggle flips `disabled` on', async () => {
    // The gallery's "Reduce motion" switch drives this path, and it is the only
    // one that runs the directive's `updated()` hook.
    const { el, bound, wrapper } = mountHost('tilt', vTilt, { disabled: false })
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 100, 100)
    expect(el.style.transform).not.toBe('')

    bound.value = { disabled: true }
    await wrapper.vm.$nextTick()
    // Detach resets the host to its untilted box AND stops tracking.
    expect(el.style.transform).toBe('')
    pointerMove(el, 0, 0)
    expect(el.style.transform).toBe('')

    wrapper.unmount()
  })

  it('appends an aria-hidden glare overlay only when asked, and removes it on unmount', () => {
    const { el, wrapper } = mountHost('tilt', vTilt, { glare: true })
    const glare = el.querySelector('.dz-tilt__glare')
    expect(glare).toBeTruthy()
    // Decorative: it must never reach the accessibility tree.
    expect(glare!.getAttribute('aria-hidden')).toBe('true')

    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 50, 25)
    expect((glare as HTMLElement).style.getPropertyValue('--dz-tilt-glare-x')).toBe('50%')
    expect((glare as HTMLElement).style.getPropertyValue('--dz-tilt-glare-y')).toBe('25%')

    wrapper.unmount()
    expect(glare!.isConnected).toBe(false)
  })
})

describe('v-glare', () => {
  it('tracks the pointer as a percentage of the host box', () => {
    const { el, wrapper } = mountHost('glare', vGlare, undefined)
    const glare = el.querySelector('.dz-glare') as HTMLElement
    expect(glare).toBeTruthy()
    expect(glare.getAttribute('aria-hidden')).toBe('true')

    stubRect(el, { left: 100, top: 100, width: 200, height: 200 })
    pointerMove(el, 150, 200)
    expect(glare.classList.contains('dz-glare--active')).toBe(true)
    expect(glare.style.getPropertyValue('--dz-glare-x')).toBe('25.00%')
    expect(glare.style.getPropertyValue('--dz-glare-y')).toBe('50.00%')

    el.dispatchEvent(new Event('pointerleave'))
    expect(glare.classList.contains('dz-glare--active')).toBe(false)
    wrapper.unmount()
  })

  it('stays inert under reduced motion (no overlay is even created)', () => {
    stubMedia({ reduced: true })
    const { el, wrapper } = mountHost('glare', vGlare, undefined)
    expect(el.querySelector('.dz-glare')).toBeNull()
    wrapper.unmount()
  })

  it('ignores touch pointers', () => {
    const { el, wrapper } = mountHost('glare', vGlare, undefined)
    const glare = el.querySelector('.dz-glare') as HTMLElement
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 50, 50, 'touch')
    expect(glare.classList.contains('dz-glare--active')).toBe(false)
    wrapper.unmount()
  })

  it('drops a pending frame when the pointer leaves mid-move', () => {
    // Leave arriving between a move and its frame is the common case at speed:
    // the queued frame must be cancelled, not applied over the resting state.
    const { el, wrapper } = mountHost('glare', vGlare, undefined)
    const glare = el.querySelector('.dz-glare') as HTMLElement
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })

    const event = new Event('pointermove', { bubbles: true })
    Object.assign(event, { clientX: 90, clientY: 90, pointerType: 'mouse' })
    el.dispatchEvent(event) // deliberately NOT flushed
    el.dispatchEvent(new Event('pointerleave'))
    flushFrames()

    expect(glare.classList.contains('dz-glare--active')).toBe(false)
    expect(glare.style.getPropertyValue('--dz-glare-x')).toBe('')
    wrapper.unmount()
  })

  it('detaches when the page-level toggle flips `disabled` on', async () => {
    const { el, bound, wrapper } = mountHost('glare', vGlare, { disabled: false })
    const glare = el.querySelector('.dz-glare') as HTMLElement
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 50, 50)
    expect(glare.classList.contains('dz-glare--active')).toBe(true)

    bound.value = { disabled: true }
    await wrapper.vm.$nextTick()
    expect(glare.classList.contains('dz-glare--active')).toBe(false)
    pointerMove(el, 10, 10)
    expect(glare.classList.contains('dz-glare--active')).toBe(false)
    wrapper.unmount()
  })
})

describe('v-magnetic', () => {
  it('pulls toward the pointer, clamped to the radius', () => {
    const { el, wrapper } = mountHost('magnetic', vMagnetic, { strength: 0.5, radius: 10 })
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })

    // 10px right of centre × 0.5 strength = 5px, inside the radius.
    pointerMove(el, 60, 50)
    expect(el.style.transform).toBe('translate3d(5px, 0px, 0)')

    // 200px away × 0.5 = 100px, clamped to the 10px radius in both directions.
    pointerMove(el, 250, -150)
    expect(el.style.transform).toBe('translate3d(10px, -10px, 0)')

    wrapper.unmount()
  })

  it('returns to the exact rest position on leave', () => {
    const { el, wrapper } = mountHost('magnetic', vMagnetic, {})
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 90, 90)
    expect(el.style.willChange).toBe('transform')

    el.dispatchEvent(new Event('pointerleave'))
    expect(el.style.transform).toBe('translate3d(0, 0, 0)')
    el.dispatchEvent(new Event('transitionend'))
    expect(el.style.willChange).toBe('')
    wrapper.unmount()
  })

  it('does not attach under reduced motion', () => {
    stubMedia({ reduced: true })
    const { el, wrapper } = mountHost('magnetic', vMagnetic, {})
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 90, 90)
    expect(el.style.transform).toBe('')
    wrapper.unmount()
  })

  it('detaches — and un-translates — when `disabled` flips on', async () => {
    const { el, bound, wrapper } = mountHost('magnetic', vMagnetic, { disabled: false })
    stubRect(el, { left: 0, top: 0, width: 100, height: 100 })
    pointerMove(el, 90, 90)
    expect(el.style.transform).not.toBe('')

    bound.value = { disabled: true }
    await wrapper.vm.$nextTick()
    // The host must return to its real box: a magnet left mid-pull would leave
    // the click target offset from where it is painted.
    expect(el.style.transform).toBe('')
    pointerMove(el, 10, 10)
    expect(el.style.transform).toBe('')
    wrapper.unmount()
  })
})

describe('v-animate-on-scroll', () => {
  it('adds the entrance classes when the host intersects, then stops observing', () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const { el, wrapper } = mountHost('animate-on-scroll', vAnimateOnScroll, undefined)

    // Nothing before intersection — that is the whole point of a scroll reveal.
    expect(el.className).not.toContain('dz-animate-in')

    const io = FakeIntersectionObserver.instances.at(-1)!
    io.trigger(el, true)
    expect(el.className).toContain('dz-animate-in')
    expect(el.className).toContain('dz-fade-in')
    expect(el.style.willChange).toBe('opacity, transform')
    // `once` defaults true: revealed content is not re-animated on every pass.
    expect(io.unobserve).toHaveBeenCalledWith(el)

    el.dispatchEvent(new Event('animationend'))
    expect(el.style.willChange).toBe('')
    wrapper.unmount()
  })

  it('plays the leave animation on exit when `once` is false', () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    // A distinct threshold on purpose: observers are pooled per (root, threshold)
    // in MODULE state that outlives a test, so reusing the default 0.1 would hand
    // this test the previous test's observer and construct none of its own.
    const { el, wrapper } = mountHost('animate-on-scroll', vAnimateOnScroll, { once: false, threshold: 0.2 })
    const io = FakeIntersectionObserver.instances.at(-1)!

    io.trigger(el, true)
    expect(el.className).toContain('dz-animate-in')
    expect(io.unobserve).not.toHaveBeenCalled()

    io.trigger(el, false)
    expect(el.className).not.toContain('dz-animate-in')
    expect(el.className).toContain('dz-animate-out')
    wrapper.unmount()
  })

  it('shows the end state immediately under reduced motion, with no observer', () => {
    stubMedia({ reduced: true })
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const { el, wrapper } = mountHost('animate-on-scroll', vAnimateOnScroll, undefined)

    expect(el.className).toContain('dz-animate-in')
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
    wrapper.unmount()
  })

  it('reveals at once when IntersectionObserver is unavailable', () => {
    // The content-is-never-hidden guarantee: no observer must mean visible, not
    // permanently pre-animation.
    vi.stubGlobal('IntersectionObserver', undefined)
    const { el, wrapper } = mountHost('animate-on-scroll', vAnimateOnScroll, undefined)
    expect(el.className).toContain('dz-animate-in')
    wrapper.unmount()
  })

  it('honours a custom enter class and threshold', () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const { el, wrapper } = mountHost('animate-on-scroll', vAnimateOnScroll, {
      enterClass: 'dz-animate-in dz-zoom-in',
      threshold: 0.75,
    })
    FakeIntersectionObserver.instances.at(-1)!.trigger(el, true)
    expect(el.className).toContain('dz-zoom-in')
    expect(el.className).not.toContain('dz-fade-in')
    wrapper.unmount()
  })
})

describe('v-reveal', () => {
  it('starts hidden, reveals on intersect, and unobserves after', () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const { el, wrapper } = mountHost('reveal', vReveal, undefined)

    expect(el.classList.contains('dz-reveal')).toBe(true)
    expect(el.classList.contains('dz-reveal--in')).toBe(false)

    const io = FakeIntersectionObserver.instances.at(-1)!
    io.trigger(el, true)
    expect(el.classList.contains('dz-reveal--in')).toBe(true)
    expect(el.style.willChange).toBe('opacity, transform, filter')
    expect(io.unobserve).toHaveBeenCalledWith(el)

    el.dispatchEvent(new Event('transitionend'))
    expect(el.style.willChange).toBe('')
    wrapper.unmount()
  })

  it('reveals immediately when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { el, wrapper } = mountHost('reveal', vReveal, undefined)
    expect(el.classList.contains('dz-reveal--in')).toBe(true)
    wrapper.unmount()
  })
})
