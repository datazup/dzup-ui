/**
 * Shadow / Elevation Scale
 *
 * All shadows use OKLCH black for consistency.
 */

export const SHADOW_SCALE = {
  'none': 'none',
  'xs': '0 1px 2px oklch(0 0 0 / 0.04)',
  'sm': '0 1px 3px oklch(0 0 0 / 0.06), 0 1px 2px oklch(0 0 0 / 0.04)',
  'md': '0 4px 6px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04)',
  'lg': '0 10px 15px oklch(0 0 0 / 0.08), 0 4px 6px oklch(0 0 0 / 0.04)',
  'xl': '0 20px 25px oklch(0 0 0 / 0.1), 0 8px 10px oklch(0 0 0 / 0.04)',
  '2xl': '0 25px 50px oklch(0 0 0 / 0.15)',
  'inner': 'inset 0 2px 4px oklch(0 0 0 / 0.05)',
} as const

/** Dark mode shadows with increased opacity */
export const SHADOW_SCALE_DARK = {
  'none': 'none',
  'xs': '0 1px 2px oklch(0 0 0 / 0.1)',
  'sm': '0 1px 3px oklch(0 0 0 / 0.15), 0 1px 2px oklch(0 0 0 / 0.1)',
  'md': '0 4px 6px oklch(0 0 0 / 0.15), 0 2px 4px oklch(0 0 0 / 0.1)',
  'lg': '0 10px 15px oklch(0 0 0 / 0.2), 0 4px 6px oklch(0 0 0 / 0.1)',
  'xl': '0 20px 25px oklch(0 0 0 / 0.25), 0 8px 10px oklch(0 0 0 / 0.1)',
  '2xl': '0 25px 50px oklch(0 0 0 / 0.35)',
  'inner': 'inset 0 2px 4px oklch(0 0 0 / 0.15)',
} as const

export type ShadowStep = keyof typeof SHADOW_SCALE

/**
 * Generate CSS custom properties for shadows (light mode).
 * Output format: --dz-shadow-{step}: value;
 */
export function generateShadowCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [step, value] of Object.entries(SHADOW_SCALE)) {
    vars[`--dz-shadow-${step}`] = value
  }
  return vars
}

/**
 * Generate CSS custom properties for shadows (dark mode overrides).
 */
export function generateShadowDarkCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [step, value] of Object.entries(SHADOW_SCALE_DARK)) {
    vars[`--dz-shadow-${step}`] = value
  }
  return vars
}
