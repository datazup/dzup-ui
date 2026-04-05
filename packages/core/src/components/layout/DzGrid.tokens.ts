/**
 * DzGrid -- Component-specific token mappings.
 *
 * Maps semantic design tokens to CSS Grid layout properties (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/layout/DzGrid.tokens
 */

export const gridTokens = {
  /** Gap scale for grid spacing between cells */
  gap: {
    none: 'var(--dz-spacing-0)',
    xs: 'var(--dz-spacing-1)',
    sm: 'var(--dz-spacing-2)',
    md: 'var(--dz-spacing-4)',
    lg: 'var(--dz-spacing-6)',
    xl: 'var(--dz-spacing-8)',
  },
} as const
