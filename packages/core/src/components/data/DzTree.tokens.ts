/**
 * DzTree -- Component-specific token mappings.
 *
 * Maps semantic design tokens to tree view components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/data/DzTree.tokens
 */

export const treeTokens = {
  /** Tree item */
  item: {
    gap: 'var(--dz-spacing-1)',
    radius: 'var(--dz-radius-sm)',
    hoverBackground: 'var(--dz-muted)',
    focusRing: 'var(--dz-primary)',
  },
  /** Selected item state */
  selected: {
    background: 'var(--dz-primary-muted)',
    foreground: 'var(--dz-primary)',
  },
  /** Expand/collapse icon */
  expandIcon: {
    color: 'var(--dz-muted-foreground)',
  },
  /** Selection checkbox */
  checkbox: {
    radius: 'var(--dz-radius-sm)',
    border: 'var(--dz-border)',
    checkedBackground: 'var(--dz-primary)',
    checkedBorder: 'var(--dz-primary)',
  },
  /** Empty state */
  empty: {
    color: 'var(--dz-muted-foreground)',
    padding: 'var(--dz-spacing-4)',
  },
  /** Size scale (item padding, font, indent, icon dimensions) */
  size: {
    xs: {
      paddingX: 'var(--dz-spacing-1)',
      paddingY: 'var(--dz-spacing-0-5)',
      fontSize: 'var(--dz-text-xs)',
      indent: 'var(--dz-spacing-3)',
    },
    sm: {
      paddingX: 'var(--dz-spacing-1-5)',
      paddingY: 'var(--dz-spacing-1)',
      fontSize: 'var(--dz-text-sm)',
      indent: 'var(--dz-spacing-4)',
    },
    md: {
      paddingX: 'var(--dz-spacing-2)',
      paddingY: 'var(--dz-spacing-1-5)',
      fontSize: 'var(--dz-text-sm)',
      indent: 'var(--dz-spacing-5)',
    },
    lg: {
      paddingX: 'var(--dz-spacing-2-5)',
      paddingY: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-base)',
      indent: 'var(--dz-spacing-6)',
    },
    xl: {
      paddingX: 'var(--dz-spacing-3)',
      paddingY: 'var(--dz-spacing-2-5)',
      fontSize: 'var(--dz-text-lg)',
      indent: 'var(--dz-spacing-8)',
    },
  },
} as const
