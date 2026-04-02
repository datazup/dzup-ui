/**
 * DzRadioGroup -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * DzRadioGroup is a layout wrapper that arranges DzRadio children.
 * It has minimal unique styling beyond orientation-dependent gaps.
 */
export const radioGroupTokens = {
  /** Gap between items when orientation is vertical */
  verticalGap: 'var(--dz-spacing-2)',
  /** Gap between items when orientation is horizontal */
  horizontalGap: 'var(--dz-spacing-4)',
} as const
