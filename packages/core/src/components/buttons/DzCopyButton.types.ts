/**
 * DzCopyButton — type definitions.
 *
 * A button that copies a value to the clipboard and provides visual feedback.
 *
 * @module @dzup-ui/core/components/buttons/DzCopyButton
 */

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzCopyButtonUi } from './DzCopyButton.anatomy.ts'

/** Props for the DzCopyButton component */
export interface DzCopyButtonProps {
  /** Element ID */
  id?: string
  /** Accessible label for the button */
  ariaLabel?: string
  /** The value to copy to the clipboard */
  value: string
  /** Label shown alongside the copy icon */
  label?: string
  /** Label shown after a successful copy */
  copiedLabel?: string
  /** Visual style variant (fill / border treatment) */
  variant?: ButtonVariant
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Button size */
  size?: CanonicalSize
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /**
   * Per-part class overrides, keyed by the names in `DzCopyButton.anatomy.ts`
   * (ADR-19 §5). `class` keeps its existing meaning and its existing target;
   * `ui` addresses the other parts by name, and a typo is a type error.
   *
   * @example
   * ```vue
   * <DzCopyButton :value="code" :ui="{ root: 'rounded-full' }" />
   * ```
   */
  ui?: DzCopyButtonUi
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzCopyButton */
export interface DzCopyButtonEmits {
  /** Emitted when the value has been copied to clipboard */
  copied: [value: string]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzCopyButton */
export interface DzCopyButtonSlots {
  /** Custom content replacing default label */
  default?: (props: { copied: boolean }) => unknown
  /** Custom icon replacing default copy/check icons */
  icon?: (props: { copied: boolean }) => unknown
}
