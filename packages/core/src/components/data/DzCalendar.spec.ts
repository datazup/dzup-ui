import { mount } from '@vue/test-utils'
/**
 * DzCalendar — unit/behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import DzCalendar from './DzCalendar.vue'

const FOCUS = '2026-06-15'

function mountCal(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
  return mount(DzCalendar, { props: { focusedDate: FOCUS, ...props }, ...options })
}

describe('dzCalendar — selection', () => {
  it('single mode: selecting emits the ISO string', async () => {
    const wrapper = mountCal({ mode: 'single' })
    await wrapper.get('button[data-iso="2026-06-10"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual(['2026-06-10'])
  })

  it('single mode: marks the selected cell', async () => {
    const wrapper = mountCal({ mode: 'single', value: '2026-06-10' })
    const btn = wrapper.get('button[data-iso="2026-06-10"]')
    expect(btn.attributes('data-selected')).toBe('')
    expect(btn.attributes('aria-label')).toBeTruthy()
    const cell = btn.element.closest('[role="gridcell"]')
    expect(cell?.getAttribute('aria-selected')).toBe('true')
  })

  it('multiple mode: toggles membership and keeps sorted', async () => {
    const wrapper = mountCal({ mode: 'multiple', value: ['2026-06-12'] })
    await wrapper.get('button[data-iso="2026-06-10"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([['2026-06-10', '2026-06-12']])
  })

  it('multiple mode: clicking a selected day removes it', async () => {
    const wrapper = mountCal({ mode: 'multiple', value: ['2026-06-10', '2026-06-12'] })
    await wrapper.get('button[data-iso="2026-06-10"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([['2026-06-12']])
  })

  it('range mode: first click sets start, second sets end', async () => {
    const wrapper = mountCal({ mode: 'range' })
    await wrapper.get('button[data-iso="2026-06-10"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([{ start: '2026-06-10', end: null }])
    await wrapper.setProps({ value: { start: '2026-06-10', end: null } })
    await wrapper.get('button[data-iso="2026-06-14"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([{ start: '2026-06-10', end: '2026-06-14' }])
  })

  it('range mode: selecting before start swaps endpoints', async () => {
    const wrapper = mountCal({ mode: 'range', value: { start: '2026-06-10', end: null } })
    await wrapper.get('button[data-iso="2026-06-05"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([{ start: '2026-06-05', end: '2026-06-10' }])
  })

  it('range mode: highlights in-range cells', () => {
    const wrapper = mountCal({ mode: 'range', value: { start: '2026-06-10', end: '2026-06-14' } })
    expect(wrapper.get('button[data-iso="2026-06-12"]').attributes('data-in-range')).toBe('')
    expect(wrapper.get('button[data-iso="2026-06-10"]').attributes('data-selected')).toBe('')
    expect(wrapper.get('button[data-iso="2026-06-14"]').attributes('data-selected')).toBe('')
  })
})

describe('dzCalendar — constraints', () => {
  it('disables dates outside minDate/maxDate', () => {
    const wrapper = mountCal({ minDate: '2026-06-10', maxDate: '2026-06-20' })
    expect(wrapper.get('button[data-iso="2026-06-05"]').attributes('data-disabled')).toBe('')
    expect(wrapper.get('button[data-iso="2026-06-25"]').attributes('data-disabled')).toBe('')
    expect(wrapper.get('button[data-iso="2026-06-15"]').attributes('data-disabled')).toBeUndefined()
  })

  it('honors the disabledDate predicate', async () => {
    const disabledDate = (d: Date) => d.getDate() === 13
    const wrapper = mountCal({ disabledDate })
    const btn = wrapper.get('button[data-iso="2026-06-13"]')
    expect(btn.attributes('data-disabled')).toBe('')
    expect(btn.attributes('aria-disabled')).toBe('true')
    await btn.trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })

  it('readonly prevents selection but stays navigable', async () => {
    const wrapper = mountCal({ readonly: true, mode: 'single' })
    await wrapper.get('button[data-iso="2026-06-10"]').trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.find('[role="grid"]').attributes('aria-readonly')).toBe('true')
  })
})

describe('dzCalendar — keyboard grid navigation', () => {
  it('ArrowRight moves focus by one day', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-16'])
  })

  it('ArrowDown moves focus by one week', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-22'])
  })

  it('PageDown moves focus by one month and emits panelChange', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'PageDown' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-07-15'])
    expect(wrapper.emitted('panelChange')?.at(-1)).toEqual([{ focusedDate: '2026-07-15', view: 'month' }])
  })

  it('Home/End jump to week edges', async () => {
    const wrapper = mountCal({ firstDayOfWeek: 0 }) // Sunday-start
    const grid = wrapper.get('[role="grid"]')
    await grid.trigger('keydown', { key: 'Home' })
    // 2026-06-15 is a Monday; Sunday-start week begins 2026-06-14.
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-14'])
    await grid.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-20'])
  })

  it('Enter selects the focused day', async () => {
    const wrapper = mountCal({ mode: 'single' })
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([FOCUS])
  })

  it('does not navigate when disabled', async () => {
    const wrapper = mountCal({ disabled: true })
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:focusedDate')).toBeUndefined()
  })
})

describe('dzCalendar — header controls', () => {
  it('next advances the month and emits panelChange', async () => {
    const wrapper = mountCal()
    await wrapper.get('button[aria-label="Next month"]').trigger('click')
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-07-15'])
    expect(wrapper.emitted('panelChange')?.at(-1)).toEqual([{ focusedDate: '2026-07-15', view: 'month' }])
  })

  it('prev rewinds the month', async () => {
    const wrapper = mountCal()
    await wrapper.get('button[aria-label="Previous month"]').trigger('click')
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-05-15'])
  })

  it('week view navigates by week', async () => {
    const wrapper = mountCal({ view: 'week' })
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(7)
    await wrapper.get('button[aria-label="Next week"]').trigger('click')
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-22'])
  })
})

describe('dzCalendar — slots', () => {
  it('renders the #day slot with cell metadata', () => {
    const wrapper = mountCal({ mode: 'single', value: '2026-06-15' }, {
      slots: {
        day: `<template #day="{ dayNumber, isSelected }">
          <span class="custom-day" :data-sel="isSelected">{{ dayNumber }}*</span>
        </template>`,
      },
    })
    const selected = wrapper.get('button[data-iso="2026-06-15"]')
    expect(selected.find('.custom-day').exists()).toBe(true)
    expect(selected.text()).toContain('15*')
    expect(selected.find('.custom-day').attributes('data-sel')).toBe('true')
  })

  it('defaults to the day number without a slot', () => {
    const wrapper = mountCal()
    expect(wrapper.get('button[data-iso="2026-06-15"]').text()).toBe('15')
  })
})

describe('dzCalendar — accessibility roles', () => {
  it('uses grid/row/gridcell/columnheader roles', () => {
    const wrapper = mountCal()
    expect(wrapper.find('[role="grid"]').exists()).toBe(true)
    expect(wrapper.findAll('[role="columnheader"]')).toHaveLength(7)
    expect(wrapper.findAll('[role="gridcell"]')).toHaveLength(42)
  })

  it('marks today with data-today', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 15))
    const wrapper = mount(DzCalendar, { props: { focusedDate: '2026-06-15' } })
    expect(wrapper.get('button[data-iso="2026-06-15"]').attributes('data-today')).toBe('')
    vi.useRealTimers()
  })
})
