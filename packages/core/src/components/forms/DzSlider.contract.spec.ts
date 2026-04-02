import { mount } from '@vue/test-utils'
/**
 * DzSlider — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzSlider from './DzSlider.vue'

describe('dzSlider — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzSlider)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSlider, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzSlider, { props: { tone } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzSlider, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
