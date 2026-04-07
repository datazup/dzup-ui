/**
 * DzPopover -- Component-specific token mappings.
 *
 * Maps semantic design tokens to popover components (ADR-04).
 *
 * @module @dzup-ui/core/components/overlays/DzPopover.tokens
 */

export const popoverTokens = {
  /** Content panel */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-lg)',
    padding: 'var(--dz-spacing-4)',
  },
  /** Arrow */
  arrow: {
    fill: 'var(--dz-background)',
    stroke: 'var(--dz-border)',
  },
  /** Size widths */
  size: {
    sm: '12rem',
    md: '18rem',
    lg: '24rem',
  },
  /** Transition timing */
  transition: 'var(--dz-transition-fast)',
} as const
