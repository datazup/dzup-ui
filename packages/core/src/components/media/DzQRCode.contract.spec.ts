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
    // `role="img"` lives on the graphic wrapper, not the root: an interactive
    // overlay (the `expired` refresh button) must not be a focusable descendant
    // of a `role="img"` element (WCAG nested-interactive).
    const img = wrapper.find('[role="img"]')
    expect(img.exists()).toBe(true)
    expect(img.attributes('aria-label')).toBe('Two-factor enrolment code')
  })

  it('never exposes the raw payload in the aria-label', () => {
    const secret = 'otpauth://totp/super-secret-token'
    const wrapper = mount(DzQRCode, { props: { value: secret } })
    expect(wrapper.find('[role="img"]').attributes('aria-label')).not.toContain(secret)
  })

  it('does not nest the expired refresh control inside the role="img" graphic', () => {
    const wrapper = mount(DzQRCode, { props: { value: 'x', status: 'expired' } })
    // The focusable refresh button must be a sibling of the labelled graphic,
    // never a descendant of it (WCAG nested-interactive).
    expect(wrapper.find('[role="img"] button').exists()).toBe(false)
    expect(wrapper.find('button').exists()).toBe(true)
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
