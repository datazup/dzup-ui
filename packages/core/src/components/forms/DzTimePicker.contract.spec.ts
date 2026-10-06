import { mount } from '@vue/test-utils'
/**
 * DzTimePicker — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
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

  // DZUP-UI-R9-01-20261006-R1: the declared `#trigger` slot and the trigger's ARIA.
  it('trigger slot replaces the label and receives value and display', () => {
    const wrapper = mount(DzTimePicker, {
      props: { modelValue: '14:30' },
      slots: {
        trigger: ({ value, display }: { value: string, display: string }) =>
          h('span', { class: 'custom-trigger' }, `${value}|${display}`),
      },
    })
    const trigger = wrapper.get('[data-part="trigger"]')
    expect(trigger.find('.custom-trigger').text()).toMatch(/^14:30\|\S/)
    expect(trigger.find('[data-part="label"]').exists()).toBe(false)
  })

  it('exposes the trigger as a named, collapsed combobox opening a dialog', () => {
    const trigger = mount(DzTimePicker, { props: { ariaLabel: 'Start time' } }).get('[data-part="trigger"]')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-label')).toBe('Start time')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
  })
})
