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

  // DZUP-UI-R9-01-20261006-R1: the declared slots and the trigger's ARIA.
  it('default slot replaces the whole trigger content', () => {
    const wrapper = mount(DzColorPicker, {
      props: { modelValue: '#ff0000' },
      slots: { default: '<span class="custom-trigger">Brand colour</span>' },
    })
    const trigger = wrapper.get('[data-part="trigger"]')
    expect(trigger.find('.custom-trigger').text()).toBe('Brand colour')
    expect(trigger.find('[data-part="indicator"]').exists()).toBe(false)
  })

  it('label slot replaces only the value text and keeps the swatch', () => {
    const wrapper = mount(DzColorPicker, {
      props: { modelValue: '#ff0000' },
      slots: { label: '<em class="custom-label">Red</em>' },
    })
    const trigger = wrapper.get('[data-part="trigger"]')
    expect(trigger.find('.custom-label').text()).toBe('Red')
    expect(trigger.find('[data-part="indicator"]').exists()).toBe(true)
    expect(trigger.text()).not.toContain('#ff0000')
  })

  it('names the trigger and reports the closed popover', () => {
    const wrapper = mount(DzColorPicker, { props: { ariaLabel: 'Brand colour' } })
    const trigger = wrapper.get('[data-part="trigger"]')
    expect(trigger.attributes('aria-label')).toBe('Brand colour')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })
})
