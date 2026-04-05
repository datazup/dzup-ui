/**
 * DzTable -- Component-specific token mappings.
 *
 * Maps semantic design tokens to table components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/data/DzTable.tokens
 */

export const tableTokens = {
  /** Root table */
  root: {
    foreground: 'var(--dz-foreground)',
  },
  /** Header section */
  header: {
    background: 'var(--dz-muted)',
    foreground: 'var(--dz-muted-foreground)',
  },
  /** Body rows */
  row: {
    border: 'var(--dz-border)',
    hoverBackground: 'var(--dz-muted)',
    stripedBackground: 'var(--dz-muted)',
    transition: 'var(--dz-transition-fast)',
  },
  /** Bordered variant */
  bordered: {
    border: 'var(--dz-border)',
  },
  /** Cell density */
  density: {
    compact: {
      paddingX: 'var(--dz-spacing-2)',
      paddingY: 'var(--dz-spacing-1)',
    },
    default: {
      paddingX: 'var(--dz-spacing-4)',
      paddingY: 'var(--dz-spacing-3)',
    },
    comfortable: {
      paddingX: 'var(--dz-spacing-6)',
      paddingY: 'var(--dz-spacing-4)',
    },
  },
  /** Size font scale */
  size: {
    xs: 'var(--dz-text-xs)',
    sm: 'var(--dz-text-sm)',
    md: 'var(--dz-text-sm)',
    lg: 'var(--dz-text-base)',
    xl: 'var(--dz-text-lg)',
  },
} as const
