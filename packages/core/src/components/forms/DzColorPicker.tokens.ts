/**
 * DzColorPicker -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Built from scratch with trigger button, popover panel,
 * color area, hex input, and preset swatch grid.
 */
export const colorPickerTokens = {
  /** Root gap between trigger and error */
  gap: 'var(--dz-spacing-1)',
  /** Trigger button */
  trigger: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    hoverBorder: 'var(--dz-primary)',
    focusRingColor: 'var(--dz-input-focus-ring-color)',
    invalidBorder: 'var(--dz-danger)',
  },
  /** Color swatch preview */
  swatch: {
    radius: 'var(--dz-radius-sm)',
    border: 'var(--dz-border)',
  },
  /** Hex value text */
  valueText: {
    foreground: 'var(--dz-foreground)',
  },
  /** Popover panel */
  panel: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-lg)',
    shadow: 'var(--dz-shadow-lg)',
    padding: 'var(--dz-spacing-3)',
    gap: 'var(--dz-spacing-3)',
  },
  /** Color area */
  colorArea: {
    radius: 'var(--dz-radius-md)',
  },
  /** Preset swatch grid */
  preset: {
    gap: 'var(--dz-spacing-1)',
    swatchRadius: 'var(--dz-radius-sm)',
    swatchBorder: 'var(--dz-border)',
    swatchFocusRing: 'var(--dz-control-focus-ring-color)',
  },
  /** Hex text input */
  input: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    foreground: 'var(--dz-foreground)',
    fontSize: 'var(--dz-text-sm)',
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-1)',
    focusBorder: 'var(--dz-input-border-focus)',
  },
  /** Disabled state */
  disabledOpacity: 'var(--dz-input-disabled-opacity)',
  /** Error display */
  errorColor: 'var(--dz-danger)',
  errorFontSize: 'var(--dz-text-xs)',
  /** Size scale */
  size: {
    xs: {
      triggerHeight: 'var(--dz-input-xs-height)',
      triggerPaddingX: 'var(--dz-input-xs-padding-x)',
      triggerFontSize: 'var(--dz-input-xs-font-size)',
      swatchSize: '1rem',
      presetSwatchSize: '1rem',
    },
    sm: {
      triggerHeight: 'var(--dz-input-sm-height)',
      triggerPaddingX: 'var(--dz-input-sm-padding-x)',
      triggerFontSize: 'var(--dz-input-sm-font-size)',
      swatchSize: '1.25rem',
      presetSwatchSize: '1.25rem',
    },
    md: {
      triggerHeight: 'var(--dz-input-md-height)',
      triggerPaddingX: 'var(--dz-input-md-padding-x)',
      triggerFontSize: 'var(--dz-input-md-font-size)',
      swatchSize: '1.5rem',
      presetSwatchSize: '1.5rem',
    },
    lg: {
      triggerHeight: 'var(--dz-input-lg-height)',
      triggerPaddingX: 'var(--dz-input-lg-padding-x)',
      triggerFontSize: 'var(--dz-input-lg-font-size)',
      swatchSize: '1.75rem',
      presetSwatchSize: '1.75rem',
    },
    xl: {
      triggerHeight: 'var(--dz-input-xl-height)',
      triggerPaddingX: 'var(--dz-input-xl-padding-x)',
      triggerFontSize: 'var(--dz-input-xl-font-size)',
      swatchSize: '2rem',
      presetSwatchSize: '2rem',
    },
  },
} as const
