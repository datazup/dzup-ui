import { mount } from '@vue/test-utils'
/**
 * DzMeterGroup — Contract Spec v1 conformance tests.
 *
 * Verifies that the component's public API (props, slots,
 * data attributes, ARIA) conforms to the canonical contract.
 */
import { describe, expect, it } from 'vitest'
import DzMeterGroup from './DzMeterGroup.vue'

const sampleValues = [
  { label: 'Images', value: 30, tone: 'primary' as const },
  { label: 'Docs', value: 20, tone: 'info' as const },
  { label: 'Free', value: 50, tone: 'neutral' as const },
]

describe('dzMeterGroup — Contract Spec v1', () => {
  // -- Prop defaults --

  it('renders with default props (orientation=horizontal, size=md)', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues } })
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzMeterGroup, { props: { values: sampleValues, size } })
      expect(wrapper.exists()).toBe(true)
    }
  })

  it('accepts both orientation values', () => {
    const orientations = ['horizontal', 'vertical'] as const
    for (const orientation of orientations) {
      const wrapper = mount(DzMeterGroup, { props: { values: sampleValues, orientation } })
      expect(wrapper.attributes('data-orientation')).toBe(orientation)
    }
  })

  it('accepts all canonical tone values on segments', () => {
    const tones = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const
    const wrapper = mount(DzMeterGroup, {
      props: { values: tones.map((tone, i) => ({ label: tone, value: i + 1, tone })) },
    })
    expect(wrapper.findAll('[role="meter"]')).toHaveLength(tones.length)
  })

  // -- Data attributes --

  it('sets data-orientation attribute', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues, orientation: 'vertical' } })
    expect(wrapper.attributes('data-orientation')).toBe('vertical')
  })

  it('sets data-segment-label on each segment', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues } })
    const segments = wrapper.findAll('[role="meter"]')
    expect(segments[0]!.attributes('data-segment-label')).toBe('Images')
  })

  // -- ARIA --

  it('has role="group" on the container', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues } })
    expect(wrapper.attributes('role')).toBe('group')
  })

  it('renders one role="meter" per segment', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues } })
    expect(wrapper.findAll('[role="meter"]')).toHaveLength(3)
  })

  it('sets aria-valuenow/min/max on each segment', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues, max: 100 } })
    const first = wrapper.findAll('[role="meter"]')[0]!
    expect(first.attributes('aria-valuenow')).toBe('30')
    expect(first.attributes('aria-valuemin')).toBe('0')
    expect(first.attributes('aria-valuemax')).toBe('100')
  })

  it('sets aria-label on each segment from its label', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues } })
    const first = wrapper.findAll('[role="meter"]')[0]!
    expect(first.attributes('aria-label')).toBe('Images')
  })

  it('has default aria-label="Meter group" on the container', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues } })
    expect(wrapper.attributes('aria-label')).toBe('Meter group')
  })

  it('forwards custom aria-label', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values: sampleValues, ariaLabel: 'Storage usage' },
    })
    expect(wrapper.attributes('aria-label')).toBe('Storage usage')
  })

  // -- CSS containment --

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: sampleValues } })
    expect(wrapper.attributes('style')).toContain('contain: layout style')
  })
})
