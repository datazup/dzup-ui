/**
 * DzTagsInput -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Free-text token input. The wrapping field reuses the shared `--dz-input-*`
 * family so it sits flush with other form controls; committed tokens are
 * rendered with DzChip and therefore inherit the `--dz-chip-*` / tone families.
 */
export const tagsInputTokens = {
  /** Field container (input-like shell) */
  background: 'var(--dz-background)',
  foreground: 'var(--dz-foreground)',
  border: 'var(--dz-border)',
  radius: 'var(--dz-radius-md)',
  transition: 'var(--dz-transition-fast)',
  focusRingColor: 'var(--dz-input-focus-ring-color)',
  borderFocus: 'var(--dz-input-border-focus)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Placeholder text */
  placeholder: 'var(--dz-muted-foreground)',
  /** Invalid + rejected-token flash */
  invalidBorder: 'var(--dz-danger)',
  flashBorder: 'var(--dz-danger)',
  /** Disabled state */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Size scale (field min-heights, shared with inputs) */
  size: {
    xs: {
      height: 'var(--dz-input-xs-height)',
      paddingX: 'var(--dz-input-xs-padding-x)',
      fontSize: 'var(--dz-input-xs-font-size)',
    },
    sm: {
      height: 'var(--dz-input-sm-height)',
      paddingX: 'var(--dz-input-sm-padding-x)',
      fontSize: 'var(--dz-input-sm-font-size)',
    },
    md: {
      height: 'var(--dz-input-md-height)',
      paddingX: 'var(--dz-input-md-padding-x)',
      fontSize: 'var(--dz-input-md-font-size)',
    },
    lg: {
      height: 'var(--dz-input-lg-height)',
      paddingX: 'var(--dz-input-lg-padding-x)',
      fontSize: 'var(--dz-input-lg-font-size)',
    },
    xl: {
      height: 'var(--dz-input-xl-height)',
      paddingX: 'var(--dz-input-xl-padding-x)',
      fontSize: 'var(--dz-input-xl-font-size)',
    },
  },
} as const
