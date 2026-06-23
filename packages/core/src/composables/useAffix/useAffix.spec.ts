import { flushPromises, mount } from '@vue/test-utils'
/**
 * useAffix — composable behaviour tests, exercised through a tiny host.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useAffix } from './useAffix.ts'

let rect: Partial<DOMRect>

const Host = defineComponent({
  props: {
    offsetTop: { type: Number, default: undefined },
    offsetBottom: { type: Number, default: undefined },
    onAffixChange: { type: Function, default: undefined },
  },
  setup(props) {
    const { affixed, setRootRef, rootStyle, contentStyle } = useAffix({
      offsetTop: () => props.offsetTop,
      offsetBottom: () => props.offsetBottom,
      onChange: value => props.onAffixChange?.(value),
    })
    return { affixed, setRootRef, rootStyle, contentStyle }
  },
  render() {
    return h(
      'div',
      { 'ref': this.setRootRef, 'style': this.rootStyle, 'data-affixed': this.affixed },
      [h('div', { style: this.contentStyle }, 'content')],
    )
  },
})

describe('useAffix', () => {
  beforeEach(() => {
    rect = { top: 100, bottom: 150, left: 0, width: 120, height: 40 }
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function mountHost(props: Record<string, unknown> = {}) {
    const wrapper = mount(Host, { props, attachTo: document.body })
    ;(wrapper.element as HTMLElement).getBoundingClientRect = () => rect as DOMRect
    return wrapper
  }

  it('reports not-affixed by default', () => {
    const wrapper = mountHost({ offsetTop: 0 })
    expect(wrapper.element.getAttribute('data-affixed')).toBe('false')
  })

  it('invokes onChange exactly once per state transition', async () => {
    const onAffixChange = vi.fn()
    mountHost({ offsetTop: 0, onAffixChange })

    rect = { ...rect, top: -1 }
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()

    expect(onAffixChange).toHaveBeenCalledTimes(1)
    expect(onAffixChange).toHaveBeenLastCalledWith(true)
  })

  it('defaults to top pinning when no offset is provided', async () => {
    const wrapper = mountHost({})
    rect = { ...rect, top: -1 }
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.element.getAttribute('data-affixed')).toBe('true')
  })

  describe('nearest scrollable ancestor detection (no explicit target)', () => {
    /** Host that nests the affixed root inside a vertically scrollable panel. */
    const NestedHost = defineComponent({
      props: { onAffixChange: { type: Function, default: undefined } },
      setup(props) {
        const { affixed, setRootRef, rootStyle, contentStyle } = useAffix({
          offsetTop: () => 0,
          onChange: value => props.onAffixChange?.(value),
        })
        return { affixed, setRootRef, rootStyle, contentStyle }
      },
      render() {
        return h(
          'div',
          { 'class': 'scroller', 'style': 'overflow-y: auto', 'data-testid': 'scroller' },
          [
            h(
              'div',
              { 'ref': this.setRootRef, 'style': this.rootStyle, 'data-affixed': this.affixed },
              [h('div', { style: this.contentStyle }, 'content')],
            ),
          ],
        )
      },
    })

    /**
     * Make every element report a scrollable box so `findScrollableAncestor`
     * accepts the `overflow-y: auto` panel as the container. Scoped per-test
     * and restored in the returned cleanup.
     */
    function stubScrollMetrics(): () => void {
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        get: () => 1000,
      })
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        get: () => 200,
      })
      return () => {
        const proto = HTMLElement.prototype as unknown as Record<string, unknown>
        delete proto.scrollHeight
        delete proto.clientHeight
      }
    }

    it('pins against the scrollable panel rather than the window', async () => {
      const restore = stubScrollMetrics()
      const onAffixChange = vi.fn()
      try {
        const wrapper = mount(NestedHost, { props: { onAffixChange }, attachTo: document.body })
        const scroller = wrapper.element as HTMLElement
        const root = scroller.firstElementChild as HTMLElement

        scroller.getBoundingClientRect = () => ({ top: 0, bottom: 200 }) as DOMRect
        // Natural top scrolled above the panel's top edge → should pin.
        root.getBoundingClientRect = () =>
          ({ top: -10, bottom: 30, left: 0, width: 120, height: 40 }) as DOMRect

        // Scrolling the *panel* (not the window) must drive the affix.
        scroller.dispatchEvent(new Event('scroll'))
        await flushPromises()

        expect(wrapper.find('[data-affixed="true"]').exists()).toBe(true)
        expect(onAffixChange).toHaveBeenLastCalledWith(true)
        wrapper.unmount()
      }
      finally {
        restore()
      }
    })
  })
})
