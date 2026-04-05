/**
 * DzPasswordInput — Type definitions for password input with visibility toggle.
 *
 * @module @dzip-ui/core/components/inputs/DzPasswordInput
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzPasswordInput component */
export interface DzPasswordInputProps extends BaseFormControlProps<InputVariant> {
  /** Placeholder text */
  placeholder?: string
  /** Maximum character length */
  maxlength?: number
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzPasswordInput */
export interface DzPasswordInputEmits extends ChangeEvents<string> {
  // Inherits focus, blur, change from ChangeEvents
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzPasswordInput */
export interface DzPasswordInputSlots {
  /** Content rendered before the input (icon) */
  prefix?: () => unknown
}
