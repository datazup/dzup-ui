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
    focusRingColor: 'var(--dz-primary)',
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
    swatchFocusRing: 'var(--dz-primary)',
  },
  /** Hex text input */
  input: {
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-md)',
    foreground: 'var(--dz-foreground)',
    fontSize: 'var(--dz-text-sm)',
    paddingX: 'var(--dz-spacing-2)',
    paddingY: 'var(--dz-spacing-1)',
    focusBorder: 'var(--dz-primary)',
  },
  /** Disabled state */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
  /** Error display */
  errorColor: 'var(--dz-danger)',
  errorFontSize: 'var(--dz-text-xs)',
  /** Size scale */
  size: {
    xs: {
      triggerHeight: '1.75rem',
      triggerPaddingX: 'var(--dz-spacing-1_5)',
      triggerFontSize: 'var(--dz-text-xs)',
      swatchSize: '1rem',
      presetSwatchSize: '1rem',
    },
    sm: {
      triggerHeight: '2rem',
      triggerPaddingX: 'var(--dz-spacing-2)',
      triggerFontSize: 'var(--dz-text-sm)',
      swatchSize: '1.25rem',
      presetSwatchSize: '1.25rem',
    },
    md: {
      triggerHeight: '2.5rem',
      triggerPaddingX: 'var(--dz-spacing-3)',
      triggerFontSize: 'var(--dz-text-sm)',
      swatchSize: '1.5rem',
      presetSwatchSize: '1.5rem',
    },
    lg: {
      triggerHeight: '3rem',
      triggerPaddingX: 'var(--dz-spacing-4)',
      triggerFontSize: 'var(--dz-text-base)',
      swatchSize: '1.75rem',
      presetSwatchSize: '1.75rem',
    },
    xl: {
      triggerHeight: '3.5rem',
      triggerPaddingX: 'var(--dz-spacing-5)',
      triggerFontSize: 'var(--dz-text-lg)',
      swatchSize: '2rem',
      presetSwatchSize: '2rem',
    },
  },
} as const
