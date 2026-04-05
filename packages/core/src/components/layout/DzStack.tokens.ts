/**
 * DzStack -- Component-specific token mappings.
 *
 * Maps semantic design tokens to stack layout properties (ADR-04).
 * DzStack is a convenience wrapper over DzFlex; it shares the same gap scale.
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/layout/DzStack.tokens
 */

export const stackTokens = {
  /** Gap scale for stack spacing between children (matches DzFlex) */
  gap: {
    none: 'var(--dz-spacing-0)',
    xs: 'var(--dz-spacing-1)',
    sm: 'var(--dz-spacing-2)',
    md: 'var(--dz-spacing-4)',
    lg: 'var(--dz-spacing-6)',
    xl: 'var(--dz-spacing-8)',
  },
} as const
