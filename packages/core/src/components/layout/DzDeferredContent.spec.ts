/**
 * DzDeferredContent — Unit / behaviour tests (mocked IntersectionObserver).
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import DzDeferredContent from './DzDeferredContent.vue'

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

/** Simulate the wrapper entering / leaving view. */
function intersect(isIntersecting: boolean): void {
  ioCallback?.([{ isIntersecting }])
}

function mountDeferred(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return mount(DzDeferredContent, {
    props,
    slots: { default: '<p class="content">Heavy</p>', ...slots },
  })
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

describe('dzDeferredContent', () => {
  it('renders the placeholder first and defers the content', () => {
    const wrapper = mountDeferred()
    expect(wrapper.find('.dz-deferred-content-placeholder').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(false)
  })

  it('mounts the content once the wrapper intersects', async () => {
    const wrapper = mountDeferred()
    intersect(true)
    await nextTick()
    expect(wrapper.find('.content').exists()).toBe(true)
    expect(wrapper.find('.dz-deferred-content-placeholder').exists()).toBe(false)
    expect(wrapper.attributes('aria-busy')).toBeUndefined()
    expect(wrapper.attributes('data-loaded')).toBe('')
  })

  it('emits load exactly once on first reveal', async () => {
    const wrapper = mountDeferred({ once: false })
    intersect(true)
    intersect(false)
    intersect(true)
    await nextTick()
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('emits reveal on every re-mount under once=false', async () => {
    const wrapper = mountDeferred({ once: false })
    intersect(true)
    intersect(false)
    intersect(true)
    intersect(false)
    intersect(true)
    await nextTick()
    // Three entries → three reveals, but load still fires exactly once.
    expect(wrapper.emitted('reveal')).toHaveLength(3)
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('does not emit a spurious reveal on a repeated intersecting tick', async () => {
    const wrapper = mountDeferred({ once: false })
    intersect(true)
    intersect(true)
    await nextTick()
    expect(wrapper.emitted('reveal')).toHaveLength(1)
  })

  it('keeps the content mounted and stops observing when once=true', async () => {
    const wrapper = mountDeferred({ once: true })
    intersect(true)
    await nextTick()
    // once=true disconnects after the first reveal.
    expect(disconnectSpy).toHaveBeenCalled()
    // Subsequent (stale) leave events do not unmount the content.
    intersect(false)
    await nextTick()
    expect(wrapper.find('.content').exists()).toBe(true)
  })

  it('re-defers the content as it leaves view when once=false', async () => {
    const wrapper = mountDeferred({ once: false })
    intersect(true)
    await nextTick()
    expect(wrapper.find('.content').exists()).toBe(true)

    intersect(false)
    await nextTick()
    expect(wrapper.find('.content').exists()).toBe(false)
    expect(wrapper.find('.dz-deferred-content-placeholder').exists()).toBe(true)
  })

  it('passes rootMargin and threshold to the observer', () => {
    mountDeferred({ rootMargin: '200px', threshold: 0.5 })
    expect(lastOptions?.rootMargin).toBe('200px')
    expect(lastOptions?.threshold).toBe(0.5)
  })

  it('renders a custom placeholder slot', () => {
    const wrapper = mountDeferred({}, { placeholder: '<div class="ph">Loading…</div>' })
    expect(wrapper.find('.ph').exists()).toBe(true)
  })

  it('disconnects the observer on unmount', () => {
    const wrapper = mountDeferred()
    disconnectSpy.mockClear()
    wrapper.unmount()
    expect(disconnectSpy).toHaveBeenCalled()
  })

  describe('without IntersectionObserver (SSR / old engines)', () => {
    beforeEach(() => {
      vi.stubGlobal('IntersectionObserver', undefined)
    })

    it('renders the content immediately and emits load and reveal', async () => {
      const wrapper = mountDeferred()
      await nextTick()
      expect(wrapper.find('.content').exists()).toBe(true)
      expect(wrapper.find('.dz-deferred-content-placeholder').exists()).toBe(false)
      expect(wrapper.emitted('load')).toHaveLength(1)
      expect(wrapper.emitted('reveal')).toHaveLength(1)
    })
  })
})
