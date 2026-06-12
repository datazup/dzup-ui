import { mount } from '@vue/test-utils'
/**
 * DzKnob — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzKnob from './DzKnob.vue'

describe('dzKnob — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzKnob)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzKnob, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzKnob, { props: { tone } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('exposes a slider role with aria value bounds', () => {
    const wrapper = mount(DzKnob, { props: { min: 0, max: 100, value: 40 } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.exists()).toBe(true)
    expect(slider.attributes('aria-valuemin')).toBe('0')
    expect(slider.attributes('aria-valuemax')).toBe('100')
    expect(slider.attributes('aria-valuenow')).toBe('40')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzKnob, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
