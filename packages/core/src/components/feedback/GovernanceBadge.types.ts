/**
 * GovernanceBadge — type definitions.
 *
 * Governance badge: displays the coordinator pattern governing a team run
 * (supervisor / contract_net / blackboard / peer_to_peer / council)
 * with an accessible label and pattern-specific color token.
 *
 * @module @dzup-ui/core/components/feedback/GovernanceBadge
 */

/**
 * Coordinator pattern vocabulary used by GovernanceBadge.
 *
 * Kept local to @dzup-ui/core to avoid leaking product-specific runtime
 * dependencies into the base design-system package.
 */
// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

import type { BadgeVariant, CanonicalSize } from '@dzup-ui/contracts'

export type CoordinatorPattern
  = | 'supervisor'
    | 'contract_net'
    | 'blackboard'
    | 'peer_to_peer'
    | 'council'

/** Props for the GovernanceBadge component */
export interface GovernanceBadgeProps {
  /** Coordinator pattern governing the team run */
  pattern: CoordinatorPattern
  /** Badge size */
  size?: CanonicalSize
  /** Visual style variant */
  variant?: BadgeVariant
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for GovernanceBadge */
export interface GovernanceBadgeSlots {
  /** Override the human-readable label (defaults to title-cased pattern name) */
  default?: (props: { pattern: CoordinatorPattern, label: string }) => unknown
}
