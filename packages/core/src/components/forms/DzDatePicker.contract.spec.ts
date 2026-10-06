import { mount } from '@vue/test-utils'
/**
 * DzDatePicker — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
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

  // DZUP-UI-R9-01-20261006-R1: the declared `#trigger` slot and the trigger's ARIA.
  it('trigger slot replaces the calendar icon and receives value and placeholder', () => {
    const wrapper = mount(DzDatePicker, {
      props: { modelValue: '2026-10-06', placeholder: 'Pick a day' },
      slots: {
        trigger: ({ value, placeholder }: { value: string | undefined, placeholder: string | undefined }) =>
          h('span', { class: 'custom-trigger' }, `${value}|${placeholder}`),
      },
    })
    const trigger = wrapper.get('[data-part="trigger"]')
    expect(trigger.find('.custom-trigger').text()).toBe('2026-10-06|Pick a day')
    expect(trigger.find('[data-part="icon"]').exists()).toBe(false)
  })

  it('passes an undefined value to the trigger slot while empty', () => {
    const wrapper = mount(DzDatePicker, {
      slots: {
        trigger: ({ value }: { value: string | undefined }) => h('span', { class: 'custom-trigger' }, String(value)),
      },
    })
    expect(wrapper.get('[data-part="trigger"] .custom-trigger').text()).toBe('undefined')
  })

  it('names the calendar trigger', () => {
    expect(mount(DzDatePicker).get('[data-part="trigger"]').attributes('aria-label')).toBe('Open date picker')
    const named = mount(DzDatePicker, { props: { ariaLabel: 'Start date' } })
    expect(named.get('[data-part="trigger"]').attributes('aria-label')).toBe('Start date')
  })
})
