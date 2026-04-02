/**
 * DzMenu -- Component-specific token mappings.
 *
 * Maps semantic design tokens to vertical navigation menu styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzup-ui/core/components/navigation/DzMenu.tokens
 */

export const menuTokens = {
  /** Root menu container */
  root: {
    gap: 'var(--dz-spacing-1)',
  },
  /** Menu item styling */
  item: {
    /** Internal gap between icon and label */
    gap: 'var(--dz-spacing-2)',
    /** Default item padding */
    paddingX: 'var(--dz-spacing-3)',
    paddingY: 'var(--dz-spacing-2)',
    /** Item text styling */
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-foreground)',
    /** Hover state */
    hoverBackground: 'var(--dz-muted)',
    /** Focus ring */
    focusRing: 'var(--dz-primary)',
    /** Border radius */
    radius: 'var(--dz-radius-md)',
  },
  /** Active (selected) menu item */
  active: {
    background: 'var(--dz-primary-muted)',
    color: 'var(--dz-primary)',
    fontWeight: 'var(--dz-font-medium)',
  },
  /** Separator between menu groups */
  separator: {
    color: 'var(--dz-border)',
    marginY: 'var(--dz-spacing-1)',
  },
  /** Disabled item */
  disabled: {
    opacity: '0.5',
  },
  /** Size scale for item padding and font size */
  size: {
    xs: {
      paddingX: 'var(--dz-spacing-2)',
      paddingY: 'var(--dz-spacing-1)',
      fontSize: 'var(--dz-text-xs)',
    },
    sm: {
      paddingX: 'var(--dz-spacing-2_5)',
      paddingY: 'var(--dz-spacing-1_5)',
      fontSize: 'var(--dz-text-xs)',
    },
    md: {
      paddingX: 'var(--dz-spacing-3)',
      paddingY: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-sm)',
    },
    lg: {
      paddingX: 'var(--dz-spacing-4)',
      paddingY: 'var(--dz-spacing-2_5)',
      fontSize: 'var(--dz-text-base)',
    },
    xl: {
      paddingX: 'var(--dz-spacing-4)',
      paddingY: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-lg)',
    },
  },
} as const
