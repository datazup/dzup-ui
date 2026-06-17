/**
 * DzPanel -- Component-specific token mappings.
 *
 * Maps semantic design tokens to the panel anatomy (ADR-04/ADR-17).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/layout/DzPanel.tokens
 */

export const panelTokens = {
  /** Corner radius of the panel surface */
  radius: 'var(--dz-panel-radius)',
  /** Surface background */
  background: 'var(--dz-panel-bg)',
  /** Body/title text color */
  foreground: 'var(--dz-panel-foreground)',
  /** Border color */
  border: 'var(--dz-panel-border)',
  /** Elevation shadow (elevated variant) */
  shadow: 'var(--dz-panel-shadow)',
  /** Title accent color (driven by `tone`) */
  accent: 'var(--dz-panel-accent)',
  /** Gap between header items */
  gap: 'var(--dz-panel-gap)',
  /** Horizontal padding for header and body */
  paddingX: 'var(--dz-panel-padding-x)',
  /** Body vertical padding */
  paddingY: 'var(--dz-panel-padding-y)',
  /** Header vertical padding */
  headerPaddingY: 'var(--dz-panel-header-padding-y)',
  /** Title font size */
  titleSize: 'var(--dz-panel-title-size)',
} as const
