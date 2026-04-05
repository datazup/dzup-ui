/**
 * useDatePicker — Date conversion utilities for DzDatePicker and DzDateRangePicker.
 *
 * Handles conversion between ISO 8601 strings and @internationalized/date
 * CalendarDate objects used by Reka UI date primitives (ADR-13).
 *
 * @module @dzip-ui/core/composables/useDatePicker
 */

import type { DateValue } from '@internationalized/date'
import type { Ref } from 'vue'
import {

  getLocalTimeZone,
  parseDate,
  today,
} from '@internationalized/date'
import { computed } from 'vue'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useDatePicker composable */
export interface UseDatePickerOptions {
  /** ISO 8601 date string model (e.g. '2026-01-15') */
  modelValue: Ref<string>
  /** Minimum selectable date as ISO string */
  min?: Ref<string | undefined>
  /** Maximum selectable date as ISO string */
  max?: Ref<string | undefined>
  /** Locale for formatting (BCP 47 tag) */
  locale?: Ref<string | undefined>
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return value of the useDatePicker composable */
export interface UseDatePickerReturn {
  /** Current date as CalendarDate (for Reka UI binding) */
  dateValue: Ref<DateValue | undefined>
  /** Minimum date as CalendarDate */
  minValue: Ref<DateValue | undefined>
  /** Maximum date as CalendarDate */
  maxValue: Ref<DateValue | undefined>
  /** Placeholder date (today by default) */
  placeholderDate: Ref<DateValue>
  /** Resolved locale string */
  resolvedLocale: Ref<string>
  /** Convert CalendarDate to ISO string */
  toISOString: (date: DateValue | undefined) => string
  /** Convert ISO string to CalendarDate */
  fromISOString: (iso: string | undefined) => DateValue | undefined
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Provides bidirectional conversion between ISO 8601 date strings and
 * CalendarDate objects, plus min/max boundary parsing.
 */
export function useDatePicker(options: UseDatePickerOptions): UseDatePickerReturn {
  const { modelValue, min, max, locale } = options

  const resolvedLocale = computed(() => locale?.value ?? 'en-US')

  const placeholderDate = computed<DateValue>(() => today(getLocalTimeZone()))

  /**
   * Parse an ISO date string into a CalendarDate.
   * Returns undefined for empty/invalid strings.
   */
  function fromISOString(iso: string | undefined): DateValue | undefined {
    if (!iso)
      return undefined
    try {
      return parseDate(iso)
    }
    catch {
      return undefined
    }
  }

  /** Convert a CalendarDate to an ISO 8601 string */
  function toISOString(date: DateValue | undefined): string {
    if (!date)
      return ''
    return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
  }

  const dateValue = computed<DateValue | undefined>(() =>
    fromISOString(modelValue.value),
  )

  const minValue = computed<DateValue | undefined>(() =>
    fromISOString(min?.value),
  )

  const maxValue = computed<DateValue | undefined>(() =>
    fromISOString(max?.value),
  )

  return {
    dateValue,
    minValue,
    maxValue,
    placeholderDate,
    resolvedLocale,
    toISOString,
    fromISOString,
  }
}
