import { mount } from '@vue/test-utils'
/**
 * DzDeferredContent — Contract Spec v1 conformance tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DzDeferredContent from './DzDeferredContent.vue'

/** A no-op IntersectionObserver so the wrapper stays in its pre-load state. */
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

function mountDeferred(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzDeferredContent, {
    props,
    slots: { default: '<p class="content">Heavy</p>' },
    ...options,
  })
}

describe('dzDeferredContent — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mountDeferred()
    expect(wrapper.exists()).toBe(true)
  })

  it('exposes the dz-deferred-content root class for token scoping', () => {
    const wrapper = mountDeferred()
    expect(wrapper.classes()).toContain('dz-deferred-content')
  })

  it('renders the default placeholder (DzSkeleton) before load', () => {
    const wrapper = mountDeferred()
    expect(wrapper.find('.dz-deferred-content-placeholder').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(false)
  })

  it('marks the wrapper aria-busy while deferred', () => {
    const wrapper = mountDeferred()
    expect(wrapper.attributes('aria-busy')).toBe('true')
  })

  it('renders as a div by default and honours the `as` prop', () => {
    expect(mountDeferred().element.tagName).toBe('DIV')
    expect(mountDeferred({ as: 'section' }).element.tagName).toBe('SECTION')
  })

  it('forwards the id to the root', () => {
    const wrapper = mountDeferred({ id: 'lazy-1' })
    expect(wrapper.attributes('id')).toBe('lazy-1')
  })

  it('forwards aria-label to the root', () => {
    const wrapper = mountDeferred({ ariaLabel: 'Deferred chart' })
    expect(wrapper.attributes('aria-label')).toBe('Deferred chart')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mountDeferred({}, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('exposes loaded state via template ref', () => {
    const wrapper = mountDeferred()
    const exposed = wrapper.vm as unknown as { loaded: boolean }
    expect(exposed.loaded).toBe(false)
  })
})
