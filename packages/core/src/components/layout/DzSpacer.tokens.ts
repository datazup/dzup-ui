/**
 * DzSpacer -- Component-specific token mappings.
 *
 * Maps semantic design tokens to spacer size scale (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/layout/DzSpacer.tokens
 */

export const spacerTokens = {
  /** Fixed size scale (width and height for non-auto spacers) */
  size: {
    xs: 'var(--dz-spacing-1)',
    sm: 'var(--dz-spacing-2)',
    md: 'var(--dz-spacing-4)',
    lg: 'var(--dz-spacing-6)',
    xl: 'var(--dz-spacing-8)',
  },
} as const
