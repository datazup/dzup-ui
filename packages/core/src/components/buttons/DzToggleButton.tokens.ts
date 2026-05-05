/**
 * DzToggleButton — Component-specific token mappings.
 *
 * Reuses the DzButton token tier for base styling. Adds pressed-state
 * tokens that control the visual feedback for the toggle.
 */

/** Token references used by DzToggleButton */
export const toggleButtonTokens = {
  /** Inherits base button tokens */
  fontWeight: 'var(--dz-button-font-weight)',
  fontFamily: 'var(--dz-button-font-family)',
  transition: 'var(--dz-button-transition)',

  /** Focus ring configuration (shared with DzButton) */
  focus: {
    ringWidth: 'var(--dz-button-focus-ring-width)',
    ringColor: 'var(--dz-button-focus-ring-color)',
    ringOffset: 'var(--dz-button-focus-ring-offset)',
  },

  /** Opacity applied to the disabled state */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',

  /** Shadow applied to the solid variant */
  shadow: 'var(--dz-shadow-xs)',

  /** Size variants — reuses DzButton sizing tokens */
  size: {
    xs: {
      height: 'var(--dz-button-xs-height)',
      paddingX: 'var(--dz-button-xs-padding-x)',
      fontSize: 'var(--dz-button-xs-font-size)',
      gap: 'var(--dz-button-xs-gap)',
    },
    sm: {
      height: 'var(--dz-button-sm-height)',
      paddingX: 'var(--dz-button-sm-padding-x)',
      fontSize: 'var(--dz-button-sm-font-size)',
      gap: 'var(--dz-button-sm-gap)',
    },
    md: {
      height: 'var(--dz-button-md-height)',
      paddingX: 'var(--dz-button-md-padding-x)',
      fontSize: 'var(--dz-button-md-font-size)',
      gap: 'var(--dz-button-md-gap)',
    },
    lg: {
      height: 'var(--dz-button-lg-height)',
      paddingX: 'var(--dz-button-lg-padding-x)',
      fontSize: 'var(--dz-button-lg-font-size)',
      gap: 'var(--dz-button-lg-gap)',
    },
    xl: {
      height: 'var(--dz-button-xl-height)',
      paddingX: 'var(--dz-button-xl-padding-x)',
      fontSize: 'var(--dz-button-xl-font-size)',
      gap: 'var(--dz-button-xl-gap)',
    },
  },

  /** Border radius per size range */
  radius: {
    sm: 'var(--dz-radius-sm)',
    md: 'var(--dz-button-radius)',
    lg: 'var(--dz-radius-lg)',
  },

  /** Pressed state colors */
  pressed: {
    background: 'var(--dz-muted)',
    border: 'var(--dz-primary)',
    ring: 'var(--dz-button-focus-ring-color)',
  },
} as const
