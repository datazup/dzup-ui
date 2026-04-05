/**
 * DzBadge — type definitions.
 *
 * @module @dzip-ui/core/components/feedback/DzBadge
 */

import type {
  BadgeVariant,
  CanonicalSize,
  CanonicalTone,
} from '@dzip-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzBadge component */
export interface DzBadgeProps {
  /** Visual style variant */
  variant?: BadgeVariant
  /** Semantic color tone */
  tone?: CanonicalTone
  /** Badge size */
  size?: CanonicalSize
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzBadge */
export interface DzBadgeSlots {
  /** Badge content (label text) */
  default?: () => unknown
}
