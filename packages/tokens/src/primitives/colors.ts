/**
 * OKLCH Color Palette Definitions
 *
 * All colors use OKLCH color space for perceptually uniform shades.
 * Each palette has 11 shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950.
 *
 * Format: oklch(Lightness Chroma Hue)
 * - Lightness: 0-1 (0 = black, 1 = white)
 * - Chroma: 0-0.4 (0 = gray, higher = more saturated)
 * - Hue: 0-360 (color wheel angle)
 */

/** Shade steps in the palette */
export const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type Shade = (typeof SHADE_STEPS)[number]

/** Lightness values for each shade step */
const LIGHTNESS_SCALE: Record<Shade, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.87,
  300: 0.78,
  400: 0.68,
  500: 0.55,
  600: 0.47,
  700: 0.39,
  800: 0.31,
  900: 0.23,
  950: 0.15,
}

/**
 * Chroma multipliers per shade step.
 * Extreme lightness values (50, 950) have reduced chroma to avoid gamut clipping.
 * The 500 shade gets full chroma (base color).
 */
const CHROMA_MULTIPLIER: Record<Shade, number> = {
  50: 0.12,
  100: 0.22,
  200: 0.40,
  300: 0.62,
  400: 0.82,
  500: 1.0,
  600: 0.94,
  700: 0.82,
  800: 0.68,
  900: 0.52,
  950: 0.36,
}

/** Color palette definition: base chroma and hue */
interface PaletteConfig {
  readonly chroma: number
  readonly hue: number
}

/** All required color palettes with their OKLCH base values */
export const PALETTE_CONFIGS = {
  primary: { chroma: 0.18, hue: 260 },
  secondary: { chroma: 0.12, hue: 290 },
  neutral: { chroma: 0.01, hue: 260 },
  success: { chroma: 0.16, hue: 145 },
  warning: { chroma: 0.16, hue: 85 },
  danger: { chroma: 0.20, hue: 25 },
  info: { chroma: 0.14, hue: 230 },
} as const satisfies Record<string, PaletteConfig>

export type PaletteName = keyof typeof PALETTE_CONFIGS

/** Single OKLCH color value */
export interface OklchColor {
  readonly lightness: number
  readonly chroma: number
  readonly hue: number
}

/** A full 11-shade palette */
export type ColorPalette = Record<Shade, OklchColor>

/** Generate an OKLCH color for a specific shade of a palette */
function generateShade(config: PaletteConfig, shade: Shade): OklchColor {
  return {
    lightness: LIGHTNESS_SCALE[shade],
    chroma: config.chroma * CHROMA_MULTIPLIER[shade],
    hue: config.hue,
  }
}

/** Generate a full 11-shade palette from a config */
function generatePalette(config: PaletteConfig): ColorPalette {
  const palette = {} as Record<Shade, OklchColor>
  for (const shade of SHADE_STEPS) {
    palette[shade] = generateShade(config, shade)
  }
  return palette as ColorPalette
}

/** Format an OKLCH color as a CSS value */
export function formatOklch(color: OklchColor): string {
  const l = color.lightness.toFixed(3)
  const c = color.chroma.toFixed(4)
  const h = color.hue.toFixed(1)
  return `oklch(${l} ${c} ${h})`
}

/** All generated palettes */
export const palettes: Record<PaletteName, ColorPalette> = {
  primary: generatePalette(PALETTE_CONFIGS.primary),
  secondary: generatePalette(PALETTE_CONFIGS.secondary),
  neutral: generatePalette(PALETTE_CONFIGS.neutral),
  success: generatePalette(PALETTE_CONFIGS.success),
  warning: generatePalette(PALETTE_CONFIGS.warning),
  danger: generatePalette(PALETTE_CONFIGS.danger),
  info: generatePalette(PALETTE_CONFIGS.info),
}

/**
 * Generate CSS custom properties for all color palettes.
 * Output format: --dz-colors-{palette}-{shade}: oklch(L C H);
 */
export function generateColorCssVars(): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [name, palette] of Object.entries(palettes)) {
    for (const shade of SHADE_STEPS) {
      const color = palette[shade]
      vars[`--dz-colors-${name}-${shade}`] = formatOklch(color)
    }
  }
  return vars
}
