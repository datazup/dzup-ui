/**
 * DzTag -- Component-specific token mappings.
 *
 * Maps semantic design tokens to tag components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/data/DzTag.tokens
 */

export const tagTokens = {
  /** Base tag styling */
  base: {
    gap: 'var(--dz-spacing-1)',
    radius: 'var(--dz-radius-md)',
    transition: 'var(--dz-transition-fast)',
    focusRing: 'var(--dz-primary)',
  },
  /** Size scale */
  size: {
    sm: {
      height: 'var(--dz-spacing-5)',
      paddingX: 'var(--dz-spacing-1-5)',
      fontSize: 'var(--dz-text-xs)',
    },
    md: {
      height: 'var(--dz-spacing-6)',
      paddingX: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-xs)',
    },
    lg: {
      height: 'var(--dz-spacing-7)',
      paddingX: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-sm)',
    },
  },
  /** Tone colors (solid variant) */
  tone: {
    primary: { background: 'var(--dz-primary)', foreground: 'var(--dz-primary-foreground)', muted: 'var(--dz-primary-muted)' },
    neutral: { background: 'var(--dz-foreground)', foreground: 'var(--dz-background)', muted: 'var(--dz-muted)' },
    success: { background: 'var(--dz-success)', foreground: 'var(--dz-success-foreground)', muted: 'var(--dz-success-muted)' },
    warning: { background: 'var(--dz-warning)', foreground: 'var(--dz-warning-foreground)', muted: 'var(--dz-warning-muted)' },
    danger: { background: 'var(--dz-danger)', foreground: 'var(--dz-danger-foreground)', muted: 'var(--dz-danger-muted)' },
    info: { background: 'var(--dz-info)', foreground: 'var(--dz-info-foreground)', muted: 'var(--dz-info-muted)' },
  },
  /** Outline variant border */
  outline: {
    border: 'var(--dz-border)',
  },
} as const
