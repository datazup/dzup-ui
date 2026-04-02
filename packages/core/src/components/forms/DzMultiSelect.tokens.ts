/**
 * DzMultiSelect -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI Combobox in multiple mode with tag display
 * and searchable dropdown.
 */
export const multiSelectTokens = {
  /** Root container background */
  background: 'var(--dz-background)',
  /** Foreground text */
  foreground: 'var(--dz-foreground)',
  /** Root border */
  border: 'var(--dz-border)',
  /** Root border radius */
  radius: 'var(--dz-radius-md)',
  /** Transition */
  transition: 'var(--dz-transition-fast)',
  /** Focus ring */
  focusRingColor: 'var(--dz-primary)',
  /** Disabled opacity */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Invalid border */
  invalidBorder: 'var(--dz-danger)',
  /** Invalid focus ring */
  invalidFocusRing: 'var(--dz-danger)',
  /** Search input placeholder */
  placeholder: 'var(--dz-muted-foreground)',
  /** Selected tag styling */
  tag: {
    background: 'var(--dz-primary-muted)',
    foreground: 'var(--dz-primary)',
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-1_5)',
    gap: 'var(--dz-spacing-1)',
    closeHoverBackground: 'var(--dz-primary)',
  },
  /** Dropdown content */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    shadow: 'var(--dz-shadow-md)',
    padding: 'var(--dz-spacing-1)',
  },
  /** Dropdown item */
  item: {
    foreground: 'var(--dz-foreground)',
    radius: 'var(--dz-radius-sm)',
    highlightBackground: 'var(--dz-muted)',
    checkedBackground: 'var(--dz-primary-muted)',
    checkedForeground: 'var(--dz-primary)',
  },
  /** Icon colors */
  iconColor: 'var(--dz-muted-foreground)',
  checkIconColor: 'var(--dz-primary)',
  /** Empty state */
  emptyColor: 'var(--dz-muted-foreground)',
  /** Size scale */
  size: {
    xs: {
      minHeight: 'var(--dz-button-xs-height)',
      rootPaddingX: 'var(--dz-spacing-2)',
      rootPaddingY: 'var(--dz-spacing-0_5)',
      fontSize: 'var(--dz-text-xs)',
      tagFontSize: 'var(--dz-text-xs)',
    },
    sm: {
      minHeight: 'var(--dz-button-sm-height)',
      rootPaddingX: 'var(--dz-spacing-3)',
      rootPaddingY: 'var(--dz-spacing-0_5)',
      fontSize: 'var(--dz-text-sm)',
      tagFontSize: 'var(--dz-text-xs)',
    },
    md: {
      minHeight: 'var(--dz-button-md-height)',
      rootPaddingX: 'var(--dz-spacing-3)',
      rootPaddingY: 'var(--dz-spacing-1)',
      fontSize: 'var(--dz-text-sm)',
      tagFontSize: 'var(--dz-text-xs)',
    },
    lg: {
      minHeight: 'var(--dz-button-lg-height)',
      rootPaddingX: 'var(--dz-spacing-4)',
      rootPaddingY: 'var(--dz-spacing-1)',
      fontSize: 'var(--dz-text-base)',
      tagFontSize: 'var(--dz-text-sm)',
    },
    xl: {
      minHeight: 'var(--dz-button-xl-height)',
      rootPaddingX: 'var(--dz-spacing-4)',
      rootPaddingY: 'var(--dz-spacing-1_5)',
      fontSize: 'var(--dz-text-lg)',
      tagFontSize: 'var(--dz-text-sm)',
    },
  },
} as const
