/**
 * Shadow / Elevation Scale
 *
 * All shadows use OKLCH black for consistency.
 */

export const SHADOW_SCALE = {
  'none': 'none',
  'xs': '0 1px 2px oklch(0 0 0 / 0.06)',
  'sm': '0 1px 3px oklch(0 0 0 / 0.10), 0 1px 2px oklch(0 0 0 / 0.06)',
  'md': '0 4px 8px oklch(0 0 0 / 0.10), 0 2px 4px oklch(0 0 0 / 0.07)',
  'lg': '0 12px 20px oklch(0 0 0 / 0.12), 0 4px 8px oklch(0 0 0 / 0.08)',
  'xl': '0 24px 32px oklch(0 0 0 / 0.16), 0 8px 12px oklch(0 0 0 / 0.10)',
  '2xl': '0 32px 64px oklch(0 0 0 / 0.22), 0 12px 24px oklch(0 0 0 / 0.12)',
  'inner': 'inset 0 2px 4px oklch(0 0 0 / 0.07)',
} as const

/** Dark mode shadows with increased opacity */
export const SHADOW_SCALE_DARK = {
  'none': 'none',
  'xs': '0 1px 2px oklch(0 0 0 / 0.20)',
  'sm': '0 1px 3px oklch(0 0 0 / 0.30), 0 1px 2px oklch(0 0 0 / 0.20)',
  'md': '0 4px 8px oklch(0 0 0 / 0.35), 0 2px 4px oklch(0 0 0 / 0.22)',
  'lg': '0 12px 20px oklch(0 0 0 / 0.45), 0 4px 8px oklch(0 0 0 / 0.28)',
  'xl': '0 24px 32px oklch(0 0 0 / 0.55), 0 8px 12px oklch(0 0 0 / 0.30)',
  '2xl': '0 32px 64px oklch(0 0 0 / 0.60), 0 12px 24px oklch(0 0 0 / 0.35)',
  'inner': 'inset 0 2px 4px oklch(0 0 0 / 0.25)',
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
