/**
 * DzText — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzText variants.
 * This file serves as the contract between the token system and the component.
 */

/** Token references used by DzText */
export const textTokens = {
  /** Font family */
  fontFamily: '--dz-font-sans',

  /** Font sizes per size variant */
  fontSize: {
    xs: '--dz-text-xs',
    sm: '--dz-text-sm',
    md: '--dz-text-base',
    lg: '--dz-text-lg',
    xl: '--dz-text-xl',
  },

  /** Font weight values */
  fontWeight: {
    light: '--dz-font-light',
    normal: '--dz-font-normal',
    medium: '--dz-font-medium',
    semibold: '--dz-font-semibold',
    bold: '--dz-font-bold',
  },

  /** Colors per tone */
  tone: {
    default: '--dz-foreground',
    muted: '--dz-muted-foreground',
    success: '--dz-success',
    warning: '--dz-warning',
    danger: '--dz-danger',
  },

  /** Line height */
  leading: {
    normal: '--dz-leading-normal',
    relaxed: '--dz-leading-relaxed',
  },
} as const
