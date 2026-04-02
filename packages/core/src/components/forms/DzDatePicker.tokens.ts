/**
 * DzDatePicker -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI DatePicker with trigger field, calendar content,
 * navigation buttons, and day-cell styling.
 */
export const datePickerTokens = {
  /** Trigger field */
  trigger: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-primary)',
    disabledOpacity: 'var(--dz-button-disabled-opacity)',
    placeholder: 'var(--dz-muted-foreground)',
    filledBackground: 'var(--dz-muted)',
    invalidBorder: 'var(--dz-danger)',
    invalidFocusRing: 'var(--dz-danger)',
  },
  /** Calendar dropdown content */
  content: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    shadow: 'var(--dz-shadow-md)',
    padding: 'var(--dz-spacing-3)',
  },
  /** Day cell trigger */
  cell: {
    foreground: 'var(--dz-foreground)',
    radius: 'var(--dz-radius-sm)',
    hoverBackground: 'var(--dz-muted)',
    selectedBackground: 'var(--dz-primary)',
    selectedForeground: 'var(--dz-primary-foreground)',
    outsideMonthColor: 'var(--dz-muted-foreground)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-primary)',
  },
  /** Calendar header and navigation */
  header: {
    headingForeground: 'var(--dz-foreground)',
    headCellColor: 'var(--dz-muted-foreground)',
    headCellFontSize: 'var(--dz-text-xs)',
    navButtonColor: 'var(--dz-muted-foreground)',
    navButtonHoverBackground: 'var(--dz-muted)',
    navButtonHoverForeground: 'var(--dz-foreground)',
    navButtonRadius: 'var(--dz-radius-sm)',
    spacing: 'var(--dz-spacing-2)',
  },
  /** Date field input segments */
  fieldInput: {
    radius: 'var(--dz-radius-sm)',
    paddingX: 'var(--dz-spacing-0_5)',
    focusBackground: 'var(--dz-primary-muted)',
    placeholder: 'var(--dz-muted-foreground)',
  },
  /** Calendar icon */
  iconColor: 'var(--dz-muted-foreground)',
  /** Size scale */
  size: {
    xs: {
      triggerHeight: 'var(--dz-button-xs-height)',
      triggerPaddingX: 'var(--dz-spacing-2)',
      triggerFontSize: 'var(--dz-text-xs)',
      cellSize: '1.5rem',
    },
    sm: {
      triggerHeight: 'var(--dz-button-sm-height)',
      triggerPaddingX: 'var(--dz-spacing-3)',
      triggerFontSize: 'var(--dz-text-sm)',
      cellSize: '1.75rem',
    },
    md: {
      triggerHeight: 'var(--dz-button-md-height)',
      triggerPaddingX: 'var(--dz-spacing-3)',
      triggerFontSize: 'var(--dz-text-sm)',
      cellSize: '2rem',
    },
    lg: {
      triggerHeight: 'var(--dz-button-lg-height)',
      triggerPaddingX: 'var(--dz-spacing-4)',
      triggerFontSize: 'var(--dz-text-base)',
      cellSize: '2.25rem',
    },
    xl: {
      triggerHeight: 'var(--dz-button-xl-height)',
      triggerPaddingX: 'var(--dz-spacing-4)',
      triggerFontSize: 'var(--dz-text-lg)',
      cellSize: '2.5rem',
    },
  },
} as const
