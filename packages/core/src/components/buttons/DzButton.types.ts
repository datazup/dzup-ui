/**
 * DzButton — type definitions.
 *
 * @module @dzup-ui/core/components/buttons/DzButton
 */

import type {
  BaseAccessibilityProps,
  ButtonVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzButton component */
export interface DzButtonProps extends BaseAccessibilityProps {
  /** Visual style variant */
  variant?: ButtonVariant
  /** Component size */
  size?: CanonicalSize
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Disabled state -- prevents interaction */
  disabled?: boolean
  /** Loading state -- shows spinner and sets aria-busy */
  loading?: boolean
  /** HTML button type attribute */
  type?: 'button' | 'submit' | 'reset'
  /** Render as child element (slot content becomes the root) */
  asChild?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzButton */
export interface DzButtonEmits {
  /** Native click event (suppressed when disabled or loading) */
  click: [event: MouseEvent]
  /** Focus gained */
  focus: [event: FocusEvent]
  /** Focus lost */
  blur: [event: FocusEvent]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzButton */
export interface DzButtonSlots {
  /** Primary button content (label text) */
  default?: () => unknown
  /** Content before the label (typically an icon) */
  prefix?: () => unknown
  /** Content after the label (typically an icon) */
  suffix?: () => unknown
}
