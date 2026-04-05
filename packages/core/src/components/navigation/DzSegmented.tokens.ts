/**
 * DzSegmented -- Component-specific token mappings.
 *
 * Maps semantic design tokens to segmented control styling (ADR-04).
 * All values reference CSS custom properties from the tokens package.
 *
 * @module @dzip-ui/core/components/navigation/DzSegmented.tokens
 */

export const segmentedTokens = {
  /** Root container */
  root: {
    background: 'var(--dz-muted)',
    radius: 'var(--dz-radius-md)',
    padding: 'var(--dz-spacing-1)',
  },
  /** Individual segment item */
  item: {
    /** Default (inactive) text color */
    color: 'var(--dz-muted-foreground)',
    /** Active item background */
    activeBackground: 'var(--dz-background)',
    /** Active item text color */
    activeColor: 'var(--dz-foreground)',
    /** Active item shadow */
    activeShadow: 'var(--dz-shadow-sm)',
    /** Item border radius */
    radius: 'var(--dz-radius-sm)',
    /** Font weight */
    fontWeight: 'var(--dz-font-medium)',
    /** Focus ring color */
    focusRing: 'var(--dz-primary)',
    /** Disabled state opacity */
    disabledOpacity: '0.5',
    /** Transition for state changes */
    transition: 'var(--dz-transition-fast)',
  },
  /** Size scale for item padding and font size */
  size: {
    xs: {
      paddingX: 'var(--dz-spacing-2)',
      paddingY: 'var(--dz-spacing-0_5)',
      fontSize: 'var(--dz-text-xs)',
    },
    sm: {
      paddingX: 'var(--dz-spacing-2_5)',
      paddingY: 'var(--dz-spacing-1)',
      fontSize: 'var(--dz-text-xs)',
    },
    md: {
      paddingX: 'var(--dz-spacing-3)',
      paddingY: 'var(--dz-spacing-1_5)',
      fontSize: 'var(--dz-text-sm)',
    },
    lg: {
      paddingX: 'var(--dz-spacing-4)',
      paddingY: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-base)',
    },
    xl: {
      paddingX: 'var(--dz-spacing-5)',
      paddingY: 'var(--dz-spacing-2_5)',
      fontSize: 'var(--dz-text-lg)',
    },
  },
} as const
