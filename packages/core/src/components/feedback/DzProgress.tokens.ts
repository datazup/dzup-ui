/**
 * DzProgress -- Component-specific token mappings.
 *
 * Maps semantic design tokens to linear and circular progress components (ADR-04).
 * Supports five sizes and six tones.
 *
 * @module @dzup-ui/core/components/feedback/DzProgress.tokens
 */

export const progressTokens = {
  /** Track (background rail) */
  track: {
    background: 'var(--dz-muted)',
    radius: 'var(--dz-radius-full)',
  },

  /** Bar (filled portion) radius matches track */
  bar: {
    radius: 'var(--dz-radius-full)',
  },

  /** Bar tone colors */
  tones: {
    neutral: 'var(--dz-foreground)',
    primary: 'var(--dz-primary)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning)',
    danger: 'var(--dz-danger)',
    info: 'var(--dz-info)',
  },

  /** Linear bar height per size */
  sizes: {
    xs: { height: '0.25rem' },
    sm: { height: '0.375rem' },
    md: { height: '0.5rem' },
    lg: { height: '0.75rem' },
    xl: { height: '1rem' },
  },

  /** Circular (SVG) dimensions and stroke widths */
  circular: {
    xs: { size: 16, strokeWidth: 2 },
    sm: { size: 24, strokeWidth: 3 },
    md: { size: 32, strokeWidth: 3 },
    lg: { size: 48, strokeWidth: 4 },
    xl: { size: 64, strokeWidth: 5 },
  },

  /** Transition for width changes */
  transition: {
    duration: 'var(--dz-duration-slow)',
    easing: 'var(--dz-ease-in-out)',
  },
} as const
