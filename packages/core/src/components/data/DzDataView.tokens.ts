/**
 * DzDataView -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04, ADR-17).
 *
 * The `--dz-data-view-*` custom properties are declared on the `.dz-data-view`
 * root in `styles/base.css` (mapped to semantic tokens) and consumed by
 * `DzDataView.variants.ts`. This file documents that anatomy mapping.
 */
export const dataViewTokens = {
  /** Outer container */
  container: {
    gap: 'var(--dz-data-view-gap)',
    foreground: 'var(--dz-foreground)',
  },
  /** Toolbar (header + sort + layout toggle) */
  toolbar: {
    gap: 'var(--dz-data-view-toolbar-gap)',
  },
  /** List layout surface */
  list: {
    background: 'var(--dz-surface)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    divider: 'var(--dz-data-view-list-divider)',
    itemPaddingX: 'var(--dz-data-view-list-item-padding-x)',
    itemPaddingY: 'var(--dz-data-view-list-item-padding-y)',
  },
  /** Sort control */
  sort: {
    background: 'var(--dz-surface)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-sm)',
  },
} as const
