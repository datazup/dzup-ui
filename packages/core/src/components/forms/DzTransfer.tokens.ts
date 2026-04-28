/**
 * DzTransfer -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Dual-list transfer component with source/target panels,
 * search inputs, selectable items, and transfer action buttons.
 */
export const transferTokens = {
  /** Root layout gap between source, actions, and target */
  gap: 'var(--dz-spacing-3)',
  /** List panel */
  list: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
  },
  /** List header */
  listHeader: {
    foreground: 'var(--dz-foreground)',
    fontSize: 'var(--dz-text-sm)',
    borderBottom: 'var(--dz-border)',
    paddingX: 'var(--dz-spacing-3)',
    paddingY: 'var(--dz-spacing-2)',
  },
  /** List count badge */
  listCountColor: 'var(--dz-muted-foreground)',
  listCountFontSize: 'var(--dz-text-xs)',
  /** Search input */
  searchInput: {
    foreground: 'var(--dz-foreground)',
    placeholder: 'var(--dz-muted-foreground)',
    borderBottom: 'var(--dz-border)',
    fontSize: 'var(--dz-text-sm)',
    paddingX: 'var(--dz-spacing-3)',
    paddingY: 'var(--dz-spacing-2)',
  },
  /** List body */
  listBodyPadding: 'var(--dz-spacing-1)',
  /** Selectable item */
  item: {
    foreground: 'var(--dz-foreground)',
    fontSize: 'var(--dz-text-sm)',
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-1_5)',
    gap: 'var(--dz-spacing-2)',
    hoverBackground: 'var(--dz-muted)',
    selectedBackground: 'var(--dz-muted)',
  },
  /** Item checkbox accent */
  itemCheckbox: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-sm)',
    accent: 'var(--dz-primary)',
  },
  /** Transfer action buttons */
  actionButton: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    hoverBackground: 'var(--dz-muted)',
    focusRingColor: 'var(--dz-button-focus-ring-color)',
    disabledOpacity: '0.5',
  },
  /** Actions column gap */
  actionsGap: 'var(--dz-spacing-2)',
  /** Empty state */
  emptyColor: 'var(--dz-muted-foreground)',
  emptyFontSize: 'var(--dz-text-sm)',
  /** Disabled state */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Size scale */
  size: {
    xs: { listMinHeight: '120px', listBodyMaxHeight: '120px', actionButtonSize: '1.5rem' },
    sm: { listMinHeight: '160px', listBodyMaxHeight: '160px', actionButtonSize: '1.75rem' },
    md: { listMinHeight: '200px', listBodyMaxHeight: '200px', actionButtonSize: '2rem' },
    lg: { listMinHeight: '260px', listBodyMaxHeight: '260px', actionButtonSize: '2.25rem' },
    xl: { listMinHeight: '320px', listBodyMaxHeight: '320px', actionButtonSize: '2.5rem' },
  },
} as const
