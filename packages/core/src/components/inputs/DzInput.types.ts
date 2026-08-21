/**
 * DzInput — type definitions.
 *
 * Text input component with prefix/suffix slots, clearable behavior,
 * and full form-control contract compliance.
 *
 * @module @dzup-ui/core/components/inputs/DzInput
 */

import type { BaseFormControlProps, ChangeEvents, InputVariant } from '@dzup-ui/contracts'
import type { DzInputUi } from './DzInput.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzInput component */
export interface DzInputProps extends BaseFormControlProps<InputVariant> {
  /** HTML input type */
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search' | 'number' | 'date'
  /** Placeholder text shown when the input is empty */
  placeholder?: string
  /** Maximum number of characters allowed */
  maxlength?: number
  /** Whether the input shows a clear button when non-empty */
  clearable?: boolean
  /**
   * Per-part class overrides, keyed by the names in `DzInput.anatomy.ts`
   * (ADR-19). `class` keeps landing on the `control` part — the visual field —
   * which is where it has always landed; `ui.root` reaches the outer node.
   *
   * @example
   * ```vue
   * <DzInput v-model="q" clearable :ui="{ clear: 'text-[var(--dz-danger)]' }" />
   * ```
   */
  ui?: DzInputUi
  /** Accessible label for the loading spinner shown when `loading` is true */
  loadingLabel?: string
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
