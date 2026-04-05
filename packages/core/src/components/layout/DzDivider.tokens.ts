/**
 * DzDivider -- Component-specific token mappings.
 *
 * Maps semantic design tokens to visual separator properties (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/layout/DzDivider.tokens
 */

export const dividerTokens = {
  /** Divider line color (uses semantic border token) */
  color: 'var(--dz-border)',
  /** Divider line thickness */
  thickness: {
    horizontal: '1px',
    vertical: '1px',
  },
} as const
