import { mount } from '@vue/test-utils'
/**
 * DzDateRangePicker — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzDateRangePicker from './DzDateRangePicker.vue'

describe('dzDateRangePicker — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzDateRangePicker)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzDateRangePicker, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDateRangePicker, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
