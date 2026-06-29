/**
 * DzToolbar -- type definitions.
 *
 * Horizontal action bar with semantic start/center/end regions, consistent
 * spacing, wrap, and sticky behavior.
 *
 * @module @dzup-ui/core/components/layout/DzToolbar
 */

import type {
  BaseAccessibilityProps,
  BaseAppearanceProps,
  CanonicalSize,
  Orientation,
  ToolbarVariant,
} from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Logical orientation reported via `aria-orientation` */
export type ToolbarOrientation = Orientation

/**
 * Props for the DzToolbar component.
 *
 * `size` controls control density (gap/padding); `variant` selects the
 * surface treatment. Pure layout — no interaction logic.
 */
export interface DzToolbarProps
  extends BaseAppearanceProps<CanonicalSize, ToolbarVariant>, BaseAccessibilityProps {
  /** Whether items wrap onto multiple lines when space runs out */
  wrap?: boolean
  /** Whether the toolbar sticks to the top of its scroll container */
  sticky?: boolean
  /** Logical orientation, reflected in `aria-orientation` */
  orientation?: ToolbarOrientation
  /** HTML element to render as */
  as?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzToolbar */
export interface DzToolbarSlots {
  /** Leading region (alias of #start) */
  default?: () => unknown
  /** Leading region — controls aligned to the start edge */
  start?: () => unknown
  /** Centered region — typically a title */
  center?: () => unknown
  /** Trailing region — actions aligned to the end edge */
  end?: () => unknown
}
