/**
 * AppShell Component Tokens
 *
 * Component-level token mappings for the DzAppShell layout component.
 * References semantic tokens. Consumers can override per-component.
 */

export const APPSHELL_TOKENS: Record<string, string> = {
  /* ── Sidebar offset ── */
  /**
   * Width the AppShell content area reserves for the sidebar slot.
   * Defaults to the canonical sidebar width so flex-sibling and fixed
   * sidebar layouts share one source of truth.
   *
   * Phase 2 of the shell improvement plan removes the auto-margin from
   * `DzAppShell.variants.ts`; this token remains exposed for apps that
   * read it directly.
   */
  '--dz-appshell-sidebar-width': 'var(--dz-sidebar-width)',

  /* ── Header ── */
  '--dz-appshell-header-height': '4rem',
  '--dz-appshell-header-bg': 'var(--dz-surface)',
  '--dz-appshell-header-border': 'var(--dz-border)',
  '--dz-appshell-header-z-index': 'var(--dz-z-sticky)',
  '--dz-appshell-header-padding-x': 'var(--dz-spacing-4)',

  /* ── Main ── */
  '--dz-appshell-main-bg': 'var(--dz-background)',
  '--dz-appshell-main-padding': 'var(--dz-spacing-6)',

  /* ── Transition ── */
  '--dz-appshell-transition': 'all var(--dz-duration-normal) var(--dz-ease-default)',
}
