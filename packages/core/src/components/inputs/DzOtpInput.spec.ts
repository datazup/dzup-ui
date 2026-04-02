import { mount } from '@vue/test-utils'
/**
 * DzOtpInput — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzOtpInput from './DzOtpInput.vue'

describe('dzOtpInput — Unit Tests', () => {
  it('renders the component', () => {
    const wrapper = mount(DzOtpInput)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the correct number of input fields (default 6)', () => {
    const wrapper = mount(DzOtpInput)
    // Reka UI PinInputRoot renders an internal input alongside our 6 pin inputs
    const allInputs = wrapper.findAll('input')
    expect(allInputs.length).toBe(7) // 6 pin inputs + 1 Reka internal
  })

  it('renders custom length', () => {
    const wrapper = mount(DzOtpInput, {
      props: { length: 4 },
    })
    const allInputs = wrapper.findAll('input')
    expect(allInputs.length).toBe(5) // 4 pin inputs + 1 Reka internal
  })

  it('applies size variant classes', () => {
    const wrapper = mount(DzOtpInput, {
      props: { size: 'lg' },
    })
    expect(wrapper.html()).toContain('h-12')
  })

  it('sets data-disabled when disabled', () => {
    const wrapper = mount(DzOtpInput, {
      props: { disabled: true },
    })
    expect(wrapper.find('[data-disabled]').exists()).toBe(true)
  })

  it('applies invalid styling when invalid prop is true', () => {
    const wrapper = mount(DzOtpInput, {
      props: { invalid: true },
    })
    expect(wrapper.html()).toContain('dz-danger')
  })

  it('renders error message when error prop is provided', () => {
    const wrapper = mount(DzOtpInput, {
      props: { error: 'Invalid code' },
    })
    expect(wrapper.find('[role="alert"]').text()).toBe('Invalid code')
  })

  it('has contain: layout style on root', () => {
    const wrapper = mount(DzOtpInput)
    expect(wrapper.find('[style*="contain: layout style"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzOtpInput, {
      attrs: { class: 'my-otp' },
    })
    expect(wrapper.html()).toContain('my-otp')
  })

  it('emits focus event on input focus', async () => {
    const wrapper = mount(DzOtpInput)
    const inputs = wrapper.findAll('input')
    if (inputs.length > 0) {
      await inputs[0]!.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()
    }
  })

  it('emits blur event on input blur', async () => {
    const wrapper = mount(DzOtpInput)
    const inputs = wrapper.findAll('input')
    if (inputs.length > 0) {
      await inputs[0]!.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()
    }
  })

  it('accepts ariaLabel prop', () => {
    const wrapper = mount(DzOtpInput, {
      props: { ariaLabel: 'Verification code' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
