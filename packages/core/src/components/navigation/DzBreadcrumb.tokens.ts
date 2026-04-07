/**
 * DzBreadcrumb -- Component-specific token mappings.
 *
 * Maps semantic design tokens to breadcrumb navigation styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/navigation/DzBreadcrumb.tokens
 */

export const breadcrumbTokens = {
  /** Overall list styling */
  list: {
    gap: 'var(--dz-spacing-1_5)',
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
  },
  /** Item gap between icon/text within a single breadcrumb */
  item: {
    gap: 'var(--dz-spacing-1_5)',
  },
  /** Link styling (non-current items) */
  link: {
    /** Hover text color */
    hoverColor: 'var(--dz-foreground)',
    transition: 'var(--dz-transition-fast)',
  },
  /** Current page styling */
  currentPage: {
    color: 'var(--dz-foreground)',
  },
  /** Separator between breadcrumb items */
  separator: {
    color: 'var(--dz-muted-foreground)',
  },
  /** Disabled breadcrumb item */
  disabled: {
    opacity: '0.5',
  },
} as const
