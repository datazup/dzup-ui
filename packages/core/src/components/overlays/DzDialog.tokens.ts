/**
 * DzDialog -- Component-specific token mappings.
 *
 * Maps semantic design tokens to dialog overlay components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/overlays/DzDialog.tokens
 */

export const dialogTokens = {
  /** Overlay backdrop opacity */
  overlay: {
    background: 'var(--dz-overlay-bg)',
  },
  /** Content panel */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-xl)',
    padding: 'var(--dz-spacing-6)',
  },
  /** Title text */
  title: {
    fontSize: 'var(--dz-text-lg)',
    color: 'var(--dz-foreground)',
  },
  /** Description text */
  description: {
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
    marginTop: 'var(--dz-spacing-1.5)',
  },
  /** Close button */
  close: {
    position: {
      right: 'var(--dz-spacing-4)',
      top: 'var(--dz-spacing-4)',
    },
    radius: 'var(--dz-radius-sm)',
    focusRing: 'var(--dz-primary)',
  },
  /** Transition timing */
  transition: 'var(--dz-transition-fast)',
} as const
