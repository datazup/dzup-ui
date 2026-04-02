/**
 * DzTooltip -- Component-specific token mappings.
 *
 * Maps semantic design tokens to tooltip components (ADR-04).
 *
 * @module @dzup-ui/core/components/overlays/DzTooltip.tokens
 */

export const tooltipTokens = {
  /** Content panel */
  content: {
    background: 'var(--dz-foreground)',
    foreground: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    shadow: 'var(--dz-shadow-md)',
    paddingX: 'var(--dz-spacing-3)',
    paddingY: 'var(--dz-spacing-1.5)',
    fontSize: 'var(--dz-text-sm)',
  },
  /** Arrow fill */
  arrow: {
    fill: 'var(--dz-foreground)',
  },
  /** Transition timing */
  transition: 'var(--dz-transition-fast)',
} as const
