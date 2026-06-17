/**
 * DzToolbar -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the toolbar anatomy (ADR-04/ADR-17).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/layout/DzToolbar.tokens
 */

export const toolbarTokens = {
  /** Gap between items within each region */
  gap: 'var(--dz-toolbar-gap)',
  /** Horizontal padding */
  paddingX: 'var(--dz-toolbar-padding-x)',
  /** Vertical padding */
  paddingY: 'var(--dz-toolbar-padding-y)',
  /** Corner radius */
  radius: 'var(--dz-toolbar-radius)',
  /** Surface background */
  background: 'var(--dz-toolbar-bg)',
  /** Border color */
  border: 'var(--dz-toolbar-border)',
  /** Elevation shadow (elevated variant) */
  shadow: 'var(--dz-toolbar-shadow)',
} as const
