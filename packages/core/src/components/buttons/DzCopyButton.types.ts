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
  /** Button size */
  size?: 'sm' | 'md'
  /** Disabled state -- prevents interaction */
  disabled?: boolean
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
