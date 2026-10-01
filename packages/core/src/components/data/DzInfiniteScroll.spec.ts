import { expectKeyboardContract } from '@dzup-ui/testing'
import { mount } from '@vue/test-utils'
/**
 * DzInfiniteScroll — Unit / behavior tests (mocked IntersectionObserver).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { anatomy as infiniteScrollAnatomy } from './DzInfiniteScroll.anatomy.ts'
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
  it('emits loadMore once when the sentinel enters view', () => {
    const wrapper = mountScroll()
    intersect(true)
    intersect(true)
    expect(wrapper.emitted('loadMore')).toHaveLength(1)
  })

  it('does not emit while loading', () => {
    const wrapper = mountScroll({ loading: true })
    intersect(true)
    expect(wrapper.emitted('loadMore')).toBeUndefined()
  })

  it('does not emit when hasMore is false', () => {
    const wrapper = mountScroll({ hasMore: false })
    intersect(true)
    expect(wrapper.emitted('loadMore')).toBeUndefined()
  })

  it('does not emit when disabled', () => {
    const wrapper = mountScroll({ disabled: true })
    intersect(true)
    expect(wrapper.emitted('loadMore')).toBeUndefined()
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
    expect(wrapper.emitted('loadMore')).toBeUndefined()
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
    expect(wrapper.emitted('loadMore')).toHaveLength(1)

    await wrapper.setProps({ loading: true })
    await wrapper.setProps({ loading: false })
    await nextTick()

    expect(wrapper.emitted('loadMore')).toHaveLength(2)
  })

  it('disconnects the observer on unmount', () => {
    const wrapper = mountScroll()
    disconnectSpy.mockClear()
    wrapper.unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })

  /**
   * The declared `Tab` row — *"Move to the next focusable element inside the
   * loaded items; the feed adds no keys of its own."* — asserted rather than
   * assumed (RESIDUAL-15, closing the `Tab` half of RESIDUAL-14 §4.2).
   *
   * This is the row RESIDUAL-14 §2.2.2(c) caught being backed by the wrong node:
   * it cited `DzButton` — the **error-state retry control** — for a sentence about
   * the *loaded items*, which are the consumer's `<slot />` at
   * `DzInfiniteScroll.vue:133`. The ledger rejects that citation, and the row's
   * honest verdict became `undetermined`.
   *
   * Both halves of the sentence are asserted: every focusable node a consumer put
   * in the feed is its own tab stop (`expect: 'each'`), and the feed adds no keys
   * of its own — `tabStops` drives `Tab` and fails if the component consumed it,
   * and the loop below shows it consumes nothing else either.
   */
  it('leaves the tab order of the loaded items alone, which is what the Tab row says', () => {
    const wrapper = mountScroll({}, {
      default: '<ul class="items">'
        + '<li><a href="#a" data-testid="i1">A</a></li>'
        + '<li><a href="#b" data-testid="i2">B</a></li>'
        + '<li><a href="#c" data-testid="i3">C</a></li>'
        + '</ul>',
    })

    expectKeyboardContract(wrapper, infiniteScrollAnatomy, {
      tabStops: { of: '[data-part="content"] a[href]', expect: 'each' },
    })

    // "The feed adds no keys of its own", stated as the measurement rather than
    // as prose: the region consumes nothing the APG `feed` pattern names either,
    // which is what this anatomy's keyboard comment already says out loud.
    for (const key of ['Tab', 'PageUp', 'PageDown', 'Home', 'End']) {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      wrapper.get('[data-testid="i1"]').element.dispatchEvent(event)
      expect(event.defaultPrevented, `\`${key}\` was consumed by the feed`).toBe(false)
    }

    wrapper.unmount()
  })
})
