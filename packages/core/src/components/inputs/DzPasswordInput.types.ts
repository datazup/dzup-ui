/**
 * DzPasswordInput — Type definitions for password input with visibility toggle.
 *
 * @module @dzup-ui/core/components/inputs/DzPasswordInput
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzup-ui/contracts'
import type { DzPasswordInputUi } from './DzPasswordInput.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzPasswordInput component */
export interface DzPasswordInputProps extends BaseFormControlProps<InputVariant> {
  /** Placeholder text */
  placeholder?: string
  /** Maximum character length */
  maxlength?: number
  /** Accessible label for the loading spinner shown when `loading` is true */
  loadingLabel?: string
  /**
   * Per-part class overrides, keyed by the names in `DzPasswordInput.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzPasswordInput v-model="pw" :ui="{ toggle: 'hidden' }" />
   * ```
   */
  ui?: DzPasswordInputUi
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
