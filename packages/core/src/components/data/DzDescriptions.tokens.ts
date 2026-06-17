/**
 * DzDescriptions -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the descriptions detail grid (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 * Each `--dz-descriptions-*` token has a global-token fallback so themes can
 * override descriptions independently without losing the default.
 *
 * @module @dzup-ui/core/components/data/DzDescriptions.tokens
 */

export const descriptionsTokens = {
  /** Term / label cell */
  label: {
    color: 'var(--dz-descriptions-label-color, var(--dz-muted-foreground))',
    background: 'var(--dz-descriptions-label-bg, var(--dz-muted))',
    /** Fixed label column width used by horizontal layouts */
    width: 'var(--dz-descriptions-label-width, 8rem)',
  },
  /** Detail / value cell */
  value: {
    color: 'var(--dz-descriptions-value-color, var(--dz-foreground))',
    background: 'var(--dz-background)',
  },
  /** Cell borders (bordered variant) */
  border: {
    color: 'var(--dz-descriptions-border-color, var(--dz-border))',
    radius: 'var(--dz-radius-md)',
  },
  /** Cell padding scale (bordered variant) */
  padding: {
    xs: { x: 'var(--dz-spacing-2)', y: 'var(--dz-spacing-1)' },
    sm: { x: 'var(--dz-spacing-3)', y: 'var(--dz-spacing-1)' },
    md: { x: 'var(--dz-spacing-3)', y: 'var(--dz-spacing-2)' },
    lg: { x: 'var(--dz-spacing-4)', y: 'var(--dz-spacing-3)' },
    xl: { x: 'var(--dz-spacing-5)', y: 'var(--dz-spacing-4)' },
  },
  /** Row / column gaps (non-bordered variant) */
  gap: {
    column: 'var(--dz-spacing-6)',
    row: 'var(--dz-spacing-3)',
    /** Gap between a label and value within one pair */
    pair: 'var(--dz-spacing-3)',
  },
  /** Value font size scale */
  size: {
    xs: 'var(--dz-text-xs)',
    sm: 'var(--dz-text-sm)',
    md: 'var(--dz-text-sm)',
    lg: 'var(--dz-text-base)',
    xl: 'var(--dz-text-lg)',
  },
} as const
