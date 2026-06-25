/**
 * TeamMemberBadge — design token mappings.
 *
 * Maps each TeamMemberStatus to a semantic CSS custom property.
 *
 * @module @dzup-ui/core/components/feedback/TeamMemberBadge.tokens
 */

import type { TeamMemberStatus } from './TeamMemberBadge.types.ts'

/**
 * Maps a TeamMemberStatus to the CSS variable that should be used
 * as the background color of the status dot.
 */
export const TEAM_MEMBER_STATUS_TOKENS: Readonly<Record<TeamMemberStatus, string>> = Object.freeze({
  idle: 'var(--dz-muted-foreground)',
  active: 'var(--dz-success)',
  completed: 'var(--dz-success)',
  failed: 'var(--dz-danger)',
})
