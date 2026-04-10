/**
 * DzAppShell -- design token references.
 *
 * Maps component-level CSS custom properties to the global
 * dzup-ui token system (ADR-04).
 *
 * @module @dzup-ui/core/components/layout/DzAppShell.tokens
 */

export const appShellTokens = {
  header: {
    height: 'var(--dz-appshell-header-height)',
    bg: 'var(--dz-appshell-header-bg)',
    border: 'var(--dz-appshell-header-border)',
    zIndex: 'var(--dz-appshell-header-z-index)',
    paddingX: 'var(--dz-appshell-header-padding-x)',
  },
  main: {
    bg: 'var(--dz-appshell-main-bg)',
    padding: 'var(--dz-appshell-main-padding)',
  },
  transition: 'var(--dz-appshell-transition)',
} as const
