import { mount } from '@vue/test-utils'
/**
 * DzDateRangePicker — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzDateRangePicker from './DzDateRangePicker.vue'

describe('dzDateRangePicker — Unit Tests', () => {
  it('renders the date range picker field', () => {
    const wrapper = mount(DzDateRangePicker)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('displays placeholder when no range is selected', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { placeholder: 'Select range' },
    })
    expect(wrapper.text()).toContain('Select range')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { size: 'sm' },
    })
    expect(wrapper.html()).toContain('dz-input-sm-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { disabled: true },
    })
    const field = wrapper.find('[data-disabled]')
    expect(field.exists()).toBe(true)
  })

  it('applies invalid styling when invalid', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: { invalid: true },
    })
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDateRangePicker, {
      attrs: { class: 'my-range' },
    })
    expect(wrapper.html()).toContain('my-range')
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('renders calendar icon', () => {
    const wrapper = mount(DzDateRangePicker)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has contain: layout style on root field', () => {
    const wrapper = mount(DzDateRangePicker)
    const field = wrapper.find('[style*="contain: layout style"]')
    expect(field.exists()).toBe(true)
  })

  it('shows separator between start and end fields', () => {
    const wrapper = mount(DzDateRangePicker, {
      props: {
        'modelValue': { start: '2026-01-15', end: '2026-01-31' },
        'onUpdate:modelValue': () => {},
      },
    })
    expect(wrapper.text()).toContain('-')
  })
})
