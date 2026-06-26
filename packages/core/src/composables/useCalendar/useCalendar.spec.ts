import type { WeekdayIndex } from './useCalendar.ts'
/**
 * useCalendar — unit tests for the month/week grid math.
 */
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useCalendar } from './useCalendar.ts'

function setup(opts: {
  focused?: string
  view?: 'month' | 'week'
  fdow?: WeekdayIndex
  locale?: string
}) {
  return useCalendar({
    focusedDate: ref(opts.focused ?? ''),
    view: ref(opts.view ?? 'month'),
    firstDayOfWeek: ref<WeekdayIndex>(opts.fdow ?? 0),
    locale: ref(opts.locale),
  })
}

describe('useCalendar', () => {
  it('builds a 6-row × 7-day month matrix', () => {
    const { weeks } = setup({ focused: '2026-06-15' })
    expect(weeks.value).toHaveLength(6)
    for (const row of weeks.value)
      expect(row).toHaveLength(7)
  })

  it('builds a single-row week matrix in week view', () => {
    const { weeks } = setup({ focused: '2026-06-15', view: 'week' })
    expect(weeks.value).toHaveLength(1)
    expect(weeks.value[0]).toHaveLength(7)
  })

  it('aligns the first column to firstDayOfWeek (Sunday)', () => {
    const { weeks } = setup({ focused: '2026-06-15', fdow: 0 })
    // June 1 2026 is a Monday; with Sunday-start the grid begins May 31 (Sun).
    expect(weeks.value[0]![0]!.iso).toBe('2026-05-31')
  })

  it('aligns the first column to firstDayOfWeek (Monday)', () => {
    const { weeks } = setup({ focused: '2026-06-15', fdow: 1 })
    // June 1 2026 is a Monday; with Monday-start the grid begins June 1.
    expect(weeks.value[0]![0]!.iso).toBe('2026-06-01')
  })

  it('marks outside-month cells in month view', () => {
    const { weeks } = setup({ focused: '2026-06-15', fdow: 0 })
    expect(weeks.value[0]![0]!.isOutsideMonth).toBe(true) // May 31
    const june1 = weeks.value[0]!.find(d => d.iso === '2026-06-01')
    expect(june1?.isOutsideMonth).toBe(false)
  })

  it('never marks outside-month in week view', () => {
    const { weeks } = setup({ focused: '2026-06-15', view: 'week' })
    expect(weeks.value[0]!.every(d => !d.isOutsideMonth)).toBe(true)
  })

  it('handles month rollover continuously (May → June → July)', () => {
    const { weeks } = setup({ focused: '2026-06-15', fdow: 0 })
    const flat = weeks.value.flat().map(d => d.iso)
    expect(flat[0]).toBe('2026-05-31')
    expect(flat[flat.length - 1]).toBe('2026-07-11')
    // 42 contiguous days, strictly increasing
    for (let i = 1; i < flat.length; i++)
      expect(flat[i]! > flat[i - 1]!).toBe(true)
  })

  it('falls back to today when focusedDate is empty', () => {
    const { focusedIso } = setup({ focused: '' })
    expect(focusedIso.value).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('exposes 7 weekday labels and a period heading', () => {
    const { weekDayLabels, periodLabel } = setup({ focused: '2026-06-15', locale: 'en-US' })
    expect(weekDayLabels.value).toHaveLength(7)
    expect(periodLabel.value).toContain('2026')
    expect(periodLabel.value).toContain('June')
  })

  it('round-trips ISO ↔ CalendarDate', () => {
    const { parseISO, toISO } = setup({})
    const cd = parseISO('2026-02-28')
    expect(cd).toBeDefined()
    expect(toISO(cd!)).toBe('2026-02-28')
    expect(parseISO('')).toBeUndefined()
    expect(parseISO('not-a-date')).toBeUndefined()
  })
})
