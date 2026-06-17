import { mount } from '@vue/test-utils'
/**
 * DzRating — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzRating from './DzRating.vue'

describe('dzRating — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzRating)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzRating, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzRating, { props: { tone } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('exposes a slider role with aria value bounds', () => {
    const wrapper = mount(DzRating, { props: { count: 5, value: 3 } })
    const slider = wrapper.find('[role="slider"]')
    expect(slider.exists()).toBe(true)
    expect(slider.attributes('aria-valuemin')).toBe('0')
    expect(slider.attributes('aria-valuemax')).toBe('5')
    expect(slider.attributes('aria-valuenow')).toBe('3')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzRating, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})
