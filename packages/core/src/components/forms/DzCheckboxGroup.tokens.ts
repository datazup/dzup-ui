/**
 * DzCheckboxGroup -- Component-specific token mappings.
 * Maps semantic design tokens to component styling (ADR-04).
 *
 * DzCheckboxGroup is a layout wrapper that arranges DzCheckbox children.
 * It has minimal unique styling beyond orientation-dependent gaps.
 */
export const checkboxGroupTokens = {
  /** Gap between items when orientation is vertical */
  verticalGap: 'var(--dz-spacing-2)',
  /** Gap between items when orientation is horizontal */
  horizontalGap: 'var(--dz-spacing-4)',
} as const
