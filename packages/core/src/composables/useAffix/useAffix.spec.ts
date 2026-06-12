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
})
