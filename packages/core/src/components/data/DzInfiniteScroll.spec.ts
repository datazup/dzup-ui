import { mount } from '@vue/test-utils'
/**
 * DzInfiniteScroll — Unit / behavior tests (mocked IntersectionObserver).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DzInfiniteScroll from './DzInfiniteScroll.vue'

let ioCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null
const disconnectSpy = vi.fn()

class IOStub {
  constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
    ioCallback = cb
  }

  observe(): void {}
  unobserve(): void {}
  disconnect = disconnectSpy
  takeRecords(): [] { return [] }
}

/** Simulate the sentinel entering / leaving view. */
function intersect(isIntersecting: boolean): void {
  ioCallback?.([{ isIntersecting }])
}

function mountScroll(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return mount(DzInfiniteScroll, {
    props,
    slots: { default: '<ul class="items"><li>Row</li></ul>', ...slots },
  })
}

beforeEach(() => {
  ioCallback = null
  disconnectSpy.mockClear()
  vi.stubGlobal('IntersectionObserver', IOStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('dzInfiniteScroll', () => {
  it('emits load-more once when the sentinel enters view', () => {
    const wrapper = mountScroll()
    intersect(true)
    intersect(true)
    expect(wrapper.emitted('load-more')).toHaveLength(1)
  })

  it('does not emit while loading', () => {
    const wrapper = mountScroll({ loading: true })
    intersect(true)
    expect(wrapper.emitted('load-more')).toBeUndefined()
  })

  it('does not emit when hasMore is false', () => {
    const wrapper = mountScroll({ hasMore: false })
    intersect(true)
    expect(wrapper.emitted('load-more')).toBeUndefined()
  })

  it('does not emit when disabled', () => {
    const wrapper = mountScroll({ disabled: true })
    intersect(true)
    expect(wrapper.emitted('load-more')).toBeUndefined()
  })

  it('does not render the sentinel once hasMore is false', () => {
    const wrapper = mountScroll({ hasMore: false })
    expect(wrapper.find('.dz-infinite-scroll-sentinel').exists()).toBe(false)
  })

  it('renders the sentinel while more items remain', () => {
    const wrapper = mountScroll({ hasMore: true })
    expect(wrapper.find('.dz-infinite-scroll-sentinel').exists()).toBe(true)
  })

  it('shows the default end state when exhausted', () => {
    const wrapper = mountScroll({ hasMore: false })
    expect(wrapper.text()).toContain('reached the end')
  })

  it('renders a custom end slot', () => {
    const wrapper = mountScroll({ hasMore: false }, { end: '<span class="done">All done</span>' })
    expect(wrapper.find('.done').exists()).toBe(true)
  })

  it('shows the loading state and announces it', () => {
    const wrapper = mountScroll({ loading: true })
    expect(wrapper.find('[aria-live="polite"]').text()).toContain('Loading more')
  })

  it('renders a custom loading slot', () => {
    const wrapper = mountScroll({ loading: true }, { loading: '<span class="spin">Fetching</span>' })
    expect(wrapper.find('.spin').exists()).toBe(true)
  })

  it('renders the error state with a retry control and emits retry', async () => {
    const wrapper = mountScroll({ error: true })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    await button.trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('does not observe (emit) while in an error state', () => {
    const wrapper = mountScroll({ error: true })
    // Error suppresses the sentinel, so there is nothing to intersect.
    expect(wrapper.find('.dz-infinite-scroll-sentinel').exists()).toBe(false)
    intersect(true)
    expect(wrapper.emitted('load-more')).toBeUndefined()
  })

  it('exposes retry() via template ref', () => {
    const wrapper = mountScroll({ error: true })
    const exposed = wrapper.vm as unknown as { retry: () => void }
    expect(typeof exposed.retry).toBe('function')
    exposed.retry()
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })

  it('pages again after the parent completes a loading cycle', async () => {
    const wrapper = mountScroll()
    intersect(true)
    expect(wrapper.emitted('load-more')).toHaveLength(1)

    await wrapper.setProps({ loading: true })
    await wrapper.setProps({ loading: false })
    await nextTick()

    expect(wrapper.emitted('load-more')).toHaveLength(2)
  })

  it('disconnects the observer on unmount', () => {
    const wrapper = mountScroll()
    disconnectSpy.mockClear()
    wrapper.unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })
})
