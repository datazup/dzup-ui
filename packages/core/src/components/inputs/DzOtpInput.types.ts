/**
 * DzOtpInput — Type definitions for the OTP/PIN input component.
 *
 * Uses Reka UI PinInput primitives (ADR-07).
 * v-model via defineModel (ADR-16).
 *
 * @module @dzup-ui/core/components/inputs/DzOtpInput
 */

import type {
  BaseAccessibilityProps,
  BaseValidationProps,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { DzOtpInputUi } from './DzOtpInput.anatomy.ts'

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
  /**
   * Whether the cells are a **one-time code** the platform may autofill.
   *
   * Defaults to `true`, which is what the component is named for: each cell
   * renders `autocomplete="one-time-code"`, so iOS, macOS and Android offer the
   * code they just received in an SMS, and focus lands on the first empty cell
   * rather than the cell that was tapped.
   *
   * That autofill is the *mechanism* WCAG 2.2 SC 3.3.8 Accessible
   * Authentication (AA) accepts in place of asking the user to transcribe a code
   * from another device — a cognitive-function test the criterion exists to
   * remove. Set `:otp="false"` for a PIN or passcode the platform must not
   * offer to fill, such as a local unlock code.
   */
  otp?: boolean
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Component size */
  size?: CanonicalSize
  /** Form field name */
  name?: string
  /**
   * Per-part class overrides, keyed by the names in `DzOtpInput.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzOtpInput v-model="code" :ui="{ input: 'rounded-full' }" />
   * ```
   */
  ui?: DzOtpInputUi
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
