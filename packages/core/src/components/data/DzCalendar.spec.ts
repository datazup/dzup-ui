import { mount } from '@vue/test-utils'
/**
 * DzCalendar — unit/behavior tests.
 */
import { describe, expect, it, vi } from 'vitest'
import DzCalendar from './DzCalendar.vue'

const FOCUS = '2026-06-15'

describe('dzCalendar — controlled and uncontrolled value ownership', () => {
  it.each([false, true])('selection, controlled=%s', async (controlled) => {
    const wrapper = mountCal({ value: '2026-06-10', ...(controlled ? { 'onUpdate:value': () => {} } : {}) })
    await wrapper.get('button[data-iso="2026-06-12"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual(['2026-06-12'])
    expect(wrapper.get(`button[data-iso="${controlled ? '2026-06-10' : '2026-06-12'}"]`).attributes('data-selected')).toBe('')
    await wrapper.setProps({ value: '2026-06-14' })
    expect(wrapper.get('button[data-iso="2026-06-14"]').attributes('data-selected')).toBe('')
    expect(wrapper.get('button[data-iso="2026-06-12"]').attributes('data-selected')).toBeUndefined()
    wrapper.unmount()
  })

  it.each([false, true])('focusedDate, controlled=%s', async (controlled) => {
    const wrapper = mountCal(controlled ? { 'onUpdate:focusedDate': () => {} } : {})
    await wrapper.get('button[data-iso="2026-06-15"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-16'])
    expect(wrapper.get(`button[data-iso="${controlled ? FOCUS : '2026-06-16'}"]`).attributes('tabindex')).toBe('0')
    await wrapper.setProps({ focusedDate: '2026-06-18' })
    expect(wrapper.get('button[data-iso="2026-06-18"]').attributes('tabindex')).toBe('0')
    wrapper.unmount()
  })
})

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
  it('arrowRight moves focus by one day', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-16'])
  })

  it('arrowDown moves focus by one week', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-22'])
  })

  it('pageDown moves focus by one month and emits panelChange', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'PageDown' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-07-15'])
    expect(wrapper.emitted('panelChange')?.at(-1)).toEqual([{ focusedDate: '2026-07-15', view: 'month' }])
  })

  // `D-RES14-3`, closed by RESIDUAL-15. The two `modifiers: ['Shift']` page rows
  // have been published since TASK-R5-O5 and nothing read `shiftKey`, so
  // RESIDUAL-14 §3.2 ejected them once a declared modifier became part of the
  // contract. Both tests drive the key WITH the modifier and assert the year the
  // panel lands on — not that a `PageUp` arm exists, which the month rows above
  // already prove.
  it('shift+PageUp moves focus back one year and emits panelChange', async () => {
    const wrapper = mountCal()
    const grid = wrapper.get('[role="grid"]')
    grid.element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'PageUp', shiftKey: true, bubbles: true, cancelable: true }),
    )
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2025-06-15'])
    expect(wrapper.emitted('panelChange')?.at(-1)).toEqual([{ focusedDate: '2025-06-15', view: 'month' }])
  })

  it('shift+PageDown moves focus forward one year, and the unmodified key still moves a month', async () => {
    const wrapper = mountCal()
    const grid = wrapper.get('[role="grid"]')
    grid.element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'PageDown', shiftKey: true, bubbles: true, cancelable: true }),
    )
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2027-06-15'])

    // The same arm serves both rows, so the unmodified behaviour is asserted here
    // too: a ternary that ignored `shiftKey` in the other direction would pass the
    // test above and break the month row.
    await grid.trigger('keydown', { key: 'PageDown' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2027-07-15'])
  })

  it('home/End jump to week edges', async () => {
    const wrapper = mountCal({ firstDayOfWeek: 0 }) // Sunday-start
    const grid = wrapper.get('[role="grid"]')
    await grid.trigger('keydown', { key: 'Home' })
    // 2026-06-15 is a Monday; Sunday-start week begins 2026-06-14.
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-14'])
    await grid.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-20'])
  })

  it('enter selects the focused day', async () => {
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

// Keyboard contract rows the spec did not dispatch (DZUP-UI-R11-02):
// `ArrowLeft`, `ArrowUp` and `Space`.
describe('dzCalendar — keyboard contract: ArrowLeft, ArrowUp, Space', () => {
  it('moves focus one day to the inline start on ArrowLeft', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-14'])
  })

  it('moves focus one row up on ArrowUp', async () => {
    const wrapper = mountCal()
    await wrapper.get('[role="grid"]').trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:focusedDate')?.at(-1)).toEqual(['2026-06-08'])
  })

  it('selects the focused day on Space, as Enter does, and consumes the key', async () => {
    const wrapper = mountCal()
    const grid = wrapper.get('[role="grid"]').element
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    grid.dispatchEvent(space)
    await wrapper.vm.$nextTick()
    expect(space.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([FOCUS])

    const viaEnter = mountCal()
    await viaEnter.get('[role="grid"]').trigger('keydown', { key: 'Enter' })
    expect(viaEnter.emitted('update:value')?.at(-1)).toEqual([FOCUS])
  })

  it('does not select a disabled focused day on Space', async () => {
    const wrapper = mountCal({ disabled: true })
    await wrapper.get('[role="grid"]').trigger('keydown', { key: ' ' })
    expect(wrapper.emitted('update:value')).toBeUndefined()
  })
})
