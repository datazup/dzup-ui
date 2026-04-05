/**
 * DzDialog -- Component-specific token mappings.
 *
 * Maps semantic design tokens to dialog overlay components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/overlays/DzDialog.tokens
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
  /** Transition timing */
  transition: {
    /** Duration for open/close animations */
    duration: 'var(--dz-transition-fast)',
    /** Easing curve for open/close animations */
    easing: 'ease',
    /** Content transform on enter-from / leave-to */
    contentScale: '0.95',
    contentTranslateY: '4px',
  },
} as const
