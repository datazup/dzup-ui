/**
 * DzDateRangePicker — type definitions.
 *
 * Uses Reka UI DateRangePicker primitives (ADR-07) and
 * @internationalized/date for date handling (ADR-13).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzip-ui/core/components/forms/DzDateRangePicker
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  InputVariant,
  SelectOpenableEvents,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Value type
// ---------------------------------------------------------------------------

/** Date range value with start and end as ISO 8601 strings */
export interface DateRangeValue {
  /** Start date (ISO 8601 string, e.g. '2026-01-15') */
  start: string
  /** End date (ISO 8601 string, e.g. '2026-01-31') */
  end: string
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzDateRangePicker component */
export interface DzDateRangePickerProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Placeholder text when no range is selected */
  placeholder?: string
  /** Minimum selectable date (ISO 8601 string) */
  min?: string
  /** Maximum selectable date (ISO 8601 string) */
  max?: string
  /** Locale for date formatting (BCP 47 tag, e.g. 'en-US') */
  locale?: string
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Visual style variant */
  variant?: InputVariant
  /** Form field name */
  name?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzDateRangePicker */
export interface DzDateRangePickerEmits extends SelectOpenableEvents<DateRangeValue> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzDateRangePicker */
export interface DzDateRangePickerSlots {
  /** Custom trigger content */
  trigger?: (props: { value: DateRangeValue | undefined, placeholder: string | undefined }) => unknown
}
