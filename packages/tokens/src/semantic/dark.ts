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
  /* ── Surfaces ── */
  '--dz-background': 'var(--dz-colors-neutral-950)',
  '--dz-foreground': 'var(--dz-colors-neutral-50)',
  '--dz-surface': 'var(--dz-colors-neutral-900)',
  '--dz-surface-raised': 'var(--dz-colors-neutral-800)',
  '--dz-muted': 'var(--dz-colors-neutral-800)',
  '--dz-muted-foreground': 'var(--dz-colors-neutral-400)',

  /* ── Borders ── */
  '--dz-border': 'var(--dz-colors-neutral-700)',
  '--dz-border-hover': 'var(--dz-colors-neutral-600)',
  '--dz-ring': 'var(--dz-colors-primary-400)',

  /* ── Primary ── */
  '--dz-primary': 'var(--dz-colors-primary-400)',
  '--dz-primary-foreground': 'var(--dz-colors-primary-950)',
  '--dz-primary-hover': 'var(--dz-colors-primary-300)',
  '--dz-primary-muted': 'var(--dz-colors-primary-900)',
  '--dz-primary-muted-foreground': 'var(--dz-colors-primary-300)',

  /* ── Secondary ── */
  '--dz-secondary': 'var(--dz-colors-secondary-400)',
  '--dz-secondary-foreground': 'var(--dz-colors-secondary-950)',
  '--dz-secondary-hover': 'var(--dz-colors-secondary-300)',
  '--dz-secondary-muted': 'var(--dz-colors-secondary-900)',
  '--dz-secondary-muted-foreground': 'var(--dz-colors-secondary-300)',

  /* ── Accent ── */
  '--dz-accent': 'var(--dz-colors-neutral-800)',
  '--dz-accent-foreground': 'var(--dz-colors-neutral-50)',

  /* ── Destructive ── */
  '--dz-destructive': 'var(--dz-colors-danger-400)',
  '--dz-destructive-foreground': 'var(--dz-colors-danger-950)',

  /* ── Status: Success ── */
  '--dz-success': 'var(--dz-colors-success-400)',
  '--dz-success-foreground': 'var(--dz-colors-success-950)',
  '--dz-success-muted': 'var(--dz-colors-success-900)',
  '--dz-success-muted-foreground': 'var(--dz-colors-success-300)',

  /* ── Status: Warning ── */
  '--dz-warning': 'var(--dz-colors-warning-400)',
  '--dz-warning-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-warning-muted': 'var(--dz-colors-warning-900)',
  '--dz-warning-muted-foreground': 'var(--dz-colors-warning-300)',

  /* ── Status: Danger ── */
  '--dz-danger': 'var(--dz-colors-danger-400)',
  '--dz-danger-foreground': 'var(--dz-colors-danger-950)',
  '--dz-danger-muted': 'var(--dz-colors-danger-900)',
  '--dz-danger-muted-foreground': 'var(--dz-colors-danger-300)',

  /* ── Status: Info ── */
  '--dz-info': 'var(--dz-colors-info-400)',
  '--dz-info-foreground': 'var(--dz-colors-info-950)',
  '--dz-info-muted': 'var(--dz-colors-info-900)',
  '--dz-info-muted-foreground': 'var(--dz-colors-info-300)',

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

  /* ── Overlay ── */
  '--dz-overlay-bg': 'oklch(0 0 0 / 0.7)',

  /* ── Sidebar ── */
  '--dz-sidebar-bg': 'var(--dz-colors-neutral-950)',
  '--dz-sidebar-foreground': 'var(--dz-colors-neutral-400)',
  '--dz-sidebar-border': 'var(--dz-colors-neutral-800)',
  '--dz-sidebar-heading': 'var(--dz-colors-neutral-500)',
  '--dz-sidebar-item-hover-bg': 'var(--dz-colors-neutral-800)',
  '--dz-sidebar-item-hover-text': 'var(--dz-colors-neutral-50)',
  '--dz-sidebar-item-active-bg': 'var(--dz-colors-primary-500)',
  '--dz-sidebar-item-active-text': 'oklch(1 0 0)',
  '--dz-sidebar-header-bg': 'oklch(0 0 0)',
  '--dz-sidebar-footer-bg': 'oklch(0 0 0)',

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

  /* ── Chart Colors (shifted lighter for dark bg) ── */
  '--dz-chart-1': 'var(--dz-colors-primary-400)',
  '--dz-chart-2': 'var(--dz-colors-secondary-400)',
  '--dz-chart-3': 'var(--dz-colors-success-400)',
  '--dz-chart-4': 'var(--dz-colors-warning-400)',
  '--dz-chart-5': 'var(--dz-colors-danger-400)',

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
