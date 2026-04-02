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
  focusRingColor: 'var(--dz-primary)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Invalid state */
  invalidBorder: 'var(--dz-danger)',
  invalidFocusRing: 'var(--dz-danger)',
  /** Disabled state */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
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
      height: 'var(--dz-button-xs-height)',
      paddingX: 'var(--dz-spacing-2)',
      fontSize: 'var(--dz-text-xs)',
    },
    sm: {
      height: 'var(--dz-button-sm-height)',
      paddingX: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-sm)',
    },
    md: {
      height: 'var(--dz-button-md-height)',
      paddingX: 'var(--dz-spacing-3)',
      fontSize: 'var(--dz-text-sm)',
    },
    lg: {
      height: 'var(--dz-button-lg-height)',
      paddingX: 'var(--dz-spacing-4)',
      fontSize: 'var(--dz-text-base)',
    },
    xl: {
      height: 'var(--dz-button-xl-height)',
      paddingX: 'var(--dz-spacing-4)',
      fontSize: 'var(--dz-text-lg)',
    },
  },
} as const
