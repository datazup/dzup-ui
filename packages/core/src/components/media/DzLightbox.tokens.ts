/**
 * DzLightbox -- Component-specific token mappings.
 *
 * Maps semantic design tokens to lightbox overlay components (ADR-04).
 * Multi-slot component: overlay, content, image, caption, nav, close, counter.
 *
 * @module @dzup-ui/core/components/media/DzLightbox.tokens
 */

export const lightboxTokens = {
  /** Overlay backdrop */
  overlay: {
    background: 'var(--dz-foreground)',
    opacity: 0.9,
  },

  /** Image display */
  image: {
    radius: 'var(--dz-radius-md)',
  },

  /** Caption text */
  caption: {
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-background)',
    marginTop: 'var(--dz-spacing-3)',
  },

  /** Navigation buttons (prev/next) */
  navButton: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-background)',
    focusRing: 'var(--dz-button-focus-ring-color)',
    size: '2.5rem',
  },

  /** Navigation button positioning */
  navOffset: 'var(--dz-spacing-4)',

  /** Close button */
  closeButton: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-background)',
    focusRing: 'var(--dz-button-focus-ring-color)',
    size: '2rem',
    position: {
      right: 'var(--dz-spacing-4)',
      top: 'var(--dz-spacing-4)',
    },
  },

  /** Counter (e.g. "3 / 10") */
  counter: {
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-background)',
    position: {
      left: 'var(--dz-spacing-4)',
      top: 'var(--dz-spacing-4)',
    },
  },

  /** Transition timing */
  transition: 'var(--dz-duration-fast)',
} as const
