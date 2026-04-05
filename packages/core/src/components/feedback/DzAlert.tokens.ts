/**
 * DzAlert -- Component-specific token mappings.
 *
 * Maps semantic design tokens to alert component styling (ADR-04).
 * Alerts support four variants (filled, outline, subtle, ghost) across six tones.
 *
 * @module @dzip-ui/core/components/feedback/DzAlert.tokens
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
      outline: { border: 'var(--dz-primary)', foreground: 'var(--dz-primary)' },
      subtle: { background: 'var(--dz-primary-muted)', foreground: 'var(--dz-primary)' },
      ghost: { foreground: 'var(--dz-primary)' },
    },
    success: {
      filled: { background: 'var(--dz-success)', foreground: 'var(--dz-success-foreground)' },
      outline: { border: 'var(--dz-success)', foreground: 'var(--dz-success)' },
      subtle: { background: 'var(--dz-success-muted)', foreground: 'var(--dz-success)' },
      ghost: { foreground: 'var(--dz-success)' },
    },
    warning: {
      filled: { background: 'var(--dz-warning)', foreground: 'var(--dz-warning-foreground)' },
      outline: { border: 'var(--dz-warning)', foreground: 'var(--dz-warning)' },
      subtle: { background: 'var(--dz-warning-muted)', foreground: 'var(--dz-warning)' },
      ghost: { foreground: 'var(--dz-warning)' },
    },
    danger: {
      filled: { background: 'var(--dz-danger)', foreground: 'var(--dz-danger-foreground)' },
      outline: { border: 'var(--dz-danger)', foreground: 'var(--dz-danger)' },
      subtle: { background: 'var(--dz-danger-muted)', foreground: 'var(--dz-danger)' },
      ghost: { foreground: 'var(--dz-danger)' },
    },
    info: {
      filled: { background: 'var(--dz-info)', foreground: 'var(--dz-info-foreground)' },
      outline: { border: 'var(--dz-info)', foreground: 'var(--dz-info)' },
      subtle: { background: 'var(--dz-info-muted)', foreground: 'var(--dz-info)' },
      ghost: { foreground: 'var(--dz-info)' },
    },
  },

  /** Icon sizing within the alert (inherits current text color) */
  icon: {
    marginTop: 'var(--dz-spacing-0_5)',
  },
} as const
