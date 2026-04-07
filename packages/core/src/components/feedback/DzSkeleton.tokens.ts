/**
 * DzSkeleton -- Component-specific token mappings.
 *
 * Maps semantic design tokens to skeleton placeholder components (ADR-04).
 * Supports three shape variants (text, circular, rectangular) with optional pulse animation.
 *
 * @module @dzup-ui/core/components/feedback/DzSkeleton.tokens
 */

export const skeletonTokens = {
  /** Placeholder background (muted surface) */
  background: 'var(--dz-muted)',

  /** Border radius per shape variant */
  radius: {
    text: 'var(--dz-radius-sm)',
    circular: 'var(--dz-radius-full)',
    rectangular: 'var(--dz-radius-md)',
  },

  /** Default text skeleton height */
  textHeight: '1rem',

  /** Animation: uses Tailwind pulse (opacity fade) */
  animation: 'pulse',
} as const
