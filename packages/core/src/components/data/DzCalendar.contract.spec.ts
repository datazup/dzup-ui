import { mount } from '@vue/test-utils'
/**
 * DzCalendar — Contract Spec v1 conformance tests.
 */
import { describe, expect, it } from 'vitest'
import DzCalendar from './DzCalendar.vue'

describe('dzCalendar — Contract Spec v1', () => {
  it('renders without errors', () => {
    const wrapper = mount(DzCalendar)
    expect(wrapper.exists()).toBe(true)
  })

  it('has contain: layout style on root element', () => {
    const wrapper = mount(DzCalendar)
    expect(wrapper.classes()).toContain('[contain:layout_style]')
  })

  it('exposes the dz-calendar root class for token scoping', () => {
    const wrapper = mount(DzCalendar)
    expect(wrapper.classes()).toContain('dz-calendar')
  })

  it('accepts all canonical size values', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
    for (const size of sizes) {
      const wrapper = mount(DzCalendar, { props: { size } })
      expect(wrapper.attributes('data-size')).toBe(size)
    }
  })

  it('renders a role="grid" surface', () => {
    const wrapper = mount(DzCalendar)
    expect(wrapper.find('[role="grid"]').exists()).toBe(true)
  })

  it('renders rows and gridcells', () => {
    const wrapper = mount(DzCalendar)
    expect(wrapper.findAll('[role="row"]').length).toBeGreaterThan(0)
    expect(wrapper.findAll('[role="gridcell"]').length).toBe(42)
  })

  it('renders 7 column headers', () => {
    const wrapper = mount(DzCalendar)
    expect(wrapper.findAll('[role="columnheader"]')).toHaveLength(7)
  })

  it('gives each day button a full-date aria-label', () => {
    const wrapper = mount(DzCalendar, { props: { focusedDate: '2026-06-15' } })
    const button = wrapper.get('button[data-iso="2026-06-15"]')
    expect(button.attributes('aria-label')).toBeTruthy()
    expect(button.attributes('aria-label')).toContain('2026')
  })

  it('forwards aria-label to the grid', () => {
    const wrapper = mount(DzCalendar, { props: { ariaLabel: 'Booking calendar' } })
    expect(wrapper.find('[role="grid"]').attributes('aria-label')).toBe('Booking calendar')
  })

  it('exposes a polite live region', () => {
    const wrapper = mount(DzCalendar)
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('merges consumer class via cn()', () => {
    const wrapper = mount(DzCalendar, { attrs: { class: 'custom-class' } })
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('applies exactly one roving tabindex=0 per grid', () => {
    const wrapper = mount(DzCalendar, { props: { focusedDate: '2026-06-15' } })
    const tabbable = wrapper.findAll('button[data-iso]').filter(b => b.attributes('tabindex') === '0')
    expect(tabbable).toHaveLength(1)
    expect(tabbable[0]!.attributes('data-iso')).toBe('2026-06-15')
  })

  // ── Events ──

  it('emits panelChange with the new focused date when the month changes', async () => {
    const wrapper = mount(DzCalendar, { props: { focusedDate: '2026-06-15' } })
    await wrapper.get('button[aria-label="Next month"]').trigger('click')
    expect(wrapper.emitted('panelChange')).toEqual([[{ focusedDate: '2026-07-15', view: 'month' }]])
  })

  it('does not emit panelChange when focus stays in the visible month', async () => {
    const wrapper = mount(DzCalendar, { props: { focusedDate: '2026-06-15' } })
    await wrapper.get('button[data-iso="2026-06-15"]').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-22'])
    expect(wrapper.emitted('panelChange')).toBeUndefined()
  })

  // ── Slots ──

  it('renders the #day slot with its scope in place of the day number', () => {
    const wrapper = mount(DzCalendar, {
      props: { focusedDate: '2026-06-15', value: '2026-06-10' },
      slots: {
        day: `<template #day="{ date, isSelected, isOutsideMonth }">
          <span class="day-probe" :data-day="date.getDate()" :data-selected="String(isSelected)" :data-outside="String(isOutsideMonth)">*</span>
        </template>`,
      },
    })
    expect(wrapper.findAll('.day-probe')).toHaveLength(42)
    const selected = wrapper.get('button[data-iso="2026-06-10"] .day-probe')
    expect(selected.attributes('data-day')).toBe('10')
    expect(selected.attributes('data-selected')).toBe('true')
    expect(selected.attributes('data-outside')).toBe('false')
    expect(wrapper.get('button[data-iso="2026-06-15"]').text()).toBe('*')
  })
})
