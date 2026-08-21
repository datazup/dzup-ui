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
 *      (`:aria-label`) are fine — they resolve to something the component
 *      chose.
 *   2. **Literal defaults on `*Text`/`*Label`/`*Placeholder`/`*Message`/
 *      `*Title`/`*Hint`/`*Description` props inside `withDefaults`.** These are
 *      overridable per instance and therefore easy to miss: the component
 *      works, it is just untranslatable in bulk.
 *
 * **It reads the `<template>` block only for rule 1**, deliberately. The first
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
  rule: 'static-aria-label' | 'literal-prop-default'
  value: string
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
 * prop whose value no element renders — took six lines to explain honestly, and
 * a validator that read only the line above would have pushed that explanation
 * out of the file.
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

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const violations = checkHardcodedStrings()
  if (violations.length === 0) {
    console.warn(
      '✓ hardcoded-strings: every user-visible string resolves through the message '
      + 'catalog, or says in a comment why it does not.',
    )
    process.exit(0)
  }

  console.error(`\nFound ${violations.length} hard-coded user-visible string(s):\n`)
  for (const v of violations)
    console.error(`  ${v.file}:${v.line}  [${v.rule}]  ${JSON.stringify(v.value)}`)
  console.error(
    '\nAdd the string to packages/core/src/i18n/messages.ts and read it through '
    + `useComponentMessages('<Component>'), or mark the line \`${ALLOW} <reason>\` if it `
    + 'genuinely is not language a user reads.',
  )
  process.exit(1)
}
/* c8 ignore stop */
