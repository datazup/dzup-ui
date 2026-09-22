/**
 * Reading a component's declared anatomy from source (TASK-OSS-P3-02, ADR-19).
 *
 * The anatomy lives beside the component in `Dz{Name}.anatomy.ts` as
 * `export const anatomy = { … } as const satisfies ComponentAnatomy`, and the
 * ownership generator copies it into the manifest so docs, validators and the
 * capability matrix all read one declaration.
 *
 * **Why parse instead of import.** `buildOwnershipManifest` is synchronous, and
 * making it async to `await import()` each declaration would ripple through the
 * validator, the runtime-lookup emitter and every spec — for a file whose whole
 * job is to be a literal. Executing component-adjacent source inside a
 * generator also means a stray side effect becomes a generator failure.
 *
 * The parser is deliberately strict and narrow: it reads exactly the shape the
 * contract prescribes, and **reports anything it cannot read rather than
 * guessing**. A component whose declaration this cannot parse is treated as
 * having none, and the generator surfaces the reason — the same rule the rest of
 * the ownership pipeline follows.
 */

import type { RiskTier } from '@dzup-ui/contracts'
import { existsSync, readFileSync } from 'node:fs'

/** The anatomy fields the manifest carries. Mirrors `ComponentAnatomy`. */
export interface ManifestAnatomy {
  parts: string[] | 'none'
  states: string[]
  componentTokens: string[]
  recipes?: string[]
  optionalParts?: string[]
  globalDefaults?: string[]
  /** RTL contract (TASK-OSS-P4-05). */
  rtl?: { mirrors: string, keyboard: string, icons?: string[] }
  /**
   * Where a consumer's `class`, `id` and `data-*` land (TASK-R5-O6).
   *
   * Absent means the one root, which is most of the catalogue. Present
   * means the component is multi-root, or re-points `class` inward (D24),
   * or renders no element of its own and delegates (D26).
   */
  fallthrough?: { target: string, delegatesTo?: string }
  /** Keyboard contract (TASK-R5-O5). `'none'` is an explicit claim. */
  keyboard?: 'none' | ManifestKeyboardBinding[]
  riskTier: RiskTier
}

/** One row of a component's keyboard table, as the manifest carries it. */
export interface ManifestKeyboardBinding {
  key: string
  modifiers?: string[]
  when?: string
  action: string
  wcag?: string[]
  apg?: string
  rtl?: string
}

export interface AnatomyReadResult {
  anatomy?: ManifestAnatomy
  /** Why no anatomy was produced, or what was wrong with the one that was. */
  problems: string[]
}

const RISK_TIERS = new Set(['A', 'B', 'C', 'D'])

/**
 * Strip line and block comments so a comment inside an array literal cannot be
 * mistaken for a value. String contents are preserved: the declaration's values
 * are quoted names, and `'//'` is not one of them.
 */
export function stripComments(source: string): string {
  return source
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/(^|[^:])\/\/[^\n]*/g, '$1')
}

/** The `export const anatomy = { … }` object body, or undefined. */
export function anatomyBlock(source: string): string | undefined {
  const start = /export\s+const\s+anatomy\s*(?::[^=]+)?=\s*\{/.exec(source)
  if (start === null)
    return undefined

  // Brace matching rather than a lazy regex: `optionalParts` and nested arrays
  // make "up to the first }" wrong, and "up to the last }" would swallow
  // anything declared after the anatomy in the same file.
  let depth = 0
  const from = start.index + start[0].length - 1
  for (let index = from; index < source.length; index++) {
    const character = source[index]
    if (character === '{') {
      depth++
    }
    else if (character === '}') {
      depth--
      if (depth === 0)
        return source.slice(from + 1, index)
    }
  }
  return undefined
}

/**
 * A **top-level** `key: value` slice of an object body, value un-parsed.
 *
 * The depth scan is not a refinement — it is load-bearing. The original lookup
 * was `(?:^|,)\s*key\s*:` against the whole body, which cannot tell a top-level
 * field from a field of a nested object, and `rtl: { mirrors: 'layout',
 * keyboard: 'none' }` contains the literal `, keyboard: 'none'`. Every
 * component that declares `rtl` before its keyboard contract would have had its
 * keyboard table read as the explicit claim `'none'` — a wrong table published
 * on a page whose entire purpose is being right (TASK-R5-O5).
 *
 * Existing callers read fields that only ever appear at the top level, so their
 * results are unchanged; the scan removes the whole class of collision rather
 * than the one instance that surfaced.
 */
function fieldValue(body: string, key: string): string | undefined {
  const opener = new RegExp(`^\\s*(?:readonly\\s+)?${key}\\s*:\\s*`)
  let depth = 0
  let from = -1
  for (let index = 0; index < body.length; index++) {
    const character = body[index]
    const scanned = scanString(body, index)
    if (scanned !== undefined) {
      index = scanned.end
      continue
    }
    if (character === '[' || character === '{') {
      depth++
      continue
    }
    if (character === ']' || character === '}') {
      depth--
      continue
    }
    if (depth !== 0)
      continue
    // A field name can start at the body's head or just after a depth-0 comma.
    if (index === 0 || body[index - 1] === ',') {
      const match = opener.exec(body.slice(index))
      if (match !== null) {
        from = index + match[0].length
        break
      }
    }
  }
  if (from === -1)
    return undefined

  // Second pass: the value runs to the next depth-0 comma. Strings are skipped
  // here too, so a comma or a bracket inside an `action` sentence cannot end the
  // value early — keyboard actions are prose, and prose contains both.
  depth = 0
  for (let index = from; index < body.length; index++) {
    const character = body[index]
    const scanned = scanString(body, index)
    if (scanned !== undefined) {
      index = scanned.end
      continue
    }
    if (character === '[' || character === '{')
      depth++
    else if (character === ']' || character === '}')
      depth--
    else if (character === ',' && depth === 0)
      return body.slice(from, index).trim()
  }
  return body.slice(from).trim()
}

/** The quoted strings inside an array literal, in source order. */
function stringsIn(literal: string): string[] {
  return [...literal.matchAll(/'([^']*)'|"([^"]*)"/g)].map(match => match[1] ?? match[2] ?? '')
}

function readStringArray(body: string, key: string): string[] | undefined {
  const raw = fieldValue(body, key)
  if (raw === undefined)
    return undefined
  if (!raw.startsWith('['))
    return undefined
  return stringsIn(raw)
}

/**
 * The `rtl` declaration, or `undefined` when the component has none
 * (TASK-OSS-P4-05).
 *
 * A nested object rather than a string array, so it needs its own reader — and
 * it follows the same rule as the rest of this parser: **read exactly the shape
 * the contract prescribes and report anything else rather than guessing.** A
 * declaration whose `mirrors` is not one of the two allowed words is not
 * silently dropped; it is a problem, because a component that thinks it
 * declared its RTL contract and did not is worse off than one that never tried.
 */
export function readRtl(body: string, label: string, problems: string[]): ManifestAnatomy['rtl'] {
  const raw = fieldValue(body, 'rtl')
  if (raw === undefined)
    return undefined

  if (!raw.startsWith('{')) {
    problems.push(`${label} declares \`rtl\` as \`${raw}\`; expected an object literal.`)
    return undefined
  }

  const mirrors = /\bmirrors\s*:\s*'([^']*)'/.exec(raw)?.[1]
  const keyboard = /\bkeyboard\s*:\s*'([^']*)'/.exec(raw)?.[1]

  if (mirrors !== 'layout' && mirrors !== 'none') {
    problems.push(
      `${label} declares rtl.mirrors \`${mirrors ?? '(absent)'}\`; expected 'layout' or 'none'.`,
    )
    return undefined
  }
  if (keyboard !== 'swap-horizontal' && keyboard !== 'none') {
    problems.push(
      `${label} declares rtl.keyboard \`${keyboard ?? '(absent)'}\`; `
      + `expected 'swap-horizontal' or 'none'.`,
    )
    return undefined
  }

  const iconsRaw = /\bicons\s*:\s*(\[[^\]]*\])/.exec(raw)?.[1]
  const icons = iconsRaw === undefined ? undefined : stringsIn(iconsRaw)

  return icons === undefined ? { mirrors, keyboard } : { mirrors, keyboard, icons }
}

/**
 * The `fallthrough` declaration, or `undefined` when the component has none
 * (TASK-R5-O6, owner decisions D24 and D26).
 *
 * Absent is the honest default and the overwhelmingly common case: one root,
 * and `$attrs` reaches it. The field exists for the two shapes where that is
 * false — a multi-root template, where Vue cannot pick a target and the
 * component chose one; and a single root whose `class` is re-pointed at an
 * inner part, which six controls do.
 *
 * Read with the same rule as `readRtl`: **read exactly the shape the contract
 * prescribes and report anything else rather than guessing.** A `reason` is not
 * parsed out of the literal here — it is prose, it contains commas, quotes and
 * backticks, and `fieldValue` is a brace matcher rather than a JS parser. The
 * manifest carries the machine-readable half (`target`, `delegatesTo`); the
 * reason stays where a reader of the declaration will see it, and the contract
 * spec is what enforces that a non-`root` target has one.
 */
export function readFallthrough(
  body: string,
  label: string,
  problems: string[],
): ManifestAnatomy['fallthrough'] {
  const raw = fieldValue(body, 'fallthrough')
  if (raw === undefined)
    return undefined

  if (!raw.startsWith('{')) {
    problems.push(`${label} declares \`fallthrough\` as \`${raw}\`; expected an object literal.`)
    return undefined
  }

  const target = /\btarget\s*:\s*'([^']*)'/.exec(raw)?.[1]
  if (target === undefined || target.length === 0) {
    problems.push(
      `${label} declares \`fallthrough\` with no \`target\`. The target names the node a `
      + `consumer's \`class\`, \`id\` and \`data-*\` reach, and is the whole point of the field.`,
    )
    return undefined
  }

  const delegatesTo = /\bdelegatesTo\s*:\s*'([^']*)'/.exec(raw)?.[1]
  return delegatesTo === undefined ? { target } : { target, delegatesTo }
}

// ---------------------------------------------------------------------------
// The keyboard contract (TASK-R5-O5)
// ---------------------------------------------------------------------------

/** Modifier spellings a binding may require — `KeyboardEvent` spelling. */
const KEYBOARD_MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta'])
/** The two answers to "does this key swap in a RTL document?". */
const KEYBOARD_RTL = new Set(['mirrored', 'fixed'])

/**
 * One quoted string, honouring backslash escapes.
 *
 * {@link stringsIn} cannot be reused here: its `'([^']*)'` stops at the first
 * apostrophe, and a keyboard `action` is *prose* — `'Move to the list\'s first
 * item'` is the normal case, not the exotic one. Silently truncating a row's
 * action to `Move to the list` would publish a wrong sentence on a page whose
 * entire purpose is being right, so this scanner walks escapes instead.
 */
function scanString(text: string, from: number): { value: string, end: number } | undefined {
  const quote = text[from]
  if (quote !== '\'' && quote !== '"' && quote !== '`')
    return undefined
  let value = ''
  for (let index = from + 1; index < text.length; index++) {
    const character = text[index]
    if (character === '\\') {
      value += text[index + 1] ?? ''
      index++
      continue
    }
    if (character === quote)
      return { value, end: index }
    value += character
  }
  return undefined
}

/** Split a `[ … ]` literal into its depth-0 elements, escapes honoured. */
function splitElements(literal: string): string[] {
  const body = literal.slice(1, -1)
  const out: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < body.length; index++) {
    const character = body[index]
    const scanned = scanString(body, index)
    if (scanned !== undefined) {
      index = scanned.end
      continue
    }
    if (character === '[' || character === '{') {
      depth++
    }
    else if (character === ']' || character === '}') {
      depth--
    }
    else if (character === ',' && depth === 0) {
      out.push(body.slice(start, index).trim())
      start = index + 1
    }
  }
  const tail = body.slice(start).trim()
  if (tail !== '')
    out.push(tail)
  return out.filter(element => element !== '')
}

/** A `key: 'value'` string field of one object literal, escapes honoured. */
function objectString(object: string, key: string): string | undefined {
  const match = new RegExp(`(?:^|[{,\\s])${key}\\s*:\\s*`).exec(object)
  if (match === null)
    return undefined
  const scanned = scanString(object, match.index + match[0].length)
  return scanned?.value
}

/** A `key: ['a','b']` field of one object literal. */
function objectStringArray(object: string, key: string): string[] | undefined {
  const literal = new RegExp(`(?:^|[{,\\s])${key}\\s*:\\s*(\\[[^\\]]*\\])`).exec(object)?.[1]
  return literal === undefined ? undefined : stringsIn(literal)
}

/**
 * The `keyboard` declaration, or `undefined` when the component has none.
 *
 * Follows the same rule as the rest of this parser: read exactly the shape the
 * contract prescribes and **report** anything else rather than guessing. A
 * component whose keyboard rows this cannot read is treated as not having
 * declared them, and the docs ratchet counts it — which is a visible gap,
 * unlike a half-parsed table that reads as complete.
 */
export function readKeyboard(
  body: string,
  label: string,
  problems: string[],
): ManifestAnatomy['keyboard'] {
  const raw = fieldValue(body, 'keyboard')
  if (raw === undefined)
    return undefined

  if (/^'none'|^"none"/.test(raw))
    return 'none'

  if (!raw.startsWith('[')) {
    problems.push(
      `${label} declares \`keyboard\` as \`${raw.slice(0, 40)}\`; expected 'none' or an array of bindings.`,
    )
    return undefined
  }

  const bindings: ManifestKeyboardBinding[] = []
  for (const element of splitElements(raw)) {
    if (!element.startsWith('{')) {
      problems.push(`${label} declares a keyboard binding \`${element.slice(0, 40)}\` that is not an object literal.`)
      return undefined
    }
    const key = objectString(element, 'key')
    const action = objectString(element, 'action')
    if (key === undefined || key === '') {
      problems.push(`${label} declares a keyboard binding with no \`key\`.`)
      return undefined
    }
    if (action === undefined || action === '') {
      problems.push(`${label} declares the keyboard binding \`${key}\` with no \`action\`; a key whose effect is not stated is not a contract.`)
      return undefined
    }
    const binding: ManifestKeyboardBinding = { key, action }

    const modifiers = objectStringArray(element, 'modifiers')
    if (modifiers !== undefined) {
      const unknown = modifiers.filter(m => !KEYBOARD_MODIFIERS.has(m))
      if (unknown.length > 0) {
        problems.push(
          `${label} keyboard binding \`${key}\` names modifier(s) ${unknown.map(m => `\`${m}\``).join(', ')}; `
          + `expected KeyboardEvent spelling: Shift, Control, Alt, Meta.`,
        )
        return undefined
      }
      binding.modifiers = modifiers
    }

    const when = objectString(element, 'when')
    if (when !== undefined)
      binding.when = when
    const wcag = objectStringArray(element, 'wcag')
    if (wcag !== undefined)
      binding.wcag = wcag
    const apg = objectString(element, 'apg')
    if (apg !== undefined)
      binding.apg = apg

    const rtl = objectString(element, 'rtl')
    if (rtl !== undefined) {
      if (!KEYBOARD_RTL.has(rtl)) {
        problems.push(
          `${label} keyboard binding \`${key}\` declares rtl \`${rtl}\`; expected 'mirrored' or 'fixed'.`,
        )
        return undefined
      }
      binding.rtl = rtl
    }
    bindings.push(binding)
  }

  if (bindings.length === 0) {
    problems.push(
      `${label} declares \`keyboard: []\`. An empty array is not a claim — use \`keyboard: 'none'\` `
      + 'to say the component has no keyboard behaviour of its own.',
    )
    return undefined
  }
  return bindings
}

/**
 * Read one `Dz{Name}.anatomy.ts` source.
 *
 * @param source file contents
 * @param label how to name the file in problem messages
 */
export function parseAnatomySource(source: string, label: string): AnatomyReadResult {
  const clean = stripComments(source)
  const body = anatomyBlock(clean)
  if (body === undefined) {
    return {
      problems: [
        `${label} exists but exports no \`export const anatomy = { … }\`; the generator reads that `
        + 'declaration and nothing else.',
      ],
    }
  }

  const problems: string[] = []

  const rawParts = fieldValue(body, 'parts')
  let parts: string[] | 'none' | undefined
  if (rawParts === undefined)
    problems.push(`${label} declares no \`parts\`. Use \`parts: 'none'\` for a renderless component — the two cases are not the same.`)
  else if (/^'none'|^"none"/.test(rawParts))
    parts = 'none'
  else if (rawParts.startsWith('['))
    parts = stringsIn(rawParts)
  else
    problems.push(`${label} declares \`parts\` as \`${rawParts}\`, which is neither an array literal nor 'none'.`)

  const states = readStringArray(body, 'states')
  if (states === undefined)
    problems.push(`${label} declares no \`states\` array. Declare \`states: []\` when the component has none.`)

  const componentTokens = readStringArray(body, 'componentTokens')
  if (componentTokens === undefined)
    problems.push(`${label} declares no \`componentTokens\` array. Declare \`componentTokens: []\` when it reads none.`)

  const rawTier = fieldValue(body, 'riskTier')
  const riskTier = rawTier === undefined ? undefined : stringsIn(rawTier)[0]
  if (riskTier === undefined || !RISK_TIERS.has(riskTier))
    problems.push(`${label} declares riskTier \`${rawTier ?? '(absent)'}\`; expected one of A, B, C, D.`)

  if (problems.length > 0)
    return { problems }

  const optionalParts = readStringArray(body, 'optionalParts')
  const recipes = readStringArray(body, 'recipes')
  const globalDefaults = readStringArray(body, 'globalDefaults')
  const rtl = readRtl(body, label, problems)
  const keyboard = readKeyboard(body, label, problems)
  const fallthrough = readFallthrough(body, label, problems)
  if (problems.length > 0)
    return { problems }

  const anatomy: ManifestAnatomy = {
    parts: parts as string[] | 'none',
    states: states as string[],
    componentTokens: componentTokens as string[],
    riskTier: riskTier as RiskTier,
  }
  if (recipes !== undefined)
    anatomy.recipes = recipes
  if (optionalParts !== undefined)
    anatomy.optionalParts = optionalParts
  if (globalDefaults !== undefined)
    anatomy.globalDefaults = globalDefaults
  if (rtl !== undefined)
    anatomy.rtl = rtl
  if (keyboard !== undefined)
    anatomy.keyboard = keyboard
  if (fallthrough !== undefined)
    anatomy.fallthrough = fallthrough

  // A binding that claims to mirror on a component whose RTL contract says the
  // arrow keys do not swap is a contradiction between two declarations in the
  // same file, and it is the failure mode the `rtl` field was split into three
  // axes to make visible (ADR-19 / TASK-OSS-P4-05). Caught here rather than in
  // `validate:rtl`, because both halves are in front of this parser.
  if (Array.isArray(keyboard) && rtl !== undefined && rtl.keyboard === 'none') {
    const mirrored = keyboard.filter(b => b.rtl === 'mirrored').map(b => b.key)
    if (mirrored.length > 0) {
      problems.push(
        `${label} declares rtl.keyboard 'none' but marks ${mirrored.map(k => `\`${k}\``).join(', ')} `
        + 'as `rtl: \'mirrored\'`. Either the arrow keys swap in a RTL document or they do not; the '
        + 'two declarations cannot both be right.',
      )
    }
  }

  // Declared-but-unreachable optional parts are a typo class the DOM check
  // cannot catch: `expectAnatomy` only ever sees parts that exist.
  if (anatomy.parts !== 'none') {
    const declared = new Set(anatomy.parts)
    for (const optional of anatomy.optionalParts ?? []) {
      if (!declared.has(optional)) {
        problems.push(
          `${label} lists "${optional}" in optionalParts but not in parts, so nothing will ever look for it.`,
        )
      }
    }
  }

  return problems.length > 0 ? { problems } : { anatomy, problems: [] }
}

/**
 * The anatomy declared beside a component file, if any.
 *
 * @param componentPath absolute path to `Dz{Name}.vue`
 */
export function readAnatomyFor(componentPath: string): AnatomyReadResult & { file?: string } {
  const file = componentPath.replace(/\.vue$/, '.anatomy.ts')
  if (!existsSync(file))
    return { problems: [] }

  const result = parseAnatomySource(readFileSync(file, 'utf8'), file)
  return { ...result, file }
}

/**
 * `--dz-{family}-*` tokens a component's own files reference.
 *
 * The counterpart to `expectAnatomy` for the token half of the declaration: a
 * declared part is checked against rendered DOM, and a declared token is checked
 * against the source that reads it.
 *
 * The prefix is derived from the component name (`DzButton` -> `--dz-button-`)
 * rather than from a list, so a component that invents a family gets checked
 * too. Global semantic tokens (`--dz-primary`, `--dz-border`) are deliberately
 * NOT collected: they belong to the theme, and a component that reads one is
 * not offering it as a per-component override point.
 */
export function referencedComponentTokens(
  componentPath: string,
  symbol: string,
): string[] {
  const prefix = `--dz-${symbol.replace(/^Dz/, '').replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}-`
  const base = componentPath.replace(/\.vue$/, '')
  const sources = ['.vue', '.variants.ts', '.tokens.ts']
    .map(suffix => `${base}${suffix}`)
    .filter(file => existsSync(file))
    .map(file => readFileSync(file, 'utf8'))
    .join('\n')

  const found = new Set<string>()
  for (const match of sources.matchAll(/--dz-[a-z0-9-]+/g)) {
    const token = match[0]
    // A bare prefix is the head of an interpolation
    // (`--dz-button-${size}-height`), not a token name; reporting it would be
    // noise a maintainer cannot act on.
    if (token.startsWith(prefix) && token !== prefix)
      found.add(token)
  }
  return [...found].sort()
}
