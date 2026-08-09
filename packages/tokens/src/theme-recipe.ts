import type { OklchColor, PaletteConfig, Shade } from './primitives/index.js'
import {
  FONT_FAMILIES,
  formatOklch,
  generateShade,
  PALETTE_CONFIGS,
  RADIUS_SCALE,
  SHADE_STEPS,
  SHADOW_SCALE,
  SHADOW_SCALE_DARK,
  SPACING_SCALE,
} from './primitives/index.js'

/** Current public recipe version. Future versions are rejected fail-closed. */
export const THEME_RECIPE_VERSION = 1 as const

export const THEME_RECIPE_PALETTES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
] as const
export type ThemeRecipePaletteName = (typeof THEME_RECIPE_PALETTES)[number]

export const THEME_RECIPE_DENSITIES = ['compact', 'cozy', 'spacious'] as const
export type ThemeRecipeDensity = (typeof THEME_RECIPE_DENSITIES)[number]

export const THEME_RECIPE_MODES = ['light', 'dark', 'system'] as const
export type ThemeRecipeMode = (typeof THEME_RECIPE_MODES)[number]

export const THEME_RECIPE_DIRECTIONS = ['ltr', 'rtl'] as const
export type ThemeRecipeDirection = (typeof THEME_RECIPE_DIRECTIONS)[number]

export const THEME_RECIPE_MOTIONS = ['normal', 'reduced'] as const
export type ThemeRecipeMotion = (typeof THEME_RECIPE_MOTIONS)[number]

export const THEME_RECIPE_FONTS = {
  inter: FONT_FAMILIES.sans,
  system: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  geist: '"Geist", "Inter", ui-sans-serif, system-ui, sans-serif',
  rounded: '"SF Pro Rounded", "Nunito", ui-rounded, "Segoe UI", system-ui, sans-serif',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
  mono: FONT_FAMILIES.mono,
} as const
export type ThemeRecipeFontId = keyof typeof THEME_RECIPE_FONTS

export const THEME_RECIPE_PRESETS = [
  'dzup',
  'emerald',
  'rose',
  'amber',
  'slate',
  'violet',
  'mono',
  'custom',
] as const
export type ThemeRecipePresetId = (typeof THEME_RECIPE_PRESETS)[number]

/** An OKLCH palette ramp definition; utilities expand it into all 11 shades. */
export interface ThemeRecipePalette {
  hue: number
  chroma: number
}

/**
 * Public, framework-neutral theme recipe.
 *
 * The recipe stores design intent rather than DOM state. Applications own
 * reactivity and persistence, while token utilities validate, serialize and
 * expand it into CSS variables.
 */
export interface ThemeRecipeV1 {
  version: typeof THEME_RECIPE_VERSION
  preset: ThemeRecipePresetId
  palettes: Record<ThemeRecipePaletteName, ThemeRecipePalette>
  radius: number
  shadow: number
  density: ThemeRecipeDensity
  font: ThemeRecipeFontId
  mode: ThemeRecipeMode
  direction: ThemeRecipeDirection
  motion: ThemeRecipeMotion
}

export type ThemeRecipeErrorCode = 'INVALID_RECIPE' | 'UNSUPPORTED_VERSION' | 'INVALID_ENCODING'

export class ThemeRecipeError extends Error {
  readonly code: ThemeRecipeErrorCode

  constructor(code: ThemeRecipeErrorCode, message: string) {
    super(message)
    this.name = 'ThemeRecipeError'
    this.code = code
  }
}

const RECIPE_KEYS = [
  'version',
  'preset',
  'palettes',
  'radius',
  'shadow',
  'density',
  'font',
  'mode',
  'direction',
  'motion',
] as const

const DENSITY_FACTORS: Record<ThemeRecipeDensity, number> = {
  compact: 0.9,
  cozy: 1,
  spacious: 1.12,
}

const PRESET_OVERRIDES: Record<Exclude<ThemeRecipePresetId, 'custom'>, Omit<Partial<ThemeRecipeV1>, 'palettes'> & {
  palettes?: Partial<Record<ThemeRecipePaletteName, ThemeRecipePalette>>
}> = {
  dzup: {},
  emerald: {
    palettes: {
      primary: { hue: 165, chroma: 0.17 },
      neutral: { hue: 165, chroma: 0.012 },
    },
  },
  rose: {
    palettes: {
      primary: { hue: 12, chroma: 0.2 },
      neutral: { hue: 12, chroma: 0.01 },
    },
    radius: 1.4,
  },
  amber: {
    palettes: {
      primary: { hue: 75, chroma: 0.18 },
      neutral: { hue: 70, chroma: 0.012 },
    },
    radius: 0.6,
    font: 'rounded',
  },
  slate: {
    palettes: {
      primary: { hue: 235, chroma: 0.15 },
      neutral: { hue: 255, chroma: 0.018 },
    },
    radius: 0.7,
    density: 'compact',
  },
  violet: {
    palettes: {
      primary: { hue: 292, chroma: 0.2 },
    },
    radius: 1.6,
    shadow: 1.4,
  },
  mono: {
    palettes: {
      primary: { hue: 286, chroma: 0.006 },
      neutral: { hue: 286, chroma: 0.004 },
    },
    radius: 0.4,
    font: 'mono',
  },
}

function defaultPalettes(): Record<ThemeRecipePaletteName, ThemeRecipePalette> {
  return Object.fromEntries(
    THEME_RECIPE_PALETTES.map((name) => {
      const palette = PALETTE_CONFIGS[name]
      return [name, { hue: palette.hue, chroma: palette.chroma }]
    }),
  ) as Record<ThemeRecipePaletteName, ThemeRecipePalette>
}

export function createDefaultThemeRecipe(): ThemeRecipeV1 {
  return {
    version: THEME_RECIPE_VERSION,
    preset: 'dzup',
    palettes: defaultPalettes(),
    radius: 1,
    shadow: 1,
    density: 'cozy',
    font: 'inter',
    mode: 'system',
    direction: 'ltr',
    motion: 'normal',
  }
}

export function createThemeRecipePreset(
  preset: Exclude<ThemeRecipePresetId, 'custom'>,
  preferences: Partial<Pick<ThemeRecipeV1, 'mode' | 'direction' | 'motion'>> = {},
): ThemeRecipeV1 {
  const base = createDefaultThemeRecipe()
  const override = PRESET_OVERRIDES[preset]
  return normalizeThemeRecipe({
    ...base,
    ...override,
    ...preferences,
    version: THEME_RECIPE_VERSION,
    preset,
    palettes: {
      ...base.palettes,
      ...override.palettes,
    },
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every(key => keys.includes(key))
}

function isFiniteInRange(value: unknown, minimum: number, maximum: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum
}

function includesValue<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === 'string' && values.includes(value as T)
}

function validatePalette(value: unknown): value is ThemeRecipePalette {
  return isRecord(value)
    && hasOnlyKeys(value, ['hue', 'chroma'])
    && isFiniteInRange(value.hue, 0, 360)
    && isFiniteInRange(value.chroma, 0, 0.4)
}

function validatePalettes(value: unknown): value is Record<ThemeRecipePaletteName, ThemeRecipePalette> {
  if (!isRecord(value) || !hasOnlyKeys(value, THEME_RECIPE_PALETTES))
    return false
  return THEME_RECIPE_PALETTES.every(name => validatePalette(value[name]))
}

export function validateThemeRecipe(value: unknown): value is ThemeRecipeV1 {
  if (!isRecord(value) || !hasOnlyKeys(value, RECIPE_KEYS))
    return false
  return value.version === THEME_RECIPE_VERSION
    && includesValue(THEME_RECIPE_PRESETS, value.preset)
    && validatePalettes(value.palettes)
    && isFiniteInRange(value.radius, 0, 2)
    && isFiniteInRange(value.shadow, 0, 2.5)
    && includesValue(THEME_RECIPE_DENSITIES, value.density)
    && includesValue(Object.keys(THEME_RECIPE_FONTS) as ThemeRecipeFontId[], value.font)
    && includesValue(THEME_RECIPE_MODES, value.mode)
    && includesValue(THEME_RECIPE_DIRECTIONS, value.direction)
    && includesValue(THEME_RECIPE_MOTIONS, value.motion)
}

interface LegacyThemeRecipe {
  p?: Record<string, [number, number]>
  palettes?: Record<string, ThemeRecipePalette>
  r?: number
  radius?: number
  d?: string
  density?: string
  s?: number
  shadow?: number
  f?: string
  font?: string
  mode?: string
  direction?: string
  motion?: string
  preset?: string
}

function migrateLegacyThemeRecipe(value: Record<string, unknown>): ThemeRecipeV1 {
  const legacy = value as LegacyThemeRecipe
  const migrated = createDefaultThemeRecipe()
  const sourcePalettes = legacy.palettes ?? legacy.p
  if (sourcePalettes) {
    for (const name of THEME_RECIPE_PALETTES) {
      const palette = sourcePalettes[name]
      if (Array.isArray(palette)) {
        migrated.palettes[name] = { hue: palette[0], chroma: palette[1] }
      }
      else if (palette !== undefined) {
        migrated.palettes[name] = palette
      }
    }
  }
  migrated.radius = legacy.radius ?? legacy.r ?? migrated.radius
  migrated.shadow = legacy.shadow ?? legacy.s ?? migrated.shadow
  const density = legacy.density ?? legacy.d
  migrated.density = density === 'comfortable' ? 'cozy' : (density ?? migrated.density) as ThemeRecipeDensity
  migrated.font = (legacy.font ?? legacy.f ?? migrated.font) as ThemeRecipeFontId
  migrated.mode = (legacy.mode ?? migrated.mode) as ThemeRecipeMode
  migrated.direction = (legacy.direction ?? migrated.direction) as ThemeRecipeDirection
  migrated.motion = (legacy.motion ?? migrated.motion) as ThemeRecipeMotion
  migrated.preset = (legacy.preset ?? 'custom') as ThemeRecipePresetId
  return migrated
}

function cloneRecipe(recipe: ThemeRecipeV1): ThemeRecipeV1 {
  return {
    version: THEME_RECIPE_VERSION,
    preset: recipe.preset,
    palettes: Object.fromEntries(
      THEME_RECIPE_PALETTES.map(name => [name, { ...recipe.palettes[name] }]),
    ) as Record<ThemeRecipePaletteName, ThemeRecipePalette>,
    radius: recipe.radius,
    shadow: recipe.shadow,
    density: recipe.density,
    font: recipe.font,
    mode: recipe.mode,
    direction: recipe.direction,
    motion: recipe.motion,
  }
}

/** Validate, migrate a known legacy shape, and return a detached canonical recipe. */
export function normalizeThemeRecipe(value?: unknown): ThemeRecipeV1 {
  if (value === undefined || value === null)
    return createDefaultThemeRecipe()
  if (!isRecord(value))
    throw new ThemeRecipeError('INVALID_RECIPE', 'Theme recipe must be an object.')
  if ('version' in value && value.version !== THEME_RECIPE_VERSION) {
    throw new ThemeRecipeError(
      'UNSUPPORTED_VERSION',
      `Unsupported theme recipe version: ${String(value.version)}.`,
    )
  }
  const candidate = 'version' in value ? value : migrateLegacyThemeRecipe(value)
  if (!validateThemeRecipe(candidate))
    throw new ThemeRecipeError('INVALID_RECIPE', 'Theme recipe failed ThemeRecipeV1 validation.')
  return cloneRecipe(candidate)
}

function scaleLength(value: string, factor: number): string {
  const match = /^(-?[\d.]+)(rem|px|em)?$/.exec(value)
  if (!match?.[1])
    return value
  const scaled = Number.parseFloat(match[1]) * factor
  return `${Number.parseFloat(scaled.toFixed(4))}${match[2] ?? ''}`
}

function scaleShadowAlpha(shadow: string, factor: number): string {
  if (shadow === 'none')
    return shadow
  return shadow.replace(/\/\s*([\d.]+)\s*\)/g, (_match, alpha: string) => {
    const scaled = Math.min(1, Math.max(0, Number.parseFloat(alpha) * factor))
    return `/ ${Number.parseFloat(scaled.toFixed(3))})`
  })
}

export function themeRecipePaletteColor(
  recipeInput: ThemeRecipeV1,
  palette: ThemeRecipePaletteName,
  shade: Shade,
): OklchColor {
  const recipe = normalizeThemeRecipe(recipeInput)
  return generateShade(recipe.palettes[palette] satisfies PaletteConfig, shade)
}

/** Expand a recipe into a complete CSS-variable map for one resolved color mode. */
export function themeRecipeToCssVariables(
  recipeInput: ThemeRecipeV1,
  resolvedMode: Exclude<ThemeRecipeMode, 'system'>,
): Record<string, string> {
  const recipe = normalizeThemeRecipe(recipeInput)
  const variables: Record<string, string> = {}

  for (const palette of THEME_RECIPE_PALETTES) {
    for (const shade of SHADE_STEPS) {
      variables[`--dz-colors-${palette}-${shade}`]
        = formatOklch(generateShade(recipe.palettes[palette], shade))
    }
  }

  for (const [step, value] of Object.entries(RADIUS_SCALE)) {
    variables[`--dz-radius-${step}`]
      = step === 'none' || step === 'full' ? value : scaleLength(value, recipe.radius)
  }

  const shadows = resolvedMode === 'dark' ? SHADOW_SCALE_DARK : SHADOW_SCALE
  for (const [step, value] of Object.entries(shadows))
    variables[`--dz-shadow-${step}`] = scaleShadowAlpha(value, recipe.shadow)

  const densityFactor = DENSITY_FACTORS[recipe.density]
  for (const [step, value] of Object.entries(SPACING_SCALE)) {
    variables[`--dz-spacing-${step.replace('.', '_')}`] = scaleLength(value, densityFactor)
  }

  variables['--dz-font-sans'] = THEME_RECIPE_FONTS[recipe.font]
  return variables
}

export function themeRecipeToCssText(
  recipe: ThemeRecipeV1,
  resolvedMode: Exclude<ThemeRecipeMode, 'system'> = 'light',
  selector = ':root',
): string {
  const declarations = Object.entries(themeRecipeToCssVariables(recipe, resolvedMode))
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
  return `${selector} {\n${declarations}\n}`
}

export function resolveThemeRecipeMode(
  mode: ThemeRecipeMode,
  systemPrefersDark: boolean,
): Exclude<ThemeRecipeMode, 'system'> {
  return mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode
}

export interface ThemeRecipeStyleDeclaration {
  setProperty: (name: string, value: string) => void
}

export interface ThemeRecipeApplyTarget {
  style: ThemeRecipeStyleDeclaration
  setAttribute: (name: string, value: string) => void
}

/** Apply to an explicitly supplied target; this utility never reads global DOM state. */
export function applyThemeRecipe(
  target: ThemeRecipeApplyTarget,
  recipeInput: ThemeRecipeV1,
  resolvedMode: Exclude<ThemeRecipeMode, 'system'>,
): Record<string, string> {
  const recipe = normalizeThemeRecipe(recipeInput)
  const variables = themeRecipeToCssVariables(recipe, resolvedMode)
  for (const [name, value] of Object.entries(variables))
    target.style.setProperty(name, value)
  target.setAttribute('data-theme', resolvedMode)
  target.setAttribute('data-theme-mode', recipe.mode)
  target.setAttribute('data-density', recipe.density)
  target.setAttribute('data-motion-preview', recipe.motion)
  target.setAttribute('dir', recipe.direction)
  return variables
}

/** Canonical JSON with field and palette order fixed by the contract. */
export function serializeThemeRecipe(recipeInput: ThemeRecipeV1, pretty = false): string {
  const recipe = normalizeThemeRecipe(recipeInput)
  const ordered: ThemeRecipeV1 = {
    version: THEME_RECIPE_VERSION,
    preset: recipe.preset,
    palettes: Object.fromEntries(
      THEME_RECIPE_PALETTES.map(name => [name, {
        hue: recipe.palettes[name].hue,
        chroma: recipe.palettes[name].chroma,
      }]),
    ) as Record<ThemeRecipePaletteName, ThemeRecipePalette>,
    radius: recipe.radius,
    shadow: recipe.shadow,
    density: recipe.density,
    font: recipe.font,
    mode: recipe.mode,
    direction: recipe.direction,
    motion: recipe.motion,
  }
  return JSON.stringify(ordered, null, pretty ? 2 : undefined)
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function bytesToBase64(bytes: Uint8Array): string {
  let output = ''
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0
    const second = bytes[index + 1]
    const third = bytes[index + 2]
    const packed = (first << 16) | ((second ?? 0) << 8) | (third ?? 0)
    output += BASE64_ALPHABET[(packed >> 18) & 63]
    output += BASE64_ALPHABET[(packed >> 12) & 63]
    output += second === undefined ? '=' : BASE64_ALPHABET[(packed >> 6) & 63]
    output += third === undefined ? '=' : BASE64_ALPHABET[packed & 63]
  }
  return output
}

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  if (!/^[a-z0-9+/]*={0,2}$/i.test(normalized) || normalized.length % 4 === 1)
    throw new ThemeRecipeError('INVALID_ENCODING', 'Theme recipe URL token is not valid base64url.')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const bytes: number[] = []
  for (let index = 0; index < padded.length; index += 4) {
    const a = BASE64_ALPHABET.indexOf(padded[index] ?? '')
    const b = BASE64_ALPHABET.indexOf(padded[index + 1] ?? '')
    const c = padded[index + 2] === '=' ? 0 : BASE64_ALPHABET.indexOf(padded[index + 2] ?? '')
    const d = padded[index + 3] === '=' ? 0 : BASE64_ALPHABET.indexOf(padded[index + 3] ?? '')
    if (a < 0 || b < 0 || c < 0 || d < 0)
      throw new ThemeRecipeError('INVALID_ENCODING', 'Theme recipe URL token contains invalid bytes.')
    const packed = (a << 18) | (b << 12) | (c << 6) | d
    bytes.push((packed >> 16) & 255)
    if (padded[index + 2] !== '=')
      bytes.push((packed >> 8) & 255)
    if (padded[index + 3] !== '=')
      bytes.push(packed & 255)
  }
  return new Uint8Array(bytes)
}

export function encodeThemeRecipe(recipe: ThemeRecipeV1): string {
  const bytes = new TextEncoder().encode(serializeThemeRecipe(recipe))
  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeThemeRecipe(token: string): ThemeRecipeV1 {
  try {
    const json = new TextDecoder('utf-8', { fatal: true }).decode(base64ToBytes(token))
    return normalizeThemeRecipe(JSON.parse(json) as unknown)
  }
  catch (error) {
    if (error instanceof ThemeRecipeError)
      throw error
    throw new ThemeRecipeError('INVALID_ENCODING', 'Theme recipe URL token could not be decoded.')
  }
}

export function themeRecipeToUrl(
  baseUrl: string,
  recipe: ThemeRecipeV1,
  parameter = 'theme',
): string {
  const url = new URL(baseUrl)
  url.searchParams.set(parameter, encodeThemeRecipe(recipe))
  return url.toString()
}

export function themeRecipeFromUrl(
  urlValue: string,
  parameter = 'theme',
): ThemeRecipeV1 | null {
  const token = new URL(urlValue).searchParams.get(parameter)
  return token ? decodeThemeRecipe(token) : null
}
