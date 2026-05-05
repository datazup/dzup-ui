/**
 * DzRangeSlider -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Dual-thumb range slider. Shares the same visual pattern
 * as DzSlider with two thumb elements.
 */
export const rangeSliderTokens = {
  /** Track (rail) background */
  trackBackground: 'var(--dz-muted)',
  /** Thumb styling */
  thumb: {
    background: 'var(--dz-background)',
    border: 'var(--dz-primary)',
    borderHover: 'var(--dz-primary-hover)',
    shadow: 'var(--dz-shadow-sm)',
    transition: 'var(--dz-control-transition)',
    focusRingColor: 'var(--dz-control-focus-ring-color)',
    focusRingWidth: 'var(--dz-control-focus-ring-width)',
    focusRingOffset: 'var(--dz-control-focus-ring-offset)',
  },
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-control-disabled-opacity)',
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
