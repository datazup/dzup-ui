/**
 * DzBadge -- Component-specific token mappings.
 *
 * Maps semantic design tokens to badge component styling (ADR-04).
 * Badges support three variants (solid, outline, subtle), three sizes, and six tones.
 *
 * @module @dzup-ui/core/components/feedback/DzBadge.tokens
 */

export const badgeTokens = {
  /** Shape — badges always use full pill radius */
  radius: 'var(--dz-radius-full)',

  /** Size-specific padding and typography */
  sizes: {
    sm: {
      paddingX: 'var(--dz-spacing-1_5)',
      fontSize: 'var(--dz-text-xs)',
    },
    md: {
      paddingX: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-xs)',
    },
    lg: {
      paddingX: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-sm)',
    },
  },

  /** Tone colors — solid variant backgrounds and foregrounds */
  tones: {
    neutral: {
      solid: { background: 'var(--dz-foreground)', foreground: 'var(--dz-background)' },
      outline: { border: 'var(--dz-border)', foreground: 'var(--dz-foreground)' },
      subtle: { background: 'var(--dz-muted)', foreground: 'var(--dz-foreground)' },
    },
    primary: {
      solid: { background: 'var(--dz-primary)', foreground: 'var(--dz-primary-foreground)' },
      outline: { border: 'var(--dz-primary)', foreground: 'var(--dz-primary)' },
      subtle: { background: 'var(--dz-primary-muted)', foreground: 'var(--dz-primary)' },
    },
    success: {
      solid: { background: 'var(--dz-success)', foreground: 'var(--dz-success-foreground)' },
      outline: { border: 'var(--dz-success)', foreground: 'var(--dz-success)' },
      subtle: { background: 'var(--dz-success-muted)', foreground: 'var(--dz-success)' },
    },
    warning: {
      solid: { background: 'var(--dz-warning)', foreground: 'var(--dz-warning-foreground)' },
      outline: { border: 'var(--dz-warning)', foreground: 'var(--dz-warning)' },
      subtle: { background: 'var(--dz-warning-muted)', foreground: 'var(--dz-warning)' },
    },
    danger: {
      solid: { background: 'var(--dz-danger)', foreground: 'var(--dz-danger-foreground)' },
      outline: { border: 'var(--dz-danger)', foreground: 'var(--dz-danger)' },
      subtle: { background: 'var(--dz-danger-muted)', foreground: 'var(--dz-danger)' },
    },
    info: {
      solid: { background: 'var(--dz-info)', foreground: 'var(--dz-info-foreground)' },
      outline: { border: 'var(--dz-info)', foreground: 'var(--dz-info)' },
      subtle: { background: 'var(--dz-info-muted)', foreground: 'var(--dz-info)' },
    },
  },
} as const
