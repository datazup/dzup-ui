import type { UseLazyMountOptions } from './useLazyMount.ts'
import { mount } from '@vue/test-utils'
/**
 * useLazyMount — viewport-gated mount gate (docs/blocks.md §1.3, Task E5).
 *
 * Covers the three render paths the gallery relies on: the lazy happy path
 * (skeleton until the element nears the viewport, then mount + stop observing),
 * the `eager` deep-link override, and the no-IntersectionObserver fallback —
 * the last two must NEVER withhold content.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { useLazyMount } from './useLazyMount.ts'

/** A controllable IntersectionObserver fake: tests drive `trigger()` manually. */
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = []
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(public cb: (entries: { isIntersecting: boolean }[]) => void) {
    FakeIntersectionObserver.instances.push(this)
  }

  trigger(isIntersecting: boolean): void {
    this.cb([{ isIntersecting }])
  }
}

/** Mount a host component that wires the composable to a gated <div>. */
function mountHost(options?: UseLazyMountOptions) {
  const host = defineComponent({
    setup() {
      const { setEl, shouldRender } = useLazyMount(options)
      return { setEl, shouldRender }
    },
    render() {
      return h('div', { ref: this.setEl }, this.shouldRender ? 'live' : 'skeleton')
    },
  })
  return mount(host)
}

describe('useLazyMount', () => {
  beforeEach(() => {
    FakeIntersectionObserver.instances = []
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stays a placeholder until the element nears the viewport, then mounts once', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const wrapper = mountHost({ rootMargin: '100px' })
    await nextTick()

    expect(wrapper.text()).toBe('skeleton')
    const io = FakeIntersectionObserver.instances[0]!
    expect(io.observe).toHaveBeenCalledTimes(1)

    io.trigger(true)
    await nextTick()

    expect(wrapper.text()).toBe('live')
    // Mounted-and-done: it disconnects so it never flips back or leaks.
    expect(io.disconnect).toHaveBeenCalled()
  })

  it('ignores non-intersecting entries (does not mount early)', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const wrapper = mountHost()
    await nextTick()

    FakeIntersectionObserver.instances[0]!.trigger(false)
    await nextTick()

    expect(wrapper.text()).toBe('skeleton')
  })

  it('renders immediately when eager (deep-link / palette target)', async () => {
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
    const wrapper = mountHost({ eager: true })
    await nextTick()

    expect(wrapper.text()).toBe('live')
    // Eager skips observation entirely.
    expect(FakeIntersectionObserver.instances).toHaveLength(0)
  })

  it('renders immediately when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const wrapper = mountHost()
    await nextTick()

    expect(wrapper.text()).toBe('live')
  })
})
