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

import type {
  Shade,
  ThemeRecipeDensity,
  ThemeRecipeFontId,
  ThemeRecipePalette,
  ThemeRecipePaletteName,
  ThemeRecipePresetId,
  ThemeRecipeV1,
} from '@dzup-ui/tokens'
import type { ComputedRef } from 'vue'
import {
  createDefaultThemeRecipe,
  createThemeRecipePreset,
  DARK_SEMANTIC_TOKENS,
  decodeThemeRecipe,
  encodeThemeRecipe,
  formatOklch,
  LIGHT_SEMANTIC_TOKENS,
  PALETTE_CONFIGS,
  serializeThemeRecipe,
  THEME_RECIPE_FONTS,
  themeRecipePaletteColor,
  themeRecipeToCssText,
  themeRecipeToCssVariables,
  themeRecipeToUrl,
} from '@dzup-ui/tokens'
import { computed, reactive, toRef, watch } from 'vue'
import { SITE_ORIGIN } from '../origin.ts'

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
] as const satisfies readonly ThemeRecipePaletteName[]

export type DesignerIntent = ThemeRecipePaletteName

/** A palette's editable OKLCH base: the hue and the chroma of its 500 shade. */
export type PaletteState = ThemeRecipePalette

/** Density presets → a multiplier on the whole `--dz-spacing-*` scale. */
export type Density = ThemeRecipeDensity

/** Radius slider bounds — 1 is the shipped scale (no override emitted). */
export const RADIUS_MIN = 0
export const RADIUS_MAX = 2
export const RADIUS_STEP = 0.05

/** Shadow-intensity slider bounds — 1 is the shipped elevation (no override). */
export const SHADOW_MIN = 0
export const SHADOW_MAX = 2.5
export const SHADOW_STEP = 0.05

/** Minimum WCAG contrast for normal text (AA) and large text (AA Large). */
export const AA_NORMAL = 4.5
export const AA_LARGE = 3

// ── Font choices ─────────────────────────────────────────────────────────────
// Every stack ends in system fallbacks so a choice renders even when the named
// face isn't installed — no webfont fetch is added by the editor. `inter` is the
// shipped default (emits nothing when selected).
export interface FontChoice {
  key: ThemeRecipeFontId
  label: string
  stack: string
}

const FONT_LABELS: Record<ThemeRecipeFontId, string> = {
  inter: 'Inter',
  system: 'System UI',
  geist: 'Geist',
  rounded: 'Rounded',
  serif: 'Serif',
  mono: 'Monospace',
}

export const FONT_CHOICES: readonly FontChoice[] = Object.entries(THEME_RECIPE_FONTS)
  .map(([key, stack]) => ({
    key: key as ThemeRecipeFontId,
    label: FONT_LABELS[key as ThemeRecipeFontId],
    stack,
  }))

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
  if (hue < 0)
    hue += 360
  return { lightness: okL, chroma, hue }
}

// ── Module-level singleton state ─────────────────────────────────────────────
// The contract and transforms are token-owned; this singleton is application
// state only, keeping one recipe across landing routes.
const recipe = reactive<ThemeRecipeV1>(createDefaultThemeRecipe())
const palettes = recipe.palettes
const radiusScale = toRef(recipe, 'radius')
const density = toRef(recipe, 'density')
const shadowIntensity = toRef(recipe, 'shadow')
const fontKey = toRef(recipe, 'font')
const mode = toRef(recipe, 'mode')
const direction = toRef(recipe, 'direction')
const motion = toRef(recipe, 'motion')
let applyingRecipe = false

function replaceRecipe(next: ThemeRecipeV1): void {
  applyingRecipe = true
  try {
    recipe.version = next.version
    recipe.preset = next.preset
    for (const intent of DESIGNER_INTENTS)
      Object.assign(palettes[intent], next.palettes[intent])
    recipe.radius = next.radius
    recipe.shadow = next.shadow
    recipe.density = next.density
    recipe.font = next.font
    recipe.mode = next.mode
    recipe.direction = next.direction
    recipe.motion = next.motion
  }
  finally {
    applyingRecipe = false
  }
}

watch(
  [() => recipe.palettes, radiusScale, density, shadowIntensity, fontKey],
  () => {
    if (!applyingRecipe)
      recipe.preset = 'custom'
  },
  { deep: true, flush: 'sync' },
)

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
  return themeRecipePaletteColor(recipe, intent, shade)
}

/** The CSS `oklch(...)` string for a shade — the swatch/ramp source of truth. */
export function shadeCss(intent: DesignerIntent, shade: Shade): string {
  return formatOklch(shadeColor(intent, shade))
}

/** Full override map for a given preview theme (colour ramps + theme shadows). */
export function varsFor(theme: 'light' | 'dark'): Record<string, string> {
  return themeRecipeToCssVariables(recipe, theme)
}

/** The export map is the contract's complete light-mode expansion. */
const vars = computed<Record<string, string>>(() => themeRecipeToCssVariables(recipe, 'light'))

const defaultSerialized = serializeThemeRecipe(createDefaultThemeRecipe())
const hasOverrides = computed<boolean>(() => serializeThemeRecipe(recipe) !== defaultSerialized)

// ── Exports: CSS + JSON ──────────────────────────────────────────────────────
const cssText = computed<string>(() => [
  '/* ThemeRecipeV1 · light and dark expansion */',
  themeRecipeToCssText(recipe, 'light'),
  themeRecipeToCssText(recipe, 'dark', '[data-theme="dark"]'),
].join('\n\n'))

/** A structured token export: the design params + the resolved CSS variables. */
const jsonText = computed<string>(() => serializeThemeRecipe(recipe, true))

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

/** A pair endpoint: an intent+shade, or pure white. */
export type PairEndpoint = [DesignerIntent, Shade] | 'white'

/** A pair descriptor: foreground vs background, each an intent+shade or white. */
export interface PairSpec {
  label: string
  /** The semantic tokens the endpoints were resolved from. */
  fgToken: string
  bgToken: string
  fg: PairEndpoint
  bg: PairEndpoint
}

/** Luminance of a pair endpoint under the current design. */
function endpointLum(end: PairEndpoint): number {
  if (end === 'white')
    return 1
  const [intent, shade] = end
  const { lightness, chroma, hue } = shadeColor(intent, shade)
  return oklchLuminance(lightness, chroma, hue)
}

const PRIMITIVE_REF = /^var\(--dz-colors-([a-z]+)-(\d+)\)$/
const SEMANTIC_REF = /^var\((--dz-[a-z-]+)\)$/

/**
 * Resolve a semantic token to the palette shade it references in `map`
 * (following semantic → semantic aliases). Throws on anything the designer
 * cannot retune, so a semantic-layer change fails loudly here instead of
 * silently measuring a pair the product does not ship.
 */
export function resolveSemanticEndpoint(map: Record<string, string>, token: string): PairEndpoint {
  let value = map[token]
  for (let hops = 0; value !== undefined && hops < 4; hops++) {
    if (value.replace(/\s+/g, ' ') === 'oklch(1 0 0)')
      return 'white'
    const primitive = PRIMITIVE_REF.exec(value)
    if (primitive) {
      const intent = primitive[1] as DesignerIntent
      if (!(DESIGNER_INTENTS as readonly string[]).includes(intent))
        break
      return [intent, Number(primitive[2]) as Shade]
    }
    const alias = SEMANTIC_REF.exec(value)
    if (!alias)
      break
    value = map[alias[1]!]
  }
  throw new Error(`[themeDesigner] ${token} does not resolve to a designer palette shade`)
}

function evalPairs(specs: readonly PairSpec[]): ContrastPair[] {
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

// Each readout measures a real semantic pair (UI-DZUP-UI-DESIGN-M-14): the
// shades are read from @dzup-ui/tokens' semantic maps rather than restated, so
// a pair can never report a pass for a shade the shipped token does not use.
const PAIR_TOKENS: ReadonlyArray<{ label: string, fg: string, bg: string }> = [
  { label: 'Body text', fg: '--dz-foreground', bg: '--dz-background' },
  { label: 'Muted text', fg: '--dz-muted-foreground', bg: '--dz-background' },
  { label: 'Primary solid', fg: '--dz-primary-foreground', bg: '--dz-primary' },
  { label: 'Link', fg: '--dz-link', bg: '--dz-background' },
  { label: 'Success solid', fg: '--dz-success-foreground', bg: '--dz-success' },
  { label: 'Warning solid', fg: '--dz-warning-foreground', bg: '--dz-warning' },
  { label: 'Danger solid', fg: '--dz-danger-foreground', bg: '--dz-danger' },
  { label: 'Info solid', fg: '--dz-info-foreground', bg: '--dz-info' },
]

function pairsFor(map: Record<string, string>): PairSpec[] {
  return PAIR_TOKENS.map(({ label, fg, bg }) => ({
    label,
    fgToken: fg,
    bgToken: bg,
    fg: resolveSemanticEndpoint(map, fg),
    bg: resolveSemanticEndpoint(map, bg),
  }))
}

/** The measured pairs per theme, resolved from the semantic token maps. */
export const LIGHT_PAIRS: readonly PairSpec[] = pairsFor(LIGHT_SEMANTIC_TOKENS)
export const DARK_PAIRS: readonly PairSpec[] = pairsFor(DARK_SEMANTIC_TOKENS)

const contrastLight = computed<ContrastPair[]>(() => evalPairs(LIGHT_PAIRS))
const contrastDark = computed<ContrastPair[]>(() => evalPairs(DARK_PAIRS))

/** Count of pairs (across both themes) that fail AA normal — the headline gate. */
const failingCount = computed<number>(
  () =>
    contrastLight.value.filter(p => !p.passNormal).length
    + contrastDark.value.filter(p => !p.passNormal).length,
)

// ── Curated presets ──────────────────────────────────────────────────────────
export interface ThemePreset {
  id: Exclude<ThemeRecipePresetId, 'custom'>
  name: string
  /** Swatch hue/chroma for the button (the preset's primary). */
  swatch: { hue: number, chroma: number }
  apply: () => void
}

function applyPreset(preset: Exclude<ThemeRecipePresetId, 'custom'>): void {
  replaceRecipe(createThemeRecipePreset(preset, {
    mode: recipe.mode,
    direction: recipe.direction,
    motion: recipe.motion,
  }))
}

export const PRESETS: ThemePreset[] = [
  { id: 'dzup', name: 'dzup', swatch: { hue: 260, chroma: 0.22 }, apply: () => applyPreset('dzup') },
  { id: 'emerald', name: 'Emerald', swatch: { hue: 165, chroma: 0.17 }, apply: () => applyPreset('emerald') },
  { id: 'rose', name: 'Rose', swatch: { hue: 12, chroma: 0.2 }, apply: () => applyPreset('rose') },
  { id: 'amber', name: 'Amber', swatch: { hue: 75, chroma: 0.18 }, apply: () => applyPreset('amber') },
  { id: 'slate', name: 'Slate', swatch: { hue: 235, chroma: 0.15 }, apply: () => applyPreset('slate') },
  { id: 'violet', name: 'Violet', swatch: { hue: 292, chroma: 0.2 }, apply: () => applyPreset('violet') },
  { id: 'mono', name: 'Mono', swatch: { hue: 260, chroma: 0.004 }, apply: () => applyPreset('mono') },
]

/** The current canonical recipe as a URL-safe token. */
function serialize(): string {
  return encodeThemeRecipe(recipe)
}

/** Restore a design from a `?theme=` token. Returns true if anything applied. */
function deserialize(token: string): boolean {
  try {
    replaceRecipe(decodeThemeRecipe(token))
    return true
  }
  catch {
    return false
  }
}

/**
 * Absolute shareable URL for the current design (or the bare /themes URL).
 *
 * The live origin when there is one, so a link shared from a preview deploy
 * points back at that preview. Without `window` (SSR/prerender) it falls back to
 * the canonical origin — a shared link must never carry a host we don't own.
 */
const shareUrl = computed<string>(() => {
  const base
    = typeof window !== 'undefined' ? `${window.location.origin}/themes` : `${SITE_ORIGIN}/themes`
  return themeRecipeToUrl(base, recipe)
})

function reset(): void {
  replaceRecipe(createDefaultThemeRecipe())
}

export interface UseThemeDesigner {
  palettes: Record<DesignerIntent, PaletteState>
  recipe: ThemeRecipeV1
  radiusScale: typeof radiusScale
  density: typeof density
  shadowIntensity: typeof shadowIntensity
  fontKey: typeof fontKey
  mode: typeof mode
  direction: typeof direction
  motion: typeof motion
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
  replaceRecipe: typeof replaceRecipe
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
    recipe,
    radiusScale,
    density,
    shadowIntensity,
    fontKey,
    mode,
    direction,
    motion,
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
    replaceRecipe,
    paletteChanged,
    reset,
  }
}
