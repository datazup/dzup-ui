/**
 * useIntersection — observer lifecycle tests with a recording
 * IntersectionObserver double (UI-DZUP-UI-CODE-M-02).
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { useIntersection } from './useIntersection.ts'

class FakeObserver {
  static instances: FakeObserver[] = []
  readonly observed: Element[] = []
  disconnected = false

  constructor(
    readonly callback: IntersectionObserverCallback,
    readonly init: IntersectionObserverInit = {},
  ) {
    FakeObserver.instances.push(this)
  }

  observe(el: Element): void {
    this.observed.push(el)
  }

  disconnect(): void {
    this.disconnected = true
  }

  unobserve(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  /** Deliver one entry for the first observed element. */
  fire(isIntersecting: boolean): void {
    const entry = { isIntersecting, target: this.observed[0] } as IntersectionObserverEntry
    this.callback([entry], this as unknown as IntersectionObserver)
  }
}

function live(): FakeObserver[] {
  return FakeObserver.instances.filter(o => !o.disconnected)
}

describe('useIntersection', () => {
  beforeEach(() => {
    FakeObserver.instances = []
    vi.stubGlobal('IntersectionObserver', FakeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function mountHost(opts: { once?: boolean } = {}) {
    const first = document.createElement('div')
    const second = document.createElement('div')
    const target = shallowRef<Element | null>(first)
    const root = shallowRef<Element | null>(null)
    const rootMargin = ref('0px')
    const onChange = vi.fn()
    let api!: ReturnType<typeof useIntersection>
    const Host = defineComponent({
      setup() {
        api = useIntersection({ target, root, rootMargin, once: ref(opts.once ?? false), onChange })
        return () => h('div')
      },
    })
    const wrapper = mount(Host)
    return { wrapper, first, second, target, root, rootMargin, onChange, api: () => api }
  }

  it('observes the target on mount', () => {
    const { first, api } = mountHost()
    expect(api().isSupported).toBe(true)
    expect(live()).toHaveLength(1)
    expect(live()[0]!.observed).toEqual([first])
  })

  it('disconnects the observer on unmount', () => {
    const { wrapper } = mountHost()
    const observer = live()[0]!
    wrapper.unmount()
    expect(observer.disconnected).toBe(true)
    expect(live()).toHaveLength(0)
  })

  it('disconnects the old observer and observes the new element on target swap', async () => {
    const { second, target } = mountHost()
    const original = live()[0]!
    target.value = second
    await nextTick()
    expect(original.disconnected).toBe(true)
    expect(live()).toHaveLength(1)
    expect(live()[0]!.observed).toEqual([second])
  })

  it('disconnects and resets state when the target is cleared', async () => {
    const { target, api } = mountHost()
    live()[0]!.fire(true)
    expect(api().isIntersecting.value).toBe(true)
    target.value = null
    await nextTick()
    expect(live()).toHaveLength(0)
    expect(api().isIntersecting.value).toBe(false)
  })

  it('reconnects when the root or observer options change', async () => {
    const { root, rootMargin } = mountHost()
    const scroller = document.createElement('div')
    root.value = scroller
    await nextTick()
    expect(live()).toHaveLength(1)
    expect(live()[0]!.init.root).toBe(scroller)

    rootMargin.value = '10px'
    await nextTick()
    expect(live()).toHaveLength(1)
    expect(live()[0]!.init.rootMargin).toBe('10px')
    expect(FakeObserver.instances).toHaveLength(3)
  })

  it('reports changes and disconnects after the first hit with once', () => {
    const { onChange, api } = mountHost({ once: true })
    const observer = live()[0]!
    observer.fire(false)
    expect(onChange).toHaveBeenLastCalledWith(false, expect.anything())
    expect(observer.disconnected).toBe(false)
    observer.fire(true)
    expect(onChange).toHaveBeenLastCalledWith(true, expect.anything())
    expect(api().isIntersecting.value).toBe(true)
    expect(observer.disconnected).toBe(true)
  })
})
