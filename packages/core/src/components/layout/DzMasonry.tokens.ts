/**
 * DzMasonry -- Component-specific token mappings.
 *
 * Maps the semantic gap scale to spacing design tokens (ADR-04). The resolved
 * value is published once as the `--dz-masonry-gap` custom property and reused
 * for column-gap, vertical item spacing, and the flex gap of the measured path.
 *
 * @module @dzup-ui/core/components/layout/DzMasonry.tokens
 */

export const masonryTokens = {
  /** Gap scale shared between columns and stacked items within a column. */
  gap: {
    none: 'var(--dz-spacing-0)',
    xs: 'var(--dz-spacing-1)',
    sm: 'var(--dz-spacing-2)',
    md: 'var(--dz-spacing-4)',
    lg: 'var(--dz-spacing-6)',
    xl: 'var(--dz-spacing-8)',
  },
} as const
