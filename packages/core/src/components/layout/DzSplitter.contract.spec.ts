import { mount } from '@vue/test-utils'
/**
 * DzSplitter — Contract Spec v1 conformance tests.
 *
 * DzSplitter is an alias for DzResizable, sharing the same API.
 */
import { describe, expect, it } from 'vitest'
import DzSplitter from './DzSplitter.vue'

describe('dzSplitter — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSplitter, { slots: { default: '<div>Panel</div>' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzSplitter, { slots: { default: '<div>Panel</div>' } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSplitter, { props: { size }, slots: { default: '<div>Panel</div>' } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSplitter, {
      attrs: { class: 'custom-class' },
      slots: { default: '<div>Panel</div>' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
