/**
 * DzList -- Component-specific token mappings.
 *
 * Maps semantic design tokens to list and list-item components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/data/DzList.tokens
 */

export const listTokens = {
  /** Root container (bordered variant) */
  root: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
  },
  /** List item */
  item: {
    gap: 'var(--dz-spacing-3)',
    border: 'var(--dz-border)',
    transition: 'var(--dz-transition-fast)',
  },
  /** Interactive item states */
  interactive: {
    hoverBackground: 'var(--dz-muted)',
    focusRing: 'var(--dz-primary)',
  },
  /** Size scale */
  size: {
    xs: {
      paddingX: 'var(--dz-spacing-2)',
      paddingY: 'var(--dz-spacing-1)',
      fontSize: 'var(--dz-text-xs)',
    },
    sm: {
      paddingX: 'var(--dz-spacing-3)',
      paddingY: 'var(--dz-spacing-1-5)',
      fontSize: 'var(--dz-text-sm)',
    },
    md: {
      paddingX: 'var(--dz-spacing-4)',
      paddingY: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-sm)',
    },
    lg: {
      paddingX: 'var(--dz-spacing-5)',
      paddingY: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-base)',
    },
    xl: {
      paddingX: 'var(--dz-spacing-6)',
      paddingY: 'var(--dz-spacing-4)',
      fontSize: 'var(--dz-text-lg)',
    },
  },
} as const
