/**
 * DzRating -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04, ADR-17).
 *
 * Anatomy: a horizontal row of icon items. Each item layers a filled icon
 * (clipped to a fill percentage) over an empty icon. Filled color derives
 * from the active tone; the empty color stays muted for clear WCAG AA
 * contrast between filled and empty states.
 */
export const ratingTokens = {
  /** Empty (unfilled) icon color */
  empty: 'var(--dz-muted-foreground)',
  /** Invalid-state empty icon color */
  invalid: 'var(--dz-danger)',
  /** Filled icon color per tone */
  tone: {
    neutral: 'var(--dz-foreground)',
    primary: 'var(--dz-primary)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning)',
    danger: 'var(--dz-danger)',
    info: 'var(--dz-info)',
  },
  /** Inter-item gap per size */
  gap: {
    xs: 'var(--dz-spacing-0-5, 0.125rem)',
    sm: 'var(--dz-spacing-0-5, 0.125rem)',
    md: 'var(--dz-spacing-1, 0.25rem)',
    lg: 'var(--dz-spacing-1, 0.25rem)',
    xl: 'var(--dz-spacing-1-5, 0.375rem)',
  },
  /** Icon dimension per size (mirrors DzIcon size scale) */
  size: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '2rem',
  },
} as const
