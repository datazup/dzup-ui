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
  '--dz-background': 'var(--dz-colors-neutral-50)',
  '--dz-foreground': 'var(--dz-colors-neutral-900)',
  '--dz-surface': 'oklch(1 0 0)',
  '--dz-surface-raised': 'var(--dz-colors-neutral-50)',
  '--dz-muted': 'var(--dz-colors-neutral-100)',
  '--dz-muted-foreground': 'var(--dz-colors-neutral-500)',

  /* ── Borders ── */
  '--dz-border': 'var(--dz-colors-neutral-200)',
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

  /* ── Status: Warning ── */
  '--dz-warning': 'var(--dz-colors-warning-500)',
  '--dz-warning-foreground': 'var(--dz-colors-neutral-900)',
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
  '--dz-overlay-bg': 'oklch(0 0 0 / 0.5)',

  /* ── Chart Colors ── */
  '--dz-chart-1': 'var(--dz-colors-primary-500)',
  '--dz-chart-2': 'var(--dz-colors-secondary-500)',
  '--dz-chart-3': 'var(--dz-colors-success-500)',
  '--dz-chart-4': 'var(--dz-colors-warning-500)',
  '--dz-chart-5': 'var(--dz-colors-danger-500)',
}
