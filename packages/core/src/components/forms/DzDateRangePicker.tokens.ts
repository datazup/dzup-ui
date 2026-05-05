/**
 * DzDateRangePicker -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Extends DzDatePicker token pattern with range-specific
 * additions (separator, highlighted range cells).
 */
export const dateRangePickerTokens = {
  /** Trigger field */
  trigger: {
    background: 'var(--dz-background)',
    foreground: 'var(--dz-foreground)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-input-focus-ring-color)',
    disabledOpacity: 'var(--dz-input-disabled-opacity)',
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
    /** Background for days within the selected range (not endpoints) */
    highlightedBackground: 'var(--dz-primary-muted)',
    outsideMonthColor: 'var(--dz-muted-foreground)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-control-focus-ring-color)',
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
  /** Range separator between start and end fields */
  separator: {
    color: 'var(--dz-muted-foreground)',
    marginX: 'var(--dz-spacing-2)',
  },
  /** Calendar icon */
  iconColor: 'var(--dz-muted-foreground)',
  /** Size scale */
  size: {
    xs: {
      triggerHeight: 'var(--dz-input-xs-height)',
      triggerPaddingX: 'var(--dz-input-xs-padding-x)',
      triggerFontSize: 'var(--dz-input-xs-font-size)',
      cellSize: '1.5rem',
    },
    sm: {
      triggerHeight: 'var(--dz-input-sm-height)',
      triggerPaddingX: 'var(--dz-input-sm-padding-x)',
      triggerFontSize: 'var(--dz-input-sm-font-size)',
      cellSize: '1.75rem',
    },
    md: {
      triggerHeight: 'var(--dz-input-md-height)',
      triggerPaddingX: 'var(--dz-input-md-padding-x)',
      triggerFontSize: 'var(--dz-input-md-font-size)',
      cellSize: '2rem',
    },
    lg: {
      triggerHeight: 'var(--dz-input-lg-height)',
      triggerPaddingX: 'var(--dz-input-lg-padding-x)',
      triggerFontSize: 'var(--dz-input-lg-font-size)',
      cellSize: '2.25rem',
    },
    xl: {
      triggerHeight: 'var(--dz-input-xl-height)',
      triggerPaddingX: 'var(--dz-input-xl-padding-x)',
      triggerFontSize: 'var(--dz-input-xl-font-size)',
      cellSize: '2.5rem',
    },
  },
} as const
