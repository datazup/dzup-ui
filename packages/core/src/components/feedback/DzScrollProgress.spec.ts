import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzScrollProgress — Unit / behavior tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzScrollProgress from './DzScrollProgress.vue'

/** Set the window's vertical scroll offset for the duration of a test. */
function setScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true })
}

/** Mock the window scroll metrics so a deterministic percentage can be computed. */
function setWindowMetrics({ scrollHeight, innerHeight }: { scrollHeight: number, innerHeight: number }): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', { value: scrollHeight, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true })
}

describe('dzScrollProgress', () => {
  beforeEach(() => {
    // Run rAF callbacks synchronously so scroll handling resolves in tests.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    // jsdom has no ResizeObserver — provide a no-op so attach() doesn't throw.
    vi.stubGlobal('ResizeObserver', class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    })
    setScrollY(0)
    setWindowMetrics({ scrollHeight: 2000, innerHeight: 1000 })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts at 0% when not scrolled', () => {
    const wrapper = mount(DzScrollProgress)
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
  })

  it('computes percentage from scroll metrics', async () => {
    // scrollable = 2000 - 1000 = 1000; scrollTop 500 → 50%
    const wrapper = mount(DzScrollProgress)
    setScrollY(500)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.attributes('aria-valuenow')).toBe('50')
  })

  it('clamps the value to 100 when scrolled past the bottom', async () => {
    const wrapper = mount(DzScrollProgress)
    setScrollY(99999)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.attributes('aria-valuenow')).toBe('100')
  })

  it('clamps the value to 0 for negative scroll positions', async () => {
    const wrapper = mount(DzScrollProgress)
    setScrollY(-200)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
  })

  it('reports 0% when there is nothing to scroll', async () => {
    setWindowMetrics({ scrollHeight: 800, innerHeight: 1000 })
    const wrapper = mount(DzScrollProgress)
    setScrollY(0)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
  })

  it('emits change with the new value when scrolling', async () => {
    const wrapper = mount(DzScrollProgress)
    setScrollY(250)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    const events = wrapper.emitted('change')
    expect(events).toBeTruthy()
    expect(events?.at(-1)?.[0]).toBe(25)
  })

  it('drives the bar fill width from the percentage', async () => {
    const wrapper = mount(DzScrollProgress, { props: { variant: 'bar' } })
    setScrollY(500)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    const fill = wrapper.find('[data-component] > div')
    expect(fill.attributes('style')).toContain('width: 50%')
  })

  it('renders both edge positions', () => {
    const top = mount(DzScrollProgress, { props: { position: 'top' } })
    const bottom = mount(DzScrollProgress, { props: { position: 'bottom' } })
    expect(top.attributes('class')).toContain('top-0')
    expect(bottom.attributes('class')).toContain('bottom-0')
  })

  it('applies a custom thickness to the bar via inline token', () => {
    const wrapper = mount(DzScrollProgress, { props: { thickness: 6 } })
    expect(wrapper.attributes('style')).toContain('--dz-scroll-progress-height: 6px')
  })

  it('removes its scroll listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(DzScrollProgress)
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    removeSpy.mockRestore()
  })
})
