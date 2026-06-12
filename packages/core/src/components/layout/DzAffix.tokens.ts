/**
 * DzAffix -- Component-specific token mappings.
 *
 * DzAffix is a behavioural primitive with no visual styling beyond the fixed
 * positioning it applies while pinned. The only token it references is the
 * stacking order of the pinned content, consumed via
 * `var(--dz-affix-z-index, 10)` in the composable-driven inline style.
 *
 * @module @dzup-ui/core/components/layout/DzAffix.tokens
 */

export const affixTokens = {
  /** Stacking order applied to pinned content. */
  zIndex: 'var(--dz-affix-z-index, 10)',
} as const
