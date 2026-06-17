/**
 * DzMegaMenu — Component-specific token mappings.
 *
 * Maps semantic design tokens to the multi-column navigation menu (ADR-04,
 * ADR-17). The `--dz-menu-*` panel/column custom properties are declared on
 * the `.dz-mega-menu` root in `styles/base.css` and consumed by
 * `DzMegaMenu.variants.ts`. This file documents that anatomy mapping.
 *
 * @module @dzup-ui/core/components/navigation/DzMegaMenu.tokens
 */

export const megaMenuTokens = {
  /** Menubar (top-level trigger row) */
  menubar: {
    gap: 'var(--dz-menu-bar-gap)',
  },
  /** Top-level trigger */
  trigger: {
    gap: 'var(--dz-spacing-1)',
    paddingX: 'var(--dz-spacing-3)',
    paddingY: 'var(--dz-spacing-2)',
    fontSize: 'var(--dz-text-sm)',
    fontWeight: 'var(--dz-font-medium)',
    color: 'var(--dz-foreground)',
    hoverBackground: 'var(--dz-muted)',
    radius: 'var(--dz-radius-md)',
  },
  /** Dropdown panel surface */
  panel: {
    offset: 'var(--dz-menu-panel-offset)',
    padding: 'var(--dz-menu-panel-padding)',
    background: 'var(--dz-surface)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-lg)',
  },
  /** Columns inside a panel */
  column: {
    gap: 'var(--dz-menu-column-gap)',
    minWidth: 'var(--dz-menu-column-min-width)',
    headingColor: 'var(--dz-muted-foreground)',
    headingFontSize: 'var(--dz-text-xs)',
  },
  /** A panel link */
  link: {
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-1_5)',
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-foreground)',
    hoverBackground: 'var(--dz-muted)',
    radius: 'var(--dz-radius-md)',
    descriptionColor: 'var(--dz-muted-foreground)',
  },
} as const
