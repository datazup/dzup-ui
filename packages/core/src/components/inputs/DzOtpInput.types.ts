/**
 * DzOtpInput — Type definitions for the OTP/PIN input component.
 *
 * Uses Reka UI PinInput primitives (ADR-07).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzip-ui/core/components/inputs/DzOtpInput
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzOtpInput component */
export interface DzOtpInputProps extends BaseAccessibilityProps, BaseValidationProps {
  /** Number of input digits */
  length?: number
  /** Input type: number-only or any text */
  type?: 'number' | 'text'
  /** Mask input values (like a password field) */
  mask?: boolean
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Form field name */
  name?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzOtpInput */
export interface DzOtpInputEmits {
  /** All digits filled */
  complete: [value: string]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzOtpInput */
export interface DzOtpInputSlots {
  /** Default slot (unused -- component is self-contained) */
  default?: () => unknown
}
