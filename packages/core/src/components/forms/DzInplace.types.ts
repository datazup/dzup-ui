/**
 * DzInplace — type definitions.
 *
 * A display→edit toggle wrapper: renders a read-only display view that swaps to
 * an editable field on activation. Standardizes the open/commit/cancel cycle,
 * `saveOn` policy, and focus handling for "click to edit" cells and fields.
 *
 * @module @dzup-ui/core/components/forms/DzInplace
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Unions
// ---------------------------------------------------------------------------

/**
 * When the editor commits its value.
 * - `enter`  — only the Enter key commits
 * - `blur`   — only losing focus commits
 * - `both`   — Enter *or* blur commits (default)
 */
export type DzInplaceSaveOn = 'enter' | 'blur' | 'both'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzInplace component */
export interface DzInplaceProps extends BaseAccessibilityProps {
  /** When the editor commits its value (default `both`) */
  saveOn?: DzInplaceSaveOn
  /** Prevents activation and interaction */
  disabled?: boolean
  /** Control size — forwarded to the built-in DzInput editor */
  size?: CanonicalSize
  /** Placeholder for the built-in DzInput editor (no `#edit` slot) */
  placeholder?: string
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzInplace */
export interface DzInplaceEmits<T = unknown> {
  /** Editor was opened (display → edit) */
  open: []
  /** Value committed; payload is the current model value */
  save: [value: T]
  /** Edit was cancelled and the prior value restored */
  cancel: []
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `#display` slot */
export interface DzInplaceDisplaySlotProps<T = unknown> {
  /** Current model value */
  value: T
  /** Open the editor (display → edit) */
  activate: () => void
}

/** Props passed to the `#edit` slot */
export interface DzInplaceEditSlotProps<T = unknown> {
  /** Current model value (bind your input to it) */
  value: T
  /** Update the model value without committing */
  setValue: (value: T) => void
  /** Commit the current value and close */
  save: () => void
  /** Restore the prior value and close */
  cancel: () => void
}

/** Slot definitions for DzInplace */
export interface DzInplaceSlots<T = unknown> {
  /** Read-only view rendered inside the activation button */
  display?: (props: DzInplaceDisplaySlotProps<T>) => unknown
  /** Editor view. When omitted, a built-in DzInput is rendered. */
  edit?: (props: DzInplaceEditSlotProps<T>) => unknown
}
