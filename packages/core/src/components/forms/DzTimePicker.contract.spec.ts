import { mount } from '@vue/test-utils'
/**
 * DzTimePicker — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzTimePicker from './DzTimePicker.vue'

describe('dzTimePicker — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzTimePicker)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzTimePicker, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTimePicker, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
