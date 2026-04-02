/**
 * DzRadio -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI RadioGroupItem + RadioGroupIndicator with
 * circular indicator, inner dot, and label styling.
 */
export const radioTokens = {
  /** Root label gap between indicator and text */
  gap: 'var(--dz-spacing-2)',
  /** Disabled state opacity */
  disabledOpacity: 'var(--dz-button-disabled-opacity)',
  /** Indicator circle */
  indicator: {
    background: 'var(--dz-background)',
    border: 'var(--dz-border)',
    transition: 'var(--dz-transition-fast)',
    focusRingColor: 'var(--dz-primary)',
    focusRingWidth: '2px',
    focusRingOffset: '2px',
    checkedBorder: 'var(--dz-primary)',
  },
  /** Inner dot when checked */
  dot: {
    background: 'var(--dz-primary)',
  },
  /** Label text */
  label: {
    foreground: 'var(--dz-foreground)',
  },
  /** Size scale -- indicator dimensions, dot size, label font-size */
  size: {
    xs: { indicatorSize: '0.875rem', dotSize: '0.375rem', labelFontSize: 'var(--dz-text-xs)' },
    sm: { indicatorSize: '1rem', dotSize: '0.5rem', labelFontSize: 'var(--dz-text-sm)' },
    md: { indicatorSize: '1.125rem', dotSize: '0.625rem', labelFontSize: 'var(--dz-text-sm)' },
    lg: { indicatorSize: '1.25rem', dotSize: '0.75rem', labelFontSize: 'var(--dz-text-base)' },
    xl: { indicatorSize: '1.5rem', dotSize: '0.875rem', labelFontSize: 'var(--dz-text-lg)' },
  },
} as const
