/**
 * useThemeDesigner — the reactive store behind the full-page Theme Designer
 * (/themes). It is the ThemingDemo teaser grown into a complete editor.
 *
 * ── The single-source insight ────────────────────────────────────────────────
 * Every `@dzup-ui/core` component is styled by semantic `--dz-*` tokens, and
 * every semantic token resolves THROUGH the primitive colour ramp
 * `--dz-colors-{palette}-{shade}` (see @dzup-ui/tokens semantic/*.ts). The
 * light and dark layers already pick the right shade per theme (light leans on
 * 500/600/700, dark on 400/300/200). So instead of overriding dozens of
 * semantic tokens — and getting light/dark wrong — we regenerate the PRIMITIVE
 * ramps from an OKLCH hue+chroma, using the EXACT same lightness/chroma curve
 * the token build uses (`primitives/colors.ts`). Override the ramp and every
 * component re-themes, automatically correct in BOTH themes, entirely in token
 * vars — never a raw hex. This generalises `templates/previewCustomiser.ts`
 * (which only aliased the primary ramp to a fixed decorative palette) into a
 * free OKLCH editor across every intent palette plus the neutral surface ramp.
 *
 * The one `vars` map is the single source for the live preview (`:style` on the
 * preview roots), the copied CSS, the JSON export AND the shareable URL — they
 * are never computed separately, which keeps preview, export and link in
 * lockstep (the same guarantee `useBlockTheme` makes for the /blocks editor).
 *
 * A module-level singleton keeps one design across the SPA.
 */

import { computed, reactive, ref } from 'vue'
import type { ComputedRef } from 'vue'
import {
  FONT_FAMILIES,
  PALETTE_CONFIGS,
  RADIUS_SCALE,
  SHADE_STEPS,
  SHADOW_SCALE,
  SHADOW_SCALE_DARK,
  SPACING_SCALE,
  formatOklch,
} from '@dzup-ui/tokens'
import type { Shade } from '@dzup-ui/tokens'

// ── The design surface: the palettes a user can retune ───────────────────────
// The seven intent palettes drive every semantic role. `neutral` is the surface
// ramp — its shades back `--dz-background`, `--dz-foreground`, `--dz-surface`,
// `--dz-border` and every muted role, so retuning it (e.g. a cool slate or warm
// stone undertone) re-skins all surfaces and foregrounds in both themes at once.
export const DESIGNER_INTENTS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
] as const

export type DesignerIntent = (typeof DESIGNER_INTENTS)[number]

/** A palette's editable OKLCH base: the hue and the chroma of its 500 shade. */
export interface PaletteState {
  hue: number
  chroma: number
}

/** Density presets → a multiplier on the whole `--dz-spacing-*` scale. */
export type Density = 'compact' | 'comfortable' | 'spacious'

const DENSITY_FACTORS: Record<Density, number> = {
  compact: 0.9,
  comfortable: 1,
  spacious: 1.12,
}

// ── Ramp curve — MIRRORS @dzup-ui/tokens primitives/colors.ts ────────────────
// Kept in lockstep with the token build so a regenerated ramp is byte-identical
// to the shipped one when hue/chroma are left at their defaults (the editor then
// emits nothing for that palette — see `paletteChanged`). These two records are
// the only place the curve is duplicated; if the token curve ever changes, this
// is the single spot to re-sync.
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

const CHROMA_MULTIPLIER: Record<Shade, number> = {
  50: 0.12,
  100: 0.22,
  200: 0.4,
  300: 0.62,
  400: 0.82,
  500: 1.0,
  600: 0.94,
  700: 0.82,
  800: 0.68,
  900: 0.52,
  950: 0.36,
}

/** Radius slider bounds — 1 is the shipped scale (no override emitted). */
export const RADIUS_MIN = 0
export const RADIUS_MAX = 2
export const RADIUS_STEP = 0.05

/** Shadow-intensity slider bounds — 1 is the shipped elevation (no override). */
export const SHADOW_MIN = 0
export const SHADOW_MAX = 2.5
export const SHADOW_STEP = 0.05

/**
 * Radius steps we scale. `full` (pill) and `none` (square) are left untouched so
 * a pill stays a pill and a square stays square at any multiplier.
 */
const RADIUS_STEPS = (Object.keys(RADIUS_SCALE) as (keyof typeof RADIUS_SCALE)[]).filter(
  (step) => step !== 'full' && step !== 'none',
)

/** Minimum WCAG contrast for normal text (AA) and large text (AA Large). */
export const AA_NORMAL = 4.5
export const AA_LARGE = 3

// ── Font choices ─────────────────────────────────────────────────────────────
// Every stack ends in system fallbacks so a choice renders even when the named
// face isn't installed — no webfont fetch is added by the editor. `inter` is the
// shipped default (emits nothing when selected).
export interface FontChoice {
  key: string
  label: string
  stack: string
}

export const FONT_CHOICES: readonly FontChoice[] = [
  { key: 'inter', label: 'Inter', stack: FONT_FAMILIES.sans },
  {
    key: 'system',
    label: 'System UI',
    stack: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  },
  {
    key: 'geist',
    label: 'Geist',
    stack: '"Geist", "Inter", ui-sans-serif, system-ui, sans-serif',
  },
  {
    key: 'rounded',
    label: 'Rounded',
    stack: '"SF Pro Rounded", "Nunito", ui-rounded, "Segoe UI", system-ui, sans-serif',
  },
  {
    key: 'serif',
    label: 'Serif',
    stack: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  },
  {
    key: 'mono',
    label: 'Monospace',
    stack: FONT_FAMILIES.mono,
  },
] as const

const DEFAULT_FONT = 'inter'

// ── Colour maths: OKLCH ⇄ sRGB, WCAG luminance ───────────────────────────────
// Björn Ottosson's OKLab conversions. We convert an OKLCH triple straight to
// linear-light sRGB and read the WCAG relative luminance off that (luminance is
// defined on linear values), so contrast is computed from the SAME numbers the
// browser paints — no hex round-trip, no per-channel gamma step.

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

/** OKLCH (L 0–1, C, H°) → linear-light sRGB triple (unclamped). */
function oklchToLinearSrgb(l: number, c: number, h: number): [number, number, number] {
  const hr = (h * Math.PI) / 180
  const a = c * Math.cos(hr)
  const b = c * Math.sin(hr)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const lc = l_ ** 3
  const mc = m_ ** 3
  const sc = s_ ** 3
  return [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ]
}

/** WCAG relative luminance (0–1) of an OKLCH colour. */
function oklchLuminance(l: number, c: number, h: number): number {
  const [r, g, b] = oklchToLinearSrgb(l, c, h)
  return 0.2126 * clamp01(r) + 0.7152 * clamp01(g) + 0.0722 * clamp01(b)
}

/** WCAG contrast ratio between two relative luminances. */
function contrastRatio(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * sRGB (0–255) → OKLCH. Powers the experimental "theme from image": a sampled
 * dominant pixel becomes a hue+chroma the editor can drop onto a palette.
 */
export function srgbToOklch(r255: number, g255: number, b255: number): {
  lightness: number
  chroma: number
  hue: number
} {
  const toLinear = (v: number): number => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const r = toLinear(r255)
  const g = toLinear(g255)
  const b = toLinear(b255)
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)
  const okL = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const okA = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const okB = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const chroma = Math.sqrt(okA * okA + okB * okB)
  let hue = (Math.atan2(okB, okA) * 180) / Math.PI
  if (hue < 0) hue += 360
  return { lightness: okL, chroma, hue }
}

// ── Module-level singleton state ─────────────────────────────────────────────
// Seeded from the shipped palette configs so the editor opens on the real dzup
// theme; the neutral ramp carries its faint chroma so "reset" restores exactly.
function seedPalettes(): Record<DesignerIntent, PaletteState> {
  const seed = {} as Record<DesignerIntent, PaletteState>
  for (const intent of DESIGNER_INTENTS) {
    const cfg = PALETTE_CONFIGS[intent]
    seed[intent] = { hue: cfg.hue, chroma: cfg.chroma }
  }
  return seed
}

const palettes = reactive<Record<DesignerIntent, PaletteState>>(seedPalettes())
const radiusScale = ref(1)
const density = ref<Density>('comfortable')
const shadowIntensity = ref(1)
const fontKey = ref<string>(DEFAULT_FONT)

/** Whether a palette deviates from its shipped hue/chroma (→ needs emitting). */
function paletteChanged(intent: DesignerIntent): boolean {
  const cfg = PALETTE_CONFIGS[intent]
  const cur = palettes[intent]
  return Math.abs(cur.hue - cfg.hue) > 0.01 || Math.abs(cur.chroma - cfg.chroma) > 0.0005
}

/** The OKLCH of one shade of a (current-state) palette. */
function shadeColor(intent: DesignerIntent, shade: Shade): {
  lightness: number
  chroma: number
  hue: number
} {
  const cur = palettes[intent]
  return {
    lightness: LIGHTNESS_SCALE[shade],
    chroma: cur.chroma * CHROMA_MULTIPLIER[shade],
    hue: cur.hue,
  }
}

/** The CSS `oklch(...)` string for a shade — the swatch/ramp source of truth. */
export function shadeCss(intent: DesignerIntent, shade: Shade): string {
  return formatOklch(shadeColor(intent, shade))
}

// ── Scaling helpers (shared with the /blocks editor's approach) ──────────────
function scaleLength(value: string, factor: number): string {
  const match = /^(-?[\d.]+)(rem|px|em)?$/.exec(value)
  const num = match?.[1]
  if (num === undefined) return value
  const scaled = Number.parseFloat(num) * factor
  return `${Number.parseFloat(scaled.toFixed(4))}${match?.[2] ?? ''}`
}

/** Scale the alpha of every `oklch(0 0 0 / a)` layer in a shadow value. */
function scaleShadowAlpha(shadow: string, factor: number): string {
  if (shadow === 'none') return shadow
  return shadow.replace(/\/\s*([\d.]+)\s*\)/g, (_m, a: string) => {
    const scaled = clamp01(Number.parseFloat(a) * factor)
    return `/ ${Number.parseFloat(scaled.toFixed(3))})`
  })
}

// ── The single override map ──────────────────────────────────────────────────
// Colour ramps + radius + spacing + font. Shadow overrides are theme-specific
// (light vs dark elevation differ), so they are layered on per preview panel by
// `varsFor()` and merged into `cssText` from the light scale for the export.
const baseVars = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}

  // Colour: regenerate a full 11-shade ramp for each *changed* palette. Unchanged
  // palettes emit nothing — they already resolve to the shipped tokens, keeping
  // the export lean and the diff honest.
  for (const intent of DESIGNER_INTENTS) {
    if (!paletteChanged(intent)) continue
    for (const shade of SHADE_STEPS) {
      out[`--dz-colors-${intent}-${shade}`] = shadeCss(intent, shade)
    }
  }

  // Radius: multiply each named step (pill/square excluded).
  if (radiusScale.value !== 1) {
    for (const step of RADIUS_STEPS) {
      const base = RADIUS_SCALE[step]
      if (base !== undefined) out[`--dz-radius-${step}`] = scaleLength(base, radiusScale.value)
    }
  }

  // Density: multiply the whole spacing scale — component heights/paddings read
  // from `--dz-spacing-*`, so this re-densifies every control proportionally.
  const factor = DENSITY_FACTORS[density.value]
  if (factor !== 1) {
    for (const [step, value] of Object.entries(SPACING_SCALE)) {
      const name = step.replace('.', '_') // CSS custom props can't contain a dot.
      out[`--dz-spacing-${name}`] = scaleLength(value, factor)
    }
  }

  // Font: swap the sans stack that the whole library inherits.
  if (fontKey.value !== DEFAULT_FONT) {
    const choice = FONT_CHOICES.find((f) => f.key === fontKey.value)
    if (choice) out['--dz-font-sans'] = choice.stack
  }

  return out
})

/** Shadow overrides for a theme, or `{}` when intensity is at its default. */
function shadowVars(theme: 'light' | 'dark'): Record<string, string> {
  if (shadowIntensity.value === 1) return {}
  const scale = theme === 'dark' ? SHADOW_SCALE_DARK : SHADOW_SCALE
  const out: Record<string, string> = {}
  for (const [step, value] of Object.entries(scale)) {
    out[`--dz-shadow-${step}`] = scaleShadowAlpha(value, shadowIntensity.value)
  }
  return out
}

/** Full override map for a given preview theme (colour ramps + theme shadows). */
export function varsFor(theme: 'light' | 'dark'): Record<string, string> {
  return { ...baseVars.value, ...shadowVars(theme) }
}

/** The export map: the light-mode view of every override (ramps are theme-agnostic). */
const vars = computed<Record<string, string>>(() => ({
  ...baseVars.value,
  ...shadowVars('light'),
}))

const hasOverrides = computed<boolean>(() => Object.keys(vars.value).length > 0)

// ── Exports: CSS + JSON ──────────────────────────────────────────────────────
const cssText = computed<string>(() => {
  const body = Object.entries(vars.value)
    .map(([prop, value]) => `  ${prop}: ${value};`)
    .join('\n')
  return (
    '/* dzup-ui theme — generated by the Theme Designer (/themes).\n' +
    '   Drop this into your global stylesheet, after @dzup-ui/tokens/css, so the\n' +
    '   library re-skins to your palette. Values are OKLCH primitive-ramp\n' +
    '   overrides — the semantic tokens resolve through them in light AND dark. */\n' +
    `:root {\n${body || '  /* defaults — no overrides */'}\n}`
  )
})

/** A structured token export: the design params + the resolved CSS variables. */
const jsonText = computed<string>(() => {
  const changed: Record<string, PaletteState> = {}
  for (const intent of DESIGNER_INTENTS) {
    if (paletteChanged(intent)) changed[intent] = { ...palettes[intent] }
  }
  return JSON.stringify(
    {
      $schema: 'https://dzup-ui.dev/schema/theme.json',
      name: 'dzup-ui-theme',
      palettes: changed,
      radius: radiusScale.value,
      density: density.value,
      shadow: shadowIntensity.value,
      font: fontKey.value,
      cssVars: vars.value,
    },
    null,
    2,
  )
})

// ── Live WCAG contrast readouts ──────────────────────────────────────────────
export interface ContrastPair {
  /** What the pair represents (e.g. "Primary button"). */
  label: string
  /** The measured contrast ratio. */
  ratio: number
  /** Whether it clears AA for normal (4.5) and large (3.0) text. */
  passNormal: boolean
  passLarge: boolean
}

/** A pair descriptor: foreground vs background, each an intent+shade or white. */
interface PairSpec {
  label: string
  fg: [DesignerIntent, Shade] | 'white'
  bg: [DesignerIntent, Shade]
}

/** Luminance of a pair endpoint under the current design. */
function endpointLum(end: [DesignerIntent, Shade] | 'white'): number {
  if (end === 'white') return 1
  const [intent, shade] = end
  const { lightness, chroma, hue } = shadeColor(intent, shade)
  return oklchLuminance(lightness, chroma, hue)
}

function evalPairs(specs: PairSpec[]): ContrastPair[] {
  return specs.map((spec) => {
    const ratio = contrastRatio(endpointLum(spec.fg), endpointLum(spec.bg))
    return {
      label: spec.label,
      ratio,
      passNormal: ratio >= AA_NORMAL,
      passLarge: ratio >= AA_LARGE,
    }
  })
}

// Shade mappings mirror the semantic layers (@dzup-ui/tokens semantic/*.ts): in
// light, text is neutral-900/-600 on neutral-100 and solids are shade 500 with
// white/neutral-900 text; in dark, surfaces invert (neutral-950 bg, neutral-50
// text) and solids lift to shade 400 with a -950 foreground.
const LIGHT_PAIRS: PairSpec[] = [
  { label: 'Body text', fg: ['neutral', 900], bg: ['neutral', 100] },
  { label: 'Muted text', fg: ['neutral', 600], bg: ['neutral', 100] },
  { label: 'Primary solid', fg: 'white', bg: ['primary', 500] },
  { label: 'Link', fg: ['primary', 600], bg: ['neutral', 100] },
  { label: 'Success solid', fg: 'white', bg: ['success', 500] },
  { label: 'Warning solid', fg: ['neutral', 900], bg: ['warning', 300] },
  { label: 'Danger solid', fg: 'white', bg: ['danger', 500] },
  { label: 'Info solid', fg: 'white', bg: ['info', 500] },
]

const DARK_PAIRS: PairSpec[] = [
  { label: 'Body text', fg: ['neutral', 50], bg: ['neutral', 950] },
  { label: 'Muted text', fg: ['neutral', 400], bg: ['neutral', 950] },
  { label: 'Primary solid', fg: ['primary', 950], bg: ['primary', 400] },
  { label: 'Link', fg: ['primary', 400], bg: ['neutral', 950] },
  { label: 'Success solid', fg: ['success', 950], bg: ['success', 400] },
  { label: 'Warning solid', fg: ['neutral', 900], bg: ['warning', 300] },
  { label: 'Danger solid', fg: ['danger', 950], bg: ['danger', 400] },
  { label: 'Info solid', fg: ['info', 950], bg: ['info', 400] },
]

const contrastLight = computed<ContrastPair[]>(() => evalPairs(LIGHT_PAIRS))
const contrastDark = computed<ContrastPair[]>(() => evalPairs(DARK_PAIRS))

/** Count of pairs (across both themes) that fail AA normal — the headline gate. */
const failingCount = computed<number>(
  () =>
    contrastLight.value.filter((p) => !p.passNormal).length +
    contrastDark.value.filter((p) => !p.passNormal).length,
)

// ── Curated presets ──────────────────────────────────────────────────────────
export interface ThemePreset {
  name: string
  /** Swatch hue/chroma for the button (the preset's primary). */
  swatch: { hue: number, chroma: number }
  apply: () => void
}

/** Partial application helper — sets only the palettes/knobs a preset names. */
function applyPartial(spec: {
  palettes?: Partial<Record<DesignerIntent, PaletteState>>
  radius?: number
  density?: Density
  shadow?: number
  font?: string
}): void {
  if (spec.palettes) {
    for (const intent of DESIGNER_INTENTS) {
      const next = spec.palettes[intent]
      if (next) palettes[intent] = { ...next }
    }
  }
  if (spec.radius !== undefined) radiusScale.value = spec.radius
  if (spec.density !== undefined) density.value = spec.density
  if (spec.shadow !== undefined) shadowIntensity.value = spec.shadow
  if (spec.font !== undefined) fontKey.value = spec.font
}

export const PRESETS: ThemePreset[] = [
  {
    name: 'dzup',
    swatch: { hue: 260, chroma: 0.22 },
    apply: () => reset(),
  },
  {
    name: 'Emerald',
    swatch: { hue: 165, chroma: 0.17 },
    apply: () =>
      applyPartial({
        palettes: {
          primary: { hue: 165, chroma: 0.17 },
          neutral: { hue: 165, chroma: 0.012 },
        },
        radius: 1,
      }),
  },
  {
    name: 'Rose',
    swatch: { hue: 12, chroma: 0.2 },
    apply: () =>
      applyPartial({
        palettes: {
          primary: { hue: 12, chroma: 0.2 },
          neutral: { hue: 12, chroma: 0.01 },
        },
        radius: 1.4,
      }),
  },
  {
    name: 'Amber',
    swatch: { hue: 75, chroma: 0.18 },
    apply: () =>
      applyPartial({
        palettes: {
          primary: { hue: 75, chroma: 0.18 },
          neutral: { hue: 70, chroma: 0.012 },
        },
        radius: 0.6,
        font: 'rounded',
      }),
  },
  {
    name: 'Slate',
    swatch: { hue: 235, chroma: 0.15 },
    apply: () =>
      applyPartial({
        palettes: {
          primary: { hue: 235, chroma: 0.15 },
          neutral: { hue: 255, chroma: 0.018 },
        },
        radius: 0.7,
        density: 'compact',
      }),
  },
  {
    name: 'Violet',
    swatch: { hue: 292, chroma: 0.2 },
    apply: () =>
      applyPartial({
        palettes: { primary: { hue: 292, chroma: 0.2 } },
        radius: 1.6,
        shadow: 1.4,
      }),
  },
  {
    name: 'Mono',
    swatch: { hue: 260, chroma: 0.004 },
    apply: () =>
      applyPartial({
        palettes: {
          primary: { hue: 286, chroma: 0.006 },
          neutral: { hue: 286, chroma: 0.004 },
        },
        radius: 0.4,
        font: 'mono',
      }),
  },
]

// ── URL encode / decode ──────────────────────────────────────────────────────
// The whole design is a compact JSON blob, base64url-encoded into `?theme=`.
// Only non-default knobs are serialised, so a default theme yields no param and
// a shared link stays short. `serialize()` returns '' when nothing is overridden.
interface SerializedTheme {
  p?: Record<string, [number, number]>
  r?: number
  d?: Density
  s?: number
  f?: string
}

function toBase64Url(json: string): string {
  const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : ''
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(text: string): string {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/')
  try {
    return typeof atob === 'function' ? decodeURIComponent(escape(atob(b64))) : ''
  } catch {
    return ''
  }
}

/** The current design as a URL-safe token (empty when at defaults). */
function serialize(): string {
  const state: SerializedTheme = {}
  const p: Record<string, [number, number]> = {}
  for (const intent of DESIGNER_INTENTS) {
    if (paletteChanged(intent)) {
      p[intent] = [
        Number(palettes[intent].hue.toFixed(1)),
        Number(palettes[intent].chroma.toFixed(4)),
      ]
    }
  }
  if (Object.keys(p).length) state.p = p
  if (radiusScale.value !== 1) state.r = radiusScale.value
  if (density.value !== 'comfortable') state.d = density.value
  if (shadowIntensity.value !== 1) state.s = shadowIntensity.value
  if (fontKey.value !== DEFAULT_FONT) state.f = fontKey.value
  if (!Object.keys(state).length) return ''
  return toBase64Url(JSON.stringify(state))
}

const DENSITIES: Density[] = ['compact', 'comfortable', 'spacious']

/** Restore a design from a `?theme=` token. Returns true if anything applied. */
function deserialize(token: string): boolean {
  const json = fromBase64Url(token)
  if (!json) return false
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return false
  }
  if (typeof parsed !== 'object' || parsed === null) return false
  const state = parsed as SerializedTheme
  reset()
  if (state.p) {
    for (const intent of DESIGNER_INTENTS) {
      const pair = state.p[intent]
      if (Array.isArray(pair) && pair.length === 2) {
        const [hue, chroma] = pair
        if (typeof hue === 'number' && typeof chroma === 'number') {
          palettes[intent] = { hue, chroma }
        }
      }
    }
  }
  if (typeof state.r === 'number') radiusScale.value = state.r
  if (typeof state.d === 'string' && DENSITIES.includes(state.d)) density.value = state.d
  if (typeof state.s === 'number') shadowIntensity.value = state.s
  if (typeof state.f === 'string' && FONT_CHOICES.some((c) => c.key === state.f)) {
    fontKey.value = state.f
  }
  return true
}

/** Absolute shareable URL for the current design (or the bare /themes URL). */
const shareUrl = computed<string>(() => {
  const base =
    typeof window !== 'undefined' ? `${window.location.origin}/themes` : 'https://dzup-ui.dev/themes'
  const token = serialize()
  return token ? `${base}?theme=${token}` : base
})

function reset(): void {
  Object.assign(palettes, seedPalettes())
  radiusScale.value = 1
  density.value = 'comfortable'
  shadowIntensity.value = 1
  fontKey.value = DEFAULT_FONT
}

export interface UseThemeDesigner {
  palettes: Record<DesignerIntent, PaletteState>
  radiusScale: typeof radiusScale
  density: typeof density
  shadowIntensity: typeof shadowIntensity
  fontKey: typeof fontKey
  vars: ComputedRef<Record<string, string>>
  varsFor: typeof varsFor
  hasOverrides: ComputedRef<boolean>
  cssText: ComputedRef<string>
  jsonText: ComputedRef<string>
  contrastLight: ComputedRef<ContrastPair[]>
  contrastDark: ComputedRef<ContrastPair[]>
  failingCount: ComputedRef<number>
  shareUrl: ComputedRef<string>
  serialize: typeof serialize
  deserialize: typeof deserialize
  paletteChanged: typeof paletteChanged
  reset: typeof reset
}

/**
 * Access the shared Theme Designer store. Every caller (the controls, the light
 * and dark preview panels, the export bar) gets the SAME reactive design, so one
 * edit re-themes every panel and feeds every export + the share link from one map.
 */
export function useThemeDesigner(): UseThemeDesigner {
  return {
    palettes,
    radiusScale,
    density,
    shadowIntensity,
    fontKey,
    vars,
    varsFor,
    hasOverrides,
    cssText,
    jsonText,
    contrastLight,
    contrastDark,
    failingCount,
    shareUrl,
    serialize,
    deserialize,
    paletteChanged,
    reset,
  }
}
