import { mount } from '@vue/test-utils'
/**
 * DzInfiniteScroll — Contract Spec v1 conformance tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzInfiniteScroll from './DzInfiniteScroll.vue'

class IOStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] { return [] }
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IOStub)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function mountScroll(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzInfiniteScroll, {
    props,
    slots: { default: '<ul class="items"><li>Row</li></ul>' },
    ...options,
  })
}

describe('dzInfiniteScroll — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mountScroll()
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the default slot content', () => {
    const wrapper = mountScroll()
    expect(wrapper.find('ul.items').exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mountScroll()
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('exposes the dz-infinite-scroll root class for token scoping', () => {
    const wrapper = mountScroll()
    expect(wrapper.classes()).toContain('dz-infinite-scroll')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mountScroll({ size })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('reflects the paging direction via data-direction', () => {
    expect(mountScroll({ direction: 'down' }).attributes('data-direction')).toBe('down')
    expect(mountScroll({ direction: 'up' }).attributes('data-direction')).toBe('up')
  })

  it('exposes a polite live region', () => {
    const wrapper = mountScroll()
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('sets aria-busy while loading', () => {
    expect(mountScroll({ loading: true }).attributes('aria-busy')).toBe('true')
    expect(mountScroll({ loading: false }).attributes('aria-busy')).toBeUndefined()
  })

  it('forwards aria-label to the root', () => {
    const wrapper = mountScroll({ ariaLabel: 'Activity feed' })
    expect(wrapper.attributes('aria-label')).toBe('Activity feed')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountScroll({}, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
  })
})
