/**
 * DzSheet -- Component-specific token mappings.
 *
 * Maps semantic design tokens to sheet (side-drawer) overlay components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/overlays/DzSheet.tokens
 */

export const sheetTokens = {
  /** Overlay backdrop */
  overlay: {
    background: 'var(--dz-overlay-bg)',
  },
  /** Content panel */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
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
    marginTop: 'var(--dz-spacing-1_5)',
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
  /** Side-constrained sizes (right/left panels) */
  size: {
    default: 'max-w-sm',
  },
  /** Transition timing */
  transition: 'var(--dz-transition-fast)',
} as const
