/**
 * DzAlert -- Component-specific token mappings.
 *
 * Maps semantic design tokens to alert component styling (ADR-04).
 * Alerts support four variants (filled, outline, subtle, ghost) across six tones.
 *
 * @module @dzup-ui/core/components/feedback/DzAlert.tokens
 */

export const alertTokens = {
  /** Base layout */
  gap: 'var(--dz-spacing-3)',
  padding: 'var(--dz-spacing-4)',
  radius: 'var(--dz-radius-md)',
  fontSize: 'var(--dz-text-sm)',

  /** Tone colors — filled variant backgrounds and foregrounds */
  tones: {
    neutral: {
      filled: { background: 'var(--dz-foreground)', foreground: 'var(--dz-background)' },
      outline: { border: 'var(--dz-border)', foreground: 'var(--dz-foreground)' },
      subtle: { background: 'var(--dz-muted)', foreground: 'var(--dz-foreground)' },
      ghost: { foreground: 'var(--dz-foreground)' },
    },
    primary: {
      filled: { background: 'var(--dz-primary)', foreground: 'var(--dz-primary-foreground)' },
      outline: { border: 'var(--dz-primary)', foreground: 'var(--dz-primary-muted-foreground)' },
      subtle: { background: 'var(--dz-primary-muted)', foreground: 'var(--dz-primary-muted-foreground)' },
      ghost: { foreground: 'var(--dz-primary-muted-foreground)' },
    },
    success: {
      filled: { background: 'var(--dz-success)', foreground: 'var(--dz-success-foreground)' },
      outline: { border: 'var(--dz-success)', foreground: 'var(--dz-success-muted-foreground)' },
      subtle: { background: 'var(--dz-success-muted)', foreground: 'var(--dz-success-muted-foreground)' },
      ghost: { foreground: 'var(--dz-success-muted-foreground)' },
    },
    warning: {
      // Warning fills with `-solid` (8.44:1); `--dz-warning` under the foreground is 3.51:1.
      filled: { background: 'var(--dz-warning-solid)', foreground: 'var(--dz-warning-foreground)' },
      outline: { border: 'var(--dz-warning)', foreground: 'var(--dz-warning-muted-foreground)' },
      subtle: { background: 'var(--dz-warning-muted)', foreground: 'var(--dz-warning-muted-foreground)' },
      ghost: { foreground: 'var(--dz-warning-muted-foreground)' },
    },
    danger: {
      filled: { background: 'var(--dz-danger)', foreground: 'var(--dz-danger-foreground)' },
      outline: { border: 'var(--dz-danger)', foreground: 'var(--dz-danger-muted-foreground)' },
      subtle: { background: 'var(--dz-danger-muted)', foreground: 'var(--dz-danger-muted-foreground)' },
      ghost: { foreground: 'var(--dz-danger-muted-foreground)' },
    },
    info: {
      filled: { background: 'var(--dz-info)', foreground: 'var(--dz-info-foreground)' },
      outline: { border: 'var(--dz-info)', foreground: 'var(--dz-info-muted-foreground)' },
      subtle: { background: 'var(--dz-info-muted)', foreground: 'var(--dz-info-muted-foreground)' },
      ghost: { foreground: 'var(--dz-info-muted-foreground)' },
    },
  },

  /** Icon sizing within the alert (inherits current text color) */
  icon: {
    marginTop: 'var(--dz-spacing-0_5)',
  },
} as const
