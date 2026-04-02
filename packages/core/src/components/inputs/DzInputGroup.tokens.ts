/**
 * DzInputGroup -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Groups an input element with prefix/suffix addon content.
 * Addon styling uses muted surface tokens.
 */
export const inputGroupTokens = {
  /** Addon background color */
  addonBackground: 'var(--dz-muted)',
  /** Addon text color */
  addonForeground: 'var(--dz-muted-foreground)',
  /** Addon border color (matches input border) */
  addonBorder: 'var(--dz-input-border)',
  /** Addon default padding */
  addonPaddingX: 'var(--dz-spacing-3)',
  /** Addon default font size */
  addonFontSize: 'var(--dz-text-sm)',
  /** Radius for prefix/suffix rounding (matches input radius) */
  radius: 'var(--dz-input-radius)',
  /** Size scale -- addon padding and font-size per size */
  size: {
    xs: { addonPaddingX: 'var(--dz-spacing-1_5)', addonFontSize: 'var(--dz-text-xs)' },
    sm: { addonPaddingX: 'var(--dz-spacing-2)', addonFontSize: 'var(--dz-text-xs)' },
    md: { addonPaddingX: 'var(--dz-spacing-3)', addonFontSize: 'var(--dz-text-sm)' },
    lg: { addonPaddingX: 'var(--dz-spacing-4)', addonFontSize: 'var(--dz-text-base)' },
    xl: { addonPaddingX: 'var(--dz-spacing-4)', addonFontSize: 'var(--dz-text-lg)' },
  },
} as const
