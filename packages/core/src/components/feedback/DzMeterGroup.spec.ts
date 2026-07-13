import { mount } from '@vue/test-utils'
/**
 * DzMeterGroup — Unit / behavior tests.
 */
import { describe, expect, it } from 'vitest'
import DzMeterGroup from './DzMeterGroup.vue'

const values = [
  { label: 'Images', value: 30, tone: 'primary' as const },
  { label: 'Docs', value: 20, tone: 'info' as const },
  { label: 'Free', value: 50, tone: 'neutral' as const },
]

function segmentStyles(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('[role="meter"]').map(s => (s.element as HTMLElement).style)
}

describe('dzMeterGroup — Unit Tests', () => {
  it('renders a <div> container element', () => {
    const wrapper = mount(DzMeterGroup, { props: { values } })
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzMeterGroup, { props: { values }, attrs: { class: 'my-meter' } })
    expect(wrapper.classes()).toContain('my-meter')
  })

  it('forwards extra HTML attributes', () => {
    const wrapper = mount(DzMeterGroup, { props: { values }, attrs: { 'data-testid': 'usage' } })
    expect(wrapper.attributes('data-testid')).toBe('usage')
  })

  it('renders one segment per value', () => {
    const wrapper = mount(DzMeterGroup, { props: { values } })
    expect(wrapper.findAll('[role="meter"]')).toHaveLength(3)
  })

  // -- Proportion math --

  it('defaults max to the sum of values (proportions fill 100%)', () => {
    const wrapper = mount(DzMeterGroup, { props: { values } })
    const widths = segmentStyles(wrapper).map(s => s.width)
    expect(widths).toEqual(['30%', '20%', '50%'])
  })

  it('respects an explicit max override', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values: [{ label: 'Used', value: 25 }], max: 100 },
    })
    expect(segmentStyles(wrapper)[0]!.width).toBe('25%')
  })

  it('computes proportions against a max larger than the sum', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values: [{ label: 'A', value: 20 }, { label: 'B', value: 30 }], max: 200 },
    })
    const widths = segmentStyles(wrapper).map(s => s.width)
    expect(widths).toEqual(['10%', '15%'])
  })

  it('treats negative values as zero', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values: [{ label: 'A', value: -10 }, { label: 'B', value: 50 }], max: 100 },
    })
    const widths = segmentStyles(wrapper).map(s => s.width)
    expect(widths).toEqual(['0%', '50%'])
  })

  it('does not divide by zero when all values are zero', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values: [{ label: 'A', value: 0 }, { label: 'B', value: 0 }] },
    })
    const widths = segmentStyles(wrapper).map(s => s.width)
    expect(widths).toEqual(['0%', '0%'])
  })

  // -- Orientation --

  it('uses width for horizontal orientation', () => {
    const wrapper = mount(DzMeterGroup, { props: { values, orientation: 'horizontal' } })
    expect(segmentStyles(wrapper)[0]!.width).toBe('30%')
    expect(segmentStyles(wrapper)[0]!.height).toBe('')
  })

  it('uses height for vertical orientation', () => {
    const wrapper = mount(DzMeterGroup, { props: { values, orientation: 'vertical' } })
    expect(segmentStyles(wrapper)[0]!.height).toBe('30%')
    expect(segmentStyles(wrapper)[0]!.width).toBe('')
  })

  // -- Color resolution --

  it('resolves tone to a token-based background color', () => {
    const wrapper = mount(DzMeterGroup, { props: { values } })
    expect(segmentStyles(wrapper)[0]!.backgroundColor).toBe('var(--dz-primary-solid)')
  })

  it('prefers an explicit color token over tone', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values: [{ label: 'X', value: 10, tone: 'primary', color: 'var(--dz-chart-1)' }] },
    })
    expect(segmentStyles(wrapper)[0]!.backgroundColor).toBe('var(--dz-chart-1)')
  })

  it('cycles the default palette when tone and color are omitted', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values: [{ label: 'A', value: 1 }, { label: 'B', value: 1 }] },
    })
    const colors = segmentStyles(wrapper).map(s => s.backgroundColor)
    expect(colors[0]).toBe('var(--dz-primary-solid)')
    expect(colors[1]).toBe('var(--dz-info-solid)')
  })

  // -- Legend --

  it('renders a default legend with label + value', () => {
    const wrapper = mount(DzMeterGroup, { props: { values } })
    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[0]!.text()).toContain('Images')
    expect(items[0]!.text()).toContain('30')
  })

  it('hides the legend when showLegend is false', () => {
    const wrapper = mount(DzMeterGroup, { props: { values, showLegend: false } })
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('renders a custom legend slot', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values },
      slots: { legend: '<div class="custom-legend">custom</div>' },
    })
    expect(wrapper.find('.custom-legend').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('exposes computed segments + total to slots', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values, max: 200 },
      slots: {
        label: `<template #label="{ total, max, percentage }">
          <span class="summary">{{ total }}/{{ max }}={{ percentage }}</span>
        </template>`,
      },
    })
    expect(wrapper.find('.summary').text()).toBe('100/200=50')
  })

  // -- start / end slots --

  it('renders start and end slots', () => {
    const wrapper = mount(DzMeterGroup, {
      props: { values },
      slots: {
        start: '<span class="start-slot">s</span>',
        end: '<span class="end-slot">e</span>',
      },
    })
    expect(wrapper.find('.start-slot').exists()).toBe(true)
    expect(wrapper.find('.end-slot').exists()).toBe(true)
  })

  it('renders nothing meaningful with empty values', () => {
    const wrapper = mount(DzMeterGroup, { props: { values: [] } })
    expect(wrapper.findAll('[role="meter"]')).toHaveLength(0)
  })
})
