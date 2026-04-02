/**
 * DzCaption — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzCaption.
 * This file serves as the contract between the token system and the component.
 */

/** Token references used by DzCaption */
export const captionTokens = {
  /** Font size (always xs) */
  fontSize: 'var(--dz-text-xs)',
  /** Line height */
  leading: 'var(--dz-leading-normal)',

  /** Colors per tone variant */
  tone: {
    default: 'var(--dz-foreground)',
    muted: 'var(--dz-muted-foreground)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning)',
    danger: 'var(--dz-danger)',
  },
} as const
