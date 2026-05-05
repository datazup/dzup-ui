/**
 * DzOtpInput -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * Wraps Reka UI PinInput with individual cell styling.
 * Each cell is an independent bordered box.
 */
export const otpInputTokens = {
  /** Root gap between cells */
  gap: 'var(--dz-spacing-2)',
  /** Cell background */
  cellBackground: 'var(--dz-background)',
  /** Cell border color */
  cellBorder: 'var(--dz-border)',
  /** Cell border radius */
  cellRadius: 'var(--dz-radius-md)',
  /** Cell foreground text color */
  cellForeground: 'var(--dz-foreground)',
  /** Cell shadow */
  cellShadow: 'var(--dz-shadow-sm)',
  /** Transition for focus state */
  transition: 'var(--dz-transition-fast)',
  /** Cell placeholder text color */
  placeholder: 'var(--dz-muted-foreground)',
  /** Focus state */
  focus: {
    borderColor: 'var(--dz-input-border-focus)',
    ringColor: 'var(--dz-input-focus-ring-color)',
    ringWidth: 'var(--dz-input-focus-ring-width)',
    ringOffset: 'var(--dz-input-focus-ring-offset)',
  },
  /** Invalid state */
  invalid: {
    borderColor: 'var(--dz-danger)',
    focusRingColor: 'var(--dz-danger)',
  },
  /** Disabled state */
  disabled: {
    opacity: 'var(--dz-input-disabled-opacity)',
  },
  /** Error display */
  errorColor: 'var(--dz-danger)',
  errorFontSize: 'var(--dz-text-xs)',
  errorGap: 'var(--dz-spacing-1)',
  /** Size scale -- cell dimensions and font size per size */
  size: {
    xs: { cellSize: '1.75rem', fontSize: 'var(--dz-text-xs)' },
    sm: { cellSize: '2rem', fontSize: 'var(--dz-text-sm)' },
    md: { cellSize: '2.5rem', fontSize: 'var(--dz-text-base)' },
    lg: { cellSize: '3rem', fontSize: 'var(--dz-text-lg)' },
    xl: { cellSize: '3.5rem', fontSize: 'var(--dz-text-xl)' },
  },
} as const
