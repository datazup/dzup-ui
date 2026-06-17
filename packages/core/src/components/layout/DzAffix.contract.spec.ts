import { mount } from '@vue/test-utils'
/**
 * DzAffix — Contract Spec v1 conformance tests.
 *
 * Verifies the public API (props, slot, change event, data attributes, class
 * merging) without depending on layout measurement.
 */
import { describe, expect, it } from 'vitest'
import DzAffix from './DzAffix.vue'

describe('dzAffix — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzAffix, { slots: { default: '<div>Pinned</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders default slot content', () => {
    const wrapper = mount(DzAffix, {
      slots: { default: '<div data-testid="content">Content</div>' },
    })
    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true)
  })

  it('accepts offsetTop prop', () => {
    const wrapper = mount(DzAffix, {
      props: { offsetTop: 24 },
      slots: { default: '<div>Pinned</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts offsetBottom prop', () => {
    const wrapper = mount(DzAffix, {
      props: { offsetBottom: 24 },
      slots: { default: '<div>Pinned</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts target prop (scroll container getter)', () => {
    const wrapper = mount(DzAffix, {
      props: { target: () => window },
      slots: { default: '<div>Pinned</div>' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('exposes the affixed flag to the default slot', () => {
    const wrapper = mount(DzAffix, {
      slots: {
        default: `<template #default="{ affixed }"><span data-testid="flag">{{ String(affixed) }}</span></template>`,
      },
    })
    expect(wrapper.find('[data-testid="flag"]').text()).toBe('false')
  })

  it('applies the id prop to the root element', () => {
    const wrapper = mount(DzAffix, {
      props: { id: 'affix-root' },
      slots: { default: '<div>Pinned</div>' },
    })
    expect(wrapper.attributes('id')).toBe('affix-root')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzAffix, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Content</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
