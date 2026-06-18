import { flushPromises, mount } from '@vue/test-utils'
/**
 * useScrollProgress — composable behaviour tests, exercised through a tiny host.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useScrollProgress } from './useScrollProgress.ts'

function setScrollY(value: number): void {
  Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true })
}

function setWindowMetrics({ scrollHeight, innerHeight }: { scrollHeight: number, innerHeight: number }): void {
  Object.defineProperty(document.documentElement, 'scrollHeight', { value: scrollHeight, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: innerHeight, configurable: true })
}

const Host = defineComponent({
  props: {
    onChange: { type: Function, default: undefined },
  },
  setup(props) {
    const { progress } = useScrollProgress({
      onChange: props.onChange as ((value: number) => void) | undefined,
    })
    return { progress }
  },
  render() {
    return h('div', { 'data-progress': this.progress }, '')
  },
})

describe('useScrollProgress', () => {
  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    vi.stubGlobal('ResizeObserver', class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    })
    setScrollY(0)
    setWindowMetrics({ scrollHeight: 3000, innerHeight: 1000 })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('measures progress on mount', async () => {
    setScrollY(1000) // scrollable 2000 → 50%
    const wrapper = mount(Host)
    await flushPromises()
    expect(wrapper.attributes('data-progress')).toBe('50')
  })

  it('updates progress on scroll', async () => {
    const wrapper = mount(Host)
    expect(wrapper.attributes('data-progress')).toBe('0')
    setScrollY(500) // 25%
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(wrapper.attributes('data-progress')).toBe('25')
  })

  it('recomputes on window resize', async () => {
    setScrollY(1000)
    const wrapper = mount(Host)
    await flushPromises()
    expect(wrapper.attributes('data-progress')).toBe('50')
    // Grow the viewport so the same scrollTop is a larger fraction.
    setWindowMetrics({ scrollHeight: 3000, innerHeight: 2000 })
    window.dispatchEvent(new Event('resize'))
    await flushPromises()
    expect(wrapper.attributes('data-progress')).toBe('100')
  })

  it('fires onChange only when the value changes', async () => {
    const onChange = vi.fn()
    mount(Host, { props: { onChange } })
    onChange.mockClear()

    setScrollY(750)
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(37.5)

    // Same position again → no further emit.
    window.dispatchEvent(new Event('scroll'))
    await flushPromises()
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('cleans up listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const wrapper = mount(Host)
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })
})
