/**
 * Dark Theme Semantic Tokens
 *
 * Maps primitive color tokens to semantic roles for the dark theme.
 * Applied via `[data-theme="dark"]` selector.
 *
 * Key differences from light:
 * - Surfaces invert (light bg -> dark bg)
 * - Primary shifts to lighter shade (500 -> 400) for contrast
 * - Saturation slightly reduced for dark mode comfort
 * - Shadow opacity increased (dark backgrounds absorb light)
 * - Borders shift to lighter neutrals (200 -> 700)
 */

export const DARK_SEMANTIC_TOKENS: Record<string, string> = {
  /* ── Surfaces ──
   * Same elevation ladder as light, inverted. In dark mode raised surfaces get
   * *lighter* (more tint) while sunken wells go darker than the resting card. */
  '--dz-background': 'var(--dz-colors-neutral-950)',
  '--dz-foreground': 'var(--dz-colors-neutral-50)',
  '--dz-surface-sunken': 'var(--dz-colors-neutral-950)',
  '--dz-surface': 'var(--dz-colors-neutral-900)',
  '--dz-surface-raised': 'var(--dz-colors-neutral-800)',
  '--dz-surface-overlay': 'var(--dz-colors-neutral-800)',
  '--dz-surface-foreground': 'var(--dz-colors-neutral-50)',
  '--dz-muted': 'var(--dz-colors-neutral-800)',
  '--dz-muted-foreground': 'var(--dz-colors-neutral-400)',

  /* ── Borders ── */
  '--dz-border': 'var(--dz-colors-neutral-700)',
  '--dz-border-hover': 'var(--dz-colors-neutral-600)',
  '--dz-divider': 'var(--dz-colors-neutral-800)',
  '--dz-ring': 'var(--dz-colors-primary-400)',
  '--dz-ring-offset': 'var(--dz-background)',

  /* ── Links ── */
  '--dz-link': 'var(--dz-colors-primary-400)',
  '--dz-link-hover': 'var(--dz-colors-primary-300)',

  /* ── Disabled ── */
  '--dz-disabled': 'var(--dz-colors-neutral-800)',
  '--dz-disabled-foreground': 'var(--dz-colors-neutral-600)',

  /* ── Highlight ── */
  '--dz-highlight': 'var(--dz-colors-primary-900)',
  '--dz-highlight-foreground': 'var(--dz-colors-primary-200)',

  /* ── Primary ── */
  '--dz-primary': 'var(--dz-colors-primary-400)',
  '--dz-primary-foreground': 'var(--dz-colors-primary-950)',
  '--dz-primary-hover': 'var(--dz-colors-primary-300)',
  '--dz-primary-active': 'var(--dz-colors-primary-200)',
  '--dz-primary-muted': 'var(--dz-colors-primary-900)',
  '--dz-primary-muted-foreground': 'var(--dz-colors-primary-300)',
  '--dz-primary-border': 'var(--dz-colors-primary-800)',

  /* ── Secondary ── */
  '--dz-secondary': 'var(--dz-colors-secondary-400)',
  '--dz-secondary-foreground': 'var(--dz-colors-secondary-950)',
  '--dz-secondary-hover': 'var(--dz-colors-secondary-300)',
  '--dz-secondary-active': 'var(--dz-colors-secondary-200)',
  '--dz-secondary-muted': 'var(--dz-colors-secondary-900)',
  '--dz-secondary-muted-foreground': 'var(--dz-colors-secondary-300)',
  '--dz-secondary-border': 'var(--dz-colors-secondary-800)',

  /* ── Accent ── */
  '--dz-accent': 'var(--dz-colors-neutral-800)',
  '--dz-accent-foreground': 'var(--dz-colors-neutral-50)',

  /* ── Destructive ── */
  '--dz-destructive': 'var(--dz-colors-danger-400)',
  '--dz-destructive-foreground': 'var(--dz-colors-danger-950)',

  /* ── Status: Success ── */
  '--dz-success': 'var(--dz-colors-success-400)',
  '--dz-success-foreground': 'var(--dz-colors-success-950)',
  '--dz-success-hover': 'var(--dz-colors-success-300)',
  '--dz-success-active': 'var(--dz-colors-success-200)',
  '--dz-success-muted': 'var(--dz-colors-success-900)',
  '--dz-success-muted-foreground': 'var(--dz-colors-success-300)',
  '--dz-success-border': 'var(--dz-colors-success-800)',

  /* ── Status: Warning ──
   * Solid fills stay a bright yellow with dark text in dark mode too — a yellow
   * warning button reads the same regardless of theme. `--dz-warning` (shade
   * 400) remains the legible accent/text color on dark surfaces. */
  '--dz-warning': 'var(--dz-colors-warning-400)',
  '--dz-warning-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-warning-solid': 'var(--dz-colors-warning-300)',
  '--dz-warning-solid-hover': 'var(--dz-colors-warning-400)',
  '--dz-warning-active': 'var(--dz-colors-warning-200)',
  '--dz-warning-muted': 'var(--dz-colors-warning-900)',
  '--dz-warning-muted-foreground': 'var(--dz-colors-warning-300)',
  '--dz-warning-border': 'var(--dz-colors-warning-800)',

  /* ── Status: Danger ── */
  '--dz-danger': 'var(--dz-colors-danger-400)',
  '--dz-danger-foreground': 'var(--dz-colors-danger-950)',
  '--dz-danger-hover': 'var(--dz-colors-danger-300)',
  '--dz-danger-active': 'var(--dz-colors-danger-200)',
  '--dz-danger-muted': 'var(--dz-colors-danger-900)',
  '--dz-danger-muted-foreground': 'var(--dz-colors-danger-300)',
  '--dz-danger-border': 'var(--dz-colors-danger-800)',

  /* ── Status: Info ── */
  '--dz-info': 'var(--dz-colors-info-400)',
  '--dz-info-foreground': 'var(--dz-colors-info-950)',
  '--dz-info-hover': 'var(--dz-colors-info-300)',
  '--dz-info-active': 'var(--dz-colors-info-200)',
  '--dz-info-muted': 'var(--dz-colors-info-900)',
  '--dz-info-muted-foreground': 'var(--dz-colors-info-300)',
  '--dz-info-border': 'var(--dz-colors-info-800)',

  /* ── Input ── */
  '--dz-input-bg': 'var(--dz-colors-neutral-800)',
  '--dz-input-border': 'var(--dz-colors-neutral-600)',
  '--dz-input-border-focus': 'var(--dz-colors-primary-400)',
  '--dz-input-placeholder': 'var(--dz-colors-neutral-500)',

  /* ── Card ── */
  '--dz-card': 'var(--dz-colors-neutral-900)',
  '--dz-card-foreground': 'var(--dz-colors-neutral-50)',

  /* ── Popover ── */
  '--dz-popover': 'var(--dz-colors-neutral-900)',
  '--dz-popover-foreground': 'var(--dz-colors-neutral-50)',

  /* ── Overlay / Scrim ── */
  '--dz-overlay-bg': 'oklch(0 0 0 / 0.7)',
  '--dz-scrim': 'oklch(0 0 0 / 0.7)',

  /* ── Sidebar ──
   * See `light.ts` for the rationale. Sidebar values live in the brand
   * preset, not the semantic tier. Tier 3 component defaults provide the
   * neutral fallback for apps that don't import a sidebar preset. */

  /* ── AppShell ── */
  '--dz-appshell-header-bg': 'var(--dz-colors-neutral-900)',
  '--dz-appshell-header-border': 'var(--dz-colors-neutral-700)',
  '--dz-appshell-main-bg': 'var(--dz-colors-neutral-950)',

  /* ── CodeBlock ── */
  '--dz-codeblock-bg': 'var(--dz-colors-neutral-950)',
  '--dz-codeblock-text': 'var(--dz-colors-neutral-100)',
  '--dz-codeblock-border': 'var(--dz-colors-neutral-800)',
  '--dz-codeblock-header-bg': 'var(--dz-colors-neutral-900)',
  '--dz-codeblock-header-text': 'var(--dz-colors-neutral-500)',
  '--dz-codeblock-line-number': 'var(--dz-colors-neutral-700)',

  /* ── Chart / categorical palette (shifted lighter for dark bg) ── */
  '--dz-chart-1': 'var(--dz-colors-primary-400)',
  '--dz-chart-2': 'var(--dz-colors-secondary-400)',
  '--dz-chart-3': 'var(--dz-colors-success-400)',
  '--dz-chart-4': 'var(--dz-colors-warning-400)',
  '--dz-chart-5': 'var(--dz-colors-danger-400)',
  '--dz-chart-6': 'var(--dz-colors-cyan-400)',
  '--dz-chart-7': 'var(--dz-colors-violet-400)',
  '--dz-chart-8': 'var(--dz-colors-pink-400)',
  '--dz-chart-9': 'var(--dz-colors-amber-400)',
  '--dz-chart-10': 'var(--dz-colors-teal-400)',

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
