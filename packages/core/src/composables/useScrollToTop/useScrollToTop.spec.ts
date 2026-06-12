import { flushPromises, mount } from '@vue/test-utils'
/**
 * useScrollToTop — composable behaviour tests, exercised through a tiny host.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useScrollToTop } from './useScrollToTop.ts'

function setScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true })
}

const Host = defineComponent({
  props: {
    visibilityHeight: { type: Number, default: 400 },
    duration: { type: Number, default: 400 },
  },
  setup(props) {
    const { visible, scrollToTop } = useScrollToTop({
      visibilityHeight: () => props.visibilityHeight,
      duration: () => props.duration,
    })
    return { visible, scrollToTop }
  },
  render() {
    return h('button', { 'data-visible': this.visible, 'onClick': this.scrollToTop }, 'top')
  },
})

describe('useScrollToTop', () => {
  beforeEach(() => {
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

  it('starts not visible below the threshold', () => {
    const wrapper = mount(Host)
    expect(wrapper.element.getAttribute('data-visible')).toBe('false')
  })

  it('flips visible once scrolled past the threshold', async () => {
    const wrapper = mount(Host, { props: { visibilityHeight: 300 } })
    setScrollY(350)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.element.getAttribute('data-visible')).toBe('true')
  })

  it('jumps to the top instantly when duration is 0', async () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo
    setScrollY(800)
    const wrapper = mount(Host, { props: { duration: 0 } })
    await wrapper.trigger('click')
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('does nothing when already at the top', async () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo
    setScrollY(0)
    const wrapper = mount(Host, { props: { duration: 0 } })
    await wrapper.trigger('click')
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('removes scroll listeners on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(Host)
    wrapper.unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
