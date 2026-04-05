/**
 * DzFlex -- Component-specific token mappings.
 *
 * Maps semantic design tokens to Flexbox layout properties (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/layout/DzFlex.tokens
 */

export const flexTokens = {
  /** Gap scale for flex spacing between children */
  gap: {
    none: 'var(--dz-spacing-0)',
    xs: 'var(--dz-spacing-1)',
    sm: 'var(--dz-spacing-2)',
    md: 'var(--dz-spacing-4)',
    lg: 'var(--dz-spacing-6)',
    xl: 'var(--dz-spacing-8)',
  },
} as const
