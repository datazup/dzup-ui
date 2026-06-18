/**
 * Light Theme Semantic Tokens
 *
 * Maps primitive color tokens to semantic roles for the light theme.
 * These are the default (`:root`) values.
 */

/**
 * Semantic token definitions for light mode.
 * Values reference primitive CSS custom properties via var().
 */
export const LIGHT_SEMANTIC_TOKENS: Record<string, string> = {
  /* ── Surfaces ── */
  '--dz-background': 'var(--dz-colors-neutral-100)',
  '--dz-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-surface': 'oklch(1 0 0)',
  '--dz-surface-raised': 'oklch(1 0 0)',
  '--dz-muted': 'var(--dz-colors-neutral-200)',
  // neutral-600 (not -500) so muted text clears WCAG AA 4.5:1 on both the page
  // surface (neutral-100 → 5.55:1) and muted surfaces (neutral-200 → 4.61:1).
  // neutral-500 sat at ~3.95:1 / ~3.27:1 and failed axe color-contrast across
  // components. Dark mode (neutral-400) already passes and is unchanged.
  '--dz-muted-foreground': 'var(--dz-colors-neutral-600)',

  /* ── Borders ── */
  '--dz-border': 'var(--dz-colors-neutral-300)',
  '--dz-border-hover': 'var(--dz-colors-neutral-300)',
  '--dz-ring': 'var(--dz-colors-primary-500)',

  /* ── Primary ── */
  '--dz-primary': 'var(--dz-colors-primary-500)',
  '--dz-primary-foreground': 'oklch(1 0 0)',
  '--dz-primary-hover': 'var(--dz-colors-primary-600)',
  '--dz-primary-muted': 'var(--dz-colors-primary-100)',
  '--dz-primary-muted-foreground': 'var(--dz-colors-primary-700)',

  /* ── Secondary ── */
  '--dz-secondary': 'var(--dz-colors-secondary-500)',
  '--dz-secondary-foreground': 'oklch(1 0 0)',
  '--dz-secondary-hover': 'var(--dz-colors-secondary-600)',
  '--dz-secondary-muted': 'var(--dz-colors-secondary-100)',
  '--dz-secondary-muted-foreground': 'var(--dz-colors-secondary-700)',

  /* ── Accent ── */
  '--dz-accent': 'var(--dz-colors-neutral-100)',
  '--dz-accent-foreground': 'var(--dz-colors-neutral-900)',

  /* ── Destructive ── */
  '--dz-destructive': 'var(--dz-colors-danger-500)',
  '--dz-destructive-foreground': 'oklch(1 0 0)',

  /* ── Status: Success ── */
  '--dz-success': 'var(--dz-colors-success-500)',
  '--dz-success-foreground': 'oklch(1 0 0)',
  '--dz-success-muted': 'var(--dz-colors-success-100)',
  '--dz-success-muted-foreground': 'var(--dz-colors-success-700)',

  /* ── Status: Warning ──
   * `--dz-warning` stays at shade 500 so it remains legible as a text/border
   * color on light surfaces. Solid fills (e.g. warning buttons) need a bright,
   * clearly-yellow surface with dark text instead of a dark fill, so they use
   * the dedicated `--dz-warning-solid` pair. */
  '--dz-warning': 'var(--dz-colors-warning-500)',
  '--dz-warning-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-warning-solid': 'var(--dz-colors-warning-300)',
  '--dz-warning-solid-hover': 'var(--dz-colors-warning-400)',
  '--dz-warning-muted': 'var(--dz-colors-warning-100)',
  '--dz-warning-muted-foreground': 'var(--dz-colors-warning-700)',

  /* ── Status: Danger ── */
  '--dz-danger': 'var(--dz-colors-danger-500)',
  '--dz-danger-foreground': 'oklch(1 0 0)',
  '--dz-danger-muted': 'var(--dz-colors-danger-100)',
  '--dz-danger-muted-foreground': 'var(--dz-colors-danger-700)',

  /* ── Status: Info ── */
  '--dz-info': 'var(--dz-colors-info-500)',
  '--dz-info-foreground': 'oklch(1 0 0)',
  '--dz-info-muted': 'var(--dz-colors-info-100)',
  '--dz-info-muted-foreground': 'var(--dz-colors-info-700)',

  /* ── Input ── */
  '--dz-input-bg': 'oklch(1 0 0)',
  '--dz-input-border': 'var(--dz-colors-neutral-300)',
  '--dz-input-border-focus': 'var(--dz-colors-primary-500)',
  '--dz-input-placeholder': 'var(--dz-colors-neutral-400)',

  /* ── Card ── */
  '--dz-card': 'oklch(1 0 0)',
  '--dz-card-foreground': 'var(--dz-colors-neutral-900)',

  /* ── Popover ── */
  '--dz-popover': 'oklch(1 0 0)',
  '--dz-popover-foreground': 'var(--dz-colors-neutral-900)',

  /* ── Overlay ── */
  '--dz-overlay-bg': 'oklch(0 0 0 / 0.6)',

  /* ── Sidebar ──
   * Sidebar token values are NOT written at the semantic tier. Tier 3 component
   * defaults in `src/component/sidebar.ts` provide neutral fallbacks (which
   * resolve to `var(--dz-surface)` etc.). Brand overrides — including the
   * "always-dark" Datazup sidebar look — live in
   * `@datazup/dzup-theme/styles/preset-dark-sidebar.css`. Apps opt in by
   * importing that preset; apps that don't import it get a neutral light
   * sidebar that follows the page surface.
   *
   * Writing concrete dark-neutrals here used to silently override the Tier 3
   * defaults regardless of whether the consumer wanted a dark sidebar — that
   * cascade collision was the bug Phase 6 of the shell improvement plan
   * resolved at the brand-preset level. Now that the preset writes the full
   * canonical set, this block is redundant and removed. */

  /* ── AppShell ── */
  '--dz-appshell-header-bg': 'oklch(1 0 0)',
  '--dz-appshell-header-border': 'var(--dz-colors-neutral-200)',
  '--dz-appshell-main-bg': 'var(--dz-colors-neutral-100)',

  /* ── CodeBlock ── */
  '--dz-codeblock-bg': 'var(--dz-colors-neutral-900)',
  '--dz-codeblock-text': 'var(--dz-colors-neutral-100)',
  '--dz-codeblock-border': 'var(--dz-colors-neutral-800)',
  '--dz-codeblock-header-bg': 'var(--dz-colors-neutral-800)',
  '--dz-codeblock-header-text': 'var(--dz-colors-neutral-400)',
  '--dz-codeblock-line-number': 'var(--dz-colors-neutral-600)',

  /* ── Chart Colors ── */
  '--dz-chart-1': 'var(--dz-colors-primary-500)',
  '--dz-chart-2': 'var(--dz-colors-secondary-500)',
  '--dz-chart-3': 'var(--dz-colors-success-500)',
  '--dz-chart-4': 'var(--dz-colors-warning-500)',
  '--dz-chart-5': 'var(--dz-colors-danger-500)',

  /* ── Orchestration run status ── */
  '--dz-status-pending': 'var(--dz-muted-foreground)',
  '--dz-status-running': 'var(--dz-info)',
  '--dz-status-paused': 'var(--dz-warning)',
  '--dz-status-completed': 'var(--dz-success)',
  '--dz-status-failed': 'var(--dz-danger)',
  '--dz-status-cancelled': 'var(--dz-muted-foreground)',

  /* ── Progress thresholds (token-usage bars) ── */
  '--dz-progress-amber': 'var(--dz-warning)',
  '--dz-progress-red': 'var(--dz-danger)',
}
