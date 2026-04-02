import { mount } from '@vue/test-utils'
/**
 * DzProgress — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzProgress from './DzProgress.vue'

describe('dzProgress — Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (variant=bar, size=md, tone=primary)', () => {
    const wrapper = mount(DzProgress)
    expect(wrapper.attributes('data-tone')).toBe('primary')
    expect(wrapper.attributes('role')).toBe('progressbar')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzProgress, { props: { size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzProgress, { props: { tone } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('accepts bar and circular variant values', () => {
    const variants = ['bar', 'circular'] as const
    for (const variant of variants) {
      const wrapper = mount(DzProgress, { props: { variant } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  // -- Data attributes --

  it('sets data-tone attribute', () => {
    const wrapper = mount(DzProgress, { props: { tone: 'success' } })
    expect(wrapper.attributes('data-tone')).toBe('success')
  })

  it('sets data-state="determinate" by default', () => {
    const wrapper = mount(DzProgress, { props: { value: 50 } })
    expect(wrapper.attributes('data-state')).toBe('determinate')
  })

  it('sets data-state="indeterminate" when indeterminate', () => {
    const wrapper = mount(DzProgress, { props: { indeterminate: true } })
    expect(wrapper.attributes('data-state')).toBe('indeterminate')
  })

  // -- ARIA --

  it('has role="progressbar"', () => {
    const wrapper = mount(DzProgress)
    expect(wrapper.attributes('role')).toBe('progressbar')
  })

  it('sets aria-valuenow to percentage', () => {
    const wrapper = mount(DzProgress, { props: { value: 75, max: 100 } })
    expect(wrapper.attributes('aria-valuenow')).toBe('75')
  })

  it('sets aria-valuemin="0"', () => {
    const wrapper = mount(DzProgress)
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
  })

  it('sets aria-valuemax to max prop', () => {
    const wrapper = mount(DzProgress, { props: { max: 200 } })
    expect(wrapper.attributes('aria-valuemax')).toBe('200')
  })

  it('has default aria-label="Progress"', () => {
    const wrapper = mount(DzProgress)
    expect(wrapper.attributes('aria-label')).toBe('Progress')
  })

  it('forwards custom aria-label', () => {
    const wrapper = mount(DzProgress, { props: { ariaLabel: 'Upload progress' } })
    expect(wrapper.attributes('aria-label')).toBe('Upload progress')
  })

  it('omits aria-valuenow when indeterminate', () => {
    const wrapper = mount(DzProgress, { props: { indeterminate: true } })
    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
  })

  // -- CSS containment --

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzProgress)
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })

  // -- Circular variant --

  it('renders SVG for circular variant', () => {
    const wrapper = mount(DzProgress, { props: { variant: 'circular' } })
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('has role="progressbar" for circular variant', () => {
    const wrapper = mount(DzProgress, { props: { variant: 'circular' } })
    expect(wrapper.attributes('role')).toBe('progressbar')
  })
})
