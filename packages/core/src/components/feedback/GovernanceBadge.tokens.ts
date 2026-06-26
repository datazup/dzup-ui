/**
 * GovernanceBadge — coordinator pattern → CSS token mapping.
 *
 * Each coordinator pattern maps to a semantic CSS variable from
 * the global @dzup-ui/tokens design token set.
 *
 * @module @dzup-ui/core/components/feedback/GovernanceBadge.tokens
 */

import type { CoordinatorPattern } from './GovernanceBadge.types.ts'

/**
 * Maps each coordinator pattern to its semantic background CSS variable.
 *
 * supervisor    → --dz-primary       (authoritative, primary color)
 * contract_net  → --dz-info          (negotiated, informational blue)
 * blackboard    → --dz-warning-solid (shared workspace, warm amber)
 * peer_to_peer  → --dz-success       (collaborative, positive green)
 * council       → --dz-foreground    (deliberative, neutral/foreground)
 */
export const GOVERNANCE_PATTERN_TOKENS: Readonly<Record<CoordinatorPattern, string>>
  = Object.freeze({
    supervisor: 'var(--dz-primary)',
    contract_net: 'var(--dz-info)',
    blackboard: 'var(--dz-warning-solid)',
    peer_to_peer: 'var(--dz-success)',
    council: 'var(--dz-foreground)',
  })
