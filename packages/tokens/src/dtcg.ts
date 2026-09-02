/**
 * DTCG 2025.10 projection of the dzup-ui token maps (TASK-N2-T1)
 *
 * This module is a **projection**, not a second token system. It reads the same
 * `Record<cssVariableName, cssValue>` maps that `generate.ts` turns into
 * `dist/tokens.css`, and re-expresses them in the Design Tokens Community Group
 * Format module, version **2025.10** (Stable, published 2025-10-28).
 *
 * ## The contract this file encodes
 *
 *   - `--dz-*` CSS custom properties are the **runtime ABI**. They are what
 *     components read, what consumers override, and what semver governs.
 *   - The DTCG JSON is the **interchange format**. It exists so Tokens Studio,
 *     Style Dictionary v5, Terrazzo and Figma-adjacent tooling can read the
 *     system without re-typing it. It is derived; it never decides.
 *
 * Consequences, applied throughout:
 *
 *   1. **No token is renamed to suit DTCG.** Every emitted token carries its
 *      exact `--dz-*` name in `$extensions["com.dzup"].cssVariable`, and the
 *      group path is mechanically reversible to that name (see
 *      `CSS_VARIABLE_RULES`). A round-trip gate re-derives both directions.
 *   2. **A value that DTCG cannot express is not given a fake `$type`.** The
 *      spec has no type for `em` letter-spacing, a CSS `transition` shorthand,
 *      `clamp()`, `100vw`, a multi-layer gradient or the `none` keyword. Those
 *      tokens are *not* emitted as typed tokens (a token whose `$type` cannot be
 *      resolved is invalid per the Format module); they are recorded in
 *      `$extensions["com.dzup"].untyped` with their reason, and the round-trip
 *      gate still checks their value against the shipped CSS. Nothing is
 *      silently dropped.
 *   3. **`$type` is never guessed from a value.** The Format module says tools
 *      "MUST NOT attempt to guess the type of a token by inspecting the contents
 *      of its value". Primitive groups declare their type; the semantic tier is
 *      declared `color` (asserted); component literals are typed by the declared
 *      name rules in `COMPONENT_TYPE_RULES`; aliases inherit their target's type.
 *      A value that does not fit its declared type is *reported* as untyped,
 *      never retyped to fit.
 *   4. **Aliases are preserved, not resolved.** `var(--dz-colors-primary-500)`
 *      becomes `"{primitive.color.primary.500}"`.
 *   5. **Output is deterministic and timestamp-free.** No date, no commit, no
 *      host path. Freshness is proven by regeneration + diff
 *      (`yarn validate:tokens:dtcg`), the same discipline `design-md-check.ts`
 *      uses for DESIGN.md.
 *
 * ## Themes
 *
 * The Format module has no modes/themes concept (the technical-reports index
 * lists only Format editions; there is no Resolver module there). dzup-ui's two
 * themes are therefore emitted as two sibling groups, `semantic.light` and
 * `semantic.dark`, mirroring the two CSS declaration blocks exactly:
 * `semantic.dark` also carries the eight `--dz-shadow-*` values the dark block
 * overrides, because that is what the shipped CSS does.
 *
 * Component-tier tokens alias into `semantic.light` (the `:root` default),
 * because the component `:root` block is theme-agnostic and resolves late. Any
 * component token whose resolved value actually differs between the two
 * cascades is flagged `$extensions["com.dzup"].themeVarying` — including ones
 * that alias a *primitive* the dark block overrides, such as `--dz-card-shadow`
 * → `--dz-shadow-md`. The round-trip gate models the same late binding by
 * following the dark declaration of any ABI name the dark cascade redeclares,
 * and it independently re-derives the `themeVarying` flags from the two
 * cascades so the export cannot claim a token is theme-stable when it is not.
 */

import { APPSHELL_TOKENS } from './component/appshell.js'
import { BADGE_TOKENS } from './component/badge.js'
import { BUTTON_TOKENS } from './component/button.js'
import { CARD_TOKENS } from './component/card.js'
import { CONTROL_TOKENS } from './component/control.js'
import { DIALOG_TOKENS } from './component/dialog.js'
import { INPUT_TOKENS } from './component/input.js'
import { PAGE_HERO_TOKENS } from './component/pagehero.js'
import { SIDEBAR_TOKENS } from './component/sidebar.js'
import { generateBreakpointCssVars } from './primitives/breakpoints.js'
import { generateColorCssVars } from './primitives/colors.js'
import { generateRadiusCssVars } from './primitives/radius.js'
import { generateShadowCssVars, generateShadowDarkCssVars } from './primitives/shadows.js'
import { generateSpacingCssVars } from './primitives/spacing.js'
import { generateTransitionCssVars } from './primitives/transitions.js'
import {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LETTER_SPACINGS,
  LINE_HEIGHTS,
} from './primitives/typography.js'
import { generateZIndexCssVars } from './primitives/z-index.js'
import { DARK_SEMANTIC_TOKENS } from './semantic/dark.js'
import { LIGHT_SEMANTIC_TOKENS } from './semantic/light.js'

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

/** The DTCG Format module edition this projection targets. */
export const DTCG_SPEC_VERSION = '2025.10'

/** Published JSON Schema for that edition. Emitted as the document's `$schema`. */
export const DTCG_SCHEMA_URL = 'https://www.designtokens.org/schemas/2025.10/format.json'

/**
 * Reverse-DNS `$extensions` namespace. The Format module recommends reverse
 * domain name notation and requires tools to preserve extension data they do
 * not understand, which is what makes this a safe place for the untyped set.
 */
export const DZUP_EXTENSION_NS = 'com.dzup'

/** Prefix every dzup-ui custom property carries. This is the ABI's namespace. */
export const CSS_VARIABLE_PREFIX = '--dz-'

/** Path of the emitted artifact, relative to the package root. */
export const DTCG_OUTPUT_RELATIVE_PATH = 'dist/tokens.dtcg.json'

/** A whole-value reference to another dzup-ui custom property. */
const ALIAS_PATTERN = /^var\(\s*(--dz-[a-z0-9_-]+)\s*\)$/

/**
 * DTCG token/group name rule from the Format module:
 * must not start with `$`, and must never contain `{`, `}` or `.`.
 */
const DTCG_NAME_PATTERN = /^[^${}.][^{}.]*$/

// --------------------------------------------------------------------------
// Value types (the subset of DTCG types this system actually produces)
// --------------------------------------------------------------------------

export type DtcgTypeName
  = | 'color'
    | 'dimension'
    | 'fontFamily'
    | 'fontWeight'
    | 'duration'
    | 'cubicBezier'
    | 'number'
    | 'shadow'

export interface DtcgColorValue {
  readonly colorSpace: 'oklch'
  readonly components: readonly [number, number, number]
  readonly alpha?: number
}

export interface DtcgDimensionValue {
  readonly value: number
  readonly unit: 'px' | 'rem'
}

export interface DtcgDurationValue {
  readonly value: number
  readonly unit: 'ms' | 's'
}

export type DtcgCubicBezierValue = readonly [number, number, number, number]

export interface DtcgShadowLayer {
  readonly color: DtcgColorValue
  readonly offsetX: DtcgDimensionValue
  readonly offsetY: DtcgDimensionValue
  readonly blur: DtcgDimensionValue
  readonly spread: DtcgDimensionValue
  readonly inset?: boolean
}

export type DtcgShadowValue = DtcgShadowLayer | readonly DtcgShadowLayer[]

export type DtcgConcreteValue
  = | DtcgColorValue
    | DtcgDimensionValue
    | DtcgDurationValue
    | DtcgCubicBezierValue
    | DtcgShadowValue
    | readonly string[]
    | number

/** `$value` as emitted: either a concrete value or a `{group.token}` alias. */
export type DtcgValue = DtcgConcreteValue | string

export interface DtcgTokenExtensions {
  /** The exact `--dz-*` custom property this token projects. The ABI name. */
  readonly cssVariable: string
  /** The exact value string `dist/tokens.css` declares for it. */
  readonly cssValue: string
  /**
   * Present on a component-tier token whose alias target has a different value
   * in the dark theme. Consumers resolving for dark must follow the dark
   * semantic group instead.
   */
  readonly themeVarying?: true
}

export interface DtcgToken {
  readonly $type: DtcgTypeName
  readonly $value: DtcgValue
  readonly $deprecated?: string
  readonly $extensions: { readonly [DZUP_EXTENSION_NS]: DtcgTokenExtensions }
}

export interface DtcgGroup {
  readonly $description?: string
  readonly [name: string]: DtcgGroup | DtcgToken | string | undefined
}

/** A token the DTCG Format module cannot express without inventing a type. */
export interface UntypedTokenRecord {
  /** The group path this token would have occupied. */
  readonly path: string
  readonly cssVariable: string
  readonly cssValue: string
  /** Why no `$type` fits. Never a workaround; always a reason. */
  readonly reason: string
}

// --------------------------------------------------------------------------
// Value parsing — CSS value string -> DTCG value, or a reason it cannot be one
// --------------------------------------------------------------------------

export type ParseOutcome
  = | { readonly ok: true, readonly value: DtcgConcreteValue }
    | { readonly ok: false, readonly reason: string }

// Written without an ambiguous `\d+\.?\d*` alternation: that form lets the two
// quantifiers exchange characters, which is a super-linear-backtracking hazard
// the lint config rejects (and a real one — these run over every token value).
const NUMBER_SOURCE = '-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)'
const OKLCH_PATTERN = new RegExp(
  `^oklch\\(\\s*(${NUMBER_SOURCE})\\s+(${NUMBER_SOURCE})\\s+(${NUMBER_SOURCE})\\s*(?:/\\s*(${NUMBER_SOURCE})\\s*)?\\)$`,
)
const DIMENSION_PATTERN = new RegExp(`^(${NUMBER_SOURCE})(px|rem)$`)
/** Only the unit is captured — this pattern exists to *name* a rejected unit. */
const UNIT_PATTERN = new RegExp(`^${NUMBER_SOURCE}([a-z%]+)$`)
const DURATION_PATTERN = new RegExp(`^(${NUMBER_SOURCE})(ms|s)$`)
const PLAIN_NUMBER_PATTERN = new RegExp(`^${NUMBER_SOURCE}$`)
const CUBIC_BEZIER_PATTERN = /^cubic-bezier\(([^)]*)\)$/

/**
 * Split on commas that are not inside parentheses. CSS colour functions and
 * `clamp()` both nest commas, so a naive `split(',')` shreds them.
 */
function splitTopLevel(value: string, separator: ','): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of value) {
    if (char === '(')
      depth += 1
    if (char === ')')
      depth -= 1
    if (char === separator && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (current.trim() !== '')
    parts.push(current.trim())
  return parts
}

/** Split on whitespace that is not inside parentheses. */
function splitTopLevelSpace(value: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of value) {
    if (char === '(')
      depth += 1
    if (char === ')')
      depth -= 1
    if (/\s/.test(char) && depth === 0) {
      if (current !== '')
        parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (current !== '')
    parts.push(current)
  return parts
}

/**
 * `oklch(L C H)` / `oklch(L C H / A)` -> a DTCG `color`.
 *
 * The numbers are taken **exactly as the CSS ships them**. `formatOklch()`
 * rounds to 3/4/1 decimals before writing the stylesheet, so the shipped string
 * — not the higher-precision float behind it — is what a consumer of the
 * interchange file must reproduce. Re-deriving from `PALETTE_CONFIGS` would put
 * `0.026400000000000003` in the JSON for a colour the browser renders as
 * `0.0264`, and the round-trip gate would be comparing the export against a
 * value the stylesheet does not contain.
 */
export function parseOklchColor(value: string): ParseOutcome {
  const match = OKLCH_PATTERN.exec(value.trim())
  if (!match)
    return { ok: false, reason: `not an oklch() literal: ${value}` }
  const [, lRaw, cRaw, hRaw, aRaw] = match
  const lightness = Number(lRaw)
  const chroma = Number(cRaw)
  const hue = Number(hRaw)
  if (lightness < 0 || lightness > 1) {
    return { ok: false, reason: `oklch lightness ${lightness} outside DTCG range [0,1]` }
  }
  if (chroma < 0)
    return { ok: false, reason: `oklch chroma ${chroma} below DTCG minimum 0` }
  if (hue < 0 || hue >= 360) {
    return { ok: false, reason: `oklch hue ${hue} outside DTCG range [0,360)` }
  }
  // `alpha` is optional and defaults to 1; omitting it keeps the export terse
  // and matches what the CSS says when there is no `/ a` component.
  if (aRaw === undefined) {
    return { ok: true, value: { colorSpace: 'oklch', components: [lightness, chroma, hue] } }
  }
  const alpha = Number(aRaw)
  if (alpha < 0 || alpha > 1) {
    return { ok: false, reason: `alpha ${alpha} outside DTCG range [0,1]` }
  }
  return { ok: true, value: { colorSpace: 'oklch', components: [lightness, chroma, hue], alpha } }
}

/**
 * A CSS length -> a DTCG `dimension`. Only `px` and `rem` exist in the spec.
 *
 * A bare `0` is accepted as `0px`: CSS treats an unitless zero as a length, and
 * the token maps are inconsistent about it (`--dz-spacing-0` ships `0px`,
 * `--dz-radius-none` ships `0`). Normalising here rather than editing the maps
 * keeps the CSS byte-identical, which this task requires.
 */
export function parseDimension(value: string): ParseOutcome {
  const trimmed = value.trim()
  if (trimmed === '0')
    return { ok: true, value: { value: 0, unit: 'px' } }
  const match = DIMENSION_PATTERN.exec(trimmed)
  if (match) {
    const unit = match[2] === 'px' ? 'px' : 'rem'
    return { ok: true, value: { value: Number(match[1]), unit } }
  }
  const unitMatch = UNIT_PATTERN.exec(trimmed)
  if (unitMatch) {
    return {
      ok: false,
      reason: `unit "${unitMatch[1]}" has no DTCG dimension equivalent (spec allows px and rem only)`,
    }
  }
  return { ok: false, reason: `not a CSS length: ${trimmed}` }
}

/** A CSS time -> a DTCG `duration`. */
export function parseDuration(value: string): ParseOutcome {
  const match = DURATION_PATTERN.exec(value.trim())
  if (!match)
    return { ok: false, reason: `not a CSS time: ${value}` }
  const unit = match[2] === 'ms' ? 'ms' : 's'
  return { ok: true, value: { value: Number(match[1]), unit } }
}

/** A plain JSON number (`number` type: z-index, line height, opacity). */
export function parseNumber(value: string): ParseOutcome {
  const trimmed = value.trim()
  if (!PLAIN_NUMBER_PATTERN.test(trimmed)) {
    return { ok: false, reason: `not a unitless number: ${trimmed}` }
  }
  return { ok: true, value: Number(trimmed) }
}

/** A numeric font weight in the DTCG range [1,1000]. */
export function parseFontWeight(value: string): ParseOutcome {
  const parsed = parseNumber(value)
  if (!parsed.ok)
    return parsed
  const weight = parsed.value as number
  if (!Number.isInteger(weight) || weight < 1 || weight > 1000) {
    return { ok: false, reason: `font weight ${weight} outside DTCG range [1,1000]` }
  }
  return { ok: true, value: weight }
}

/** `cubic-bezier(a, b, c, d)` -> the DTCG four-number array. */
export function parseCubicBezier(value: string): ParseOutcome {
  const match = CUBIC_BEZIER_PATTERN.exec(value.trim())
  if (!match)
    return { ok: false, reason: `not a cubic-bezier(): ${value}` }
  const parts = splitTopLevel(match[1] ?? '', ',')
  if (parts.length !== 4) {
    return { ok: false, reason: `cubic-bezier() needs 4 arguments, got ${parts.length}` }
  }
  const numbers: number[] = []
  for (const part of parts) {
    if (!PLAIN_NUMBER_PATTERN.test(part)) {
      return { ok: false, reason: `cubic-bezier() argument "${part}" is not a number` }
    }
    numbers.push(Number(part))
  }
  const [x1, y1, x2, y2] = numbers as [number, number, number, number]
  // The spec bounds the x coordinates to [0,1]; the y coordinates are free
  // (that is what lets `--dz-ease-bounce` overshoot).
  if (x1 < 0 || x1 > 1 || x2 < 0 || x2 > 1) {
    return { ok: false, reason: `cubic-bezier x coordinates must be within [0,1]` }
  }
  return { ok: true, value: [x1, y1, x2, y2] }
}

/**
 * A CSS font stack -> the DTCG `fontFamily` array, most preferred first.
 * Quotes are stripped: the spec's value is the family *name*, not its CSS
 * serialisation, and the round-trip gate compares name arrays rather than
 * re-quoted strings so quoting style can never make the gate lie.
 */
export function parseFontFamily(value: string): ParseOutcome {
  const names = splitTopLevel(value, ',').map(part => part.replace(/^['"]|['"]$/g, '').trim())
  if (names.length === 0 || names.includes('')) {
    return { ok: false, reason: `not a font stack: ${value}` }
  }
  return { ok: true, value: names }
}

/**
 * A CSS box-shadow -> a DTCG `shadow` (one layer, or an array of them).
 *
 * `spread` is required by the schema; CSS omits it when it is zero, so an
 * absent spread becomes `0px` — the same value the browser applies.
 */
export function parseShadow(value: string): ParseOutcome {
  if (value.trim() === 'none') {
    return {
      ok: false,
      reason: 'the CSS keyword `none` — a DTCG shadow is an object with colour and offsets, '
        + 'and the Format module has no keyword type to carry "no shadow"',
    }
  }
  const layers = splitTopLevel(value, ',')
  if (layers.length === 0)
    return { ok: false, reason: `empty shadow value` }
  const parsed: DtcgShadowLayer[] = []
  for (const layer of layers) {
    const outcome = parseShadowLayer(layer)
    if (!outcome.ok)
      return outcome
    parsed.push(outcome.value as DtcgShadowLayer)
  }
  const first = parsed[0]
  if (first === undefined)
    return { ok: false, reason: `empty shadow value` }
  return { ok: true, value: parsed.length === 1 ? first : parsed }
}

function parseShadowLayer(layer: string): ParseOutcome {
  let tokens = splitTopLevelSpace(layer.trim())
  let inset = false
  if (tokens[0] === 'inset') {
    inset = true
    tokens = tokens.slice(1)
  }
  const colorSource = tokens[tokens.length - 1]
  if (colorSource === undefined)
    return { ok: false, reason: `shadow layer "${layer}" has no colour` }
  const color = parseOklchColor(colorSource)
  if (!color.ok)
    return { ok: false, reason: `shadow layer colour: ${color.reason}` }
  const lengths = tokens.slice(0, -1)
  if (lengths.length < 2 || lengths.length > 4) {
    return { ok: false, reason: `shadow layer "${layer}" has ${lengths.length} lengths, expected 2-4` }
  }
  const dimensions: DtcgDimensionValue[] = []
  for (const length of lengths) {
    const outcome = parseDimension(length)
    if (!outcome.ok)
      return { ok: false, reason: `shadow layer length: ${outcome.reason}` }
    dimensions.push(outcome.value as DtcgDimensionValue)
  }
  const zero: DtcgDimensionValue = { value: 0, unit: 'px' }
  const offsetX = dimensions[0] ?? zero
  const offsetY = dimensions[1] ?? zero
  const blur = dimensions[2] ?? zero
  const spread = dimensions[3] ?? zero
  const shadow: DtcgShadowLayer = inset
    ? { color: color.value as DtcgColorValue, offsetX, offsetY, blur, spread, inset: true }
    : { color: color.value as DtcgColorValue, offsetX, offsetY, blur, spread }
  return { ok: true, value: shadow }
}

/** Dispatch a CSS value string to the parser for a declared DTCG type. */
export function parseAs(type: DtcgTypeName, value: string): ParseOutcome {
  switch (type) {
    case 'color': return parseOklchColor(value)
    case 'dimension': return parseDimension(value)
    case 'duration': return parseDuration(value)
    case 'number': return parseNumber(value)
    case 'fontWeight': return parseFontWeight(value)
    case 'cubicBezier': return parseCubicBezier(value)
    case 'fontFamily': return parseFontFamily(value)
    case 'shadow': return parseShadow(value)
  }
}

// --------------------------------------------------------------------------
// Declared tier structure
// --------------------------------------------------------------------------

export interface PrimitiveGroupSpec {
  /** DTCG group name under `primitive`. */
  readonly group: string
  /** Segment after `--dz-` that this group's tokens carry. */
  readonly cssSegment: string
  /** Declared `$type`, or `null` when the whole group is inexpressible. */
  readonly type: DtcgTypeName | null
  /** Required when `type` is `null`. Why the spec has no home for it. */
  readonly untypedReason?: string
  readonly description: string
  /** Colour is the only two-level group (`palette` then `shade`). */
  readonly nested?: 'palette-shade'
  readonly vars: () => Record<string, string>
}

function scaleVars(prefix: string, scale: Readonly<Record<string, string>>): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [name, value] of Object.entries(scale)) vars[`${prefix}${name}`] = value
  return vars
}

/**
 * The primitive tier, in the order `generate.ts` writes it into `:root`.
 *
 * `generateTypographyCssVars()` folds five unrelated scales into one record, and
 * two of them share the `--dz-font-` prefix (families and weights). They are
 * split back apart here so each carries its own `$type`; the CSS names are
 * untouched, and the reconstruction is asserted by `validate:tokens:dtcg`.
 */
export const PRIMITIVE_GROUPS: readonly PrimitiveGroupSpec[] = [
  {
    group: 'color',
    cssSegment: 'colors',
    type: 'color',
    nested: 'palette-shade',
    description: '11-step OKLCH ramps. Intent palettes are wired to semantic roles; the decorative spectrum is not.',
    vars: generateColorCssVars,
  },
  {
    group: 'spacing',
    cssSegment: 'spacing',
    type: 'dimension',
    description: '4px-based spacing scale. Fractional steps use `_` in the CSS name (`--dz-spacing-1_5`).',
    vars: generateSpacingCssVars,
  },
  {
    group: 'fontFamily',
    cssSegment: 'font',
    type: 'fontFamily',
    description: 'Font stacks. Shares the `--dz-font-` prefix with `fontWeight`.',
    vars: () => scaleVars('--dz-font-', FONT_FAMILIES),
  },
  {
    group: 'fontSize',
    cssSegment: 'text',
    type: 'dimension',
    description: 'Type scale, emitted as `--dz-text-*`.',
    vars: () => scaleVars('--dz-text-', FONT_SIZES),
  },
  {
    group: 'fontWeight',
    cssSegment: 'font',
    type: 'fontWeight',
    description: 'Numeric OpenType weights. Shares the `--dz-font-` prefix with `fontFamily`.',
    vars: () => scaleVars('--dz-font-', FONT_WEIGHTS),
  },
  {
    group: 'lineHeight',
    cssSegment: 'leading',
    type: 'number',
    description: 'Unitless line heights — the spec names these as an example use of `number`.',
    vars: () => scaleVars('--dz-leading-', LINE_HEIGHTS),
  },
  {
    group: 'letterSpacing',
    cssSegment: 'tracking',
    type: null,
    untypedReason: 'values are in `em`; the DTCG dimension type allows only `px` and `rem`, and `em` is relative to the element\'s own font size so no lossless conversion exists',
    description: 'Letter spacing. Not expressible as a DTCG type — see $extensions["com.dzup"].untyped.',
    vars: () => scaleVars('--dz-tracking-', LETTER_SPACINGS),
  },
  {
    group: 'radius',
    cssSegment: 'radius',
    type: 'dimension',
    description: 'Corner radius scale. `--dz-radius-none` ships a unitless `0`, projected as `0px`.',
    vars: generateRadiusCssVars,
  },
  {
    group: 'shadow',
    cssSegment: 'shadow',
    type: 'shadow',
    description: 'Elevation ladder. Multi-layer shadows become DTCG shadow arrays; `--dz-shadow-none` has no DTCG form.',
    vars: generateShadowCssVars,
  },
  {
    group: 'duration',
    cssSegment: 'duration',
    type: 'duration',
    description: 'Motion durations.',
    vars: () => {
      const vars: Record<string, string> = {}
      for (const [name, value] of Object.entries(generateTransitionCssVars())) {
        if (name.startsWith('--dz-duration-'))
          vars[name] = value
      }
      return vars
    },
  },
  {
    group: 'easing',
    cssSegment: 'ease',
    type: 'cubicBezier',
    description: 'Easing curves, emitted as `--dz-ease-*`.',
    vars: () => {
      const vars: Record<string, string> = {}
      for (const [name, value] of Object.entries(generateTransitionCssVars())) {
        if (name.startsWith('--dz-ease-'))
          vars[name] = value
      }
      return vars
    },
  },
  {
    group: 'transition',
    cssSegment: 'transition',
    type: null,
    untypedReason: 'a `duration easing` value fragment meant to be pasted after a property list; the DTCG `transition` type models the CSS longhands (duration + delay + timingFunction) and cannot represent a fragment without inventing a delay',
    description: 'Duration+easing shorthands. Not expressible as a DTCG type — see $extensions["com.dzup"].untyped.',
    vars: () => {
      const vars: Record<string, string> = {}
      for (const [name, value] of Object.entries(generateTransitionCssVars())) {
        if (name.startsWith('--dz-transition-'))
          vars[name] = value
      }
      return vars
    },
  },
  {
    group: 'zIndex',
    cssSegment: 'z',
    type: 'number',
    description: 'Stacking layers, emitted as `--dz-z-*`.',
    vars: generateZIndexCssVars,
  },
  {
    group: 'breakpoint',
    cssSegment: 'breakpoint',
    type: 'dimension',
    description: 'Responsive breakpoints, exposed as tokens for programmatic access.',
    vars: generateBreakpointCssVars,
  },
]

export interface ComponentGroupSpec {
  /** DTCG group name under `component`; also the CSS segment after `--dz-`. */
  readonly group: string
  readonly description: string
  readonly tokens: Record<string, string>
}

/** The component tier, in the order `generate.ts` merges it into `:root`. */
export const COMPONENT_GROUPS: readonly ComponentGroupSpec[] = [
  { group: 'button', description: 'DzButton and its size ladder.', tokens: BUTTON_TOKENS },
  { group: 'control', description: 'Shared tokens for non-text interactive controls.', tokens: CONTROL_TOKENS },
  { group: 'input', description: 'Shared tokens for input-like components.', tokens: INPUT_TOKENS },
  { group: 'card', description: 'DzCard.', tokens: CARD_TOKENS },
  { group: 'badge', description: 'DzBadge.', tokens: BADGE_TOKENS },
  { group: 'dialog', description: 'DzDialog / modal.', tokens: DIALOG_TOKENS },
  { group: 'sidebar', description: 'DzSidebar. Carries two deprecated aliases.', tokens: SIDEBAR_TOKENS },
  { group: 'appshell', description: 'DzAppShell layout.', tokens: APPSHELL_TOKENS },
  { group: 'page-hero', description: 'Dark gradient hero band.', tokens: PAGE_HERO_TOKENS },
]

/**
 * `$type` rules for component-tier **literals**, applied in order, first match
 * wins. Name-based, never value-based: the Format module forbids inferring a
 * type from a value. A literal matching no rule is reported as untyped rather
 * than assigned a plausible one, and a literal whose value does not fit its
 * declared rule is *also* reported as untyped — the rule says what the token is
 * for*, the parser says whether DTCG can hold it, and neither overrides the
 * other.
 *
 * Aliases do not consult this table; they inherit their target's type exactly.
 */
export const COMPONENT_TYPE_RULES: readonly (readonly [RegExp, DtcgTypeName | null, string?])[] = [
  [/-font-weight$/, 'fontWeight'],
  [/-transition$/, null, 'a CSS `transition` shorthand string including property names; the DTCG `transition` type models a single property\'s duration/delay/timingFunction and cannot carry a property list'],
  [/-text-transform$/, null, 'a CSS keyword; the DTCG Format module has no keyword or string token type'],
  [/-letter-spacing$/, null, 'value is in `em`; the DTCG dimension type allows only `px` and `rem`'],
  [/-(?:gradient|overlay)$/, null, 'a multi-layer CSS gradient with `var()` fallbacks into brand-preset properties this package does not define; the DTCG `gradient` type models a single gradient\'s colour stops'],
  [/-(?:opacity|line-height|z-index)$/, 'number'],
  [/-font-family$/, 'fontFamily'],
  [/-duration$/, 'duration'],
  [/-(?:height|width|radius|padding|padding-x|padding-y|gap|font-size|size|offset|target-min|min|max-width)$/, 'dimension'],
  [/-shadow$/, 'shadow'],
  [/-(?:bg|bg-hover|border|foreground|color|text|heading|accent|scrim)$/, 'color'],
]

/**
 * Deprecated ABI names, lifted from the `@deprecated` JSDoc in
 * `component/sidebar.ts`. Declared as data here because a JSDoc comment is not
 * machine-readable; `validate:tokens:dtcg` fails if a listed name stops
 * existing, so this table cannot rot into a lie about a token that is gone.
 * It *can* fall behind a newly deprecated token — lifting `@deprecated` into
 * the token maps themselves is the durable fix and is recorded as owner work.
 */
export const DEPRECATED_TOKENS: Readonly<Record<string, string>> = {
  '--dz-sidebar-text': 'Use --dz-sidebar-foreground instead. Removed in the next major.',
  '--dz-sidebar-text-hover': 'Use --dz-sidebar-foreground-hover instead. Removed in the next major.',
}

// --------------------------------------------------------------------------
// Path <-> CSS variable name
// --------------------------------------------------------------------------

/**
 * The mechanical rule that turns a DTCG group path back into an ABI name.
 * Emitted into the document so a consumer can derive `--dz-*` names without
 * reading this file, and re-implemented independently by the round-trip gate.
 */
export interface CssVariableRule {
  readonly pathPrefix: string
  readonly cssPrefix: string
  readonly note?: string
}

export function cssVariableRules(): readonly CssVariableRule[] {
  const rules: CssVariableRule[] = []
  for (const spec of PRIMITIVE_GROUPS) {
    rules.push({
      pathPrefix: `primitive.${spec.group}`,
      cssPrefix: `${CSS_VARIABLE_PREFIX}${spec.cssSegment}`,
      ...(spec.nested === 'palette-shade'
        ? { note: 'two path segments follow (palette, shade), joined with `-`' }
        : {}),
    })
  }
  rules.push({
    pathPrefix: 'semantic.light',
    cssPrefix: CSS_VARIABLE_PREFIX,
    note: 'the `:root, [data-theme="light"]` declaration block',
  })
  rules.push({
    pathPrefix: 'semantic.dark',
    cssPrefix: CSS_VARIABLE_PREFIX,
    note: 'the `[data-theme="dark"]` declaration block; also overrides eight primitive-tier --dz-shadow-* names',
  })
  for (const spec of COMPONENT_GROUPS) {
    rules.push({
      pathPrefix: `component.${spec.group}`,
      cssPrefix: `${CSS_VARIABLE_PREFIX}${spec.group}`,
    })
  }
  return rules
}

function assertDtcgName(name: string, path: string): void {
  if (!DTCG_NAME_PATTERN.test(name)) {
    throw new Error(
      `[dtcg] "${name}" at ${path} is not a legal DTCG token/group name `
      + `(must not begin with $, must not contain { } or .)`,
    )
  }
}

// --------------------------------------------------------------------------
// Document construction
// --------------------------------------------------------------------------

interface PlannedToken {
  readonly path: string
  readonly segments: readonly string[]
  readonly cssVariable: string
  readonly cssValue: string
  /** `null` while unresolved; an alias target name when the value is `var(--dz-x)`. */
  readonly aliasTarget: string | null
  /** Declared type, or `null` when the family has no DTCG type at all. */
  readonly declaredType: DtcgTypeName | null
  readonly declaredUntypedReason?: string
}

export interface BuildOptions {
  /** Written into `$extensions["com.dzup"].version`. */
  readonly packageVersion: string
}

export interface DtcgBuildResult {
  readonly document: Record<string, unknown>
  readonly untyped: readonly UntypedTokenRecord[]
  /** Every emitted token path -> its ABI name, for the gate and for tests. */
  readonly pathToCssVariable: ReadonlyMap<string, string>
  readonly counts: {
    readonly total: number
    readonly typed: number
    readonly untyped: number
    readonly aliases: number
    readonly byType: Readonly<Record<string, number>>
  }
}

function planPrimitiveTokens(): PlannedToken[] {
  const planned: PlannedToken[] = []
  for (const spec of PRIMITIVE_GROUPS) {
    for (const [cssVariable, cssValue] of Object.entries(spec.vars())) {
      const remainder = cssVariable.slice(`${CSS_VARIABLE_PREFIX}${spec.cssSegment}-`.length)
      let segments: string[]
      if (spec.nested === 'palette-shade') {
        const split = remainder.lastIndexOf('-')
        segments = [remainder.slice(0, split), remainder.slice(split + 1)]
      }
      else {
        segments = [remainder]
      }
      const path = ['primitive', spec.group, ...segments].join('.')
      for (const segment of segments) assertDtcgName(segment, path)
      planned.push({
        path,
        segments: ['primitive', spec.group, ...segments],
        cssVariable,
        cssValue,
        aliasTarget: ALIAS_PATTERN.exec(cssValue)?.[1] ?? null,
        declaredType: spec.type,
        ...(spec.untypedReason === undefined ? {} : { declaredUntypedReason: spec.untypedReason }),
      })
    }
  }
  return planned
}

function planSemanticTokens(
  theme: 'light' | 'dark',
  source: Record<string, string>,
  shadowOverrides: Record<string, string>,
): PlannedToken[] {
  const planned: PlannedToken[] = []
  for (const [cssVariable, cssValue] of Object.entries(source)) {
    const leaf = cssVariable.slice(CSS_VARIABLE_PREFIX.length)
    const path = ['semantic', theme, leaf].join('.')
    assertDtcgName(leaf, path)
    planned.push({
      path,
      segments: ['semantic', theme, leaf],
      cssVariable,
      cssValue,
      aliasTarget: ALIAS_PATTERN.exec(cssValue)?.[1] ?? null,
      // The whole semantic tier is colour. Asserted, not assumed: a non-colour
      // value here is reported as untyped and shows up in the census.
      declaredType: 'color',
    })
  }
  for (const [cssVariable, cssValue] of Object.entries(shadowOverrides)) {
    const leaf = cssVariable.slice(CSS_VARIABLE_PREFIX.length)
    const path = ['semantic', theme, leaf].join('.')
    assertDtcgName(leaf, path)
    planned.push({
      path,
      segments: ['semantic', theme, leaf],
      cssVariable,
      cssValue,
      aliasTarget: ALIAS_PATTERN.exec(cssValue)?.[1] ?? null,
      declaredType: 'shadow',
    })
  }
  return planned
}

function componentRuleFor(cssVariable: string): {
  type: DtcgTypeName | null
  reason?: string
  matched: boolean
} {
  for (const [pattern, type, reason] of COMPONENT_TYPE_RULES) {
    if (pattern.test(cssVariable)) {
      return { type, matched: true, ...(reason === undefined ? {} : { reason }) }
    }
  }
  return { type: null, matched: false, reason: 'no declared component type rule matches this name' }
}

function planComponentTokens(): PlannedToken[] {
  const planned: PlannedToken[] = []
  for (const spec of COMPONENT_GROUPS) {
    for (const [cssVariable, cssValue] of Object.entries(spec.tokens)) {
      const leaf = cssVariable.slice(`${CSS_VARIABLE_PREFIX}${spec.group}-`.length)
      const path = ['component', spec.group, leaf].join('.')
      assertDtcgName(leaf, path)
      const aliasTarget = ALIAS_PATTERN.exec(cssValue)?.[1] ?? null
      const rule = componentRuleFor(cssVariable)
      planned.push({
        path,
        segments: ['component', spec.group, leaf],
        cssVariable,
        cssValue,
        aliasTarget,
        // Aliases inherit from their target and ignore the rule table.
        declaredType: aliasTarget === null ? rule.type : null,
        ...(aliasTarget === null && rule.reason !== undefined
          ? { declaredUntypedReason: rule.reason }
          : {}),
      })
    }
  }
  return planned
}

function setDeep(root: Record<string, unknown>, segments: readonly string[], leaf: unknown): void {
  let cursor = root
  for (const segment of segments.slice(0, -1)) {
    const next = cursor[segment]
    if (next === undefined) {
      const created: Record<string, unknown> = {}
      cursor[segment] = created
      cursor = created
    }
    else {
      cursor = next as Record<string, unknown>
    }
  }
  const last = segments[segments.length - 1]
  if (last !== undefined)
    cursor[last] = leaf
}

/**
 * Build the DTCG document from the live token maps.
 *
 * Two passes. The first plans every token (path, ABI name, raw CSS value, alias
 * target, declared type). The second resolves alias targets to paths and types
 * — which needs the whole plan, because a component token can alias a semantic
 * token that aliases a primitive.
 */
export function buildDtcgDocument(options: BuildOptions): DtcgBuildResult {
  const primitives = planPrimitiveTokens()
  const light = planSemanticTokens('light', LIGHT_SEMANTIC_TOKENS, {})
  const dark = planSemanticTokens('dark', DARK_SEMANTIC_TOKENS, generateShadowDarkCssVars())
  const components = planComponentTokens()

  // Per-tier lookup scopes. A token may only alias its own tier or a lower one;
  // a semantic token pointing at a component token would invert the cascade and
  // is rejected rather than emitted.
  const primitiveIndex = new Map<string, PlannedToken>()
  for (const token of primitives) primitiveIndex.set(token.cssVariable, token)

  const lightIndex = new Map(primitiveIndex)
  for (const token of light) lightIndex.set(token.cssVariable, token)

  const darkIndex = new Map(primitiveIndex)
  for (const token of dark) darkIndex.set(token.cssVariable, token)

  const componentIndex = new Map(lightIndex)
  for (const token of components) componentIndex.set(token.cssVariable, token)

  function scopeFor(token: PlannedToken): Map<string, PlannedToken> {
    const tier = token.segments[0]
    if (tier === 'primitive')
      return primitiveIndex
    if (tier === 'component')
      return componentIndex
    return token.segments[1] === 'dark' ? darkIndex : lightIndex
  }

  const byPath = new Map<string, PlannedToken>()
  for (const token of [...primitives, ...light, ...dark, ...components]) byPath.set(token.path, token)

  /** Walk an alias chain to the token that actually carries a literal value. */
  function terminalOf(token: PlannedToken, seen: Set<string>): PlannedToken | null {
    if (seen.has(token.path))
      return null
    seen.add(token.path)
    if (token.aliasTarget === null)
      return token
    const next = scopeFor(token).get(token.aliasTarget)
    if (next === undefined)
      return null
    return terminalOf(next, seen)
  }

  const untyped: UntypedTokenRecord[] = []
  const untypedPaths = new Set<string>()
  const document: Record<string, unknown> = {}
  const pathToCssVariable = new Map<string, string>()
  const byType: Record<string, number> = {}
  let aliases = 0

  // Pass 1 — decide, for every token, whether it is expressible and as what.
  interface Decision {
    readonly token: PlannedToken
    readonly type: DtcgTypeName | null
    readonly value: DtcgValue | null
    readonly reason?: string
  }
  const decisions: Decision[] = []
  const all = [...primitives, ...light, ...dark, ...components]

  for (const token of all) {
    // A whole family with no DTCG type stays untyped regardless of its value.
    if (token.aliasTarget === null && token.declaredType === null) {
      decisions.push({
        token,
        type: null,
        value: null,
        reason: token.declaredUntypedReason ?? 'no DTCG type declared for this family',
      })
      continue
    }

    if (token.aliasTarget !== null) {
      const target = scopeFor(token).get(token.aliasTarget)
      if (target === undefined) {
        decisions.push({
          token,
          type: null,
          value: null,
          reason: `aliases ${token.aliasTarget}, which this package does not define`,
        })
        continue
      }
      const terminal = terminalOf(token, new Set())
      if (terminal === null) {
        decisions.push({ token, type: null, value: null, reason: `alias chain is cyclic or broken` })
        continue
      }
      // The terminal's own family decides the type; if that family has no DTCG
      // type, neither does anything pointing at it.
      const terminalType = terminal.declaredType
      if (terminalType === null) {
        decisions.push({
          token,
          type: null,
          value: null,
          reason: `resolves to ${terminal.cssVariable}, which has no DTCG type`,
        })
        continue
      }
      const terminalParse = parseAs(terminalType, terminal.cssValue)
      if (!terminalParse.ok) {
        decisions.push({
          token,
          type: null,
          value: null,
          reason: `resolves to ${terminal.cssVariable}: ${terminalParse.reason}`,
        })
        continue
      }
      aliases += 1
      decisions.push({ token, type: terminalType, value: `{${target.path}}` })
      continue
    }

    const declared = token.declaredType
    if (declared === null) {
      decisions.push({ token, type: null, value: null, reason: 'no declared type' })
      continue
    }
    const parsed = parseAs(declared, token.cssValue)
    if (!parsed.ok) {
      // The declared type says what the token is *for*; the parser says whether
      // DTCG can hold this particular value. Report both, so the reason never
      // reads as though the type rule were wrong.
      decisions.push({
        token,
        type: null,
        value: null,
        reason: `declared $type "${declared}", but the value cannot be expressed: ${parsed.reason}`,
      })
      continue
    }
    decisions.push({ token, type: declared, value: parsed.value })
  }

  // Pass 2 — a token that resolves through an untyped token is itself untyped.
  const untypedByPath = new Set(
    decisions.filter(decision => decision.type === null).map(decision => decision.token.path),
  )
  let settled = false
  while (!settled) {
    settled = true
    for (const decision of decisions) {
      if (decision.type === null)
        continue
      const target = decision.token.aliasTarget
      if (target === null)
        continue
      const resolved = scopeFor(decision.token).get(target)
      if (resolved !== undefined && untypedByPath.has(resolved.path)) {
        untypedByPath.add(decision.token.path)
        settled = false
      }
    }
  }

  // Emit.
  //
  // A component token is "theme varying" when the value the browser computes
  // for it differs between the two themes. That is *not* the same as "aliases a
  // semantic token": `--dz-card-shadow` aliases the primitive `--dz-shadow-md`,
  // which the dark block also overrides, so it varies too. The flag is
  // therefore computed by walking the whole alias chain against the set of
  // names the dark cascade redeclares — which is what a consumer resolving this
  // export for dark has to do. (The round-trip gate caught the narrower
  // definition; the export must not tell a consumer a token is theme-stable
  // when it is not.)
  const darkOverriddenNames = new Set<string>([
    ...Object.keys(DARK_SEMANTIC_TOKENS),
    ...Object.keys(generateShadowDarkCssVars()),
  ])
  const themeVarying = new Set<string>()
  for (const token of components) {
    let cursor: PlannedToken | undefined = token
    const visited = new Set<string>()
    while (cursor !== undefined && !visited.has(cursor.path)) {
      visited.add(cursor.path)
      if (cursor !== token && darkOverriddenNames.has(cursor.cssVariable)) {
        themeVarying.add(token.cssVariable)
        break
      }
      if (cursor.aliasTarget === null)
        break
      cursor = componentIndex.get(cursor.aliasTarget)
    }
  }

  for (const decision of decisions) {
    const { token } = decision
    pathToCssVariable.set(token.path, token.cssVariable)
    const isUntyped = decision.type === null || untypedByPath.has(token.path)
    if (isUntyped) {
      if (!untypedPaths.has(token.path)) {
        untypedPaths.add(token.path)
        untyped.push({
          path: token.path,
          cssVariable: token.cssVariable,
          cssValue: token.cssValue,
          reason: decision.reason ?? 'resolves through a token with no DTCG type',
        })
      }
      continue
    }
    const type = decision.type as DtcgTypeName
    byType[type] = (byType[type] ?? 0) + 1
    const extensions: Record<string, unknown> = {
      cssVariable: token.cssVariable,
      cssValue: token.cssValue,
    }
    if (themeVarying.has(token.cssVariable) && token.segments[0] === 'component') {
      extensions.themeVarying = true
    }
    const deprecation = DEPRECATED_TOKENS[token.cssVariable]
    const emitted: Record<string, unknown> = {
      $type: type,
      $value: decision.value,
      ...(deprecation === undefined ? {} : { $deprecated: deprecation }),
      $extensions: { [DZUP_EXTENSION_NS]: extensions },
    }
    setDeep(document, token.segments, emitted)
  }

  // Group descriptions, written after the tokens so they sit at the top of each
  // group in the serialised output would be wrong — JSON key order follows
  // insertion, so they are injected up front instead.
  const primitiveGroup = document.primitive as Record<string, unknown> | undefined
  if (primitiveGroup !== undefined) {
    for (const spec of PRIMITIVE_GROUPS) {
      const group = primitiveGroup[spec.group] as Record<string, unknown> | undefined
      if (group !== undefined)
        primitiveGroup[spec.group] = { $description: spec.description, ...group }
    }
  }
  const componentGroup = document.component as Record<string, unknown> | undefined
  if (componentGroup !== undefined) {
    for (const spec of COMPONENT_GROUPS) {
      const group = componentGroup[spec.group] as Record<string, unknown> | undefined
      if (group !== undefined)
        componentGroup[spec.group] = { $description: spec.description, ...group }
    }
  }

  const typedCount = decisions.length - untyped.length
  const counts = {
    total: decisions.length,
    typed: typedCount,
    untyped: untyped.length,
    aliases,
    byType,
  }

  const ordered: Record<string, unknown> = {
    $schema: DTCG_SCHEMA_URL,
    $description:
      'dzup-ui design tokens, DTCG 2025.10 interchange export. The runtime ABI is the '
      + '--dz-* CSS custom properties in @dzup-ui/tokens/css; this file is a derived '
      + 'projection of the same source maps and is regenerated, never edited.',
    $extensions: {
      [DZUP_EXTENSION_NS]: {
        package: '@dzup-ui/tokens',
        version: options.packageVersion,
        specVersion: DTCG_SPEC_VERSION,
        runtimeAbi: {
          kind: 'css-custom-properties',
          prefix: CSS_VARIABLE_PREFIX,
          artifact: '@dzup-ui/tokens/css (dist/tokens.css)',
          statement:
            'The --dz-* custom properties are the stable, semver-governed runtime ABI. '
            + 'This DTCG document is interchange only: consuming it does not create a '
            + 'compatibility claim on the JSON shape, group paths or $extensions payload.',
        },
        generator: 'packages/tokens/src/generate-dtcg.ts',
        gate: 'yarn validate:tokens:dtcg',
        themes: {
          note:
            'The DTCG Format module 2025.10 has no modes/themes concept. The two dzup-ui '
            + 'themes are emitted as the sibling groups semantic.light and semantic.dark, '
            + 'mirroring the two CSS declaration blocks. semantic.dark additionally carries '
            + 'the eight --dz-shadow-* values the dark block overrides.',
          default: 'semantic.light',
          modes: { light: 'semantic.light', dark: 'semantic.dark' },
        },
        cssVariableRules: cssVariableRules(),
        coverage: counts,
        untyped: untyped.reduce<Record<string, unknown>>((accumulator, record) => {
          accumulator[record.path] = {
            cssVariable: record.cssVariable,
            cssValue: record.cssValue,
            reason: record.reason,
          }
          return accumulator
        }, {}),
      },
    },
    ...document,
  }

  return { document: ordered, untyped, pathToCssVariable, counts }
}

/** Deterministic serialisation: 2-space JSON, trailing newline, no timestamps. */
export function serializeDtcgDocument(document: Record<string, unknown>): string {
  return `${JSON.stringify(document, null, 2)}\n`
}
