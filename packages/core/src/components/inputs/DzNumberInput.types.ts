/**
 * DzNumberInput — type definitions.
 *
 * Numeric input with increment/decrement buttons and value clamping.
 *
 * @module @dzup-ui/core/components/inputs/DzNumberInput
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzNumberInput component */
export interface DzNumberInputProps extends BaseFormControlProps<InputVariant> {
  /** Placeholder text shown when empty */
  placeholder?: string
  /** Minimum allowed value */
  min?: number
  /** Maximum allowed value */
  max?: number
  /** Step increment for +/- buttons and arrow keys */
  step?: number
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/**
 * Events emitted by DzNumberInput.
 *
 * `change` carries `number | undefined` and not `number`, because the model is
 * `number | undefined` and the two must agree: clearing the field sets the
 * model to `undefined` — the empty value the renderer contract's C1.4 names —
 * and the event previously announced `0` for the same edit. A consumer reading
 * the event and a consumer reading the model got different answers, and `0` is
 * a legitimate value, so nothing downstream could tell the difference between
 * "the user cleared it" and "the user typed zero".
 *
 * Widening the payload is a **minor with a behaviour note**: a handler typed
 * `(value: number) => void` needs `number | undefined`.
 */
export interface DzNumberInputEmits extends ChangeEvents<number | undefined> {
  /** Value incremented via + button or arrow key */
  increment: []
  /** Value decremented via - button or arrow key */
  decrement: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzNumberInput */
export interface DzNumberInputSlots {
  /** Content rendered before the input (icon, label fragment) */
  prefix?: () => unknown
}
