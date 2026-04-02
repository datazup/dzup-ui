/**
 * DzInput -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Tokens referenced by DzInput.variants.ts and DzInput.vue.
 */
export const inputTokens = {
  /** Background for the outline variant */
  background: 'var(--dz-input-bg)',
  /** Foreground text color */
  foreground: 'var(--dz-foreground)',
  /** Border color (default state) */
  border: 'var(--dz-input-border)',
  /** Border color when focused */
  borderFocus: 'var(--dz-input-border-focus)',
  /** Placeholder text color */
  placeholder: 'var(--dz-input-placeholder)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Default border radius */
  radius: 'var(--dz-input-radius)',
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
  /** Addon/icon color */
  addonColor: 'var(--dz-colors-neutral-400)',
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
      height: '1.75rem',
      paddingX: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-xs)',
      gap: 'var(--dz-spacing-1)',
      radius: 'var(--dz-radius-sm)',
    },
    sm: {
      height: 'var(--dz-input-sm-height)',
      paddingX: 'var(--dz-input-sm-padding-x)',
      fontSize: 'var(--dz-input-sm-font-size)',
      gap: 'var(--dz-spacing-1_5)',
      radius: 'var(--dz-radius-sm)',
    },
    md: {
      height: 'var(--dz-input-md-height)',
      paddingX: 'var(--dz-input-md-padding-x)',
      fontSize: 'var(--dz-input-md-font-size)',
      gap: 'var(--dz-spacing-2)',
      radius: 'var(--dz-input-radius)',
    },
    lg: {
      height: 'var(--dz-input-lg-height)',
      paddingX: 'var(--dz-input-lg-padding-x)',
      fontSize: 'var(--dz-input-lg-font-size)',
      gap: 'var(--dz-spacing-2)',
      radius: 'var(--dz-input-radius)',
    },
    xl: {
      height: 'var(--dz-spacing-12)',
      paddingX: 'var(--dz-spacing-4)',
      fontSize: 'var(--dz-text-lg)',
      gap: 'var(--dz-spacing-2_5)',
      radius: 'var(--dz-radius-lg)',
    },
  },
} as const
