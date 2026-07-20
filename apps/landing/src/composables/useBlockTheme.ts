/**
 * useBlockTheme — the one reactive token-override store behind the /blocks theme
 * editor (docs/blocks.md §3.4; tweakcn is the reference).
 *
 * This is the flagship single-source guarantee: because every @dzup-ui/core
 * component is styled by `--dz-*` CSS variables, ONE small store of overrides
 * (brand colour · radius scale · density) drives BOTH
 *   • the live previews — its {@link UseBlockTheme.vars} map binds as an inline
 *     `:style` on every preview root, so the override cascades into the block
 *     subtree and re-resolves the tokens there (scoped, never leaking to the
 *     page chrome), and
 *   • the copied code — its {@link UseBlockTheme.themeCssBlock} serialises the
 *     SAME map into a `:root { … }` block prepended to the snippet, so pasted
 *     markup renders byte-for-byte like the themed preview.
 *
 * Both outputs derive from the single `vars` computed — they are never computed
 * separately, which is what keeps preview and copy in lockstep.
 *
 * A module-level singleton (like {@link ../composables/useTheme.ts}) keeps one
 * source of truth across the SPA: the global toolbar writes it, every
 * BlockPreview reads it.
 */

import type { ComputedRef, Ref } from 'vue'
import { RADIUS_SCALE, SPACING_SCALE } from '@dzup-ui/tokens'
import { computed, ref } from 'vue'

/** Density presets → a multiplier applied to the whole `--dz-spacing-*` scale. */
export type Density = 'compact' | 'comfortable' | 'spacious'

/** Spacing multipliers per density. `comfortable` is the shipped scale (no override). */
const DENSITY_FACTORS: Record<Density, number> = {
  compact: 0.875,
  comfortable: 1,
  spacious: 1.15,
}

/** Radius slider bounds — 1 is the shipped scale (no override). */
export const RADIUS_MIN = 0
export const RADIUS_MAX = 2
export const RADIUS_STEP = 0.05

/**
 * Radius steps we scale. `full` (the 9999px pill) and `none` (0) are intentionally
 * left untouched so a pill stays a pill and a square stays square at any scale.
 */
const RADIUS_STEPS = (Object.keys(RADIUS_SCALE) as (keyof typeof RADIUS_SCALE)[]).filter(
  step => step !== 'full' && step !== 'none',
)

/** Minimum AA contrast ratio for normal text/icons on the brand fill. */
const AA_CONTRAST = 4.5

/**
 * Relative luminance of the two foreground tokens we can put on the brand fill —
 * `--dz-colors-neutral-50` (near-white) and `--dz-colors-neutral-950`
 * (near-black). We measure against THESE (not pure #fff/#000) because that's
 * what actually renders; with pure endpoints every colour trivially clears AA on
 * one side, so the guard would never fire on a genuinely muddy mid-tone.
 */
const FG_LIGHT_LUM = 0.92
const FG_DARK_LUM = 0.02

/** Parse `#rgb`/`#rrggbb` to an [r,g,b] triple (0–255), or null if not a hex. */
function parseHex(hex: string): [number, number, number] | null {
  const raw = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim())?.[1]
  if (!raw)
    return null
  const full = raw.length === 3 ? raw.replace(/(.)/g, '$1$1') : raw
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** WCAG relative luminance of an sRGB triple (0–1). */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number): number => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** WCAG contrast ratio between two relative luminances. */
function contrastRatio(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

/** Multiply a `<n>rem` / `<n>px` length by `factor`, preserving its unit. */
function scaleLength(value: string, factor: number): string {
  const match = /^(-?[\d.]+)(rem|px|em)?$/.exec(value)
  const num = match?.[1]
  if (num === undefined)
    return value
  const scaled = Number.parseFloat(num) * factor
  // Trim float noise (0.5 * 1.15 → 0.575, not 0.5750000001).
  return `${Number.parseFloat(scaled.toFixed(4))}${match?.[2] ?? ''}`
}

/** The reactive surface returned by {@link useBlockTheme}. */
export interface UseBlockTheme {
  /** Brand/primary colour (any CSS colour from the picker). `''` = shipped primary. */
  brand: Ref<string>
  /** Radius multiplier; `1` = the shipped radius scale. */
  radiusScale: Ref<number>
  /** Density preset; `comfortable` = the shipped spacing scale. */
  density: Ref<Density>
  /**
   * The single override map (`--dz-*` → value). Empty when every control is at
   * its default. Bound as `:style` on preview roots AND serialised into the
   * copied `:root{}` — one source, two consumers.
   */
  vars: ComputedRef<Record<string, string>>
  /** Whether any control deviates from the shipped defaults. */
  hasOverrides: ComputedRef<boolean>
  /** The serialised `:root { … }` block (empty when there are no overrides). */
  rootCss: ComputedRef<string>
  /** `rootCss` plus a paste-instruction comment, for prepending to copied code. */
  themeCssBlock: ComputedRef<string>
  /** Best achievable contrast of the brand fill vs. its chosen text colour (or null). */
  brandContrast: ComputedRef<number | null>
  /** A human warning when the brand colour can't reach AA in either text colour. */
  contrastWarning: ComputedRef<string | null>
  /** Restore every control to the library's shipped defaults. */
  reset: () => void
}

// ── Module-level singleton state ──────────────────────────────────────────
// One shared store: the toolbar mutates these; every preview binds `vars`.
const brand = ref<string>('')
const radiusScale = ref<number>(1)
const density = ref<Density>('comfortable')

/** Relative luminance of the current brand colour, or null when not a hex. */
const brandLuminance = computed<number | null>(() => {
  if (!brand.value)
    return null
  const rgb = parseHex(brand.value)
  return rgb ? relativeLuminance(rgb) : null
})

/**
 * Token-only foreground for the brand fill: near-white or near-black (real
 * `--dz-colors-neutral-*` tokens), whichever yields the higher contrast on the
 * chosen colour. Falls back to near-white for non-hex colours we can't measure.
 */
const brandForeground = computed<string>(() => {
  const lum = brandLuminance.value
  if (lum === null)
    return 'var(--dz-colors-neutral-50)'
  const onLight = contrastRatio(lum, FG_LIGHT_LUM)
  const onDark = contrastRatio(lum, FG_DARK_LUM)
  return onDark >= onLight ? 'var(--dz-colors-neutral-950)' : 'var(--dz-colors-neutral-50)'
})

const brandContrast = computed<number | null>(() => {
  const lum = brandLuminance.value
  if (lum === null)
    return null
  return Math.max(contrastRatio(lum, FG_LIGHT_LUM), contrastRatio(lum, FG_DARK_LUM))
})

const contrastWarning = computed<string | null>(() => {
  const ratio = brandContrast.value
  if (ratio === null || ratio >= AA_CONTRAST)
    return null
  return `This brand colour reaches only ${ratio.toFixed(1)}:1 against its text — below the WCAG AA minimum of ${AA_CONTRAST}:1. Pick a darker or lighter colour for accessible previews.`
})

const vars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}

  // Brand colour: override the primary token set directly so any picked colour
  // re-themes every component that reads a primary token. Hover/active shift
  // toward `--dz-foreground`, which flips per theme — so the derivation darkens
  // in light mode and lightens in dark mode automatically (token-only, no hex).
  if (brand.value) {
    out['--dz-primary'] = brand.value
    out['--dz-primary-hover'] = `color-mix(in oklch, ${brand.value} 88%, var(--dz-foreground))`
    out['--dz-primary-active'] = `color-mix(in oklch, ${brand.value} 78%, var(--dz-foreground))`
    out['--dz-primary-foreground'] = brandForeground.value
    out['--dz-ring'] = brand.value
    out['--dz-link'] = brand.value
  }

  // Radius scale: multiply each named radius step (pill/square excluded).
  if (radiusScale.value !== 1) {
    for (const step of RADIUS_STEPS) {
      const base = RADIUS_SCALE[step]
      if (base !== undefined)
        out[`--dz-radius-${step}`] = scaleLength(base, radiusScale.value)
    }
  }

  // Density: multiply the whole spacing scale — component heights/paddings read
  // from `--dz-spacing-*`, so this re-densifies every control proportionally.
  const factor = DENSITY_FACTORS[density.value]
  if (factor !== 1) {
    for (const [step, value] of Object.entries(SPACING_SCALE)) {
      // CSS custom props can't contain a dot; the token build maps `.` → `_`.
      const name = step.replace('.', '_')
      out[`--dz-spacing-${name}`] = scaleLength(value, factor)
    }
  }

  return out
})

const hasOverrides = computed<boolean>(() => Object.keys(vars.value).length > 0)

const rootCss = computed<string>(() => {
  if (!hasOverrides.value)
    return ''
  const body = Object.entries(vars.value)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n')
  return `:root {\n${body}\n}`
})

const themeCssBlock = computed<string>(() => {
  if (!hasOverrides.value)
    return ''
  return (
    `/* dzup-ui theme overrides — generated by the Blocks theme editor.\n`
    + `   Drop these into your global stylesheet so the pasted markup renders\n`
    + `   exactly like the themed preview. */\n${
      rootCss.value}`
  )
})

function reset(): void {
  brand.value = ''
  radiusScale.value = 1
  density.value = 'comfortable'
}

/**
 * Access the shared block-theme store. Every caller (the toolbar, every
 * BlockPreview) gets the SAME reactive state, so one edit re-themes all previews
 * and feeds every copied snippet from one source.
 */
export function useBlockTheme(): UseBlockTheme {
  return {
    brand,
    radiusScale,
    density,
    vars,
    hasOverrides,
    rootCss,
    themeCssBlock,
    brandContrast,
    contrastWarning,
    reset,
  }
}
