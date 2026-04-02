import { mount } from '@vue/test-utils'
/**
 * DzFileUpload — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzFileUpload from './DzFileUpload.vue'

describe('dzFileUpload — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzFileUpload)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzFileUpload, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzFileUpload, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
