/**
 * DzPagination -- Component-specific token mappings.
 *
 * Maps semantic design tokens to pagination navigation styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/navigation/DzPagination.tokens
 */

export const paginationTokens = {
  /** Page button list gap */
  list: {
    gap: 'var(--dz-spacing-1)',
  },
  /** Individual page button */
  button: {
    color: 'var(--dz-foreground)',
    hoverBackground: 'var(--dz-muted)',
    radius: 'var(--dz-radius-md)',
    focusRing: 'var(--dz-primary)',
    disabledOpacity: '0.5',
    transition: 'var(--dz-transition-fast)',
  },
  /** Active (current) page button */
  activeButton: {
    background: 'var(--dz-primary)',
    color: 'var(--dz-primary-foreground)',
    hoverBackground: 'var(--dz-primary-hover)',
  },
  /** Ellipsis indicator */
  ellipsis: {
    color: 'var(--dz-muted-foreground)',
  },
  /** Size scale for button height, min-width, and font size */
  size: {
    xs: {
      height: 'var(--dz-button-xs-height)',
      fontSize: 'var(--dz-text-xs)',
    },
    sm: {
      height: 'var(--dz-button-sm-height)',
      fontSize: 'var(--dz-text-sm)',
    },
    md: {
      height: 'var(--dz-button-md-height)',
      fontSize: 'var(--dz-text-sm)',
    },
    lg: {
      height: 'var(--dz-button-lg-height)',
      fontSize: 'var(--dz-text-base)',
    },
    xl: {
      height: 'var(--dz-button-xl-height)',
      fontSize: 'var(--dz-text-lg)',
    },
  },
} as const
