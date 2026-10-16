/**
 * OKLCH → sRGB → WCAG contrast (dependency-free)
 *
 * The dzup-ui palette is authored in OKLCH, but WCAG contrast is defined over
 * sRGB relative luminance. These pure functions convert an `oklch(L C H)` string
 * to linear sRGB and compute the contrast ratio between two colors, so the
 * DESIGN.md gate can assert documented color pairs meet AA — without pulling in
 * a color library (per the plan's "reuse, don't add a color lib" note).
 *
 * The arithmetic itself — OKLab matrices, WCAG luminance, the ratio — lives in
 * `@dzup-ui/tokens/utils` (`packages/tokens/src/utils/contrast.ts`), shared
 * with the landing theme designer so the gate and the site cannot disagree
 * (UI-DZUP-UI-ARCH-L-07). This module adds the `oklch()` string parsing and the
 * hex round-trip the gates need.
 */

import {
  clampUnit,
  oklchToLinearSrgb,
  wcagContrastRatio,
  wcagLuminanceFromLinear,
} from '../../../tokens/src/utils/contrast.js'

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

/** Convert OKLCH to linear-light sRGB (channels clamped into gamut). */
export function oklchToLinearRgb({ l, c, h }: Oklch): LinearRgb {
  const [r, g, b] = oklchToLinearSrgb(l, c, h)
  return { r: clampUnit(r), g: clampUnit(g), b: clampUnit(b) }
}

/**
 * Gamma-encode a linear-light channel (0–1) to sRGB (0–1) — the IEC 61966-2-1
 * transfer function. `relativeLuminance` below deliberately does NOT use this
 * (WCAG luminance is defined over LINEAR channels); this exists for the trip back
 * out to a displayable/serialisable color.
 */
function encodeGamma(channel: number): number {
  return channel <= 0.003_130_8
    ? 12.92 * channel
    : 1.055 * channel ** (1 / 2.4) - 0.055
}

/**
 * Convert an `oklch(L C H)` string to a lowercase `#rrggbb` sRGB hex, or `null`
 * if it can't be parsed.
 *
 * For surfaces that CANNOT read the token CSS — the Storybook manager chrome
 * renders outside the preview iframe — a hex literal is unavoidable. This lets a
 * check assert those literals still equal the token they claim to mirror, so the
 * copy is verified rather than merely commented (TASK-FREE-17).
 *
 * Out-of-gamut colors are clamped per-channel by `oklchToLinearRgb`, so a wide
 * OKLCH value round-trips to the nearest displayable sRGB rather than failing.
 */
export function oklchToHex(value: string): string | null {
  const oklch = parseOklch(value)
  if (!oklch) {
    return null
  }
  const { r, g, b } = oklchToLinearRgb(oklch)
  const channel = (c: number): string =>
    Math.round(encodeGamma(c) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(r)}${channel(g)}${channel(b)}`
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
  return wcagLuminanceFromLinear(r, g, b)
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
  return wcagContrastRatio(la, lb)
}
