import { mount } from '@vue/test-utils'
/**
 * DzColorPicker — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzColorPicker from './DzColorPicker.vue'

describe('dzColorPicker — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzColorPicker)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzColorPicker, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzColorPicker, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
