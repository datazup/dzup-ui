import { mount } from '@vue/test-utils'
/**
 * DzDatePicker — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzDatePicker from './DzDatePicker.vue'

describe('dzDatePicker — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzDatePicker)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzDatePicker, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDatePicker, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
