/**
 * DzBlockquote — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzBlockquote.
 * This file serves as the contract between the token system and the component.
 */

/** Token references used by DzBlockquote */
export const blockquoteTokens = {
  /** Left accent border color */
  borderColor: 'var(--dz-border)',
  /** Left padding (inside the border) */
  paddingLeft: 'var(--dz-spacing-4)',
  /** Vertical padding */
  paddingY: 'var(--dz-spacing-2)',
  /** Quote text color */
  color: 'var(--dz-muted-foreground)',

  /** Footer (attribution) sub-part */
  footer: {
    marginTop: 'var(--dz-spacing-2)',
    fontSize: 'var(--dz-text-sm)',
    color: 'var(--dz-muted-foreground)',
  },
} as const
