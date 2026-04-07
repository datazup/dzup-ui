/**
 * DzScrollArea -- Component-specific token mappings.
 *
 * Maps semantic design tokens to custom scrollbar styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/layout/DzScrollArea.tokens
 */

export const scrollAreaTokens = {
  /** Scrollbar thumb */
  thumb: {
    /** Default thumb color (uses border token) */
    background: 'var(--dz-border)',
    /** Thumb color on hover */
    hoverBackground: 'var(--dz-muted-foreground)',
    /** Thumb border radius */
    radius: 'var(--dz-radius-full)',
  },
  /** Scrollbar track (transparent by default) */
  track: {
    /** Track padding */
    padding: '1px',
  },
  /** Corner square when both scrollbars are visible */
  corner: {
    background: 'var(--dz-muted)',
  },
  /** Transition timing for thumb color changes */
  transition: 'var(--dz-transition-fast)',
} as const
