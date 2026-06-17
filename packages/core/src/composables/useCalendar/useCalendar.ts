/**
 * useCalendar — Month/week grid date math for DzCalendar.
 *
 * Builds the visible week × day matrix, weekday header labels, and the
 * localized period heading from a focused ISO date. Reuses
 * @internationalized/date CalendarDate primitives (ADR-13), the same
 * foundation that powers DzDatePicker via {@link useDatePicker}.
 *
 * Stateless with respect to selection — selection lives in the component.
 *
 * @module @dzup-ui/core/composables/useCalendar
 */

import type { Ref } from 'vue'
import {
  CalendarDate,
  DateFormatter,
  getLocalTimeZone,
  isToday as isTodayInTz,
  parseDate,
  today,
} from '@internationalized/date'
import { computed } from 'vue'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Calendar surface view granularity */
export type CalendarView = 'month' | 'week'

/** Day index where the week begins (0 = Sunday … 6 = Saturday) */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

/** A single rendered day cell in the visible grid */
export interface CalendarDay {
  /** Underlying CalendarDate */
  date: CalendarDate
  /** ISO 8601 string (YYYY-MM-DD) */
  iso: string
  /** Native Date (local timezone) — passed to slot + disabledDate predicate */
  jsDate: Date
  /** Localized full-date accessible label (e.g. "Monday, June 1, 2026") */
  label: string
  /** Day-of-month number */
  dayNumber: number
  /** Whether this cell is today */
  isToday: boolean
  /** Whether this cell falls outside the focused month (month view only) */
  isOutsideMonth: boolean
}

/** Options for the useCalendar composable */
export interface UseCalendarOptions {
  /** Focused ISO date string driving the visible period (may be empty) */
  focusedDate: Ref<string>
  /** View granularity */
  view: Ref<CalendarView>
  /** First day of week (0 = Sunday … 6 = Saturday) */
  firstDayOfWeek: Ref<WeekdayIndex>
  /** Locale for formatting (BCP 47 tag) */
  locale: Ref<string | undefined>
}

/** Return value of the useCalendar composable */
export interface UseCalendarReturn {
  /** Resolved focused date as CalendarDate (falls back to today) */
  focusedCalendarDate: Ref<CalendarDate>
  /** Focused date as ISO string (always present, used for roving tabindex) */
  focusedIso: Ref<string>
  /** Visible grid as rows of days (6 rows in month view, 1 in week view) */
  weeks: Ref<CalendarDay[][]>
  /** Ordered, localized weekday header labels */
  weekDayLabels: Ref<string[]>
  /** Localized period heading (e.g. "June 2026") */
  periodLabel: Ref<string>
  /** Resolved locale string */
  resolvedLocale: Ref<string>
  /** Convert a CalendarDate to an ISO string */
  toISO: (date: CalendarDate) => string
  /** Parse an ISO string into a CalendarDate (undefined when empty/invalid) */
  parseISO: (iso: string | undefined) => CalendarDate | undefined
  /** Today as a CalendarDate */
  todayDate: () => CalendarDate
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

const NUM_MONTH_ROWS = 6
const DAYS_PER_WEEK = 7

/**
 * Provides the visible grid matrix, weekday labels, and period heading for a
 * month/week calendar surface. Pure date math — no selection state.
 */
export function useCalendar(options: UseCalendarOptions): UseCalendarReturn {
  const { focusedDate, view, firstDayOfWeek, locale } = options

  const tz = getLocalTimeZone()
  const resolvedLocale = computed(() => locale?.value ?? 'en-US')

  function todayDate(): CalendarDate {
    return today(tz)
  }

  function parseISO(iso: string | undefined): CalendarDate | undefined {
    if (!iso)
      return undefined
    try {
      return parseDate(iso)
    }
    catch {
      return undefined
    }
  }

  function toISO(date: CalendarDate): string {
    return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  }

  /** JS weekday (0 = Sunday … 6 = Saturday) for a CalendarDate */
  function jsWeekday(date: CalendarDate): number {
    return date.toDate(tz).getDay()
  }

  const focusedCalendarDate = computed<CalendarDate>(
    () => parseISO(focusedDate.value) ?? todayDate(),
  )

  const focusedIso = computed(() => toISO(focusedCalendarDate.value))

  /** First cell of the visible grid, aligned to firstDayOfWeek */
  const gridStart = computed<CalendarDate>(() => {
    const focused = focusedCalendarDate.value
    const fdow = firstDayOfWeek.value
    if (view.value === 'week') {
      const offset = (jsWeekday(focused) - fdow + DAYS_PER_WEEK) % DAYS_PER_WEEK
      return focused.subtract({ days: offset })
    }
    const monthStart = focused.set({ day: 1 })
    const offset = (jsWeekday(monthStart) - fdow + DAYS_PER_WEEK) % DAYS_PER_WEEK
    return monthStart.subtract({ days: offset })
  })

  const labelFormatter = computed(
    () => new DateFormatter(resolvedLocale.value, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  )

  function buildDay(date: CalendarDate, focusedMonth: number): CalendarDay {
    return {
      date,
      iso: toISO(date),
      jsDate: date.toDate(tz),
      label: labelFormatter.value.format(date.toDate(tz)),
      dayNumber: date.day,
      isToday: isTodayInTz(date, tz),
      isOutsideMonth: view.value === 'month' && date.month !== focusedMonth,
    }
  }

  const weeks = computed<CalendarDay[][]>(() => {
    const start = gridStart.value
    const focusedMonth = focusedCalendarDate.value.month
    const rowCount = view.value === 'week' ? 1 : NUM_MONTH_ROWS
    const rows: CalendarDay[][] = []
    for (let w = 0; w < rowCount; w++) {
      const row: CalendarDay[] = []
      for (let d = 0; d < DAYS_PER_WEEK; d++) {
        row.push(buildDay(start.add({ days: w * DAYS_PER_WEEK + d }), focusedMonth))
      }
      rows.push(row)
    }
    return rows
  })

  const weekDayLabels = computed<string[]>(() => {
    const fmt = new DateFormatter(resolvedLocale.value, { weekday: 'short' })
    const start = gridStart.value
    const labels: string[] = []
    for (let d = 0; d < DAYS_PER_WEEK; d++) {
      labels.push(fmt.format(start.add({ days: d }).toDate(tz)))
    }
    return labels
  })

  const periodLabel = computed<string>(() => {
    const fmt = new DateFormatter(resolvedLocale.value, { month: 'long', year: 'numeric' })
    return fmt.format(focusedCalendarDate.value.toDate(tz))
  })

  return {
    focusedCalendarDate,
    focusedIso,
    weeks,
    weekDayLabels,
    periodLabel,
    resolvedLocale,
    toISO,
    parseISO,
    todayDate,
  }
}
