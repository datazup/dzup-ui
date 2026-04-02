/**
 * DzStatCard — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzStatCard's slot-based
 * variant definitions (root, header, title, icon, value, description, trend).
 */

/** Token references used by DzStatCard */
export const statCardTokens = {
  /** Root container */
  root: {
    radius: 'var(--dz-card-radius)',
    foreground: 'var(--dz-card-foreground)',
    padding: 'var(--dz-card-padding)',
    background: 'var(--dz-card)',
  },

  /** Shadow per variant */
  shadow: {
    elevated: 'var(--dz-shadow-md)',
  },

  /** Border for outlined variant */
  border: {
    color: 'var(--dz-card-border-color)',
  },

  /** Title label */
  title: {
    fontSize: 'var(--dz-text-sm)',
    fontWeight: 'var(--dz-font-medium)',
    color: 'var(--dz-muted-foreground)',
  },

  /** Icon slot */
  icon: {
    color: 'var(--dz-muted-foreground)',
  },

  /** Primary metric value */
  value: {
    fontSize: 'var(--dz-text-2xl)',
    color: 'var(--dz-foreground)',
    marginTop: 'var(--dz-spacing-2)',
  },

  /** Description text */
  description: {
    fontSize: 'var(--dz-text-xs)',
    color: 'var(--dz-muted-foreground)',
    marginTop: 'var(--dz-spacing-1)',
  },

  /** Trend indicator */
  trend: {
    fontSize: 'var(--dz-text-xs)',
    fontWeight: 'var(--dz-font-medium)',
    gap: 'var(--dz-spacing-1)',
    up: 'var(--dz-success)',
    down: 'var(--dz-danger)',
    neutral: 'var(--dz-muted-foreground)',
  },
} as const
