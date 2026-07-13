/**
 * OKLCH → sRGB → WCAG contrast (dependency-free)
 *
 * The dzup-ui palette is authored in OKLCH, but WCAG contrast is defined over
 * sRGB relative luminance. These pure functions convert an `oklch(L C H)` string
 * to linear sRGB and compute the contrast ratio between two colors, so the
 * DESIGN.md gate can assert documented color pairs meet AA — without pulling in
 * a color library (per the plan's "reuse, don't add a color lib" note).
 *
 * Conversion follows Björn Ottosson's OKLab reference matrices.
 */

/** Parsed OKLCH components: L in 0–1, C ≥ 0, H in degrees. */
export interface Oklch {
  readonly l: number
  readonly c: number
  readonly h: number
}

/** Linear-light sRGB channels, each clamped to 0–1. */
export interface LinearRgb {
  readonly r: number
  readonly g: number
  readonly b: number
}

/**
 * Parse an `oklch(L C H)` or `oklch(L C H / A)` string. Lightness may be a
 * percentage. Returns `null` for anything that isn't an oklch() literal.
 */
export function parseOklch(value: string): Oklch | null {
  const m = value
    .trim()
    .match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*[\d.]+%?\s*)?\)$/i)
  if (!m) {
    return null
  }
  const rawL = m[1] ?? '0'
  const l = rawL.endsWith('%') ? Number.parseFloat(rawL) / 100 : Number.parseFloat(rawL)
  const c = Number.parseFloat(m[2] ?? '0')
  const h = Number.parseFloat(m[3] ?? '0')
  return { l, c, h }
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

/** Convert OKLCH to linear-light sRGB (channels clamped into gamut). */
export function oklchToLinearRgb({ l, c, h }: Oklch): LinearRgb {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const bComp = c * Math.sin(hRad)

  // OKLab → LMS (cube of the linearized cone responses)
  const lp = l + 0.396_337_777_4 * a + 0.215_803_757_3 * bComp
  const mp = l - 0.105_561_345_8 * a - 0.063_854_172_8 * bComp
  const sp = l - 0.089_484_177_5 * a - 1.291_485_548_0 * bComp

  const lc = lp * lp * lp
  const mc = mp * mp * mp
  const sc = sp * sp * sp

  // LMS → linear sRGB
  const r = 4.076_741_662_1 * lc - 3.307_711_591_3 * mc + 0.230_969_929_2 * sc
  const g = -1.268_438_004_6 * lc + 2.609_757_401_1 * mc - 0.341_319_396_5 * sc
  const b = -0.004_196_086_3 * lc - 0.703_418_614_7 * mc + 1.707_614_701_0 * sc

  return { r: clamp01(r), g: clamp01(g), b: clamp01(b) }
}

/**
 * WCAG relative luminance of an OKLCH color (0 = black, 1 = white). Returns
 * `null` when the string can't be parsed as oklch().
 */
export function relativeLuminance(value: string): number | null {
  const oklch = parseOklch(value)
  if (!oklch) {
    return null
  }
  const { r, g, b } = oklchToLinearRgb(oklch)
  // Linear channels are already gamma-decoded; WCAG luminance is a direct dot.
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * WCAG 2.x contrast ratio (1–21) between two OKLCH colors. Returns `null` if
 * either color can't be parsed.
 */
export function contrastRatio(a: string, b: string): number | null {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  if (la === null || lb === null) {
    return null
  }
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}
