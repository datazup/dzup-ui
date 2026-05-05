/**
 * DzTimePicker -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI TimeFieldRoot with hour/minute segment inputs,
 * separator, and clock icon.
 */
export const timePickerTokens = {
  /** Root container */
  background: 'var(--dz-background)',
  foreground: 'var(--dz-foreground)',
  border: 'var(--dz-border)',
  radius: 'var(--dz-radius-md)',
  transition: 'var(--dz-transition-fast)',
  focusRingColor: 'var(--dz-input-focus-ring-color)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Invalid state */
  invalidBorder: 'var(--dz-danger)',
  invalidFocusRing: 'var(--dz-danger)',
  /** Disabled state */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Segment input */
  input: {
    foreground: 'var(--dz-foreground)',
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-0_5)',
    focusBackground: 'var(--dz-primary-muted)',
    placeholder: 'var(--dz-muted-foreground)',
  },
  /** Colon separator */
  separatorColor: 'var(--dz-muted-foreground)',
  /** Clock icon */
  iconColor: 'var(--dz-muted-foreground)',
  /** Size scale */
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
