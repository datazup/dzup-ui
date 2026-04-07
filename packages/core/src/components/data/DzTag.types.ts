/**
 * DzTag — type definitions.
 *
 * Categorization tag with tone/variant styling.
 * Similar to DzChip but semantically for categorization (labels, filters).
 *
 * @module @dzup-ui/core/components/data/DzTag
 */

import type {
  BadgeVariant,
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzTag component */
export interface DzTagProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: BadgeVariant
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Component size */
  size?: CanonicalSize
  /** Whether the tag can be dismissed/closed */
  closable?: boolean
  /** Disabled state -- prevents interaction */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzTag */
export interface DzTagEmits {
  /** Emitted when the close button is clicked */
  close: []
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTag */
export interface DzTagSlots {
  /** Tag label content */
  default: () => unknown
  /** Content before the label (typically an icon) */
  prefix?: () => unknown
}
