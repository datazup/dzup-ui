/**
 * DzBadge — type definitions.
 *
 * @module @dzup-ui/core/components/feedback/DzBadge
 */

import type {
  BadgeVariant,
  CanonicalTone,
} from '@dzup-ui/contracts'

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
  size?: 'sm' | 'md' | 'lg'
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzBadge */
export interface DzBadgeSlots {
  /** Badge content (label text) */
  default?: () => unknown
}
