import { mount } from '@vue/test-utils'
/**
 * DzTimePicker — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzTimePicker from './DzTimePicker.vue'

describe('dzTimePicker — Unit Tests', () => {
  it('renders the time picker root', () => {
    const wrapper = mount(DzTimePicker)
    expect(wrapper.find('[style*="contain"]').exists()).toBe(true)
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzTimePicker, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('dz-input-lg-height')
  })

  it('applies variant classes (outline)', () => {
    const wrapper = mount(DzTimePicker, {
      props: { variant: 'outline' },
    })
    expect(wrapper.html()).toContain('border')
  })

  it('applies variant classes (filled)', () => {
    const wrapper = mount(DzTimePicker, {
      props: { variant: 'filled' },
    })
    expect(wrapper.html()).toContain('dz-muted')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzTimePicker, {
      props: { disabled: true },
    })
    const root = wrapper.find('[data-disabled]')
    expect(root.exists()).toBe(true)
  })

  it('applies invalid styling when invalid', () => {
    const wrapper = mount(DzTimePicker, {
      props: { invalid: true },
    })
    // Reka UI TimeFieldRoot may not forward data-invalid;
    // verify the invalid variant class is applied
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzTimePicker, {
      attrs: { class: 'my-time' },
    })
    expect(wrapper.html()).toContain('my-time')
  })

  it('renders clock icon', () => {
    const wrapper = mount(DzTimePicker)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('renders colon separator', () => {
    const wrapper = mount(DzTimePicker)
    expect(wrapper.text()).toContain(':')
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzTimePicker)
    const root = wrapper.find('[style*="contain: layout style"]')
    expect(root.exists()).toBe(true)
  })

  it('emits focus event', async () => {
    const wrapper = mount(DzTimePicker)
    const root = wrapper.find('[style*="contain"]')
    await root.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()
  })

  it('emits blur event', async () => {
    const wrapper = mount(DzTimePicker)
    const root = wrapper.find('[style*="contain"]')
    await root.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })
})
