import { flushPromises, mount } from '@vue/test-utils'
/**
 * DzBackTop — Unit / behavior tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzBackTop from './DzBackTop.vue'

/** Set the window's vertical scroll offset for the duration of a test. */
function setScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true })
}

describe('dzBackTop', () => {
  beforeEach(() => {
    // Run rAF callbacks synchronously so scroll handling resolves in tests.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    setScrollY(0)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is hidden and removed from the tab order before the threshold', () => {
    const wrapper = mount(DzBackTop, { props: { visibilityHeight: 400 } })
    const btn = wrapper.find('button')
    expect(btn.attributes('class')).toContain('opacity-0')
    expect(btn.attributes('class')).toContain('pointer-events-none')
    expect(btn.attributes('tabindex')).toBe('-1')
    expect(btn.attributes('aria-hidden')).toBe('true')
  })

  it('becomes visible after scrolling past visibilityHeight', async () => {
    const wrapper = mount(DzBackTop, { props: { visibilityHeight: 400 } })

    setScrollY(500)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()

    const btn = wrapper.find('button')
    expect(btn.attributes('class')).toContain('opacity-100')
    expect(btn.attributes('tabindex')).toBeUndefined()
    expect(btn.attributes('aria-hidden')).toBeUndefined()
  })

  it('respects a custom threshold', async () => {
    const wrapper = mount(DzBackTop, { props: { visibilityHeight: 200 } })

    setScrollY(250)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()

    expect(wrapper.find('button').attributes('class')).toContain('opacity-100')
  })

  it('scrolls the window to the top on click', async () => {
    const scrollTo = vi.fn()
    vi.stubGlobal('scrollTo', scrollTo)
    window.scrollTo = scrollTo
    setScrollY(500)

    // duration: 0 forces an instant jump (no animation frames needed).
    const wrapper = mount(DzBackTop, { props: { duration: 0 } })
    await wrapper.find('button').trigger('click')

    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('emits click when activated', async () => {
    const wrapper = mount(DzBackTop)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  /**
   * Repointed, not weakened (TASK-R5-O2). The inline inset was `right-` and is
   * now `inset-e-` — the same physical edge in a LTR document, the mirrored one
   * in an RTL document. `DzBackTop.anatomy.ts` declares `mirrors: 'layout'`,
   * which is what `validate:rtl` reads, and this assertion is the unit-level
   * half of the same promise: the button is pinned to the inline END, not to
   * the physical right. The assertion count and shape are unchanged.
   */
  it('is fixed-positioned to the bottom inline-end via tokens', () => {
    const wrapper = mount(DzBackTop)
    const cls = wrapper.find('button').attributes('class') ?? ''
    expect(cls).toContain('dz-back-top')
    expect(cls).toContain('fixed')
    expect(cls).toContain('bottom-[var(--dz-back-top-offset)]')
    expect(cls).toContain('inset-e-[var(--dz-back-top-offset)]')
    expect(cls).not.toContain('right-[var(--dz-back-top-offset)]')
  })
})
