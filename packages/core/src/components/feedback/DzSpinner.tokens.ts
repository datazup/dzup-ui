/**
 * DzSpinner -- Component-specific token mappings.
 *
 * Maps semantic design tokens to spinner/loading indicator (ADR-04).
 * Renders as an animated SVG circle; size controls dimensions, tone controls color.
 *
 * @module @dzup-ui/core/components/feedback/DzSpinner.tokens
 */

export const spinnerTokens = {
  /** Dimension per size variant (Tailwind spacing scale) */
  sizes: {
    xs: { height: '0.75rem', width: '0.75rem' },
    sm: { height: '1rem', width: '1rem' },
    md: { height: '1.5rem', width: '1.5rem' },
    lg: { height: '2rem', width: '2rem' },
    xl: { height: '3rem', width: '3rem' },
  },

  /** Tone colors — applied to the spinner stroke/fill */
  tones: {
    neutral: 'var(--dz-foreground)',
    primary: 'var(--dz-primary)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning)',
    danger: 'var(--dz-danger)',
    info: 'var(--dz-info)',
  },

  /** Animation uses CSS spin keyframe; no custom duration token needed */
  animation: 'spin',
} as const
