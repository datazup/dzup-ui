/**
 * DzSelect -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI Select with trigger, dropdown content, and item styling.
 */
export const selectTokens = {
  /** Trigger background */
  triggerBackground: 'var(--dz-background)',
  /** Trigger foreground text color */
  triggerForeground: 'var(--dz-foreground)',
  /** Trigger border color */
  triggerBorder: 'var(--dz-border)',
  /** Trigger border radius */
  triggerRadius: 'var(--dz-radius-md)',
  /** Trigger transition */
  transition: 'var(--dz-transition-fast)',
  /** Trigger focus ring color */
  focusRingColor: 'var(--dz-input-focus-ring-color)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Placeholder text color */
  placeholder: 'var(--dz-muted-foreground)',
  /** Filled variant background */
  filledBackground: 'var(--dz-muted)',
  /** Invalid border color */
  invalidBorder: 'var(--dz-danger)',
  /** Invalid focus ring color */
  invalidFocusRing: 'var(--dz-danger)',
  /** Dropdown content */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    shadow: 'var(--dz-shadow-md)',
    padding: 'var(--dz-spacing-1)',
  },
  /** Item styling */
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
  /** Empty state text */
  emptyColor: 'var(--dz-muted-foreground)',
  emptyFontSize: 'var(--dz-text-sm)',
  /** Size scale */
  size: {
    xs: {
      triggerHeight: 'var(--dz-input-xs-height)',
      triggerPaddingX: 'var(--dz-input-xs-padding-x)',
      triggerFontSize: 'var(--dz-input-xs-font-size)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1)',
      itemFontSize: 'var(--dz-text-xs)',
    },
    sm: {
      triggerHeight: 'var(--dz-input-sm-height)',
      triggerPaddingX: 'var(--dz-input-sm-padding-x)',
      triggerFontSize: 'var(--dz-input-sm-font-size)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
    },
    md: {
      triggerHeight: 'var(--dz-input-md-height)',
      triggerPaddingX: 'var(--dz-input-md-padding-x)',
      triggerFontSize: 'var(--dz-input-md-font-size)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
    },
    lg: {
      triggerHeight: 'var(--dz-input-lg-height)',
      triggerPaddingX: 'var(--dz-input-lg-padding-x)',
      triggerFontSize: 'var(--dz-input-lg-font-size)',
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2)',
      itemFontSize: 'var(--dz-text-base)',
    },
    xl: {
      triggerHeight: 'var(--dz-input-xl-height)',
      triggerPaddingX: 'var(--dz-input-xl-padding-x)',
      triggerFontSize: 'var(--dz-input-xl-font-size)',
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2)',
      itemFontSize: 'var(--dz-text-lg)',
    },
  },
} as const
