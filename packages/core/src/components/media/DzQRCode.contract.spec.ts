import { mount } from '@vue/test-utils'
/**
 * DzQRCode — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzQRCode from './DzQRCode.vue'

describe('dzQRCode — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'https://dzup.dev' } })
    expect(wrapper.exists()).toBe(true)
  })

  it('renders an SVG for the encoded value', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'https://dzup.dev' } })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('path').exists()).toBe(true)
  })

  it('exposes role="img" with an accessible label', () => {
    const wrapper = mount(DzQRCode, {
      props: { value: 'secret', ariaLabel: 'Two-factor enrolment code' },
    })
    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Two-factor enrolment code')
  })

  it('never exposes the raw payload in the aria-label', () => {
    const secret = 'otpauth://totp/super-secret-token'
    const wrapper = mount(DzQRCode, { props: { value: secret } })
    expect(wrapper.attributes('aria-label')).not.toContain(secret)
  })

  it('accepts all error-correction levels', () => {
    for (const errorLevel of ['L', 'M', 'Q', 'H'] as const) {
      const wrapper = mount(DzQRCode, { props: { value: 'data', errorLevel } })
      expect(wrapper.find('svg').exists()).toBe(true)
    }
  })

  it('accepts all status values', () => {
    for (const status of ['active', 'loading', 'expired'] as const) {
      const wrapper = mount(DzQRCode, { props: { value: 'data', status } })
      expect(wrapper.attributes('data-status')).toBe(status)
    }
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzQRCode, {
      props: { value: 'x' },
      attrs: { class: 'custom-class' },
    })
    expect(wrapper.html()).toContain('custom-class')
  })
})
