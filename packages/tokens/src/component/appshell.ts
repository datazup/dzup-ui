/**
 * AppShell Component Tokens
 *
 * Component-level token mappings for the DzAppShell layout component.
 * References semantic tokens. Consumers can override per-component.
 */

export const APPSHELL_TOKENS: Record<string, string> = {
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
