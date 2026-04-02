/**
 * Border Radius Scale
 */

export const RADIUS_SCALE = {
  'none': '0',
  'sm': '0.25rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  'full': '9999px',
} as const

export type RadiusStep = keyof typeof RADIUS_SCALE

/**
 * Generate CSS custom properties for border radius.
 * Output format: --dz-radius-{step}: value;
 */
export function generateRadiusCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [step, value] of Object.entries(RADIUS_SCALE)) {
    vars[`--dz-radius-${step}`] = value
  }
  return vars
}
