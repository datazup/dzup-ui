/**
 * DzCollapse -- Component-specific token mappings.
 *
 * Maps semantic design tokens to collapse/expand animation (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/layout/DzCollapse.tokens
 */

export const collapseTokens = {
  /** Default transition duration for expand/collapse animation */
  transitionDuration: 'var(--dz-transition-normal)',
} as const
