/**
 * DzSplitButton — Component-specific token mappings.
 *
 * DzSplitButton is a compound component (root + action + menu).
 * The root is a layout wrapper; the action and menu sub-parts reuse
 * DzButton tokens for their visual styling.
 */

/** Token references used by DzSplitButton and its sub-parts */
export const splitButtonTokens = {
  /** Menu trigger: inner border that visually separates action from menu */
  menuDivider: {
    color: 'var(--dz-background)',
  },

  /**
   * Action and menu sub-parts inherit the full DzButton token set.
   * These references document the dependency.
   */
  inherited: {
    fontWeight: 'var(--dz-button-font-weight)',
    fontFamily: 'var(--dz-button-font-family)',
    transition: 'var(--dz-button-transition)',
    focus: {
      ringWidth: 'var(--dz-button-focus-ring-width)',
      ringColor: 'var(--dz-button-focus-ring-color)',
      ringOffset: 'var(--dz-button-focus-ring-offset)',
    },
    disabledOpacity: 'var(--dz-button-disabled-opacity)',
  },

  /** Size variants — action reuses DzButton sizing, menu uses a narrower paddingX */
  size: {
    xs: { height: 'var(--dz-button-xs-height)', fontSize: 'var(--dz-button-xs-font-size)' },
    sm: { height: 'var(--dz-button-sm-height)', fontSize: 'var(--dz-button-sm-font-size)' },
    md: { height: 'var(--dz-button-md-height)', fontSize: 'var(--dz-button-md-font-size)' },
    lg: { height: 'var(--dz-button-lg-height)', fontSize: 'var(--dz-button-lg-font-size)' },
    xl: { height: 'var(--dz-button-xl-height)', fontSize: 'var(--dz-button-xl-font-size)' },
  },
} as const
