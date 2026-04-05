/**
 * DzCommandPalette -- Component-specific token mappings.
 *
 * Maps semantic design tokens to command palette components (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/overlays/DzCommandPalette.tokens
 */

export const commandPaletteTokens = {
  /** Overlay backdrop */
  overlay: {
    background: 'var(--dz-overlay-bg)',
  },
  /** Content panel */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-xl)',
  },
  /** Search input */
  input: {
    paddingX: 'var(--dz-spacing-4)',
    paddingY: 'var(--dz-spacing-3)',
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-foreground)',
    placeholderColor: 'var(--dz-muted-foreground)',
    borderColor: 'var(--dz-border)',
  },
  /** Input wrapper with icon */
  inputWrapper: {
    gap: 'var(--dz-spacing-2)',
    paddingX: 'var(--dz-spacing-3)',
    borderColor: 'var(--dz-border)',
    iconColor: 'var(--dz-muted-foreground)',
  },
  /** Results list */
  list: {
    padding: 'var(--dz-spacing-1)',
  },
  /** Result item */
  item: {
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-2)',
    fontSize: 'var(--dz-text-sm)',
    highlightBackground: 'var(--dz-muted)',
    highlightForeground: 'var(--dz-foreground)',
    iconColor: 'var(--dz-muted-foreground)',
    iconGap: 'var(--dz-spacing-2)',
  },
  /** Shortcut label */
  itemShortcut: {
    fontSize: 'var(--dz-text-xs)',
    color: 'var(--dz-muted-foreground)',
  },
  /** Group heading */
  groupHeading: {
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-1_5)',
    fontSize: 'var(--dz-text-xs)',
    color: 'var(--dz-muted-foreground)',
  },
  /** Empty state */
  empty: {
    paddingY: 'var(--dz-spacing-6)',
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
  },
  /** Separator line */
  separator: {
    color: 'var(--dz-border)',
    marginX: 'var(--dz-spacing-1)',
    marginY: 'var(--dz-spacing-1)',
  },
  /** Transition timing */
  transition: 'var(--dz-transition-fast)',
} as const
