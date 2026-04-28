/**
 * DzCarousel -- Component-specific token mappings.
 *
 * Maps semantic design tokens to carousel components (ADR-04).
 * Multi-slot component: root, viewport, slide, navButton, dots.
 *
 * @module @dzup-ui/core/components/media/DzCarousel.tokens
 */

export const carouselTokens = {
  /** Navigation button styling */
  navButton: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    shadow: 'var(--dz-shadow-sm)',
    hoverBackground: 'var(--dz-muted)',
    focusRing: 'var(--dz-button-focus-ring-color)',
  },

  /** Navigation button sizes per size variant */
  navSizes: {
    xs: { button: '1.5rem', icon: '0.75rem' },
    sm: { button: '1.75rem', icon: '0.875rem' },
    md: { button: '2rem', icon: '1rem' },
    lg: { button: '2.5rem', icon: '1.25rem' },
    xl: { button: '3rem', icon: '1.5rem' },
  },

  /** Navigation button positioning offset */
  navOffset: 'var(--dz-spacing-2)',

  /** Dot indicators */
  dots: {
    gap: 'var(--dz-spacing-1_5)',
    marginTop: 'var(--dz-spacing-3)',
    inactiveColor: 'var(--dz-muted-foreground)',
    activeColor: 'var(--dz-primary)',
  },

  /** Dot sizes per size variant */
  dotSizes: {
    xs: { inactive: '0.25rem', activeWidth: '0.75rem' },
    sm: { inactive: '0.375rem', activeWidth: '1rem' },
    md: { inactive: '0.5rem', activeWidth: '1.25rem' },
    lg: { inactive: '0.625rem', activeWidth: '1.5rem' },
    xl: { inactive: '0.75rem', activeWidth: '2rem' },
  },

  /** Slide transition */
  transition: {
    property: 'transform',
    duration: 'var(--dz-duration-normal)',
    easing: 'var(--dz-ease-default)',
  },
} as const
