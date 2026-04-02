/**
 * DzTextarea -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Shares many input-tier tokens with DzInput but adds
 * textarea-specific properties (min-height, resize, padding-y).
 */
export const textareaTokens = {
  /** Background for the outline variant */
  background: 'var(--dz-input-bg)',
  /** Foreground text color */
  foreground: 'var(--dz-foreground)',
  /** Border color */
  border: 'var(--dz-input-border)',
  /** Border color when focused */
  borderFocus: 'var(--dz-input-border-focus)',
  /** Placeholder text color */
  placeholder: 'var(--dz-input-placeholder)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Font family */
  fontFamily: 'var(--dz-input-font-family)',
  /** Transition for border/ring changes */
  transition: 'var(--dz-input-transition)',
  /** Focus ring width */
  focusRingWidth: 'var(--dz-input-focus-ring-width)',
  /** Focus ring color */
  focusRingColor: 'var(--dz-input-focus-ring-color)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Error text color */
  errorColor: 'var(--dz-danger)',
  /** Error text size */
  errorFontSize: 'var(--dz-text-xs)',
  /** Error message top spacing */
  errorGap: 'var(--dz-spacing-1)',
  /** Invalid border color */
  invalidBorder: 'var(--dz-danger)',
  /** Size scale */
  size: {
    xs: {
      paddingX: 'var(--dz-spacing-2)',
      paddingY: 'var(--dz-spacing-1)',
      fontSize: 'var(--dz-text-xs)',
      radius: 'var(--dz-radius-sm)',
    },
    sm: {
      paddingX: 'var(--dz-input-sm-padding-x)',
      paddingY: 'var(--dz-spacing-1_5)',
      fontSize: 'var(--dz-input-sm-font-size)',
      radius: 'var(--dz-radius-sm)',
    },
    md: {
      paddingX: 'var(--dz-input-md-padding-x)',
      paddingY: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-input-md-font-size)',
      radius: 'var(--dz-input-radius)',
    },
    lg: {
      paddingX: 'var(--dz-input-lg-padding-x)',
      paddingY: 'var(--dz-spacing-2_5)',
      fontSize: 'var(--dz-input-lg-font-size)',
      radius: 'var(--dz-input-radius)',
    },
    xl: {
      paddingX: 'var(--dz-spacing-4)',
      paddingY: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-lg)',
      radius: 'var(--dz-radius-lg)',
    },
  },
} as const
