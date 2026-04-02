/**
 * DzDatePicker — type definitions.
 *
 * Uses Reka UI DatePicker primitives (ADR-07) and
 * @internationalized/date for date handling (ADR-13).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/forms/DzDatePicker
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  InputVariant,
  SelectOpenableEvents,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzDatePicker component */
export interface DzDatePickerProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Placeholder text when no date is selected */
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

/** Events emitted by DzDatePicker */
export interface DzDatePickerEmits extends SelectOpenableEvents<string> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzDatePicker */
export interface DzDatePickerSlots {
  /** Custom trigger content */
  trigger?: (props: { value: string | undefined, placeholder: string | undefined }) => unknown
}
