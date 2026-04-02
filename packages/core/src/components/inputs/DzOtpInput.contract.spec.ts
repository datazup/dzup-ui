import { mount } from '@vue/test-utils'
/**
 * DzOtpInput — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
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
