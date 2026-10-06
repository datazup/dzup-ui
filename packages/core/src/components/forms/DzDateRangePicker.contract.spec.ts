import { mount } from '@vue/test-utils'
/**
 * DzDateRangePicker — Contract Spec v1 conformance tests.
 */
import type { DateRangeValue } from './DzDateRangePicker.types.ts'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
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

  // DZUP-UI-R9-01-20261006-R1: the declared `#trigger` slot and the trigger's ARIA.
  it('trigger slot replaces the calendar icon and receives value and placeholder', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { modelValue: { start: '2026-10-01', end: '2026-10-06' }, placeholder: 'Pick a range' },
      slots: {
        trigger: ({ value, placeholder }: { value: DateRangeValue | undefined, placeholder: string | undefined }) =>
          h('span', { class: 'custom-trigger' }, `${value?.start}..${value?.end}|${placeholder}`),
      },
    })
    const trigger = wrapper.get('[data-part="trigger"]')
    expect(trigger.find('.custom-trigger').text()).toBe('2026-10-01..2026-10-06|Pick a range')
    expect(trigger.find('[data-part="icon"]').exists()).toBe(false)
  })

  it('names the calendar trigger', () => {
    expect(mount(DzDateRangePicker).get('[data-part="trigger"]').attributes('aria-label')).toBe('Open date range picker')
    const named = mount(DzDateRangePicker, { props: { ariaLabel: 'Stay' } })
    expect(named.get('[data-part="trigger"]').attributes('aria-label')).toBe('Stay')
  })
})
