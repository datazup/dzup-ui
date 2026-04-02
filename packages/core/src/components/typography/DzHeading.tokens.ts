/**
 * DzHeading — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzHeading variants.
 * This file serves as the contract between the token system and the component.
 */

/** Token references used by DzHeading */
export const headingTokens = {
  /** Text color */
  color: '--dz-foreground',
  /** Font family */
  fontFamily: '--dz-font-sans',

  /** Font sizes per visual size variant */
  fontSize: {
    'xs': '--dz-text-sm',
    'sm': '--dz-text-base',
    'md': '--dz-text-lg',
    'lg': '--dz-text-xl',
    'xl': '--dz-text-2xl',
    '2xl': '--dz-text-3xl',
    '3xl': '--dz-text-4xl',
    '4xl': '--dz-text-5xl',
  },

  /** Font weight values */
  fontWeight: {
    light: '--dz-font-light',
    normal: '--dz-font-normal',
    medium: '--dz-font-medium',
    semibold: '--dz-font-semibold',
    bold: '--dz-font-bold',
  },

  /** Letter spacing */
  tracking: {
    tight: '--dz-tracking-tight',
    tighter: '--dz-tracking-tighter',
  },

  /** Line height */
  leading: {
    none: '--dz-leading-none',
    tight: '--dz-leading-tight',
    snug: '--dz-leading-snug',
  },
} as const
