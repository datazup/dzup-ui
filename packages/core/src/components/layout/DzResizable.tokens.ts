/**
 * DzResizable -- Component-specific token mappings.
 *
 * Maps semantic design tokens to resizable panel component styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/layout/DzResizable.tokens
 */

export const resizableTokens = {
  /** Resize handle bar */
  handle: {
    /** Default handle background (uses border token) */
    background: 'var(--dz-border)',
    /** Handle background on hover (uses primary token) */
    hoverBackground: 'var(--dz-primary)',
    /** Focus ring color */
    focusRing: 'var(--dz-primary)',
    /** Disabled state opacity */
    disabledOpacity: '0.5',
  },
  /** Grip indicator displayed inside the handle */
  handleIndicator: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-sm)',
  },
  /** Transition timing for handle color changes */
  transition: 'var(--dz-transition-fast)',
} as const
