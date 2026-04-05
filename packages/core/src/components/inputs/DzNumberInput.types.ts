/**
 * DzNumberInput — type definitions.
 *
 * Numeric input with increment/decrement buttons and value clamping.
 *
 * @module @dzip-ui/core/components/inputs/DzNumberInput
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzip-ui/contracts'

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

/** Events emitted by DzNumberInput */
export interface DzNumberInputEmits extends ChangeEvents<number> {
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
