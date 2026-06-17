/**
 * DzMeterGroup -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the multi-segment meter (ADR-04).
 * Supports five sizes, six tones, and a cycling default palette.
 *
 * @module @dzup-ui/core/components/feedback/DzMeterGroup.tokens
 */

export const meterGroupTokens = {
  /** Track (background rail) */
  track: {
    background: 'var(--dz-muted)',
    radius: 'var(--dz-radius-full)',
  },

  /** Segment fill radius matches track */
  segment: {
    radius: 'var(--dz-radius-full)',
  },

  /** Semantic tone colors (mirrors DzProgress tone mapping) */
  tones: {
    neutral: 'var(--dz-foreground)',
    primary: 'var(--dz-primary)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning-solid)',
    danger: 'var(--dz-danger)',
    info: 'var(--dz-info)',
  },

  /**
   * Default cycling palette used when a segment omits both `tone` and `color`.
   * Each entry references a semantic tone token (no raw colors).
   */
  palette: [
    'var(--dz-primary)',
    'var(--dz-info)',
    'var(--dz-success)',
    'var(--dz-warning-solid)',
    'var(--dz-danger)',
    'var(--dz-foreground)',
  ],

  /** Track thickness per size (horizontal height / vertical width) */
  sizes: {
    xs: { thickness: '0.25rem' },
    sm: { thickness: '0.375rem' },
    md: { thickness: '0.5rem' },
    lg: { thickness: '0.75rem' },
    xl: { thickness: '1rem' },
  },

  /** Transition for proportional size changes */
  transition: {
    duration: 'var(--dz-duration-slow)',
    easing: 'var(--dz-ease-in-out)',
  },
} as const

/** Tone-to-token map for segment fills */
export const meterGroupToneColors: Record<string, string> = {
  neutral: 'var(--dz-foreground)',
  primary: 'var(--dz-primary)',
  success: 'var(--dz-success)',
  warning: 'var(--dz-warning-solid)',
  danger: 'var(--dz-danger)',
  info: 'var(--dz-info)',
}

/** Default cycling palette (token references) */
export const meterGroupPalette: string[] = [...meterGroupTokens.palette]
