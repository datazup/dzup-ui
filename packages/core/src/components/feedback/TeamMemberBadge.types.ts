/**
 * TeamMemberBadge — type definitions.
 *
 * Status pill rendering a team participant's role + live status (idle/active/completed/failed)
 * with a colored dot derived from design tokens.
 *
 * @module @dzup-ui/core/components/feedback/TeamMemberBadge
 */

import type { CanonicalSize } from '@dzup-ui/contracts'

/**
 * Live status values for a team participant.
 */
export type TeamMemberStatus = 'idle' | 'active' | 'completed' | 'failed'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the TeamMemberBadge component */
export interface TeamMemberBadgeProps {
  /** Participant ID within the team run (not the team-definition ID). */
  participantId: string
  /** Participant role label (e.g. "planner", "executor"). */
  role: string
  /** Live participant status from the team runtime. */
  status: TeamMemberStatus
  /** Badge size */
  size?: CanonicalSize
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Slot definitions for TeamMemberBadge */
export interface TeamMemberBadgeSlots {
  /** Override the default label (defaults to role text). Receives role + status as slot props. */
  default?: (props: { role: string; status: TeamMemberStatus }) => unknown
}
