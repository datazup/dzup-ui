/**
 * DzCheckbox -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI CheckboxRoot + CheckboxIndicator with
 * indicator box, label, and check/minus icon styling.
 */
export const checkboxTokens = {
  /** Root label gap between indicator and text */
  gap: 'var(--dz-spacing-2)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
  /** Indicator box */
  indicator: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    radius: 'var(--dz-radius-sm)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-primary)',
    focusRingWidth: '2px',
    focusRingOffset: '2px',
  },
  /** Checked/indeterminate state */
  checked: {
    background: 'var(--dz-primary)',
    border: 'var(--dz-primary)',
    foreground: 'var(--dz-primary-foreground)',
  },
  /** Label text */
  label: {
    foreground: 'var(--dz-foreground)',
  },
  /** Size scale -- indicator dimensions and label font-size */
  size: {
    xs: { indicatorSize: '0.875rem', labelFontSize: 'var(--dz-text-xs)' },
    sm: { indicatorSize: '1rem', labelFontSize: 'var(--dz-text-sm)' },
    md: { indicatorSize: '1.125rem', labelFontSize: 'var(--dz-text-sm)' },
    lg: { indicatorSize: '1.25rem', labelFontSize: 'var(--dz-text-base)' },
    xl: { indicatorSize: '1.5rem', labelFontSize: 'var(--dz-text-lg)' },
  },
} as const
