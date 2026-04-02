/**
 * DzButton — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzButton variants.
 * This file serves as the contract between the token system and the component.
 */

/** Token references used by DzButton */
export const buttonTokens = {
  /** Font weight applied to all button text */
  fontWeight: 'var(--dz-button-font-weight)',
  /** Font family */
  fontFamily: 'var(--dz-button-font-family)',
  /** Transition shorthand for all interactive states */
  transition: 'var(--dz-button-transition)',

  /** Focus ring configuration */
  focus: {
    ringWidth: 'var(--dz-button-focus-ring-width)',
    ringColor: 'var(--dz-button-focus-ring-color)',
    ringOffset: 'var(--dz-button-focus-ring-offset)',
  },

  /** Opacity applied to the disabled state */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',

  /** Border radius per size range */
  radius: {
    sm: 'var(--dz-radius-sm)',
    md: 'var(--dz-button-radius)',
    lg: 'var(--dz-radius-lg)',
  },

  /** Shadow applied to the solid variant */
  shadow: 'var(--dz-shadow-xs)',

  /** Size variants — height, horizontal padding, font size, gap */
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

  /** Tone colors — background, foreground, hover, muted, and border per tone */
  tone: {
    primary: {
      background: 'var(--dz-primary)',
      foreground: 'var(--dz-primary-foreground)',
      hover: 'var(--dz-primary-hover)',
      muted: 'var(--dz-primary-muted)',
    },
    neutral: {
      background: 'var(--dz-foreground)',
      foreground: 'var(--dz-background)',
      muted: 'var(--dz-muted)',
      border: 'var(--dz-border)',
    },
    success: {
      background: 'var(--dz-success)',
      foreground: 'var(--dz-success-foreground)',
      muted: 'var(--dz-success-muted)',
    },
    warning: {
      background: 'var(--dz-warning)',
      foreground: 'var(--dz-warning-foreground)',
      muted: 'var(--dz-warning-muted)',
    },
    danger: {
      background: 'var(--dz-danger)',
      foreground: 'var(--dz-danger-foreground)',
      muted: 'var(--dz-danger-muted)',
    },
    info: {
      background: 'var(--dz-info)',
      foreground: 'var(--dz-info-foreground)',
      muted: 'var(--dz-info-muted)',
    },
  },
} as const
