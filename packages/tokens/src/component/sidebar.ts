/**
 * Sidebar Component Tokens
 *
 * Component-level token mappings for the DzSidebar navigation component.
 * References semantic tokens. Consumers can override per-component.
 *
 * Canonical color token names use the `-foreground` suffix (e.g.
 * `--dz-sidebar-foreground`). Legacy `--dz-sidebar-text` /
 * `--dz-sidebar-text-hover` names are kept as deprecated aliases for one
 * minor and will be removed in the next major.
 *
 * See `apps/website-app/docs/analysis/dzup-ui-shell-improvement-pm-plan-2026-04-29.md`
 * (Task 1.2) for the unification rationale and migration plan.
 */

export const SIDEBAR_TOKENS: Record<string, string> = {
  /* ── Layout ── */
  '--dz-sidebar-width': '16rem',
  '--dz-sidebar-collapsed-width': '4rem',
  '--dz-sidebar-z-index': 'var(--dz-z-sticky)',
  '--dz-sidebar-transition': 'width var(--dz-duration-normal) var(--dz-ease-default)',

  /* ── Surfaces (canonical) ── */
  '--dz-sidebar-bg': 'var(--dz-surface)',
  '--dz-sidebar-border': 'var(--dz-border)',
  '--dz-sidebar-header-bg': 'var(--dz-surface)',
  '--dz-sidebar-footer-bg': 'var(--dz-surface)',

  /* ── Text (canonical) ── */
  '--dz-sidebar-foreground': 'var(--dz-muted-foreground)',
  '--dz-sidebar-foreground-hover': 'var(--dz-foreground)',
  '--dz-sidebar-heading': 'var(--dz-muted-foreground)',

  /* ── Text (deprecated aliases — remove in next major) ── */
  /** @deprecated Use `--dz-sidebar-foreground` instead. */
  '--dz-sidebar-text': 'var(--dz-sidebar-foreground)',
  /** @deprecated Use `--dz-sidebar-foreground-hover` instead. */
  '--dz-sidebar-text-hover': 'var(--dz-sidebar-foreground-hover)',

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
  '--dz-sidebar-section-title-color': 'var(--dz-sidebar-heading)',
  '--dz-sidebar-section-title-padding-x': 'var(--dz-spacing-3)',
  '--dz-sidebar-section-title-letter-spacing': '0.05em',
  '--dz-sidebar-section-title-text-transform': 'uppercase',

  /* ── Header & Footer (structural) ── */
  '--dz-sidebar-header-padding': 'var(--dz-spacing-4)',
  '--dz-sidebar-header-border': 'var(--dz-border)',
  '--dz-sidebar-footer-padding': 'var(--dz-spacing-4)',
  '--dz-sidebar-footer-border': 'var(--dz-border)',

  /* ── Mobile overlay ── */
  '--dz-sidebar-overlay-bg': 'var(--dz-overlay-bg)',
  '--dz-sidebar-overlay-z-index': 'var(--dz-z-modal-backdrop)',
}
