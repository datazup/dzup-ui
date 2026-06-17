/**
 * DzCalendar — type definitions.
 *
 * Full-surface month/week calendar for date selection and day-cell content.
 * Reuses @internationalized/date math via the useCalendar composable (ADR-13).
 * Selection is exposed through v-model:value + v-model:focusedDate (ADR-16).
 *
 * @module @dzup-ui/core/components/data/DzCalendar
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { CalendarView, WeekdayIndex } from '../../composables/useCalendar/index.ts'

// ---------------------------------------------------------------------------
// Selection model
// ---------------------------------------------------------------------------

/** Selection mode for the calendar surface */
export type CalendarMode = 'single' | 'multiple' | 'range'

/** Range selection value (ISO 8601 endpoints) */
export interface CalendarRangeValue {
  /** Range start (ISO 8601 string) or null when unset */
  start: string | null
  /** Range end (ISO 8601 string) or null when unset */
  end: string | null
}

/**
 * v-model:value shape, keyed to {@link CalendarMode}:
 * - `single`   → ISO string | null
 * - `multiple` → ISO string[]
 * - `range`    → {@link CalendarRangeValue}
 */
export type DzCalendarModelValue = string | string[] | CalendarRangeValue | null

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzCalendar component */
export interface DzCalendarProps extends BaseAccessibilityProps {
  /** Selection mode */
  mode?: CalendarMode
  /** View granularity */
  view?: CalendarView
  /** Component size */
  size?: CanonicalSize
  /** Disabled state -- prevents all interaction */
  disabled?: boolean
  /** Read-only state -- navigable but not selectable */
  readonly?: boolean
  /** Minimum selectable date (ISO 8601 string) */
  minDate?: string
  /** Maximum selectable date (ISO 8601 string) */
  maxDate?: string
  /** Predicate marking individual dates as disabled */
  disabledDate?: (date: Date) => boolean
  /** First day of the week (0 = Sunday … 6 = Saturday) */
  firstDayOfWeek?: WeekdayIndex
  /** Locale for formatting (BCP 47 tag, e.g. 'en-US') */
  locale?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Payload emitted when the visible period changes */
export interface CalendarPanelChangePayload {
  /** New focused date (ISO 8601 string) */
  focusedDate: string
  /** Active view granularity */
  view: CalendarView
}

/**
 * Events emitted by DzCalendar.
 *
 * Note: `update:value` and `update:focusedDate` are produced implicitly by the
 * respective `defineModel` calls (ADR-16) and are therefore NOT redeclared here
 * (doing so would double-register the emit). Only explicit, non-model events
 * belong in this interface.
 */
export interface DzCalendarEmits {
  /** Visible period (month/week) changed */
  panelChange: [payload: CalendarPanelChangePayload]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `#day` slot for each rendered cell */
export interface DzCalendarDaySlotProps {
  /** Native Date for the cell */
  date: Date
  /** Whether the cell is today */
  isToday: boolean
  /** Whether the cell is part of the current selection */
  isSelected: boolean
  /** Whether the cell falls outside the focused month */
  isOutsideMonth: boolean
  /** Whether the cell is disabled */
  isDisabled: boolean
  /** Day-of-month number (convenience for default rendering) */
  dayNumber: number
}

/** Slot definitions for DzCalendar */
export interface DzCalendarSlots {
  /** Per-day cell content (event dots, counts, badges). Defaults to day number. */
  day?: (props: DzCalendarDaySlotProps) => unknown
}
