import { mount } from '@vue/test-utils'
/**
 * DzSpinner — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzSpinner from './DzSpinner.vue'

describe('dzSpinner — Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (size=md, tone=primary)', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.attributes('data-tone')).toBe('primary')
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzSpinner, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzSpinner, { props: { tone } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  // -- Data attributes --

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzSpinner, { props: { tone: 'danger' } })
    expect(wrapper.attributes('data-tone')).toBe('danger')
  })

  // -- ARIA --

  it('has role="status"', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.attributes('role')).toBe('status')
  })

  it('has default aria-label="Loading"', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.attributes('aria-label')).toBe('Loading')
  })

  it('forwards custom label to aria-label', () => {
    const wrapper = mount(DzSpinner, { props: { label: 'Saving...' } })
    expect(wrapper.attributes('aria-label')).toBe('Saving...')
  })

  // -- Visually hidden text --

  it('renders visually hidden text for screen readers', () => {
    const wrapper = mount(DzSpinner, { props: { label: 'Processing' } })
    const srOnly = wrapper.find('.sr-only')
    expect(srOnly.exists()).toBe(true)
    expect(srOnly.text()).toBe('Processing')
  })

  it('renders default "Loading" as visually hidden text', () => {
    const wrapper = mount(DzSpinner)
    const srOnly = wrapper.find('.sr-only')
    expect(srOnly.text()).toBe('Loading')
  })

  // -- SVG --

  it('renders an SVG spinner', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('sVG has aria-hidden="true"', () => {
    const wrapper = mount(DzSpinner)
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
