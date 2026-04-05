/**
 * DzInput — type definitions.
 *
 * Text input component with prefix/suffix slots, clearable behavior,
 * and full form-control contract compliance.
 *
 * @module @dzip-ui/core/components/inputs/DzInput
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzInput component */
export interface DzInputProps extends BaseFormControlProps<InputVariant> {
  /** HTML input type */
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search'
  /** Placeholder text shown when the input is empty */
  placeholder?: string
  /** Maximum number of characters allowed */
  maxlength?: number
  /** Whether the input shows a clear button when non-empty */
  clearable?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzInput */
export interface DzInputEmits extends ChangeEvents<string> {
  /** Value cleared via the clear button */
  clear: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzInput */
export interface DzInputSlots {
  /** Content rendered before the input (icon, label fragment) */
  prefix?: () => unknown
  /** Content rendered after the input (icon, action) */
  suffix?: () => unknown
}
