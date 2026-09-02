/**
 * DzTextarea — type definitions.
 *
 * Multiline text input with optional auto-resize behavior.
 *
 * @module @dzup-ui/core/components/inputs/DzTextarea
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzup-ui/contracts'
import type { DzTextareaUi } from './DzTextarea.anatomy.ts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTextarea component */
export interface DzTextareaProps extends BaseFormControlProps<InputVariant> {
  /** Placeholder text shown when empty */
  placeholder?: string
  /** Number of visible text rows */
  rows?: number
  /** Maximum number of characters allowed */
  maxlength?: number
  /** Whether to auto-resize height based on content */
  autoResize?: boolean
  /** Maximum number of rows when auto-resizing */
  maxRows?: number
  /** Accessible label for the loading spinner shown when `loading` is true */
  loadingLabel?: string
  /**
   * Per-part class overrides, keyed by the names in `DzTextarea.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzTextarea v-model="bio" :ui="{ error: 'text-[var(--dz-warning)]' }" />
   * ```
   */
  ui?: DzTextareaUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzTextarea */
export interface DzTextareaEmits extends ChangeEvents<string> {
  // No extra events beyond ChangeEvents<string>
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTextarea */
export interface DzTextareaSlots {
  // DzTextarea has no slots — the textarea element is the sole content
}
