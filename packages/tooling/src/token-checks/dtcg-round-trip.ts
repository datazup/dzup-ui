/**
 * DTCG ⇄ CSS round-trip gate (TASK-N2-T1)
 *
 * Proves that `dist/tokens.dtcg.json` and the shipped `--dz-*` custom
 * properties are the same token system, expressed twice.
 *
 * The export is only worth publishing if it cannot drift from the ABI. A
 * generator that runs green while emitting a colour the stylesheet does not
 * contain is worse than no export at all, because a consumer designing against
 * it would ship the wrong system and blame their own build. So this gate does
 * not check that the JSON is *well formed* — the schema does that — it checks
 * that every token means the same thing on both sides.
 *
 * ## Independence
 *
 * Everything on the reading side is implemented here rather than imported from
 * `@dzup-ui/tokens`:
 *
 *   - a minimal spec-conformant **DTCG reader** (group walk, `$type`
 *     inheritance, `{group.token}` alias resolution with cycle detection),
 *   - the **path → `--dz-*` derivation rules**, re-stated independently so a
 *     renamed group in the emitter fails here instead of silently re-labelling
 *     the ABI,
 *   - a **CSS custom-property parser** with a cascade model, and
 *   - **value parsers** for each DTCG type.
 *
 * The only things imported from the tokens package are the token maps (to
 * reconstruct the declaration blocks when `dist/` has not been built) and the
 * document builder (to prove the on-disk artifact is fresh). Mirroring the
 * parsers is deliberate: if `dtcg.ts` mis-parses a shadow, a gate that reused
 * its parser would mis-parse it identically and report success.
 *
 * ## The cascade model
 *
 * `generate.ts` writes five declaration blocks inside `@layer dz-tokens`:
 *
 *   1. `:root`                              — primitives
 *   2. `:root, [data-theme="light"]`        — light semantics
 *   3. `[data-theme="dark"]`                — dark semantics + dark shadows
 *   4. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`
 *   5. `:root`                              — component tokens
 *
 * Blocks 1, 2, 3 and 5 all have specificity (0,1,0), so **source order decides**
 * and block 5 wins every collision — including against block 3. That is not a
 * hypothetical: three `--dz-appshell-*` names are declared in both the semantic
 * and the component tier, and the component tier silently wins. The gate models
 * the real cascade rather than the intended layering, so the export always
 * describes what the browser actually computes, and reports the shadowing
 * separately against an exact-set ceiling (see `SHADOWED_ACROSS_TIERS`).
 *
 * Block 4 has specificity (0,2,0) and therefore beats block 5, which makes
 * "OS dark" and "explicit dark" two different cascades. The gate asserts the
 * two dark blocks declare the same values, which is what keeps that difference
 * invisible today.
 *
 * Usage:
 *   tsx packages/tooling/src/token-checks/dtcg-round-trip.ts
 *
 * Exit code 1 on any mismatch.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { APPSHELL_TOKENS } from '../../../tokens/src/component/appshell.js'
import { BADGE_TOKENS } from '../../../tokens/src/component/badge.js'
import { BUTTON_TOKENS } from '../../../tokens/src/component/button.js'
import { CARD_TOKENS } from '../../../tokens/src/component/card.js'
import { CONTROL_TOKENS } from '../../../tokens/src/component/control.js'
import { DIALOG_TOKENS } from '../../../tokens/src/component/dialog.js'
import { INPUT_TOKENS } from '../../../tokens/src/component/input.js'
import { PAGE_HERO_TOKENS } from '../../../tokens/src/component/pagehero.js'
import { SIDEBAR_TOKENS } from '../../../tokens/src/component/sidebar.js'
import {
  buildDtcgDocument,
  DEPRECATED_TOKENS,
  serializeDtcgDocument,
} from '../../../tokens/src/dtcg.js'
import { generateBreakpointCssVars } from '../../../tokens/src/primitives/breakpoints.js'
import { generateColorCssVars } from '../../../tokens/src/primitives/colors.js'
import { generateRadiusCssVars } from '../../../tokens/src/primitives/radius.js'
import {
  generateShadowCssVars,
  generateShadowDarkCssVars,
} from '../../../tokens/src/primitives/shadows.js'
import { generateSpacingCssVars } from '../../../tokens/src/primitives/spacing.js'
import { generateTransitionCssVars } from '../../../tokens/src/primitives/transitions.js'
import { generateTypographyCssVars } from '../../../tokens/src/primitives/typography.js'
import { generateZIndexCssVars } from '../../../tokens/src/primitives/z-index.js'
import { DARK_SEMANTIC_TOKENS } from '../../../tokens/src/semantic/dark.js'
import { LIGHT_SEMANTIC_TOKENS } from '../../../tokens/src/semantic/light.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TOKENS_PACKAGE_DIR = resolve(__dirname, '../../../tokens')
const TOKENS_CSS_PATH = resolve(TOKENS_PACKAGE_DIR, 'dist/tokens.css')
const TOKENS_DTCG_PATH = resolve(TOKENS_PACKAGE_DIR, 'dist/tokens.dtcg.json')

// --------------------------------------------------------------------------
// Ratchets
// --------------------------------------------------------------------------

/**
 * ABI names declared in **more than one tier block**, where the later block
 * silently wins. Measured, not guessed. An exact set rather than a count so a
 * new collision cannot hide behind a removed one, and so the failure names the
 * symbol instead of a number.
 *
 * These three are a real defect: `semantic/light.ts` and `semantic/dark.ts`
 * declare them, `component/appshell.ts` re-declares them later in the same
 * `@layer`, and the component value wins in every context except OS-dark. For
 * `--dz-appshell-header-border` the two disagree — the semantic tier says
 * `--dz-colors-neutral-200`, the component tier resolves to
 * `--dz-colors-neutral-300`, and neutral-300 is what ships. Fixing it is a
 * token change with a visible pixel effect, so it is reported here and
 * escalated, not silently "corrected" by this gate.
 *
 * The ceiling only ever falls.
 */
const SHADOWED_ACROSS_TIERS: readonly string[] = [
  '--dz-appshell-header-bg',
  '--dz-appshell-header-border',
  '--dz-appshell-main-bg',
]

// --------------------------------------------------------------------------
// Independent path -> ABI-name rules
// --------------------------------------------------------------------------

/**
 * Re-stated here on purpose. `dtcg.ts` emits `$extensions["com.dzup"]
 * .cssVariable` on every token; this table derives the same name from the group
 * path, and the gate asserts they agree. Two independent derivations of the ABI
 * name means an emitter that starts writing tokens under the wrong group is a
 * gate failure rather than a silent rename of somebody's custom property.
 */
const PATH_PREFIX_TO_CSS_SEGMENT: Readonly<Record<string, string>> = {
  'primitive.color': 'colors',
  'primitive.spacing': 'spacing',
  'primitive.fontFamily': 'font',
  'primitive.fontSize': 'text',
  'primitive.fontWeight': 'font',
  'primitive.lineHeight': 'leading',
  'primitive.letterSpacing': 'tracking',
  'primitive.radius': 'radius',
  'primitive.shadow': 'shadow',
  'primitive.duration': 'duration',
  'primitive.easing': 'ease',
  'primitive.transition': 'transition',
  'primitive.zIndex': 'z',
  'primitive.breakpoint': 'breakpoint',
  'semantic.light': '',
  'semantic.dark': '',
  'component.button': 'button',
  'component.control': 'control',
  'component.input': 'input',
  'component.card': 'card',
  'component.badge': 'badge',
  'component.dialog': 'dialog',
  'component.sidebar': 'sidebar',
  'component.appshell': 'appshell',
  'component.page-hero': 'page-hero',
}

/** `primitive.color.primary.500` -> `--dz-colors-primary-500`. */
function cssVariableForPath(path: string): string | null {
  const segments = path.split('.')
  if (segments.length < 3)
    return null
  const prefix = `${segments[0]}.${segments[1]}`
  const segment = PATH_PREFIX_TO_CSS_SEGMENT[prefix]
  if (segment === undefined)
    return null
  const rest = segments.slice(2).join('-')
  return segment === '' ? `--dz-${rest}` : `--dz-${segment}-${rest}`
}

// --------------------------------------------------------------------------
// Independent CSS parser
// --------------------------------------------------------------------------

interface CssDeclaration {
  readonly order: number
  readonly selector: string
  readonly atRules: readonly string[]
  readonly name: string
  readonly value: string
}

/** Strip CSS block comments. The token stylesheet has no strings to protect. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

/**
 * Collect every `--dz-*` declaration with the selector and at-rule context it
 * sits in, in source order. Deliberately a small hand-rolled scanner: pulling a
 * CSS parser in would add a dependency to a validator whose whole point is to
 * not trust the token pipeline's own machinery.
 */
export function parseCssDeclarations(css: string): CssDeclaration[] {
  const source = stripCssComments(css)
  const declarations: CssDeclaration[] = []
  const stack: string[] = []
  let prelude = ''
  let buffer = ''
  let order = 0

  const flushDeclaration = (): void => {
    const text = buffer.trim()
    buffer = ''
    if (!text.startsWith('--dz-'))
      return
    const split = text.indexOf(':')
    if (split === -1)
      return
    const name = text.slice(0, split).trim()
    const value = text.slice(split + 1).trim()
    const atRules = stack.filter(entry => entry.startsWith('@'))
    const selectors = stack.filter(entry => !entry.startsWith('@'))
    const selector = selectors[selectors.length - 1] ?? ''
    declarations.push({ order: order++, selector, atRules, name, value })
  }

  for (const char of source) {
    if (char === '{') {
      stack.push(prelude.trim().replace(/\s+/g, ' '))
      prelude = ''
      buffer = ''
      continue
    }
    if (char === '}') {
      flushDeclaration()
      stack.pop()
      prelude = ''
      continue
    }
    if (char === ';') {
      flushDeclaration()
      continue
    }
    if (stack.length === 0) {
      prelude += char
      continue
    }
    // Inside a block, text before the next `{` could still be a nested
    // selector prelude (the @layer / @media wrappers). Keep both buffers.
    buffer += char
    prelude += char
  }
  return declarations
}

const LIGHT_SELECTORS = new Set([':root', ':root, [data-theme="light"]'])
const DARK_SELECTOR = '[data-theme="dark"]'
const SYSTEM_DARK_SELECTOR = ':root:not([data-theme="light"])'
const PREFERS_DARK = '@media (prefers-color-scheme: dark)'

function isSystemDark(declaration: CssDeclaration): boolean {
  return declaration.atRules.some(rule => rule.replace(/\s+/g, ' ') === PREFERS_DARK)
}

/**
 * Apply declarations in source order. Every selector involved has specificity
 * (0,1,0), so the last declaration wins — which is exactly what the browser
 * does and is *not* what the tier layering intends.
 */
function cascade(declarations: readonly CssDeclaration[]): Map<string, string> {
  const resolved = new Map<string, string>()
  for (const declaration of [...declarations].sort((a, b) => a.order - b.order)) {
    resolved.set(declaration.name, declaration.value)
  }
  return resolved
}

export interface CssContexts {
  readonly light: Map<string, string>
  readonly dark: Map<string, string>
  readonly systemDark: Map<string, string>
  /** Names declared in more than one of the four tier blocks. */
  readonly shadowed: readonly string[]
}

function buildCssContexts(declarations: readonly CssDeclaration[]): CssContexts {
  const cascadable = declarations.filter(declaration => !isSystemDark(declaration))
  const lightDeclarations = cascadable.filter(d => LIGHT_SELECTORS.has(d.selector))
  const darkDeclarations = cascadable.filter(
    d => LIGHT_SELECTORS.has(d.selector) || d.selector === DARK_SELECTOR,
  )
  const systemDarkDeclarations = declarations.filter(
    d => isSystemDark(d) && d.selector === SYSTEM_DARK_SELECTOR,
  )

  // A name is "shadowed" when more than one **unconditional** block declares
  // it — the primitive `:root` block, the `:root, [data-theme="light"]` block
  // and the component `:root` block all apply in every context at the same
  // specificity, so a name in two of them has one declaration that can never
  // win and a reader who cannot tell which.
  //
  // The `[data-theme="dark"]` block is deliberately excluded: overriding a
  // light declaration is what a theme *is*, and the dark block's re-declaration
  // of `--dz-shadow-*` is the documented dark-elevation mechanism, not a bug.
  const unconditionalCounts = new Map<string, number>()
  for (const declaration of lightDeclarations) {
    unconditionalCounts.set(declaration.name, (unconditionalCounts.get(declaration.name) ?? 0) + 1)
  }
  const shadowed = [...unconditionalCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([name]) => name)
    .sort()

  return {
    light: cascade(lightDeclarations),
    dark: cascade(darkDeclarations),
    systemDark: cascade(systemDarkDeclarations),
    shadowed,
  }
}

/**
 * Rebuild the declaration blocks straight from the token maps, in the order
 * `generate.ts` writes them.
 *
 * `dist/` is git-ignored and CI runs `yarn validate:all` on a clean checkout
 * before* `yarn build`, so a gate that only read `dist/tokens.css` would be a
 * no-op in the job that matters most. This reconstruction keeps the gate armed
 * everywhere; where the built stylesheet exists, `checkCssReconstruction`
 * proves the two agree, which is what makes the round-trip a claim about the
 * shipped artifact rather than about the maps alone.
 */
export function declarationsFromTokenMaps(): CssDeclaration[] {
  const declarations: CssDeclaration[] = []
  let order = 0
  const push = (selector: string, atRules: string[], vars: Record<string, string>): void => {
    for (const [name, value] of Object.entries(vars)) {
      declarations.push({ order: order++, selector, atRules, name, value })
    }
  }
  const layer = ['@layer dz-tokens']
  push(':root', layer, {
    ...generateColorCssVars(),
    ...generateSpacingCssVars(),
    ...generateTypographyCssVars(),
    ...generateRadiusCssVars(),
    ...generateShadowCssVars(),
    ...generateTransitionCssVars(),
    ...generateZIndexCssVars(),
    ...generateBreakpointCssVars(),
  })
  push(':root, [data-theme="light"]', layer, LIGHT_SEMANTIC_TOKENS)
  push(DARK_SELECTOR, layer, { ...DARK_SEMANTIC_TOKENS, ...generateShadowDarkCssVars() })
  push(SYSTEM_DARK_SELECTOR, [...layer, PREFERS_DARK], {
    ...DARK_SEMANTIC_TOKENS,
    ...generateShadowDarkCssVars(),
  })
  push(':root', layer, {
    ...BUTTON_TOKENS,
    ...CONTROL_TOKENS,
    ...INPUT_TOKENS,
    ...CARD_TOKENS,
    ...BADGE_TOKENS,
    ...DIALOG_TOKENS,
    ...SIDEBAR_TOKENS,
    ...APPSHELL_TOKENS,
    ...PAGE_HERO_TOKENS,
  })
  return declarations
}

/** Follow `var(--dz-x)` chains inside one theme context. */
function resolveCssValue(
  name: string,
  context: ReadonlyMap<string, string>,
  seen: Set<string> = new Set(),
): string | null {
  if (seen.has(name))
    return null
  seen.add(name)
  const value = context.get(name)
  if (value === undefined)
    return null
  const alias = /^var\(\s*(--dz-[a-z0-9_-]+)\s*\)$/.exec(value)
  if (alias === null)
    return value
  return resolveCssValue(alias[1] as string, context, seen)
}

// --------------------------------------------------------------------------
// Independent value parsers (mirrors of the emitter's, written separately)
// --------------------------------------------------------------------------

type Canonical = unknown

const NUM = '-?(?:\\d+(?:\\.\\d+)?|\\.\\d+)'
const RE_OKLCH = new RegExp(`^oklch\\(\\s*(${NUM})\\s+(${NUM})\\s+(${NUM})\\s*(?:/\\s*(${NUM})\\s*)?\\)$`)
const RE_LENGTH = new RegExp(`^(${NUM})(px|rem)$`)
const RE_TIME = new RegExp(`^(${NUM})(ms|s)$`)
const RE_NUMBER = new RegExp(`^${NUM}$`)
const RE_BEZIER = /^cubic-bezier\(([^)]*)\)$/

function splitOutsideParens(value: string, separator: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of value) {
    if (char === '(')
      depth += 1
    else if (char === ')')
      depth -= 1
    if (depth === 0 && (separator === ',' ? char === ',' : /\s/.test(char))) {
      if (current.trim() !== '')
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

function canonicalColor(value: string): Canonical | null {
  const match = RE_OKLCH.exec(value.trim())
  if (match === null)
    return null
  const components = [Number(match[1]), Number(match[2]), Number(match[3])]
  return match[4] === undefined
    ? { colorSpace: 'oklch', components }
    : { colorSpace: 'oklch', components, alpha: Number(match[4]) }
}

function canonicalDimension(value: string): Canonical | null {
  const trimmed = value.trim()
  if (trimmed === '0')
    return { value: 0, unit: 'px' }
  const match = RE_LENGTH.exec(trimmed)
  return match === null ? null : { value: Number(match[1]), unit: match[2] }
}

function canonicalShadowLayer(layer: string): Canonical | null {
  let parts = splitOutsideParens(layer.trim(), ' ')
  let inset = false
  if (parts[0] === 'inset') {
    inset = true
    parts = parts.slice(1)
  }
  const colorSource = parts[parts.length - 1]
  if (colorSource === undefined)
    return null
  const color = canonicalColor(colorSource)
  if (color === null)
    return null
  const lengths = parts.slice(0, -1).map(canonicalDimension)
  if (lengths.includes(null))
    return null
  const zero = { value: 0, unit: 'px' }
  const shape: Record<string, Canonical> = {
    color,
    offsetX: lengths[0] ?? zero,
    offsetY: lengths[1] ?? zero,
    blur: lengths[2] ?? zero,
    spread: lengths[3] ?? zero,
  }
  if (inset)
    shape.inset = true
  return shape
}

function canonicalCssValue(type: string, value: string): Canonical | null {
  const trimmed = value.trim()
  switch (type) {
    case 'color':
      return canonicalColor(trimmed)
    case 'dimension':
      return canonicalDimension(trimmed)
    case 'duration': {
      const match = RE_TIME.exec(trimmed)
      return match === null ? null : { value: Number(match[1]), unit: match[2] }
    }
    case 'number':
    case 'fontWeight':
      return RE_NUMBER.test(trimmed) ? Number(trimmed) : null
    case 'cubicBezier': {
      const match = RE_BEZIER.exec(trimmed)
      if (match === null)
        return null
      const parts = splitOutsideParens(match[1] ?? '', ',')
      if (parts.length !== 4 || parts.some(part => !RE_NUMBER.test(part)))
        return null
      return parts.map(Number)
    }
    case 'fontFamily':
      return splitOutsideParens(trimmed, ',').map(part => part.replace(/^['"]|['"]$/g, '').trim())
    case 'shadow': {
      const layers = splitOutsideParens(trimmed, ',').map(canonicalShadowLayer)
      if (layers.length === 0 || layers.includes(null))
        return null
      return layers.length === 1 ? layers[0] : layers
    }
    default:
      return null
  }
}

/** Structural equality. Numbers compare exactly: both sides come from the same decimals. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b)
    return true
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length)
      return false
    return a.every((entry, index) => deepEqual(entry, b[index]))
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null)
    return false
  const aKeys = Object.keys(a as object).sort()
  const bKeys = Object.keys(b as object).sort()
  if (aKeys.length !== bKeys.length || aKeys.some((key, index) => key !== bKeys[index]))
    return false
  return aKeys.every(key =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  )
}

// --------------------------------------------------------------------------
// Independent DTCG reader
// --------------------------------------------------------------------------

export interface ReadToken {
  readonly path: string
  readonly type: string
  readonly rawValue: unknown
  readonly cssVariable: string | null
  readonly declaredCssValue: string | null
  readonly deprecated: string | null
  /** The export's own claim that this token resolves differently under dark. */
  readonly themeVarying: boolean
}

const DTCG_RESERVED = new Set([
  '$schema',
  '$type',
  '$value',
  '$ref',
  '$description',
  '$extensions',
  '$deprecated',
  '$extends',
  '$root',
])

interface ReaderIssue { readonly check: string, readonly message: string }

/**
 * Walk a DTCG document. Groups are objects without `$value`; `$type` is
 * inherited from the nearest ancestor that declares one; a token with no
 * resolvable `$type` is invalid per the Format module and is reported.
 */
export function readDtcgDocument(document: unknown): {
  tokens: Map<string, ReadToken>
  issues: ReaderIssue[]
} {
  const tokens = new Map<string, ReadToken>()
  const issues: ReaderIssue[] = []

  const walk = (node: unknown, path: string[], inheritedType: string | null): void => {
    if (typeof node !== 'object' || node === null || Array.isArray(node))
      return
    const record = node as Record<string, unknown>
    const declaredType = typeof record.$type === 'string' ? record.$type : null
    const effectiveType = declaredType ?? inheritedType

    if ('$value' in record) {
      const dotted = path.join('.')
      if (effectiveType === null) {
        issues.push({
          check: 'dtcg-type',
          message: `${dotted}: no $type could be resolved — the Format module makes such a token invalid`,
        })
        return
      }
      const extensions = record.$extensions as Record<string, unknown> | undefined
      const dzup = extensions?.['com.dzup'] as Record<string, unknown> | undefined
      tokens.set(dotted, {
        path: dotted,
        type: effectiveType,
        rawValue: record.$value,
        cssVariable: typeof dzup?.cssVariable === 'string' ? dzup.cssVariable : null,
        declaredCssValue: typeof dzup?.cssValue === 'string' ? dzup.cssValue : null,
        deprecated: typeof record.$deprecated === 'string' ? record.$deprecated : null,
        themeVarying: dzup?.themeVarying === true,
      })
      return
    }

    for (const [key, child] of Object.entries(record)) {
      if (DTCG_RESERVED.has(key))
        continue
      if (key.startsWith('$')) {
        issues.push({
          check: 'dtcg-name',
          message: `${[...path, key].join('.')}: token and group names must not begin with "$"`,
        })
        continue
      }
      if (key.includes('{') || key.includes('}') || key.includes('.')) {
        issues.push({
          check: 'dtcg-name',
          message: `${[...path, key].join('.')}: names must not contain "{", "}" or "."`,
        })
        continue
      }
      walk(child, [...path, key], effectiveType)
    }
  }

  walk(document, [], null)
  return { tokens, issues }
}

const ALIAS_REFERENCE = /^\{([^{}]+)\}$/

/**
 * Resolve a `$value` to a concrete value, following `{group.token}` references.
 *
 * `darkOverrides` models CSS late binding. A component token declared as
 * `var(--dz-border)` is emitted pointing at `{semantic.light.border}` because
 * the DTCG Format module has no modes, but in a dark context the browser
 * resolves `var()` against whatever the dark cascade declares. The same is true
 * one tier lower: `--dz-card-shadow` aliases the *primitive* `--dz-shadow-md`,
 * which the dark block also overrides — so the rewrite cannot be a special case
 * for the semantic tier. At every hop the gate asks "does the dark cascade
 * declare this ABI name?" and, if so, follows the dark declaration. That is
 * mechanical and derived from the export's own `cssVariable` fields, so the
 * gate performs it itself rather than trusting a hint.
 */
function resolveDtcgValue(
  token: ReadToken,
  tokens: ReadonlyMap<string, ReadToken>,
  darkOverrides: ReadonlyMap<string, ReadToken> | null,
  seen: Set<string> = new Set(),
): { value: unknown } | { error: string } {
  if (seen.has(token.path))
    return { error: `alias cycle through ${token.path}` }
  seen.add(token.path)
  if (typeof token.rawValue !== 'string')
    return { value: token.rawValue }
  const match = ALIAS_REFERENCE.exec(token.rawValue)
  if (match === null)
    return { value: token.rawValue }
  const target = match[1] as string
  let next = tokens.get(target)
  if (next === undefined)
    return { error: `alias {${target}} does not resolve to a token` }
  if (darkOverrides !== null && next.cssVariable !== null) {
    const overridden = darkOverrides.get(next.cssVariable)
    if (overridden !== undefined)
      next = overridden
  }
  return resolveDtcgValue(next, tokens, darkOverrides, seen)
}

// --------------------------------------------------------------------------
// The gate
// --------------------------------------------------------------------------

export interface RoundTripIssue {
  readonly check: string
  readonly symbol: string
  readonly message: string
}

export interface RoundTripResult {
  readonly ok: boolean
  readonly issues: readonly RoundTripIssue[]
  readonly notes: readonly string[]
  readonly stats: {
    readonly dtcgTokens: number
    readonly untyped: number
    readonly cssNamesLight: number
    readonly cssNamesDark: number
    readonly comparedLight: number
    readonly comparedDark: number
    readonly aliasesResolved: number
    readonly cssSource: 'dist/tokens.css' | 'token maps (dist not built)'
    readonly dtcgSource: 'dist/tokens.dtcg.json' | 'rebuilt in memory (dist not built)'
  }
}

interface UntypedRecord { cssVariable?: unknown, cssValue?: unknown, reason?: unknown }

export function runRoundTrip(): RoundTripResult {
  const issues: RoundTripIssue[] = []
  const notes: string[] = []
  const fail = (check: string, symbol: string, message: string): void => {
    issues.push({ check, symbol, message })
  }

  // ---- inputs -----------------------------------------------------------
  const packageJson = JSON.parse(
    readFileSync(resolve(TOKENS_PACKAGE_DIR, 'package.json'), 'utf-8'),
  ) as { version?: string }
  const rebuilt = serializeDtcgDocument(
    buildDtcgDocument({ packageVersion: packageJson.version ?? '0.0.0' }).document,
  )

  let dtcgText = rebuilt
  let dtcgSource: RoundTripResult['stats']['dtcgSource'] = 'rebuilt in memory (dist not built)'
  if (existsSync(TOKENS_DTCG_PATH)) {
    const onDisk = readFileSync(TOKENS_DTCG_PATH, 'utf-8')
    dtcgSource = 'dist/tokens.dtcg.json'
    if (onDisk !== rebuilt) {
      fail(
        'freshness',
        'dist/tokens.dtcg.json',
        'the committed export differs from a fresh build of the same token maps — '
        + 'run `yarn generate:tokens:dtcg`',
      )
    }
    dtcgText = onDisk
  }
  else {
    notes.push(
      'dist/tokens.dtcg.json is absent (dist/ is git-ignored); the round-trip ran against '
      + 'a fresh in-memory build. Run `yarn generate:tokens:dtcg` to check the shipped file.',
    )
  }

  let cssDeclarations = declarationsFromTokenMaps()
  let cssSource: RoundTripResult['stats']['cssSource'] = 'token maps (dist not built)'
  if (existsSync(TOKENS_CSS_PATH)) {
    cssSource = 'dist/tokens.css'
    const parsed = parseCssDeclarations(readFileSync(TOKENS_CSS_PATH, 'utf-8'))
    // Bind the reconstruction to the shipped artifact: if these disagree, every
    // statement this gate makes about "the shipped tokens.css" is void.
    const reconstructed = buildCssContexts(declarationsFromTokenMaps())
    const shipped = buildCssContexts(parsed)
    for (const context of ['light', 'dark', 'systemDark'] as const) {
      const a = reconstructed[context]
      const b = shipped[context]
      for (const [name, value] of a) {
        const other = b.get(name)
        if (other === undefined) {
          fail('css-reconstruction', name, `present in the token maps, absent from dist/tokens.css (${context})`)
        }
        else if (other !== value) {
          fail(
            'css-reconstruction',
            name,
            `token maps say "${value}", dist/tokens.css says "${other}" (${context})`,
          )
        }
      }
      for (const name of b.keys()) {
        if (!a.has(name)) {
          fail('css-reconstruction', name, `present in dist/tokens.css, absent from the token maps (${context})`)
        }
      }
    }
    cssDeclarations = parsed
  }
  else {
    notes.push(
      'dist/tokens.css is absent (dist/ is git-ignored, and CI runs validate:all before build); '
      + 'the declaration blocks were reconstructed from the token maps in the order generate.ts '
      + 'writes them. Run `yarn tokens:generate` to compare against the shipped stylesheet.',
    )
  }

  const css = buildCssContexts(cssDeclarations)

  // ---- the two dark cascades must agree --------------------------------
  for (const [name, value] of css.systemDark) {
    const explicit = css.dark.get(name)
    const explicitDeclared = cssDeclarations
      .filter(d => !isSystemDark(d) && d.selector === DARK_SELECTOR && d.name === name)
      .map(d => d.value)[0]
    if (explicitDeclared === undefined) {
      fail(
        'dark-parity',
        name,
        'declared in the prefers-color-scheme block but not in [data-theme="dark"] — '
        + 'OS dark and explicit dark would diverge',
      )
    }
    else if (explicitDeclared !== value) {
      fail(
        'dark-parity',
        name,
        `prefers-color-scheme block says "${value}", [data-theme="dark"] says "${explicitDeclared}"`,
      )
    }
    if (explicit === undefined) {
      fail('dark-parity', name, 'resolves in the OS-dark cascade but not in the explicit-dark cascade')
    }
  }

  // ---- cross-tier shadowing ratchet ------------------------------------
  const ceiling = new Set(SHADOWED_ACROSS_TIERS)
  for (const name of css.shadowed) {
    if (!ceiling.has(name)) {
      fail(
        'tier-shadowing',
        name,
        'declared in two tier blocks; the later block silently wins. Either remove the '
        + 'duplicate declaration or, if it is deliberate, add it to SHADOWED_ACROSS_TIERS '
        + 'with the reason — the ceiling only falls',
      )
    }
  }
  const shadowedNow = new Set(css.shadowed)
  for (const name of ceiling) {
    if (!shadowedNow.has(name)) {
      notes.push(`tier-shadowing ceiling can be lowered: ${name} is no longer shadowed`)
    }
  }

  // ---- read the export --------------------------------------------------
  const parsedDocument = JSON.parse(dtcgText) as Record<string, unknown>
  const { tokens, issues: readerIssues } = readDtcgDocument(parsedDocument)
  for (const issue of readerIssues) fail(issue.check, issue.message.split(':')[0] ?? '?', issue.message)

  const rootExtensions = (parsedDocument.$extensions as Record<string, unknown> | undefined)?.['com.dzup'] as
    | Record<string, unknown>
    | undefined
  const untypedRaw = (rootExtensions?.untyped ?? {}) as Record<string, UntypedRecord>

  /** ABI name -> the `semantic.dark.*` token that redeclares it. */
  const darkOverrides = new Map<string, ReadToken>()
  for (const token of tokens.values()) {
    if (token.path.startsWith('semantic.dark.') && token.cssVariable !== null) {
      darkOverrides.set(token.cssVariable, token)
    }
  }

  // ---- path <-> ABI name ------------------------------------------------
  for (const token of tokens.values()) {
    const derived = cssVariableForPath(token.path)
    if (derived === null) {
      fail('path-mapping', token.path, 'no declared path→CSS-variable rule covers this group path')
      continue
    }
    if (token.cssVariable === null) {
      fail('path-mapping', token.path, 'token carries no $extensions["com.dzup"].cssVariable')
      continue
    }
    if (token.cssVariable !== derived) {
      fail(
        'path-mapping',
        token.path,
        `declares cssVariable "${token.cssVariable}" but its group path derives "${derived}"`,
      )
    }
  }

  // ---- aliases are preserved, not resolved ------------------------------
  let aliasesResolved = 0
  for (const token of tokens.values()) {
    const declared = token.declaredCssValue
    const isCssAlias = declared !== null && /^var\(\s*--dz-[a-z0-9_-]+\s*\)$/.test(declared)
    const isDtcgAlias = typeof token.rawValue === 'string' && ALIAS_REFERENCE.test(token.rawValue)
    if (isCssAlias && !isDtcgAlias) {
      fail(
        'alias-preservation',
        token.cssVariable ?? token.path,
        `CSS declares "${declared}" but the export inlined a resolved value instead of a `
        + '{group.token} reference',
      )
    }
    if (isDtcgAlias) {
      aliasesResolved += 1
      const resolution = resolveDtcgValue(token, tokens, null)
      if ('error' in resolution) {
        fail('alias-preservation', token.cssVariable ?? token.path, resolution.error)
      }
    }
  }

  // ---- name coverage + value equality, per theme context ----------------
  interface ContextSpec {
    readonly name: 'light' | 'dark'
    readonly cssContext: ReadonlyMap<string, string>
    readonly darkOverrides: ReadonlyMap<string, ReadToken> | null
    readonly excludedPrefix: string
  }
  const contexts: readonly ContextSpec[] = [
    { name: 'light', cssContext: css.light, darkOverrides: null, excludedPrefix: 'semantic.dark.' },
    { name: 'dark', cssContext: css.dark, darkOverrides, excludedPrefix: 'semantic.light.' },
  ]

  let comparedLight = 0
  let comparedDark = 0

  for (const context of contexts) {
    // The effective DTCG set for a context: every token except the other
    // theme's semantic group, applied in tier order so the later tier wins the
    // same way the stylesheet's later block does.
    const effective = new Map<string, ReadToken>()
    const tierRank = (path: string): number => {
      if (path.startsWith('primitive.'))
        return 0
      if (path.startsWith('semantic.light.'))
        return 1
      if (path.startsWith('semantic.dark.'))
        return 2
      return 3
    }
    const ordered = [...tokens.values()]
      .filter(token => !token.path.startsWith(context.excludedPrefix))
      .sort((a, b) => tierRank(a.path) - tierRank(b.path))
    for (const token of ordered) {
      if (token.cssVariable !== null)
        effective.set(token.cssVariable, token)
    }
    const untypedNames = new Map<string, UntypedRecord>()
    for (const [path, record] of Object.entries(untypedRaw)) {
      if (path.startsWith(context.excludedPrefix))
        continue
      if (typeof record.cssVariable === 'string')
        untypedNames.set(record.cssVariable, record)
    }

    // Coverage — a name on one side and not the other is a named failure.
    for (const name of context.cssContext.keys()) {
      if (!effective.has(name) && !untypedNames.has(name)) {
        fail(
          'coverage',
          name,
          `declared in tokens.css (${context.name}) but absent from the DTCG export and from `
          + '$extensions["com.dzup"].untyped',
        )
      }
    }
    for (const name of effective.keys()) {
      if (!context.cssContext.has(name)) {
        fail('coverage', name, `exported as a DTCG token but not declared in tokens.css (${context.name})`)
      }
    }
    for (const [name, record] of untypedNames) {
      if (!context.cssContext.has(name)) {
        fail('coverage', name, `recorded as untyped but not declared in tokens.css (${context.name})`)
        continue
      }
      const declared = context.cssContext.get(name)
      if (typeof record.cssValue === 'string' && record.cssValue !== declared) {
        fail(
          'untyped-value',
          name,
          `untyped record says "${String(record.cssValue)}", tokens.css (${context.name}) declares "${declared}"`,
        )
      }
      if (typeof record.reason !== 'string' || record.reason.trim() === '') {
        fail('untyped-value', name, 'untyped record carries no reason')
      }
    }

    // Value equality — resolve both sides, compare structurally.
    for (const [name, token] of effective) {
      const resolution = resolveDtcgValue(token, tokens, context.darkOverrides)
      if ('error' in resolution) {
        fail('value', name, `${context.name}: ${resolution.error}`)
        continue
      }
      const cssResolved = resolveCssValue(name, context.cssContext)
      if (cssResolved === null) {
        fail('value', name, `${context.name}: the CSS value could not be resolved (cycle or missing target)`)
        continue
      }
      const cssCanonical = canonicalCssValue(token.type, cssResolved)
      if (cssCanonical === null) {
        fail(
          'value',
          name,
          `${context.name}: tokens.css resolves to "${cssResolved}", which cannot be read as a `
          + `DTCG ${token.type} — the export claims a type the stylesheet does not carry`,
        )
        continue
      }
      if (!deepEqual(resolution.value, cssCanonical)) {
        fail(
          'value',
          name,
          `${context.name}: export resolves to ${JSON.stringify(resolution.value)} but tokens.css `
          + `resolves to ${JSON.stringify(cssCanonical)} (from "${cssResolved}")`,
        )
        continue
      }
      if (context.name === 'light')
        comparedLight += 1
      else comparedDark += 1
    }
  }

  // ---- the themeVarying flag must be true iff the value actually varies ----
  //
  // This flag is advice to a consumer resolving the export for dark, so a false
  // negative is the dangerous direction: it tells a design tool a component
  // token is theme-stable when the browser will compute something else. It is
  // checked against the two cascades rather than against the emitter's rule.
  for (const token of tokens.values()) {
    if (!token.path.startsWith('component.') || token.cssVariable === null)
      continue
    const lightValue = resolveCssValue(token.cssVariable, css.light)
    const darkValue = resolveCssValue(token.cssVariable, css.dark)
    const varies = lightValue !== darkValue
    if (varies && !token.themeVarying) {
      fail(
        'theme-varying',
        token.cssVariable,
        `resolves to "${String(lightValue)}" in light and "${String(darkValue)}" in dark, but the `
        + 'export does not flag it themeVarying',
      )
    }
    if (!varies && token.themeVarying) {
      fail(
        'theme-varying',
        token.cssVariable,
        'flagged themeVarying but resolves identically in both cascades',
      )
    }
  }

  // ---- the declared CSS value on each token must match the stylesheet ----
  for (const token of tokens.values()) {
    if (token.cssVariable === null || token.declaredCssValue === null)
      continue
    const source = token.path.startsWith('semantic.dark.') ? css.dark : css.light
    // Only the block that owns the token is authoritative; a shadowed name is
    // reported by the ratchet above, not counted twice here.
    const declared = cssDeclarations
      .filter(d => !isSystemDark(d) && d.name === token.cssVariable)
      .map(d => d.value)
    if (!declared.includes(token.declaredCssValue)) {
      fail(
        'declared-value',
        token.cssVariable,
        `$extensions says the stylesheet declares "${token.declaredCssValue}", but tokens.css `
        + `declares ${declared.map(value => `"${value}"`).join(' / ') || '(nothing)'}`,
      )
    }
    if (!source.has(token.cssVariable)) {
      fail('declared-value', token.cssVariable, 'exported token has no declaration in its own theme context')
    }
  }

  // ---- deprecation table cannot rot ------------------------------------
  for (const name of Object.keys(DEPRECATED_TOKENS)) {
    if (!css.light.has(name)) {
      fail(
        'deprecation',
        name,
        'listed in DEPRECATED_TOKENS but no longer declared in tokens.css — remove the entry',
      )
      continue
    }
    const token = [...tokens.values()].find(entry => entry.cssVariable === name)
    if (token !== undefined && token.deprecated === null) {
      fail('deprecation', name, 'listed in DEPRECATED_TOKENS but exported without $deprecated')
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    notes,
    stats: {
      dtcgTokens: tokens.size,
      untyped: Object.keys(untypedRaw).length,
      cssNamesLight: css.light.size,
      cssNamesDark: css.dark.size,
      comparedLight,
      comparedDark,
      aliasesResolved,
      cssSource,
      dtcgSource,
    },
  }
}

function main(): void {
  const result = runRoundTrip()
  const { stats } = result

  for (const note of result.notes) console.warn(`note: ${note}`)

  if (result.ok) {
    console.warn(
      `DTCG round-trip passed — ${stats.dtcgTokens} typed tokens + ${stats.untyped} untyped, `
      + `${stats.aliasesResolved} aliases preserved; `
      + `${stats.comparedLight} light and ${stats.comparedDark} dark values matched against `
      + `${stats.cssNamesLight}/${stats.cssNamesDark} declared custom properties`,
    )
    console.warn(`  CSS read from:  ${stats.cssSource}`)
    console.warn(`  DTCG read from: ${stats.dtcgSource}`)
    console.warn(
      `  cross-tier shadowing: ${SHADOWED_ACROSS_TIERS.length} at ceiling `
      + `(${SHADOWED_ACROSS_TIERS.join(', ')}) — reported, not failed; see the file header`,
    )
    process.exit(0)
  }

  const byCheck = new Map<string, RoundTripIssue[]>()
  for (const issue of result.issues) {
    byCheck.set(issue.check, [...(byCheck.get(issue.check) ?? []), issue])
  }
  console.error(`DTCG round-trip FAILED — ${result.issues.length} issue(s)\n`)
  for (const [check, entries] of [...byCheck.entries()].sort()) {
    console.error(`  [${check}] ${entries.length}`)
    for (const entry of entries) console.error(`    ${entry.symbol}: ${entry.message}`)
    console.error('')
  }
  console.error('The --dz-* custom properties are the ABI; dist/tokens.dtcg.json is a projection of')
  console.error('them. A mismatch means the export describes a system this package does not ship.')
  console.error('Regenerate with `yarn generate:tokens:dtcg`, or fix the emitter in')
  console.error('packages/tokens/src/dtcg.ts. Never edit dist/tokens.dtcg.json by hand.\n')
  process.exit(1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
