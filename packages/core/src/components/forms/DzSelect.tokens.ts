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
  focusRingColor: 'var(--dz-primary)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
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
      triggerHeight: 'var(--dz-button-xs-height)',
      triggerPaddingX: 'var(--dz-spacing-2)',
      triggerFontSize: 'var(--dz-text-xs)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1)',
      itemFontSize: 'var(--dz-text-xs)',
    },
    sm: {
      triggerHeight: 'var(--dz-button-sm-height)',
      triggerPaddingX: 'var(--dz-spacing-3)',
      triggerFontSize: 'var(--dz-text-sm)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
    },
    md: {
      triggerHeight: 'var(--dz-button-md-height)',
      triggerPaddingX: 'var(--dz-spacing-3)',
      triggerFontSize: 'var(--dz-text-sm)',
      itemPaddingX: 'var(--dz-spacing-2)',
      itemPaddingY: 'var(--dz-spacing-1_5)',
      itemFontSize: 'var(--dz-text-sm)',
    },
    lg: {
      triggerHeight: 'var(--dz-button-lg-height)',
      triggerPaddingX: 'var(--dz-spacing-4)',
      triggerFontSize: 'var(--dz-text-base)',
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2)',
      itemFontSize: 'var(--dz-text-base)',
    },
    xl: {
      triggerHeight: 'var(--dz-button-xl-height)',
      triggerPaddingX: 'var(--dz-spacing-4)',
      triggerFontSize: 'var(--dz-text-lg)',
      itemPaddingX: 'var(--dz-spacing-3)',
      itemPaddingY: 'var(--dz-spacing-2)',
      itemFontSize: 'var(--dz-text-lg)',
    },
  },
} as const
