import { mount } from '@vue/test-utils'
/**
 * DzDescriptions — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzDescriptions from './DzDescriptions.vue'

const items = [
  { label: 'Name', value: 'Ada Lovelace' },
  { label: 'Role', value: 'Engineer' },
]

describe('dzDescriptions — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzDescriptions, { props: { items } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzDescriptions, { props: { items } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzDescriptions, { props: { items, size } })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('accepts both layout values', () => {
    for (const layout of ['horizontal', 'vertical'] as const) {
      const wrapper = mount(DzDescriptions, { props: { items, layout } })
      expect(wrapper.attributes('data-layout')).toBe(layout)
    }
  })

  it('forwards aria-label', () => {
    const wrapper = mount(DzDescriptions, {
      props: { items, ariaLabel: 'Profile details' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Profile details')
  })

  it('forwards id', () => {
    const wrapper = mount(DzDescriptions, {
      props: { items, id: 'profile' },
    })
    expect(wrapper.attributes('id')).toBe('profile')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDescriptions, {
      props: { items },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('renders as a definition list', () => {
    const wrapper = mount(DzDescriptions, { props: { items } })
    expect(wrapper.element.tagName).toBe('DL')
  })
})
