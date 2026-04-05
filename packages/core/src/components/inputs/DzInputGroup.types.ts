/**
 * DzInputGroup — Type definitions for the input group wrapper.
 *
 * Groups an input with addons (prefix/suffix text, buttons, icons).
 *
 * @module @dzip-ui/core/components/inputs/DzInputGroup
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzInputGroup component */
export interface DzInputGroupProps extends BaseAccessibilityProps {
  /** Component size */
  size?: CanonicalSize
  /** Disabled state */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzInputGroup */
export interface DzInputGroupSlots {
  /** Input element and addon children */
  default: () => unknown
  /** Addon content before the input */
  prefix?: () => unknown
  /** Addon content after the input */
  suffix?: () => unknown
}
