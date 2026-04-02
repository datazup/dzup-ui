/**
 * DzPasswordInput -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Reuses DzInput wrapper/element variants and adds the
 * visibility toggle button token references.
 */
export const passwordInputTokens = {
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
  /** Default border radius */
  radius: 'var(--dz-input-radius)',
  /** Font family */
  fontFamily: 'var(--dz-input-font-family)',
  /** Transition */
  transition: 'var(--dz-input-transition)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Error color */
  errorColor: 'var(--dz-danger)',
  /** Error font size */
  errorFontSize: 'var(--dz-text-xs)',
  /** Error message top spacing */
  errorGap: 'var(--dz-spacing-1)',
  /** Invalid border color */
  invalidBorder: 'var(--dz-danger)',
  /** Addon/prefix color */
  addonColor: 'var(--dz-colors-neutral-400)',
  /** Visibility toggle button */
  toggle: {
    color: 'var(--dz-colors-neutral-400)',
    colorHover: 'var(--dz-foreground)',
  },
  /** Size scale (inherits from input tier) */
  size: {
    xs: {
      height: '1.75rem',
      paddingX: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-xs)',
      radius: 'var(--dz-radius-sm)',
    },
    sm: {
      height: 'var(--dz-input-sm-height)',
      paddingX: 'var(--dz-input-sm-padding-x)',
      fontSize: 'var(--dz-input-sm-font-size)',
      radius: 'var(--dz-radius-sm)',
    },
    md: {
      height: 'var(--dz-input-md-height)',
      paddingX: 'var(--dz-input-md-padding-x)',
      fontSize: 'var(--dz-input-md-font-size)',
      radius: 'var(--dz-input-radius)',
    },
    lg: {
      height: 'var(--dz-input-lg-height)',
      paddingX: 'var(--dz-input-lg-padding-x)',
      fontSize: 'var(--dz-input-lg-font-size)',
      radius: 'var(--dz-input-radius)',
    },
    xl: {
      height: 'var(--dz-spacing-12)',
      paddingX: 'var(--dz-spacing-4)',
      fontSize: 'var(--dz-text-lg)',
      radius: 'var(--dz-radius-lg)',
    },
  },
} as const
