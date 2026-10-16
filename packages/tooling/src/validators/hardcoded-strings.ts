/**
 * Hard-coded user-visible string validator (TASK-OSS-P4-03, ADR-20).
 *
 * The catalog in `packages/core/src/i18n/messages.ts` is only worth having if
 * the next component cannot quietly reintroduce the problem it solved. Before
 * it existed, 54 `aria-label` values across 27 components could not be changed
 * by any application at all, and 39 prop defaults across 24 could only be
 * changed one instance at a time.
 *
 * What this checks, and why each rule is shaped the way it is:
 *
 *   1. **Static `aria-label="Some words"` in a `<template>`.** An accessible
 *      name is a user-visible string that a screen-reader user hears in
 *      whatever language the library was written in. Bound forms
 *      (`:aria-label`) are checked by rule 3.
 *   2. **Literal defaults on `*Text`/`*Label`/`*Placeholder`/`*Message`/
 *      `*Title`/`*Hint`/`*Description` props inside `withDefaults`.** These are
 *      overridable per instance and therefore easy to miss: the component
 *      works, it is just untranslatable in bulk.
 *   3. **English inside a bound `:aria-label`** (UI-DZUP-UI-CODE-M-12). Rule 1
 *      used to wave every bound form through, which let `` `Remove ${label}` ``
 *      and `ariaLabel ?? 'Search'` past the gate while it claimed full catalog
 *      coverage. A bound value is now checked for a template literal whose
 *      static text has words in it, or a quoted string that reads as language
 *      (lower-case dotted/camel tokens such as catalog keys do not).
 *   4. **Literal text in an empty state** — the text, or a quoted string in a
 *      `{{ }}` interpolation, directly inside `<slot name="empty">`,
 *      `<ComboboxEmpty>` or a `data-part="empty"` element. "No options
 *      available" is read by every user who filters a list to nothing.
 *
 * Rules 3 and 4 found existing debt when they were added. That debt is pinned
 * per rule in `RATCHET_CEILINGS` below: the gate fails if either count rises,
 * and fails if it falls without the ceiling being lowered, so the number only
 * ever moves down and the PASS line states what is still outstanding instead
 * of claiming full coverage.
 *
 * **It reads the `<template>` block only for rules 1, 3 and 4**, deliberately. The first
 * inventory pass for this packet scanned whole files and swept up 11 strings
 * inside JSDoc `@example` blocks — documentation showing a consumer what to
 * pass, which never reaches the DOM. A validator that flagged those would teach
 * people to stop writing examples.
 *
 * **Escape hatch.** A `hardcoded-string-ok:` comment on the line or the line
 * above exempts one occurrence and must carry a reason. It is deliberately not
 * a config file listing file names: an exemption belongs where the reader meets
 * the string, and a list in a validator is where exemptions go to be forgotten.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/hardcoded-strings.ts
 *
 * Exit code 1 if any unexplained hard-coded user-visible string is found.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const SCAN_ROOTS = [resolve(ROOT, 'packages/core/src')]

/** Props whose value a user reads or hears. */
const USER_VISIBLE_PROP = /^\w*(?:Text|Label|Placeholder|Message|Title|Hint|Description)$/

/**
 * Values that are not language.
 *
 * Units, symbols, separators and format patterns read the same in every locale,
 * and forcing them through a catalog would add a translation key whose only
 * correct value is the one already there. `AM/PM` is NOT here — it is English,
 * and it is in the catalog.
 */
const NOT_LANGUAGE = /^(?:[\s\p{P}\p{S}\d]+|[A-Z]{2,5}|[A-Za-z]{1,3}\d*|\d+(?:px|rem|em|ms|s))$/u

/** The marker that exempts one occurrence, with its reason. */
const ALLOW = 'hardcoded-string-ok:'

export interface StringViolation {
  file: string
  line: number
  rule: StringRule
  value: string
}

export type StringRule
  = | 'static-aria-label'
    | 'literal-prop-default'
    | 'bound-literal-aria-label'
    | 'literal-empty-state'

/**
 * Downward-only ceilings for the rules that found existing debt when they were
 * added (UI-DZUP-UI-CODE-M-12). Rules not listed have a ceiling of zero.
 * Lower a number in the same change that routes a string through the catalog.
 */
export const RATCHET_CEILINGS: Readonly<Partial<Record<StringRule, number>>> = {
  'bound-literal-aria-label': 43,
  'literal-empty-state': 4,
}

/** Whether a quoted string reads as language rather than as a key or token. */
function readsAsLanguage(value: string): boolean {
  if (!/\p{L}/u.test(value) || NOT_LANGUAGE.test(value.trim()))
    return false
  // `dzMessages['clear']`, `t('select.empty')`, `'week'`: identifiers and
  // catalog keys start lower-case and carry no spaces.
  return !/^[a-z][\w.-]*$/.test(value)
}

/** Static text of a template literal, with every `${…}` removed. */
function templateStatics(literal: string): string {
  let out = ''
  let depth = 0
  for (let i = 0; i < literal.length; i += 1) {
    if (depth === 0 && literal[i] === '$' && literal[i + 1] === '{') {
      depth = 1
      i += 1
      continue
    }
    if (depth > 0) {
      if (literal[i] === '{')
        depth += 1
      else if (literal[i] === '}')
        depth -= 1
      continue
    }
    out += literal[i]
  }
  return out
}

/** Language found in a bound expression: template-literal statics and quoted strings. */
export function languageInExpression(expression: string): string[] {
  const found: string[] = []
  for (const m of expression.matchAll(/`([^`]*)`/g)) {
    const statics = templateStatics(m[1]!).trim()
    if (/\p{L}/u.test(statics) && !NOT_LANGUAGE.test(statics))
      found.push(m[0])
  }
  const withoutTemplates = expression.replace(/`[^`]*`/g, '``')
  for (const m of withoutTemplates.matchAll(/'([^']*)'|"([^"]*)"/g)) {
    const value = m[1] ?? m[2] ?? ''
    if (readsAsLanguage(value))
      found.push(value)
  }
  return found
}

export function walk(dir: string, predicate: (path: string) => boolean): string[] {
  const out: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  }
  catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist')
        continue
      out.push(...walk(full, predicate))
    }
    else if (predicate(full)) {
      out.push(full)
    }
  }
  return out
}

/** 1-indexed line number of a character offset. */
function lineAt(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length
}

/**
 * Whether the marker sits on this line, or anywhere in the comment block
 * directly above it.
 *
 * The whole block, not just the line above, because a one-line exemption gets a
 * one-line reason and the reasons worth accepting are rarely that short. The
 * first real use of this hatch — `DzOrderList.dragHandleLabel`, a documented
 * prop whose value no element rendered — took six lines to explain honestly, and
 * a validator that read only the line above would have pushed that explanation
 * out of the file.
 *
 * **That exemption is gone.** TASK-N5-02 made the handle render the label as its
 * `title`, so the string moved into the message catalog like every other one and
 * the six lines of justification were deleted with it. Which is the outcome an
 * exemption should have: a hatch that records a defect precisely enough that
 * somebody can close it, not a permanent allowlist entry. The multi-line rule
 * stays — it is what let the reason be written honestly in the first place, and
 * `hardcoded-strings.spec.ts` still exercises it against that shape.
 */
export function isAllowed(source: string, line: number): boolean {
  const lines = source.split('\n')
  if ((lines[line - 1] ?? '').includes(ALLOW))
    return true

  for (let i = line - 2; i >= 0; i -= 1) {
    const text = (lines[i] ?? '').trim()
    if (!text.startsWith('//') && !text.startsWith('*') && !text.startsWith('/*'))
      return false
    if (text.includes(ALLOW))
      return true
  }
  return false
}

/**
 * Check one `.vue` source. Pure, so the rules are unit-testable against strings
 * rather than against the repository's current state.
 */
export function checkSource(file: string, source: string): StringViolation[] {
  const violations: StringViolation[] = []

  // ── Rule 1: static aria-label, template only ──
  const tplAt = source.indexOf('<template>')
  if (tplAt >= 0) {
    const template = source.slice(tplAt)
    for (const match of template.matchAll(/(?<![:@\w-])aria-label="([^"{}]+)"/g)) {
      const value = match[1]!
      if (!/\p{L}/u.test(value) || NOT_LANGUAGE.test(value))
        continue
      const line = lineAt(source, tplAt + (match.index ?? 0))
      if (isAllowed(source, line))
        continue
      violations.push({ file, line, rule: 'static-aria-label', value })
    }

    // ── Rule 3: language inside a bound aria-label ──
    for (const match of template.matchAll(/(?<![\w-])(?::|v-bind:)aria-label="([^"]*)"/g)) {
      const line = lineAt(source, tplAt + (match.index ?? 0))
      if (isAllowed(source, line))
        continue
      for (const value of languageInExpression(match[1]!))
        violations.push({ file, line, rule: 'bound-literal-aria-label', value })
    }

    // ── Rule 4: literal text in an empty state ──
    const emptyOpeners = /<slot\s+name="empty"[^>]*>|<ComboboxEmpty\b[^>]*>|<[\w-]+\b[^>]*\sdata-part="empty"[^>]*>/g
    for (const match of template.matchAll(emptyOpeners)) {
      if (match[0].endsWith('/>'))
        continue
      const textAt = (match.index ?? 0) + match[0].length
      const end = template.indexOf('<', textAt)
      const text = template.slice(textAt, end < 0 ? undefined : end)
      const values: string[] = []
      const literal = text.replace(/\{\{([\s\S]*?)\}\}/g, (_, expr: string) => {
        values.push(...languageInExpression(expr))
        return ' '
      }).trim()
      if (/\p{L}/u.test(literal) && !NOT_LANGUAGE.test(literal))
        values.unshift(literal.replace(/\s+/g, ' '))
      if (values.length === 0)
        continue
      const firstNonSpace = textAt + (text.length - text.trimStart().length)
      const line = lineAt(source, tplAt + firstNonSpace)
      if (isAllowed(source, line))
        continue
      for (const value of values)
        violations.push({ file, line, rule: 'literal-empty-state', value })
    }
  }

  // ── Rule 2: literal defaults on user-visible props ──
  const head = tplAt >= 0 ? source.slice(0, tplAt) : source
  const defaults = head.match(/withDefaults\(\s*defineProps<[^>]+>\(\)\s*,\s*\{([\s\S]*?)\n\}\)/)
  if (defaults !== null) {
    const blockAt = head.indexOf(defaults[1]!)
    for (const match of defaults[1]!.matchAll(/^\s*(\w+): '([^']*)'/gm)) {
      const [, prop, value] = match as unknown as [string, string, string]
      if (!USER_VISIBLE_PROP.test(prop))
        continue
      if (!/\p{L}/u.test(value) || NOT_LANGUAGE.test(value))
        continue
      // Offset of the PROP NAME, not of the match: the leading `\s*` happily
      // consumes the preceding newline, so measuring from `match.index` reports
      // the line above — which then reads the wrong line for the `ok` marker and
      // sends anyone following the message to the wrong place.
      const line = lineAt(head, blockAt + (match.index ?? 0) + match[0].indexOf(prop))
      if (isAllowed(source, line))
        continue
      violations.push({ file, line, rule: 'literal-prop-default', value })
    }
  }

  return violations
}

export function checkHardcodedStrings(roots: string[] = SCAN_ROOTS): StringViolation[] {
  const violations: StringViolation[] = []
  for (const root of roots) {
    for (const file of walk(root, p => p.endsWith('.vue'))) {
      const rel = relative(ROOT, file).replaceAll('\\', '/')
      violations.push(...checkSource(rel, readFileSync(file, 'utf8')))
    }
  }
  return violations
}

export interface RatchetResult {
  /** Violations of rules without a ceiling, or above it. */
  failing: StringViolation[]
  /** Per-rule counts for ratcheted rules, with their ceilings. */
  ratchets: Array<{ rule: StringRule, count: number, ceiling: number }>
}

/**
 * Split violations into the ones that fail outright and the ratcheted debt.
 * A ratcheted rule fails when its count differs from its ceiling in either
 * direction: above is new debt, below is paid debt the ceiling must record.
 */
export function applyRatchets(
  violations: StringViolation[],
  ceilings: Readonly<Partial<Record<StringRule, number>>> = RATCHET_CEILINGS,
): RatchetResult {
  const failing: StringViolation[] = []
  const counts = new Map<StringRule, number>()
  for (const v of violations) {
    if (ceilings[v.rule] === undefined)
      failing.push(v)
    else
      counts.set(v.rule, (counts.get(v.rule) ?? 0) + 1)
  }
  const ratchets = (Object.keys(ceilings) as StringRule[]).map(rule => ({
    rule,
    count: counts.get(rule) ?? 0,
    ceiling: ceilings[rule] ?? 0,
  }))
  for (const r of ratchets) {
    if (r.count > r.ceiling)
      failing.push(...violations.filter(v => v.rule === r.rule))
  }
  return { failing, ratchets }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const violations = checkHardcodedStrings()
  const { failing, ratchets } = applyRatchets(violations)
  const lowered = ratchets.filter(r => r.count < r.ceiling)
  const debt = ratchets.map(r => `${r.rule} ${r.count}/${r.ceiling}`).join(', ')

  if (failing.length === 0 && lowered.length === 0) {
    console.warn(
      '✓ hardcoded-strings: no static aria-label or literal user-visible prop default '
      + 'outside the catalog. Ratcheted debt still outstanding (count/ceiling): '
      + `${debt}.`,
    )
    process.exit(0)
  }

  if (failing.length > 0) {
    console.error(`\nFound ${failing.length} hard-coded user-visible string(s):\n`)
    for (const v of failing)
      console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${JSON.stringify(v.value)}`)
    console.error(
      '\nAdd the string to packages/core/src/i18n/messages.ts and read it through '
      + `useComponentMessages('<Component>'), or mark the line \`${ALLOW} <reason>\` if it `
      + 'genuinely is not language a user reads.',
    )
  }
  for (const r of lowered) {
    console.error(
      `\n${r.rule}: ${r.count} found, ceiling ${r.ceiling}. The debt went down — lower `
      + 'RATCHET_CEILINGS in hardcoded-strings.ts to the new count in the same change.',
    )
  }
  process.exit(1)
}
/* c8 ignore stop */
