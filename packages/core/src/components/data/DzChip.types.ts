/**
 * DzChip — type definitions.
 *
 * Closable chip component with tone/variant styling.
 *
 * @module @dzup-ui/core/components/data/DzChip
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
  CanonicalTone,
  ChipVariant,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzChip component */
export interface DzChipProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: ChipVariant
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Component size */
  size?: CanonicalSize
  /** Whether the chip can be dismissed/closed */
  closable?: boolean
  /** Disabled state -- prevents interaction */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzChip */
export interface DzChipEmits {
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

/** Slot definitions for DzChip */
export interface DzChipSlots {
  /** Chip label content */
  default: () => unknown
  /** Content before the label (typically an icon or avatar) */
  prefix?: () => unknown
}
