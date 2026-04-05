/**
 * DzTimePicker — type definitions.
 *
 * Uses Reka UI TimeFieldRoot primitive (ADR-07).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzip-ui/core/components/forms/DzTimePicker
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
  ChangeEvents,
  InputVariant,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTimePicker component */
export interface DzTimePickerProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Placeholder text when no time is selected */
  placeholder?: string
  /** Minimum selectable time (HH:mm format) */
  min?: string
  /** Maximum selectable time (HH:mm format) */
  max?: string
  /** Step interval in minutes */
  step?: number
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Visual style variant */
  variant?: InputVariant
  /** Form field name */
  name?: string
  /** Locale for time formatting (BCP 47 tag) */
  locale?: string
  /** Use 24-hour format (default: follows locale) */
  hour12?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzTimePicker */
export interface DzTimePickerEmits extends ChangeEvents<string> {}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTimePicker */
export interface DzTimePickerSlots {
  /** Default slot for label */
  default?: () => unknown
}
