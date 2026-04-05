/**
 * DzImage -- Component-specific token mappings.
 *
 * Maps semantic design tokens to image components (ADR-04).
 * Includes placeholder/fallback styling for loading and error states.
 *
 * @module @dzip-ui/core/components/media/DzImage.tokens
 */

export const imageTokens = {
  /** Root container fallback background (shown while loading) */
  fallback: {
    background: 'var(--dz-muted)',
  },

  /** Placeholder icon/text color (loading or error state) */
  placeholder: {
    color: 'var(--dz-muted-foreground)',
  },
} as const
