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
  riskTier: RiskTier
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

/** A top-level `key: value` slice of an object body, value un-parsed. */
function fieldValue(body: string, key: string): string | undefined {
  const match = new RegExp(`(?:^|,)\\s*(?:readonly\\s+)?${key}\\s*:\\s*`).exec(body)
  if (match === null)
    return undefined

  const from = match.index + match[0].length
  let depth = 0
  for (let index = from; index < body.length; index++) {
    const character = body[index]
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
