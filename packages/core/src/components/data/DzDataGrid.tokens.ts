/**
 * DzDataGrid -- Component-specific token mappings.
 *
 * Maps semantic design tokens to data grid components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/data/DzDataGrid.tokens
 */

export const dataGridTokens = {
  /** Root container */
  root: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
  },
  /** Header row */
  header: {
    background: 'var(--dz-muted)',
    foreground: 'var(--dz-muted-foreground)',
  },
  /** Body rows */
  row: {
    border: 'var(--dz-border)',
    hoverBackground: 'var(--dz-muted)',
    transition: 'var(--dz-transition-fast)',
  },
  /** Selection checkbox */
  checkbox: {
    radius: 'var(--dz-radius-sm)',
    border: 'var(--dz-border)',
    accent: 'var(--dz-primary)',
  },
  /** Sort icon */
  sortIcon: {
    marginLeft: 'var(--dz-spacing-1)',
  },
  /** Pagination footer */
  pagination: {
    border: 'var(--dz-border)',
    paddingX: 'var(--dz-spacing-4)',
    paddingY: 'var(--dz-spacing-3)',
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
    buttonRadius: 'var(--dz-radius-sm)',
    buttonBorder: 'var(--dz-border)',
    buttonHoverBackground: 'var(--dz-muted)',
    buttonTransition: 'var(--dz-transition-fast)',
  },
  /** Empty/loading states */
  empty: {
    paddingY: 'var(--dz-spacing-12)',
    color: 'var(--dz-muted-foreground)',
  },
  /** Cell density (default) */
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
