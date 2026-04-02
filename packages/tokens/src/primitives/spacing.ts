/**
 * Spacing Scale
 *
 * Based on a 4px base unit (0.25rem).
 * Scale: 0, 0.5, 1, 1.5, 2 ... up to 96.
 */

/** Spacing scale steps and their rem values */
export const SPACING_SCALE = {
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const

export type SpacingStep = keyof typeof SPACING_SCALE

/**
 * Generate CSS custom properties for spacing.
 * Output format: --dz-spacing-{step}: value;
 * Note: dots in step names are replaced with underscores for valid CSS custom property names.
 */
export function generateSpacingCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [step, value] of Object.entries(SPACING_SCALE)) {
    const cssName = step.replace('.', '_')
    vars[`--dz-spacing-${cssName}`] = value
  }
  return vars
}
