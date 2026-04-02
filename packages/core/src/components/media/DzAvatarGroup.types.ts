/**
 * DzAvatarGroup — Type definitions for the stacked avatar group.
 *
 * @module @dzup-ui/core/components/media/DzAvatarGroup
 */

import type { CanonicalSize } from '@dzup-ui/contracts'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzAvatarGroup component */
export interface DzAvatarGroupProps {
  /** Maximum number of avatars to display before showing overflow count */
  max?: number
  /** Size propagated to all child avatars */
  size?: CanonicalSize
  /** Accessible label for the group */
  ariaLabel?: string
  /** Unique element ID */
  id?: string
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzAvatarGroup */
export interface DzAvatarGroupSlots {
  /** DzAvatar children */
  default: () => unknown
}
