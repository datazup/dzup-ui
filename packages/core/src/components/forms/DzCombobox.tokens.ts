/**
 * DzCombobox -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI Combobox with search input, dropdown content,
 * item list, and clear button.
 */
export const comboboxTokens = {
  /** Root container */
  background: 'var(--dz-background)',
  foreground: 'var(--dz-foreground)',
  border: 'var(--dz-border)',
  radius: 'var(--dz-radius-md)',
  transition: 'var(--dz-transition-fast)',
  focusRingColor: 'var(--dz-input-focus-ring-color)',
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Invalid state */
  invalidBorder: 'var(--dz-danger)',
  invalidFocusRing: 'var(--dz-danger)',
  /** Search input placeholder */
  placeholder: 'var(--dz-muted-foreground)',
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
  /** Clear button */
  clearButton: {
    color: 'var(--dz-muted-foreground)',
    hoverColor: 'var(--dz-foreground)',
    radius: 'var(--dz-radius-sm)',
  },
  /** Empty state */
  emptyColor: 'var(--dz-muted-foreground)',
  /** Size scale */
  size: {
    xs: {
      height: 'var(--dz-input-xs-height)',
      paddingX: 'var(--dz-input-xs-padding-x)',
      fontSize: 'var(--dz-input-xs-font-size)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1)',
      itemFontSize: 'var(--dz-text-xs)',
    },
    sm: {
      height: 'var(--dz-input-sm-height)',
      paddingX: 'var(--dz-input-sm-padding-x)',
      fontSize: 'var(--dz-input-sm-font-size)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
    },
    md: {
      height: 'var(--dz-input-md-height)',
      paddingX: 'var(--dz-input-md-padding-x)',
      fontSize: 'var(--dz-input-md-font-size)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
    },
    lg: {
      height: 'var(--dz-input-lg-height)',
      paddingX: 'var(--dz-input-lg-padding-x)',
      fontSize: 'var(--dz-input-lg-font-size)',
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2)',
      itemFontSize: 'var(--dz-text-base)',
    },
    xl: {
      height: 'var(--dz-input-xl-height)',
      paddingX: 'var(--dz-input-xl-padding-x)',
      fontSize: 'var(--dz-input-xl-font-size)',
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2)',
      itemFontSize: 'var(--dz-text-lg)',
    },
  },
} as const
