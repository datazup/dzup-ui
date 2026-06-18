/**
 * useInfiniteScroll — Unit tests (mocked IntersectionObserver).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useInfiniteScroll } from './useInfiniteScroll.ts'

let ioCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null
let lastOptions: IntersectionObserverInit | undefined
const disconnectSpy = vi.fn()
const observeSpy = vi.fn()

class IOStub {
  constructor(
    cb: (entries: Array<{ isIntersecting: boolean }>) => void,
    options?: IntersectionObserverInit,
  ) {
    ioCallback = cb
    lastOptions = options
  }

  observe = observeSpy
  unobserve(): void {}
  disconnect = disconnectSpy
  takeRecords(): [] { return [] }
}

/** Simulate the sentinel entering / leaving view. */
function intersect(isIntersecting: boolean): void {
  ioCallback?.([{ isIntersecting }])
}

/** Mount a host that wires the composable to a sentinel and reactive guards. */
function mountScroll(initial: {
  loading?: boolean
  hasMore?: boolean
  disabled?: boolean
  distance?: number
  direction?: 'down' | 'up'
} = {}) {
  const loading = ref(initial.loading ?? false)
  const hasMore = ref(initial.hasMore ?? true)
  const disabled = ref(initial.disabled ?? false)
  const distance = ref(initial.distance ?? 0)
  const direction = ref<'down' | 'up'>(initial.direction ?? 'down')
  const onLoadMore = vi.fn()

  const Host = defineComponent({
    setup() {
      const target = ref<HTMLElement | null>(null)
      const api = useInfiniteScroll({
        target,
        loading,
        hasMore,
        disabled,
        distance,
        direction,
        onLoadMore,
      })
      return { target, api }
    },
    render() {
      return h('div', { ref: 'target' }, 'sentinel')
    },
  })

  const wrapper = mount(Host)
  return { wrapper, loading, hasMore, disabled, distance, direction, onLoadMore }
}

beforeEach(() => {
  ioCallback = null
  lastOptions = undefined
  disconnectSpy.mockClear()
  observeSpy.mockClear()
  vi.stubGlobal('IntersectionObserver', IOStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useInfiniteScroll', () => {
  it('observes the sentinel on mount', () => {
    mountScroll()
    expect(observeSpy).toHaveBeenCalledTimes(1)
  })

  it('fires load-more once when the sentinel enters view', () => {
    const { onLoadMore } = mountScroll()
    intersect(true)
    intersect(true)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('does not fire while loading is true', () => {
    const { onLoadMore } = mountScroll({ loading: true })
    intersect(true)
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('does not fire when hasMore is false', () => {
    const { onLoadMore } = mountScroll({ hasMore: false })
    intersect(true)
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('does not fire when disabled', () => {
    const { onLoadMore } = mountScroll({ disabled: true })
    intersect(true)
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('pages again after a loading cycle while still in view', async () => {
    const { onLoadMore, loading } = mountScroll()
    intersect(true)
    expect(onLoadMore).toHaveBeenCalledTimes(1)

    // Parent acknowledges and finishes the request.
    loading.value = true
    await nextTick()
    loading.value = false
    await nextTick()

    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it('re-arms after the sentinel leaves and re-enters view', () => {
    const { onLoadMore } = mountScroll()
    intersect(true)
    intersect(false)
    intersect(true)
    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it('retry() re-fires after a failed load (no loading cycle)', () => {
    const { onLoadMore, wrapper } = mountScroll()
    intersect(true)
    expect(onLoadMore).toHaveBeenCalledTimes(1)

    // Simulate a failure: loading never flipped, so the guard is still set.
    intersect(true)
    expect(onLoadMore).toHaveBeenCalledTimes(1)

    ;(wrapper.vm as unknown as { api: { retry: () => void } }).api.retry()
    expect(onLoadMore).toHaveBeenCalledTimes(2)
  })

  it('grows the bottom edge for direction "down"', () => {
    mountScroll({ distance: 200, direction: 'down' })
    expect(lastOptions?.rootMargin).toBe('0px 0px 200px 0px')
  })

  it('grows the top edge for direction "up"', async () => {
    const { direction, distance } = mountScroll({ distance: 0, direction: 'down' })
    direction.value = 'up'
    distance.value = 120
    await nextTick()
    expect(lastOptions?.rootMargin).toBe('120px 0px 0px 0px')
  })

  it('disconnects the observer on unmount', () => {
    const { wrapper } = mountScroll()
    disconnectSpy.mockClear()
    wrapper.unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })
})
