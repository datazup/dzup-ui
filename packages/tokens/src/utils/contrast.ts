/**
 * WCAG contrast over OKLCH — the one implementation (UI-DZUP-UI-ARCH-L-07).
 *
 * The palette is authored in OKLCH; WCAG 2.x contrast is defined over sRGB
 * relative luminance. These pure, dependency-free functions are shared by the
 * DESIGN.md contrast gate (`@dzup-ui/tooling`) and by the landing site's theme
 * designer and block theme, so the verdict a visitor sees and the verdict the
 * gate enforces come from the same arithmetic. Before this module each of the
 * three carried its own copy, and a fix to one reached none of the others.
 *
 * Conversion follows Björn Ottosson's OKLab reference matrices.
 */

/**
 * OKLCH (L 0–1, C ≥ 0, H in degrees) → linear-light sRGB triple, **unclamped**.
 *
 * Out-of-gamut colours yield channels outside 0–1; a caller that needs a
 * displayable value clamps (as {@link wcagLuminanceFromLinear} does).
 */
export function oklchToLinearSrgb(l: number, c: number, h: number): [number, number, number] {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  // OKLab → LMS (cube of the linearized cone responses)
  const lp = l + 0.396_337_777_4 * a + 0.215_803_757_3 * b
  const mp = l - 0.105_561_345_8 * a - 0.063_854_172_8 * b
  const sp = l - 0.089_484_177_5 * a - 1.291_485_548_0 * b

  const lc = lp * lp * lp
  const mc = mp * mp * mp
  const sc = sp * sp * sp

  // LMS → linear sRGB
  return [
    4.076_741_662_1 * lc - 3.307_711_591_3 * mc + 0.230_969_929_2 * sc,
    -1.268_438_004_6 * lc + 2.609_757_401_1 * mc - 0.341_319_396_5 * sc,
    -0.004_196_086_3 * lc - 0.703_418_614_7 * mc + 1.707_614_701_0 * sc,
  ]
}

/** Clamp a channel into 0–1. */
export function clampUnit(n: number): number {
  return n < 0 ? 0 : n > 1 ? 1 : n
}

/**
 * WCAG relative luminance (0 = black, 1 = white) of linear-light sRGB channels.
 * Channels are clamped into gamut first; WCAG luminance is a direct dot product
 * over LINEAR values, so there is no gamma step here.
 */
export function wcagLuminanceFromLinear(r: number, g: number, b: number): number {
  return 0.2126 * clampUnit(r) + 0.7152 * clampUnit(g) + 0.0722 * clampUnit(b)
}

/** WCAG relative luminance of an OKLCH colour given as numbers. */
export function oklchLuminance(l: number, c: number, h: number): number {
  const [r, g, b] = oklchToLinearSrgb(l, c, h)
  return wcagLuminanceFromLinear(r, g, b)
}

/** WCAG 2.x contrast ratio (1–21) between two relative luminances, in either order. */
export function wcagContrastRatio(a: number, b: number): number {
  const lighter = Math.max(a, b)
  const darker = Math.min(a, b)
  return (lighter + 0.05) / (darker + 0.05)
}
