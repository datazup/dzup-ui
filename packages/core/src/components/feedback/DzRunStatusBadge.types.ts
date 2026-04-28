/**
 * DzRunStatusBadge — type definitions.
 *
 * Run-status badge: wraps DzBadge with status→token mapping.
 *
 * @module @dzup-ui/core/components/feedback/DzRunStatusBadge
 */

/**
 * Canonical run-status vocabulary used by DzRunStatusBadge.
 *
 * Kept local to @dzup-ui/core to avoid leaking product-specific runtime
 * dependencies into the base design-system package.
 */
export type DzRunStatus
  = | 'PENDING'
    | 'RUNNING'
    | 'PAUSED'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRunStatusBadge component */
export interface DzRunStatusBadgeProps {
  /** Canonical run status */
  status: DzRunStatus
  /** Badge size — maps to DzBadge size */
  size?: 'sm' | 'md'
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzRunStatusBadge */
export interface DzRunStatusBadgeSlots {
  /** Override the human-readable label (defaults to title-cased status) */
  default?: (props: { status: DzRunStatus, label: string }) => unknown
}
