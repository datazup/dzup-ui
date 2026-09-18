/**
 * Locale-pack gate (TASK-R5-O4; N5-04 D4 and F11).
 *
 * **What this exists to catch.** Until a second locale exists, the catalog's
 * completeness is enforced by `as const satisfies DzMessageCatalog` — which
 * compares English to itself. The first translated pack is the moment the
 * repository acquires a defect class nothing else can see: a key missing from a
 * language nobody on the team reads, rendering the English default forever, or a
 * translation whose `{count, plural, …}` does not parse and throws — in that
 * language only. A pack is JSON data, not a type literal, so `satisfies` cannot
 * reach it. This can.
 *
 * Every pack under `packages/core/src/i18n/locales/` must satisfy, per key of
 * `enMessages`:
 *
 *   1. **complete** — translated in `messages` **or** listed in `fallback`,
 *      never neither (`missing`) and never both (`both`);
 *   2. **no strays** — no message or fallback entry the catalog does not
 *      declare (`unknown`), no duplicate fallback entry (`duplicate`);
 *   3. **parses** — every translation is valid message syntax (`syntax`);
 *   4. **same arguments** — a translation reads the same argument names as the
 *      English message, each used the same way: a translator may not drop
 *      `{max}` or turn a plural into a select (`arguments`);
 *
 * and per pack:
 *
 *   5. **shape** — `locale`, `direction`, `fallback`, `messages` and nothing
 *      else, with the file named `<locale>.json` (`shape`);
 *   6. **direction** — the declared `direction` agrees with
 *      `directionForLocale()`, the list `useDzDirection()` resolves `'auto'`
 *      from (`direction`);
 *   7. **reference pack** — `en.json` is byte-identical to what `enMessages`
 *      renders (`stale`), so translators and translation tools read the real
 *      source strings;
 *   8. **tree-shaking** — no source module outside `locales/` imports a pack,
 *      so a consumer who never imports `de.json` never ships it (`imported`);
 *   9. **exported iff published** — every pack with at least one translation
 *      has its own `./i18n/locales/<locale>.json` entry in
 *      `packages/core/package.json`, and no entry names a scaffold or a missing
 *      pack (`export`). One explicit entry per locale rather than a `*`
 *      pattern: the build does not publish scaffolds, so a pattern would
 *      advertise files that do not exist, and `createDzupResolution` derives
 *      every in-repo alias from these keys.
 *
 * **The pseudo-locale is checked too**, by rules 3 and 4. It is generated from
 * English, so it is the pack that exists before any human translation does —
 * which is what lets every rule above be exercised today.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/i18n-packs.ts                  # check
 *   tsx packages/tooling/src/validators/i18n-packs.ts --write          # rewrite en.json; list new keys as fallback
 *   tsx packages/tooling/src/validators/i18n-packs.ts --scaffold <tag> # a new pack, every key an explicit fallback
 *
 * `--write` never translates and never removes a translation: a key the catalog
 * gained is added to each pack's `fallback`, where review sees it; a fallback
 * entry for a key the catalog lost is dropped (it held no text); a translation
 * for a lost key stays and is reported as `unknown` until a human removes it.
 *
 * Exit code 1 if any rule fails.
 */

import type { DzLocalePack, DzMessages } from '@dzup-ui/contracts'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { directionForLocale } from '../../../core/src/i18n/direction.ts'
import { messageArguments } from '../../../core/src/i18n/message-format.ts'
import { enMessages } from '../../../core/src/i18n/messages.ts'
import { pseudoMessages } from '../../../core/src/i18n/pseudo.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
export const LOCALES_DIR = resolve(ROOT, 'packages/core/src/i18n/locales')
const CORE_SRC = resolve(ROOT, 'packages/core/src')

export type PackRule
  = | 'missing' | 'both' | 'unknown' | 'duplicate' | 'syntax' | 'arguments'
    | 'shape' | 'direction' | 'stale' | 'imported' | 'export'

export interface PackViolation {
  readonly file: string
  readonly rule: PackRule
  readonly key?: string
  readonly message: string
}

export interface PackCoverage {
  readonly locale: string
  readonly translated: number
  readonly fallback: number
  readonly total: number
  /** `scaffold`: nothing translated. Scaffolds are not published by the build. */
  readonly status: 'complete' | 'partial' | 'scaffold'
}

/** Flatten a catalog to `Group.key → message`, in declaration order. */
export function flattenCatalog(catalog: DzMessages, prefix = ''): Map<string, unknown> {
  const out = new Map<string, unknown>()
  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix === '' ? key : `${prefix}.${key}`
    if (value !== null && typeof value === 'object') {
      for (const [inner, leaf] of flattenCatalog(value as DzMessages, path)) out.set(inner, leaf)
    }
    else {
      out.set(path, value)
    }
  }
  return out
}

/** Every catalog key, sorted — the order packs and fallback lists are written in. */
export function catalogKeys(): string[] {
  return [...flattenCatalog(enMessages as unknown as DzMessages).keys()].sort()
}

/** The reference pack, exactly as `en.json` must read. */
export function renderEnglishPack(): string {
  const pack: DzLocalePack = { locale: 'en', direction: 'ltr', fallback: [], messages: enMessages as unknown as DzMessages }
  return `${JSON.stringify(pack, null, 2)}\n`
}

/**
 * Compare one message's arguments with English's. `undefined` when they agree.
 *
 * A plain `{count}` and a `{count, plural, …}` are compatible in either
 * direction — Japanese needs no plural where English does, and a Slavic
 * language may need one where English does not. What is refused is a dropped
 * argument, an invented one, and two different *selectors* on the same value
 * (plural vs select vs selectordinal), which pick branches by different rules.
 */
function argumentDrift(english: string, translated: string): string | undefined {
  const want = messageArguments(english)
  const got = messageArguments(translated)
  const problems: string[] = []
  for (const [name, kind] of want) {
    const other = got.get(name)
    if (other === undefined)
      problems.push(`drops {${name}}`)
    else if (kind !== 'simple' && other !== 'simple' && kind !== other)
      problems.push(`uses {${name}} as ${other}, English uses it as ${kind}`)
  }
  for (const name of got.keys()) {
    if (!want.has(name))
      problems.push(`reads {${name}}, which the component never passes`)
  }
  return problems.length === 0 ? undefined : problems.join('; ')
}

/** Check one translated message against its English source (rules 3 and 4). */
function checkMessage(file: string, key: string, english: string, translated: string): PackViolation[] {
  try {
    messageArguments(translated)
  }
  catch (error) {
    return [{ file, rule: 'syntax', key, message: (error as Error).message }]
  }
  const drift = argumentDrift(english, translated)
  return drift === undefined ? [] : [{ file, rule: 'arguments', key, message: drift }]
}

/** Check a parsed pack. Pure, so the spec can seed every failure. */
export function checkPack(file: string, raw: unknown): { violations: PackViolation[], coverage?: PackCoverage } {
  const violations: PackViolation[] = []
  const shape = (message: string): { violations: PackViolation[] } => ({ violations: [{ file, rule: 'shape', message }] })

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw))
    return shape('a pack is a JSON object')
  const pack = raw as Record<string, unknown>
  const extra = Object.keys(pack).filter(key => !['locale', 'direction', 'fallback', 'messages'].includes(key))
  if (extra.length > 0)
    violations.push({ file, rule: 'shape', message: `unexpected field(s): ${extra.join(', ')}` })
  if (typeof pack.locale !== 'string' || pack.locale === '')
    return shape('`locale` must be a BCP-47 tag')
  if (pack.direction !== 'ltr' && pack.direction !== 'rtl')
    return shape('`direction` must be "ltr" or "rtl" — declared, never inferred')
  if (!Array.isArray(pack.fallback) || pack.fallback.some(entry => typeof entry !== 'string'))
    return shape('`fallback` must be an array of dotted keys')
  if (pack.messages === null || typeof pack.messages !== 'object' || Array.isArray(pack.messages))
    return shape('`messages` must be an object of component groups')

  const base = file.replaceAll('\\', '/').split('/').pop() ?? ''
  if (base !== `${pack.locale}.json`)
    violations.push({ file, rule: 'shape', message: `a pack for "${pack.locale}" must be named ${pack.locale}.json` })

  const expected = directionForLocale(pack.locale)
  if (pack.direction !== expected) {
    violations.push({
      file,
      rule: 'direction',
      message: `declares "${pack.direction}" but directionForLocale("${pack.locale}") resolves "${expected}" — `
        + 'fix the pack, or the subtag list in packages/core/src/i18n/direction.ts',
    })
  }

  const english = flattenCatalog(enMessages as unknown as DzMessages)
  const translated = flattenCatalog(pack.messages as DzMessages)
  const fallback = pack.fallback as string[]
  const fallbackSet = new Set<string>()

  for (const key of fallback) {
    if (fallbackSet.has(key))
      violations.push({ file, rule: 'duplicate', key, message: 'listed in fallback twice' })
    fallbackSet.add(key)
    if (!english.has(key))
      violations.push({ file, rule: 'unknown', key, message: 'fallback names a key the catalog does not declare' })
  }

  for (const [key, value] of translated) {
    if (!english.has(key)) {
      violations.push({ file, rule: 'unknown', key, message: 'translates a key the catalog does not declare' })
      continue
    }
    if (typeof value !== 'string') {
      violations.push({ file, rule: 'shape', key, message: 'a translation must be a string — list the key in fallback instead of null' })
      continue
    }
    if (fallbackSet.has(key))
      violations.push({ file, rule: 'both', key, message: 'translated AND listed as fallback — remove it from fallback' })
    violations.push(...checkMessage(file, key, english.get(key) as string, value))
  }

  let translatedCount = 0
  for (const key of english.keys()) {
    const has = typeof translated.get(key) === 'string'
    if (has)
      translatedCount += 1
    else if (!fallbackSet.has(key))
      violations.push({ file, rule: 'missing', key, message: 'neither translated nor listed as an explicit fallback' })
  }

  const total = english.size
  return {
    violations,
    coverage: {
      locale: pack.locale,
      translated: translatedCount,
      fallback: total - translatedCount,
      total,
      status: translatedCount === 0 ? 'scaffold' : translatedCount === total ? 'complete' : 'partial',
    },
  }
}

/** Rules 3–4 against the generated pseudo-locale: the pack that exists before any translation. */
export function checkPseudo(): PackViolation[] {
  const english = flattenCatalog(enMessages as unknown as DzMessages)
  const violations: PackViolation[] = []
  for (const [key, value] of flattenCatalog(pseudoMessages())) {
    const source = english.get(key)
    if (typeof source === 'string' && typeof value === 'string')
      violations.push(...checkMessage('pseudoMessages()', key, source, value))
  }
  return violations
}

/** Rule 8 — no module outside `locales/` imports a pack. */
export function findPackImports(): PackViolation[] {
  const out: PackViolation[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      if (full === LOCALES_DIR)
        continue
      if (statSync(full).isDirectory()) {
        walk(full)
        continue
      }
      if (!/\.(?:ts|vue)$/.test(entry) || /\.spec\.ts$/.test(entry))
        continue
      const source = readFileSync(full, 'utf8')
      if (/(?:from|import\()\s*['"][^'"]*\/locales\/[^'"]+\.json['"]/.test(source)) {
        out.push({
          file: relative(ROOT, full).replaceAll('\\', '/'),
          rule: 'imported',
          message: 'imports a locale pack — every consumer of this module would ship that language',
        })
      }
    }
  }
  walk(CORE_SRC)
  return out
}

const PACK_EXPORT = /^\.\/i18n\/locales\/(.+)\.json$/

/**
 * Rule 9 — `exports` names exactly the published packs.
 *
 * @param exportKeys the `exports` keys of `packages/core/package.json`
 * @param coverage   every pack's coverage; a `scaffold` is unpublished
 */
export function checkPackExports(exportKeys: readonly string[], coverage: readonly PackCoverage[]): PackViolation[] {
  const out: PackViolation[] = []
  const file = 'packages/core/package.json'
  const exported = new Set(exportKeys.flatMap(key => PACK_EXPORT.exec(key)?.[1] ?? []))
  for (const pack of coverage) {
    const published = pack.status !== 'scaffold'
    if (published && !exported.has(pack.locale))
      out.push({ file, rule: 'export', key: pack.locale, message: `"${pack.locale}" has translations but no "./i18n/locales/${pack.locale}.json" export` })
    if (!published && exported.has(pack.locale))
      out.push({ file, rule: 'export', key: pack.locale, message: `exports "${pack.locale}", a scaffold the build does not publish` })
  }
  for (const locale of exported) {
    if (!coverage.some(pack => pack.locale === locale))
      out.push({ file, rule: 'export', key: locale, message: `exports "./i18n/locales/${locale}.json" but no such pack exists` })
  }
  return out
}

function packFiles(): string[] {
  if (!existsSync(LOCALES_DIR))
    return []
  return readdirSync(LOCALES_DIR).filter(name => name.endsWith('.json')).sort()
}

/** A new pack for `locale` with every catalog key an explicit fallback. */
export function scaffoldPack(locale: string): string {
  const pack: DzLocalePack = {
    locale,
    direction: directionForLocale(locale),
    fallback: catalogKeys(),
    messages: {},
  }
  return `${JSON.stringify(pack, null, 2)}\n`
}

/** `--write`: keep every pack's fallback in step with the catalog, never touching a translation. */
function syncFallback(file: string, raw: Record<string, unknown>): boolean {
  const english = new Set(catalogKeys())
  const translated = new Set(flattenCatalog((raw.messages ?? {}) as DzMessages).keys())
  const current = Array.isArray(raw.fallback) ? (raw.fallback as string[]) : []
  const next = [...new Set([
    ...current.filter(key => english.has(key) && !translated.has(key)),
    ...[...english].filter(key => !translated.has(key)),
  ])].sort()
  if (JSON.stringify(next) === JSON.stringify(current))
    return false
  writeFileSync(file, `${JSON.stringify({ ...raw, fallback: next }, null, 2)}\n`, 'utf8')
  return true
}

function main(): void {
  const args = process.argv.slice(2)
  const enPath = join(LOCALES_DIR, 'en.json')

  const scaffoldAt = args.indexOf('--scaffold')
  if (scaffoldAt !== -1) {
    const locale = args[scaffoldAt + 1]
    if (locale === undefined || locale.startsWith('--')) {
      console.error('Usage: i18n-packs.ts --scaffold <locale>')
      process.exit(1)
    }
    const target = join(LOCALES_DIR, `${locale}.json`)
    if (existsSync(target)) {
      console.error(`${relative(ROOT, target)} already exists — it may hold translations; not overwriting.`)
      process.exit(1)
    }
    writeFileSync(target, scaffoldPack(locale), 'utf8')
    console.warn(`Scaffolded ${relative(ROOT, target)}: ${catalogKeys().length} keys, every one an explicit fallback.`)
    return
  }

  if (args.includes('--write')) {
    writeFileSync(enPath, renderEnglishPack(), 'utf8')
    for (const name of packFiles()) {
      if (name === 'en.json')
        continue
      const file = join(LOCALES_DIR, name)
      if (syncFallback(file, JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>))
        console.warn(`  synced fallback list: ${relative(ROOT, file)}`)
    }
  }

  const violations: PackViolation[] = []
  const coverage: PackCoverage[] = []

  if (!existsSync(enPath) || readFileSync(enPath, 'utf8').replaceAll('\r\n', '\n') !== renderEnglishPack()) {
    violations.push({
      file: relative(ROOT, enPath),
      rule: 'stale',
      message: 'does not match enMessages — run `yarn generate:i18n-packs`',
    })
  }

  for (const name of packFiles()) {
    const file = join(LOCALES_DIR, name)
    const display = relative(ROOT, file).replaceAll('\\', '/')
    let raw: unknown
    try {
      raw = JSON.parse(readFileSync(file, 'utf8'))
    }
    catch (error) {
      violations.push({ file: display, rule: 'shape', message: `not valid JSON: ${(error as Error).message}` })
      continue
    }
    const result = checkPack(display, raw)
    violations.push(...result.violations)
    if (result.coverage !== undefined)
      coverage.push(result.coverage)
  }

  const corePackage = JSON.parse(readFileSync(resolve(ROOT, 'packages/core/package.json'), 'utf8')) as { exports?: Record<string, unknown> }
  violations.push(...checkPseudo(), ...findPackImports(), ...checkPackExports(Object.keys(corePackage.exports ?? {}), coverage))

  console.warn(`i18n packs — ${catalogKeys().length} catalog keys, ${coverage.length} pack(s) + the pseudo-locale`)
  for (const pack of coverage) {
    console.warn(
      `  ${pack.locale.padEnd(8)} ${pack.status.padEnd(9)} ${pack.translated}/${pack.total} translated, `
      + `${pack.fallback} explicit fallback`,
    )
  }

  if (violations.length === 0) {
    console.warn('\ni18n packs: every key translated or an explicit fallback; 0 violations')
    return
  }

  console.error(`\ni18n packs FAILED: ${violations.length} violation(s)\n`)
  for (const violation of violations)
    console.error(`  [${violation.rule}] ${violation.file}${violation.key === undefined ? '' : ` ${violation.key}`}: ${violation.message}`)
  process.exit(1)
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main()
