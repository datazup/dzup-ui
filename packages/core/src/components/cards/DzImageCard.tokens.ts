/**
 * DzImageCard — Component-specific token mappings.
 *
 * Documents which design tokens are consumed by DzImageCard's slot-based
 * variant definitions (root, imageWrapper, body, header, footer).
 */

/** Token references used by DzImageCard */
export const imageCardTokens = {
  /** Root container */
  root: {
    radius: 'var(--dz-card-radius)',
    foreground: 'var(--dz-card-foreground)',
    background: 'var(--dz-card)',
  },

  /** Shadow per variant */
  shadow: {
    elevated: 'var(--dz-shadow-md)',
  },

  /** Border for outlined variant */
  border: {
    color: 'var(--dz-card-border-color)',
  },

  /** Body content area padding */
  body: {
    padding: 'var(--dz-card-padding)',
  },

  /** Header slot spacing */
  header: {
    paddingX: 'var(--dz-card-padding)',
    paddingTop: 'var(--dz-card-padding)',
    paddingBottom: 'var(--dz-spacing-2)',
  },

  /** Footer slot spacing */
  footer: {
    paddingX: 'var(--dz-card-padding)',
    paddingTop: 'var(--dz-spacing-2)',
    paddingBottom: 'var(--dz-card-padding)',
  },
} as const
