/**
 * DzRunStatusBadge — type definitions.
 *
 * Orchestration run-status badge: wraps DzBadge with status→token mapping.
 *
 * @module @dzup-ui/core/components/feedback/DzRunStatusBadge
 */

import type { RunStatus } from '@datazup/dzupagent-orchestration-kit'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzRunStatusBadge component */
export interface DzRunStatusBadgeProps {
  /** Canonical orchestration run status (imported from orchestration-kit) */
  status: RunStatus
  /** Badge size — maps to DzBadge size */
  size?: 'sm' | 'md'
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzRunStatusBadge */
export interface DzRunStatusBadgeSlots {
  /** Override the human-readable label (defaults to title-cased status) */
  default?: (props: { status: RunStatus, label: string }) => unknown
}
