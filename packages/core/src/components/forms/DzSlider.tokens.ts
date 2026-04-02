/**
 * DzSlider -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI SliderRoot with track, range fill, and thumb styling.
 * Supports tone-based range coloring and orientation.
 */
export const sliderTokens = {
  /** Track (rail) background */
  trackBackground: 'var(--dz-muted)',
  /** Thumb styling */
  thumb: {
    background: 'var(--dz-background)',
    border: 'var(--dz-primary)',
    borderHover: 'var(--dz-primary-hover)',
    shadow: 'var(--dz-shadow-sm)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-primary)',
    focusRingWidth: '2px',
    focusRingOffset: '2px',
  },
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
  /** Range fill color per tone */
  tone: {
    neutral: 'var(--dz-foreground)',
    primary: 'var(--dz-primary)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning)',
    danger: 'var(--dz-danger)',
    info: 'var(--dz-info)',
  },
  /** Size scale -- track height and thumb dimensions */
  size: {
    xs: { trackHeight: '0.25rem', thumbSize: '0.75rem' },
    sm: { trackHeight: '0.375rem', thumbSize: '0.875rem' },
    md: { trackHeight: '0.5rem', thumbSize: '1rem' },
    lg: { trackHeight: '0.625rem', thumbSize: '1.25rem' },
    xl: { trackHeight: '0.75rem', thumbSize: '1.5rem' },
  },
} as const
