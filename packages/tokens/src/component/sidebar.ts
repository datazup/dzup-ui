/**
 * Sidebar Component Tokens
 *
 * Component-level token mappings for the DzSidebar navigation component.
 * References semantic tokens. Consumers can override per-component.
 */

export const SIDEBAR_TOKENS: Record<string, string> = {
  /* ── Layout ── */
  '--dz-sidebar-width': '16rem',
  '--dz-sidebar-collapsed-width': '4rem',
  '--dz-sidebar-z-index': 'var(--dz-z-sticky)',
  '--dz-sidebar-transition': 'width var(--dz-duration-normal) var(--dz-ease-default)',

  /* ── Surfaces ── */
  '--dz-sidebar-bg': 'var(--dz-surface)',
  '--dz-sidebar-border': 'var(--dz-border)',

  /* ── Text ── */
  '--dz-sidebar-text': 'var(--dz-muted-foreground)',
  '--dz-sidebar-text-hover': 'var(--dz-foreground)',

  /* ── Item ── */
  '--dz-sidebar-item-radius': 'var(--dz-radius-md)',
  '--dz-sidebar-item-padding-x': 'var(--dz-spacing-3)',
  '--dz-sidebar-item-padding-y': 'var(--dz-spacing-2)',
  '--dz-sidebar-item-gap': 'var(--dz-spacing-3)',
  '--dz-sidebar-item-font-size': 'var(--dz-text-sm)',
  '--dz-sidebar-item-font-weight': '500',

  /* ── Item: Hover ── */
  '--dz-sidebar-item-hover-bg': 'var(--dz-accent)',
  '--dz-sidebar-item-hover-text': 'var(--dz-accent-foreground)',

  /* ── Item: Active ── */
  '--dz-sidebar-item-active-bg': 'var(--dz-primary)',
  '--dz-sidebar-item-active-text': 'var(--dz-primary-foreground)',

  /* ── Section ── */
  '--dz-sidebar-section-padding-y': 'var(--dz-spacing-2)',
  '--dz-sidebar-section-title-font-size': 'var(--dz-text-xs)',
  '--dz-sidebar-section-title-font-weight': '600',
  '--dz-sidebar-section-title-color': 'var(--dz-muted-foreground)',
  '--dz-sidebar-section-title-padding-x': 'var(--dz-spacing-3)',
  '--dz-sidebar-section-title-letter-spacing': '0.05em',
  '--dz-sidebar-section-title-text-transform': 'uppercase',

  /* ── Header & Footer ── */
  '--dz-sidebar-header-padding': 'var(--dz-spacing-4)',
  '--dz-sidebar-header-border': 'var(--dz-border)',
  '--dz-sidebar-footer-padding': 'var(--dz-spacing-4)',
  '--dz-sidebar-footer-border': 'var(--dz-border)',

  /* ── Mobile overlay ── */
  '--dz-sidebar-overlay-bg': 'var(--dz-overlay-bg)',
  '--dz-sidebar-overlay-z-index': 'var(--dz-z-modal-backdrop)',
}
