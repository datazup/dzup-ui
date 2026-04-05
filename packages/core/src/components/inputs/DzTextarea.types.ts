/**
 * DzTextarea — type definitions.
 *
 * Multiline text input with optional auto-resize behavior.
 *
 * @module @dzip-ui/core/components/inputs/DzTextarea
 */

import type {
  BaseFormControlProps,
  ChangeEvents,
  InputVariant,
} from '@dzip-ui/contracts'

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
