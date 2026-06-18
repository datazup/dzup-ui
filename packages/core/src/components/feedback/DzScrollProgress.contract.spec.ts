import { mount } from '@vue/test-utils'
/**
 * DzScrollProgress — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, slots, data attributes,
 * ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzScrollProgress from './DzScrollProgress.vue'

describe('dzScrollProgress — Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (variant=bar, position=top, tone=primary)', () => {
    const wrapper = mount(DzScrollProgress)
    expect(wrapper.attributes('data-variant')).toBe('bar')
    expect(wrapper.attributes('data-position')).toBe('top')
    expect(wrapper.attributes('data-tone')).toBe('primary')
    expect(wrapper.attributes('role')).toBe('progressbar')
  })

  it('accepts bar and circular variant values', () => {
    for (const variant of ['bar', 'circular'] as const) {
      const wrapper = mount(DzScrollProgress, { props: { variant } })
      expect(wrapper.attributes('data-variant')).toBe(variant)
    }
  })

  it('accepts top and bottom position values', () => {
    for (const position of ['top', 'bottom'] as const) {
      const wrapper = mount(DzScrollProgress, { props: { position } })
      expect(wrapper.attributes('data-position')).toBe(position)
    }
  })

  it('accepts all canonical tone values', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    for (const tone of tones) {
      const wrapper = mount(DzScrollProgress, { props: { tone } })
      expect(wrapper.attributes('data-tone')).toBe(tone)
    }
  })

  it('accepts all canonical size values (circular)', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzScrollProgress, { props: { variant: 'circular', size } })
      expect(wrapper.find('svg').exists()).toBe(true)
    }
  })

  // -- Data attributes --

  it('sets data-component for styling/targeting', () => {
    const wrapper = mount(DzScrollProgress)
    expect(wrapper.attributes('data-component')).toBe('dz-scroll-progress')
  })

  // -- ARIA --

  it('has role="progressbar"', () => {
    const wrapper = mount(DzScrollProgress)
    expect(wrapper.attributes('role')).toBe('progressbar')
  })

  it('exposes aria-valuenow / valuemin / valuemax', () => {
    const wrapper = mount(DzScrollProgress)
    expect(wrapper.attributes('aria-valuenow')).toBe('0')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
  })

  it('has default aria-label="Page scroll progress"', () => {
    const wrapper = mount(DzScrollProgress)
    expect(wrapper.attributes('aria-label')).toBe('Page scroll progress')
  })

  it('forwards custom aria-label', () => {
    const wrapper = mount(DzScrollProgress, { props: { ariaLabel: 'Article progress' } })
    expect(wrapper.attributes('aria-label')).toBe('Article progress')
  })

  // -- Focus behavior (decorative-supplementary) --

  it('is not focusable (no tabindex)', () => {
    const wrapper = mount(DzScrollProgress)
    expect(wrapper.attributes('tabindex')).toBeUndefined()
  })

  // -- Slots --

  it('exposes the progress value via the default slot', () => {
    const wrapper = mount(DzScrollProgress, {
      slots: { default: '<span class="custom">slotted</span>' },
    })
    expect(wrapper.find('.custom').exists()).toBe(true)
  })

  // -- Variant rendering --

  it('renders a fill element for the bar variant', () => {
    const wrapper = mount(DzScrollProgress, { props: { variant: 'bar' } })
    expect(wrapper.find('svg').exists()).toBe(false)
    expect(wrapper.find('div > div').exists()).toBe(true)
  })

  it('renders an SVG ring for the circular variant', () => {
    const wrapper = mount(DzScrollProgress, { props: { variant: 'circular' } })
    expect(wrapper.find('svg circle').exists()).toBe(true)
  })
})
