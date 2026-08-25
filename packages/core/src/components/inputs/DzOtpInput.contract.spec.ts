import { mount } from '@vue/test-utils'
/**
 * DzOtpInput — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import DzFormField from '../forms/DzFormField.vue'
import DzOtpInput from './DzOtpInput.vue'

describe('dzOtpInput — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzOtpInput)
    expect(wrapper.exists()).toBe(true)
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzOtpInput, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts length prop', () => {
    const wrapper = mount(DzOtpInput, { props: { length: 6 } })
    expect(wrapper.exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzOtpInput, { attrs: { class: 'custom-class' } })
    expect(wrapper.html()).toContain('custom-class')
  })
})

describe('dzOtpInput — renderer contract C3 states', () => {
  /**
   * `required` was declared, defaulted, and read nowhere: the prop existed, the
   * type told a consumer it worked, and the DOM never mentioned it. Nothing
   * failed, which is why it survived.
   */
  it('reflects required as data-required and aria-required', () => {
    const wrapper = mount(DzOtpInput, { props: { required: true } })
    expect(wrapper.attributes('data-required')).toBe('')
    expect(wrapper.find('[aria-required="true"]').exists()).toBe(true)
  })

  it('omits both when not required — never ="false"', () => {
    const wrapper = mount(DzOtpInput)
    expect(wrapper.attributes('data-required')).toBeUndefined()
    expect(wrapper.find('[aria-required="true"]').exists()).toBe(false)
  })

  it('takes required from a DzFormField without a prop', () => {
    const wrapper = mount(DzFormField, {
      props: { required: true },
      slots: { default: () => h(DzOtpInput) },
    })
    expect(wrapper.find('[data-required]').exists()).toBe(true)
  })
})
