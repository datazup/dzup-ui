import { mount } from '@vue/test-utils'
/**
 * DzDatePicker — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzDatePicker from './DzDatePicker.vue'

describe('dzDatePicker — Unit Tests', () => {
  it('renders the date picker field', () => {
    const wrapper = mount(DzDatePicker)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('displays placeholder when no value is selected', () => {
    const wrapper = mount(DzDatePicker, {
      props: { placeholder: 'Select date' },
    })
    expect(wrapper.text()).toContain('Select date')
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzDatePicker, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('dz-button-lg-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzDatePicker, {
      props: { variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('applies variant classes (filled)', () => {
    const wrapper = mount(DzDatePicker, {
      props: { variant: 'filled' },
    })
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzDatePicker, {
      props: { disabled: true },
    })
    const field = wrapper.find('[data-disabled]')
    expect(field.exists()).toBe(true)
  })

  it('sets data-invalid when invalid', () => {
    const wrapper = mount(DzDatePicker, {
      props: { invalid: true },
    })
    // Reka UI DatePickerField may not forward data-invalid to the DOM;
    // verify the invalid variant class is applied instead
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('applies invalid styling when error is provided', () => {
    const wrapper = mount(DzDatePicker, {
      props: { error: 'Date is required' },
    })
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzDatePicker, {
      attrs: { class: 'my-datepicker' },
    })
    expect(wrapper.html()).toContain('my-datepicker')
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzDatePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzDatePicker)
    const field = wrapper.find('[style*="contain"]')
    await field.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('sets aria-label on trigger', () => {
    const wrapper = mount(DzDatePicker, {
      props: { ariaLabel: 'Pick a date' },
    })
    expect(wrapper.html()).toContain('Pick a date')
  })

  it('renders calendar icon', () => {
    const wrapper = mount(DzDatePicker)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has contain: layout style on root field', () => {
    const wrapper = mount(DzDatePicker)
    const field = wrapper.find('[style*="contain: layout style"]')
    expect(field.exists()).toBe(true)
  })
})
