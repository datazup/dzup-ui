/**
 * DzKnob -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Renders an SVG circular dial: a muted range (track) arc with a tone-colored
 * value arc layered over it. The arc colors are exposed as local custom
 * properties so consumers can theme them:
 *   --dz-knob-range  -- the unfilled track arc color
 *   --dz-knob-value  -- the filled value arc color (driven by `tone`)
 */
export const knobTokens = {
  /** Unfilled track (range) arc color */
  rangeColor: 'var(--dz-knob-range, var(--dz-muted))',
  /** Filled value arc color */
  valueColor: 'var(--dz-knob-value, var(--dz-primary))',
  /** Centered value label color */
  labelColor: 'var(--dz-foreground)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-control-disabled-opacity)',
  /** Value arc fill color per tone */
  tone: {
    neutral: 'var(--dz-foreground)',
    primary: 'var(--dz-primary-solid)',
    success: 'var(--dz-success-solid)',
    warning: 'var(--dz-warning-solid)',
    danger: 'var(--dz-danger-solid)',
    info: 'var(--dz-info-solid)',
  },
  /** Size scale -- rendered dial diameter (px) */
  size: {
    xs: 48,
    sm: 64,
    md: 80,
    lg: 112,
    xl: 144,
  },
} as const
