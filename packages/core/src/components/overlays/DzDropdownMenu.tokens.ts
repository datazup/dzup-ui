/**
 * DzDropdownMenu -- Component-specific token mappings.
 *
 * Maps semantic design tokens to dropdown menu components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/overlays/DzDropdownMenu.tokens
 */

export const dropdownMenuTokens = {
  /** Content panel */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    shadow: 'var(--dz-shadow-md)',
    padding: 'var(--dz-spacing-1)',
  },
  /** Menu item */
  item: {
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-1_5)',
    fontSize: 'var(--dz-text-sm)',
    hoverBackground: 'var(--dz-muted)',
    hoverForeground: 'var(--dz-foreground)',
  },
  /** Separator line */
  separator: {
    color: 'var(--dz-border)',
    marginX: 'var(--dz-spacing-1)',
    marginY: 'var(--dz-spacing-1)',
  },
  /** Group label */
  label: {
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-1_5)',
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-foreground)',
  },
  /** Transition timing */
  transition: 'var(--dz-transition-fast)',
} as const
