import { mount } from '@vue/test-utils'
/**
 * DzRangeSlider — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzRangeSlider from './DzRangeSlider.vue'

describe('dzRangeSlider — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzRangeSlider)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzRangeSlider, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzRangeSlider, { props: { tone } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRangeSlider, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
