/**
 * Locale-completeness gate (TASK-S5-O1; carries R5-O4 D59 and D63).
 *
 * **Why this is not `validate:i18n-packs`.** That gate asks a *structural*
 * question — is every catalog key translated or an explicit fallback, does every
 * translation parse, does it read the same arguments as English, is the pack
 * shaped right. It answers yes today for both packs and it will answer yes for a
 * pack that copied English into every value. This gate asks the *product*
 * question: **how much of this locale is really translated, is it grammatically
 * correct for its own plural rule set, and does the script it is written in have
 * a typeface at all.** The two questions need different failure meanings, and
 * this one carries a ratchet and a decision register, so it is its own link.
 * Every measurement it shares with `i18n-packs` comes from `checkPack()`
 * directly — the two gates cannot disagree about arity or missing keys. Since
 * RESIDUAL-02 (2026-09-25) that also covers **what counts as a translation**:
 * `isUntranslated` is defined in `i18n-packs.ts`, `checkPack` applies it to
 * produce `coverage.effective`, this gate's percentage divides that number by the
 * key count, and `i18n-packs` rule 9 reads the same number to decide whether the
 * pack is publishable. Two copies of that predicate is how the two gates came to
 * disagree (TASK-S5-O1 finding F1); there is now one.
 *
 * ## The four defect classes this catches that nothing else can
 *
 *   1. **A scaffold reading as a supported locale** (`undeclared-scaffold`).
 *      `de.json` is 0 / 116. `validate:i18n-packs` reports it as `scaffold` and
 *      exits 0, because every key is an honest explicit `fallback` — which is
 *      correct, and is also why nothing stops a release note, a README or a
 *      docs page from saying "German is supported". A pack below the supported
 *      threshold must be named in `i18n-completeness-ceilings.json` with the
 *      decision that made it incomplete, or this gate fails. `stale-declaration`
 *      is the converse: a register entry that outlived its gap.
 *
 *   2. **English copied under a translated key** (`identical`, report + arithmetic).
 *      A translated value byte-identical to its English source is not counted
 *      as translated. No allowlist of "this English word is really German" —
 *      that is the evidence-laundering surface this programme keeps finding, so
 *      the threshold is 95 %, which absorbs the handful of legitimately
 *      identical values (`OK`, `Email`, `PDF`) and absorbs nothing else.
 *
 *   3. **A plural that is right for English and wrong for the locale**
 *      (`plural-categories`). This is the important one, and it is a *pack* rule
 *      rather than a formatter rule. `message-format.ts` checks that a selector
 *      is a CLDR category *name*; nothing checks that the message supplies every
 *      category the **locale** requires. A Polish pack declaring only
 *      `one`/`other` parses, satisfies `i18n-packs` rule 4 (same argument, same
 *      selector kind) and at runtime falls through `node.options[category] ??
 *      node.options.other` — rendering the `other` branch for `few` (2–4) and
 *      `many` (5+). Grammatically wrong Polish, green on every existing gate.
 *      Arabic needs six categories and would fall through on four. The required
 *      set comes from `Intl.PluralRules(locale).resolvedOptions().pluralCategories`
 *      — CLDR through the platform, never a hand-written table. `=N` exact
 *      selectors do not substitute for a category (`=1` covers exactly one;
 *      Russian's `one` covers 21, 31, 101).
 *
 *   4. **A locale whose script has no typeface** (`script-support`, REPORT-ONLY).
 *      TASK-AR-2 measured zero font binaries tracked in this repository and this
 *      gate re-measures it with `git ls-files` rather than trusting the note.
 *      Arabic, Hebrew and Persian text falls through to a platform substitute.
 *      It never fails: "the host supplies its script's typeface" is the
 *      recommended position (D63), not a defect, and failing would force either
 *      a purchase or a silent degradation. What it refuses to do is let the
 *      absence disappear — every row carries its script's provisioning status
 *      and a supported locale whose script is unprovisioned is annotated.
 *
 * ## What it never does
 *
 * It never writes a translation, never estimates one, and never counts an
 * unasserted case as passing. A locale with no pack is `unasserted` with a
 * reason; a script with no pack to exercise it is a forward declaration, not a
 * pass.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/i18n-completeness.ts            # check
 *   tsx packages/tooling/src/validators/i18n-completeness.ts --json     # machine-readable
 *
 * Exit code 1 if any rule fails. `script-support` findings never set it.
 */

import type { DzMessages } from '@dzup-ui/contracts'
import type { MessageNode } from '../../../core/src/i18n/message-format.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { parseMessage } from '../../../core/src/i18n/message-format.ts'
import { enMessages } from '../../../core/src/i18n/messages.ts'
import { catalogKeys, checkPack, flattenCatalog, LOCALES_DIR, SOURCE_LOCALE } from './i18n-packs.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
const CONFIG_PATH = resolve(dirname(fileURLToPath(import.meta.url)), 'i18n-completeness-ceilings.json')

export type CompletenessRule
  = | 'plural-categories' | 'undeclared-scaffold' | 'stale-declaration'
    | 'supported-floor' | 'arity' | 'script-support'

export interface CompletenessViolation {
  readonly file: string
  readonly rule: CompletenessRule
  readonly key?: string
  readonly message: string
}

/** Scripts this gate can reason about. A locale outside them reports `unknown`. */
export type LocaleScript = 'latin' | 'arabic' | 'hebrew' | 'unknown'

export interface ScriptSupport {
  readonly provisionedBy: string
  readonly detail: string
  readonly decision: string | null
}

export interface CompletenessConfig {
  readonly supported: { readonly minSupportedLocales: number, readonly minCompletenessPercent: number }
  readonly scaffolds: ReadonlyArray<{ readonly locale: string, readonly decision: string, readonly reason: string, readonly blockedOn?: string }>
  readonly scriptSupport: Readonly<Record<string, ScriptSupport>>
}

export interface LocaleRow {
  readonly locale: string
  readonly direction: 'ltr' | 'rtl'
  /** `source` for the pack English is generated from. */
  readonly role: 'source' | 'translation'
  readonly keys: number
  readonly translated: number
  /** Translated values byte-identical (whitespace-normalised) to English. */
  readonly identical: number
  /** Neither translated nor an explicit fallback — `i18n-packs` rule 1. */
  readonly missing: number
  /** `arguments` + `syntax` violations from `checkPack()` — one source of truth. */
  readonly arityErrors: number
  /** Translated plural messages missing a category this locale requires. */
  readonly pluralErrors: number
  /** Categories declared that this locale never selects. Report-only. */
  readonly pluralUnused: number
  /** (translated − identical) / keys, 0–100, one decimal. `en` is 100 by construction. */
  readonly completeness: number
  readonly script: LocaleScript
  readonly supported: boolean
  /** Register entry when the pack is deliberately incomplete. */
  readonly scaffoldDecision: string | null
}

export function readConfig(path: string = CONFIG_PATH): CompletenessConfig {
  return JSON.parse(readFileSync(path, 'utf8')) as CompletenessConfig
}

// ---------------------------------------------------------------------------
// Plural categories — CLDR through Intl, never a table
// ---------------------------------------------------------------------------

/**
 * The plural categories `locale` actually selects, from the platform's CLDR.
 *
 * `en` → `one, other`. `de` → `one, other`. `pl` → `one, few, many, other`.
 * `ar` → `zero, one, two, few, many, other`. `ja` → `other`. A hand-written
 * table would be wrong within a CLDR release; this cannot be.
 */
export function requiredPluralCategories(locale: string, type: 'cardinal' | 'ordinal' = 'cardinal'): readonly string[] {
  try {
    return [...new Intl.PluralRules(locale, { type }).resolvedOptions().pluralCategories].sort()
  }
  catch {
    // An unresolvable tag is a `shape`/`direction` problem `i18n-packs` owns;
    // here it means "cannot decide", and cannot-decide is never a pass.
    return []
  }
}

interface PluralUse {
  readonly name: string
  readonly type: 'cardinal' | 'ordinal'
  readonly declared: readonly string[]
}

/** Every plural/selectordinal in a parsed message, with the categories it declares. */
export function pluralUses(nodes: readonly MessageNode[]): PluralUse[] {
  const out: PluralUse[] = []
  const walk = (list: readonly MessageNode[]): void => {
    for (const node of list) {
      if (node.type === 'plural') {
        out.push({
          name: node.name,
          type: node.ordinal ? 'ordinal' : 'cardinal',
          declared: Object.keys(node.options).filter(selector => !selector.startsWith('=')),
        })
        for (const branch of Object.values(node.options)) walk(branch)
      }
      else if (node.type === 'select') {
        for (const branch of Object.values(node.options)) walk(branch)
      }
    }
  }
  walk(nodes)
  return out
}

export interface PluralGap {
  readonly argument: string
  readonly type: 'cardinal' | 'ordinal'
  readonly missing: readonly string[]
  readonly unused: readonly string[]
}

/**
 * Compare one translated message's plural branches with what `locale` requires.
 *
 * `missing` is a failure: the formatter will render the `other` branch where the
 * language needs a different form. `unused` is report-only: a branch the locale
 * never selects is dead weight, not a wrong rendering.
 */
export function pluralCategoryGaps(locale: string, message: string): PluralGap[] {
  let nodes: readonly MessageNode[]
  try {
    nodes = parseMessage(message)
  }
  catch {
    return [] // a syntax error is `i18n-packs` rule 3; not counted twice
  }
  const gaps: PluralGap[] = []
  for (const use of pluralUses(nodes)) {
    const required = requiredPluralCategories(locale, use.type)
    if (required.length === 0)
      continue
    const declared = new Set(use.declared)
    const missing = required.filter(category => !declared.has(category))
    const unused = use.declared.filter(category => !required.includes(category))
    if (missing.length > 0 || unused.length > 0)
      gaps.push({ argument: use.name, type: use.type, missing, unused })
  }
  return gaps
}

// ---------------------------------------------------------------------------
// Identical-to-English
// ---------------------------------------------------------------------------

/**
 * `true` when a "translation" is the English string.
 *
 * **Defined in `i18n-packs.ts` since RESIDUAL-02 (2026-09-25)** and re-exported
 * here, where it was first written. It moved because `validate:i18n-packs` rule 9
 * needs the same predicate to decide whether a pack is publishable, and two
 * copies of it is how the two gates came to disagree in the first place
 * (TASK-S5-O1 finding F1). `i18n-packs.ts` is the lower layer — this module
 * already imports `checkPack`, `flattenCatalog` and `catalogKeys` from it — so
 * that is where the definition lives and the dependency stays one-way.
 */
export { isUntranslated } from './i18n-packs.ts'

// ---------------------------------------------------------------------------
// Script and typeface
// ---------------------------------------------------------------------------

const ARABIC_SCRIPT = new Set(['ar', 'fa', 'ur', 'ps', 'ks', 'sd', 'ckb', 'khw', 'dv'])
const HEBREW_SCRIPT = new Set(['he', 'yi', 'arc'])

/** The script a locale's text is drawn in — what decides whether a face exists. */
export function scriptForLocale(locale: string): LocaleScript {
  const language = locale.toLowerCase().split('-')[0] ?? ''
  if (ARABIC_SCRIPT.has(language))
    return 'arabic'
  if (HEBREW_SCRIPT.has(language))
    return 'hebrew'
  return language === '' ? 'unknown' : 'latin'
}

/** AR-2's measurement, re-taken: font binaries tracked in this repository. */
export function trackedFontBinaries(root: string = ROOT): string[] {
  try {
    const out = execFileSync('git', ['ls-files', '*.woff', '*.woff2', '*.ttf', '*.otf', '*.eot'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 8 * 1024 * 1024,
    }).trim()
    return out === '' ? [] : out.split('\n').map(line => line.trim())
  }
  catch {
    return []
  }
}

/**
 * Option B's landing place: a `--dz-font-family-<script>` token in `@dzup-ui/tokens`.
 *
 * The moment such a token exists the gate reports `token-provisioned` for that
 * script with no edit here — so D63's option B records itself.
 */
export function scriptFontToken(script: LocaleScript, root: string = ROOT): string | null {
  if (script === 'latin' || script === 'unknown')
    return null
  const name = `--dz-font-family-${script}`
  const dir = resolve(root, 'packages/tokens/src')
  const walk = (at: string): boolean => {
    if (!existsSync(at))
      return false
    for (const entry of readdirSync(at, { withFileTypes: true })) {
      const full = join(at, entry.name)
      if (entry.isDirectory()) {
        if (walk(full))
          return true
        continue
      }
      if (!entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts'))
        continue
      // The token may be written `--dz-font-family-arabic` or built from the
      // family key `'font-family-arabic'`; both spellings count.
      const source = readFileSync(full, 'utf8')
      if (source.includes(name) || source.includes(`font-family-${script}`))
        return true
    }
    return false
  }
  return walk(dir) ? name : null
}

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

/** Measure one pack. Pure over its inputs, so the spec can seed every case. */
export function measurePack(
  display: string,
  raw: unknown,
  config: CompletenessConfig,
): { row?: LocaleRow, violations: CompletenessViolation[] } {
  const packCheck = checkPack(display, raw)
  const coverage = packCheck.coverage
  if (coverage === undefined)
    return { violations: [] } // an unparseable pack is `i18n-packs`' shape failure

  const pack = raw as { locale: string, direction: 'ltr' | 'rtl', messages: DzMessages }
  const english = flattenCatalog(enMessages as unknown as DzMessages)
  const translated = flattenCatalog(pack.messages)
  const violations: CompletenessViolation[] = []
  const isSource = pack.locale === SOURCE_LOCALE

  // Not recounted here. `checkPack` already applied `isUntranslated` to arrive at
  // `coverage.effective`, and rule 9 of `validate:i18n-packs` reads that same
  // number to decide whether the pack is publishable (RESIDUAL-02). Subtracting
  // is what makes it impossible for this gate's percentage and that gate's
  // publication test to disagree — the failure mode TASK-S5-O1 filed as F1.
  const identical = coverage.translated - coverage.effective
  let pluralErrors = 0
  let pluralUnusedCount = 0
  for (const [key, value] of translated) {
    const source = english.get(key)
    if (typeof source !== 'string' || typeof value !== 'string')
      continue
    for (const gap of pluralCategoryGaps(pack.locale, value)) {
      if (gap.missing.length > 0) {
        pluralErrors += 1
        violations.push({
          file: display,
          rule: 'plural-categories',
          key,
          message: `{${gap.argument}} declares no "${gap.missing.join('", "')}" branch, and ${pack.locale} `
            + `selects ${gap.type === 'ordinal' ? 'ordinal' : 'cardinal'} `
            + `${requiredPluralCategories(pack.locale, gap.type).join(', ')} — the formatter would render `
            + '`other` for those counts, which is the wrong form in this language',
        })
      }
      if (gap.unused.length > 0)
        pluralUnusedCount += 1
    }
  }

  const arityErrors = packCheck.violations.filter(v => v.rule === 'arguments' || v.rule === 'syntax').length
  const missing = packCheck.violations.filter(v => v.rule === 'missing').length
  for (const violation of packCheck.violations.filter(v => v.rule === 'arguments' || v.rule === 'syntax')) {
    violations.push({
      file: display,
      rule: 'arity',
      key: violation.key,
      message: `${violation.message} (also reported by validate:i18n-packs rule ${violation.rule})`,
    })
  }

  // `coverage.effective` already exempts the source pack, so `isSource` no longer
  // has to be branched on here; it still decides what the table prints.
  const effective = coverage.effective
  const completeness = coverage.total === 0 ? 0 : Math.round((effective / coverage.total) * 1000) / 10
  const register = config.scaffolds.find(entry => entry.locale === pack.locale) ?? null

  return {
    row: {
      locale: pack.locale,
      direction: pack.direction,
      role: isSource ? 'source' : 'translation',
      keys: coverage.total,
      translated: coverage.translated,
      identical,
      missing,
      arityErrors,
      pluralErrors,
      pluralUnused: pluralUnusedCount,
      completeness,
      script: scriptForLocale(pack.locale),
      supported: completeness >= config.supported.minCompletenessPercent,
      scaffoldDecision: register === null ? null : register.decision,
    },
    violations,
  }
}

/** The register and floor rules — everything a per-pack measurement cannot decide. */
export function checkRegister(rows: readonly LocaleRow[], config: CompletenessConfig): CompletenessViolation[] {
  const file = relative(ROOT, CONFIG_PATH).replaceAll('\\', '/')
  const out: CompletenessViolation[] = []
  const threshold = config.supported.minCompletenessPercent

  for (const row of rows) {
    if (!row.supported && row.scaffoldDecision === null) {
      out.push({
        file,
        rule: 'undeclared-scaffold',
        key: row.locale,
        message: `"${row.locale}" is ${row.completeness} % complete, below the ${threshold} % supported threshold, `
          + 'and is not listed in `scaffolds` — an incomplete locale must be incomplete on the record, with the '
          + 'decision that made it so. Add it with a decision id and a reason, or finish the translation.',
      })
    }
    if (row.supported && row.scaffoldDecision !== null) {
      out.push({
        file,
        rule: 'stale-declaration',
        key: row.locale,
        message: `"${row.locale}" has reached ${row.completeness} % and is still registered as a scaffold `
          + `(${row.scaffoldDecision}) — remove the entry so the register cannot outlive the gap it describes.`,
      })
    }
  }

  for (const entry of config.scaffolds) {
    if (!rows.some(row => row.locale === entry.locale)) {
      out.push({
        file,
        rule: 'stale-declaration',
        key: entry.locale,
        message: `\`scaffolds\` names "${entry.locale}" (${entry.decision}) but no such pack exists`,
      })
    }
  }

  const supported = rows.filter(row => row.supported)
  if (supported.length < config.supported.minSupportedLocales) {
    out.push({
      file,
      rule: 'supported-floor',
      message: `${supported.length} locale(s) at >= ${threshold} % completeness, but the floor is `
        + `${config.supported.minSupportedLocales}. A locale regressed below the threshold, or a pack was removed. `
        + 'The floor may only RISE — never lower it to make this pass.',
    })
  }
  return out
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function completenessLabel(row: LocaleRow, config: CompletenessConfig): string {
  if (row.role === 'source')
    return 'source (100 %)'
  const entry = config.scaffolds.find(item => item.locale === row.locale)
  if (entry !== undefined)
    return `${row.completeness} % (scaffold — ${entry.blockedOn ?? 'awaiting translator'}, decision ${entry.decision})`
  return `${row.completeness} %${row.supported ? '' : ' (below threshold)'}`
}

export function renderTable(rows: readonly LocaleRow[], config: CompletenessConfig): string {
  const lines = [
    '| Locale | Dir | Keys | Translated | Identical-to-en | Missing | Arity errors | Plural-category errors | Completeness |',
    '|---|---|---:|---:|---:|---:|---:|---:|---|',
  ]
  for (const row of rows) {
    lines.push(
      `| ${row.locale} | ${row.direction} | ${row.keys} `
      + `| ${row.role === 'source' ? '—' : row.translated} `
      + `| ${row.role === 'source' ? '—' : row.identical} `
      + `| ${row.missing} | ${row.arityErrors} | ${row.pluralErrors} | ${completenessLabel(row, config)} |`,
    )
  }
  return lines.join('\n')
}

/**
 * Report-only script/typeface findings. Never sets the exit code.
 *
 * Iterates the **register**, not the packs. If it iterated the packs, the Arabic
 * finding would vanish the moment no Arabic pack existed — which is the state
 * today, and is exactly the state AR-2 was written about. A declared script that
 * no pack exercises is reported `no pack exercises it` rather than omitted or
 * counted as passing (the S3-O3 rule: unasserted is reported unasserted). A
 * script a pack uses that the register does not describe is also reported.
 */
export function scriptFindings(rows: readonly LocaleRow[], config: CompletenessConfig): CompletenessViolation[] {
  const fonts = trackedFontBinaries()
  const out: CompletenessViolation[] = []

  for (const [script, support] of Object.entries(config.scriptSupport)) {
    // `//` and `$…` keys are schema prose, the convention every ceilings file in
    // this directory uses; `collectCeilings` skips them the same way.
    if (script === '//' || script.startsWith('$'))
      continue
    const using = rows.filter(row => row.script === script).map(row => row.locale)
    const token = scriptFontToken(script as LocaleScript)
    const provisioned = token !== null ? `token-provisioned (${token})` : support.provisionedBy
    const exercised = using.length === 0
      ? 'no pack exercises it (forward declaration — unasserted, not passing)'
      : `pack(s): ${using.join(', ')}`
    out.push({
      file: 'packages/tokens/src',
      rule: 'script-support',
      key: script,
      message: `${script}: ${provisioned}${support.decision === null ? '' : ` — decision ${support.decision}`}`
        + `${provisioned === 'none' ? `; ${fonts.length} font binaries tracked in this repository, so the host supplies the face` : ''}`
        + ` — ${exercised}`,
    })
  }

  for (const row of rows) {
    if (config.scriptSupport[row.script] === undefined) {
      out.push({
        file: 'packages/tokens/src',
        rule: 'script-support',
        key: row.script,
        message: `locale "${row.locale}" is written in "${row.script}", which the script-support register does not `
          + 'describe — unasserted, not passing',
      })
    }
  }
  return out
}

function packFiles(): string[] {
  if (!existsSync(LOCALES_DIR))
    return []
  return readdirSync(LOCALES_DIR).filter(name => name.endsWith('.json')).sort()
}

function main(): void {
  const config = readConfig()
  const rows: LocaleRow[] = []
  const violations: CompletenessViolation[] = []

  for (const name of packFiles()) {
    const file = join(LOCALES_DIR, name)
    const display = relative(ROOT, file).replaceAll('\\', '/')
    let raw: unknown
    try {
      raw = JSON.parse(readFileSync(file, 'utf8'))
    }
    catch {
      continue // `validate:i18n-packs` owns and reports unparseable JSON
    }
    const measured = measurePack(display, raw, config)
    violations.push(...measured.violations)
    if (measured.row !== undefined)
      rows.push(measured.row)
  }

  violations.push(...checkRegister(rows, config))
  const findings = scriptFindings(rows, config)
  const supported = rows.filter(row => row.supported)

  if (process.argv.includes('--json')) {
    console.warn(JSON.stringify({
      catalogKeys: catalogKeys().length,
      threshold: config.supported.minCompletenessPercent,
      supportedLocales: supported.map(row => row.locale),
      minSupportedLocales: config.supported.minSupportedLocales,
      rows,
      violations,
      scriptFindings: findings,
    }, null, 2))
  }
  else {
    console.warn(`i18n completeness — ${catalogKeys().length} catalog keys, ${rows.length} pack(s)\n`)
    console.warn(renderTable(rows, config))
    console.warn(
      `\nlocales at >= ${config.supported.minCompletenessPercent} % completeness: ${supported.length} `
      + `(${supported.map((row) => {
        const support = config.scriptSupport[row.script]
        const unprovisioned = support !== undefined && support.provisionedBy === 'none' && scriptFontToken(row.script) === null
        return `${row.locale}${unprovisioned ? ` [${row.script} script unprovisioned — ${support.decision}]` : ''}`
      }).join(', ')}) `
      + `— floor ${config.supported.minSupportedLocales}`,
    )
    console.warn('\nscript/typeface provisioning (report-only, never fails this gate):')
    for (const finding of findings)
      console.warn(`  [${finding.rule}] ${finding.message}`)
  }

  if (violations.length === 0) {
    console.warn(`\ni18n completeness: ${rows.length} pack(s) measured, 0 violation(s)`)
    return
  }

  console.error(`\ni18n completeness FAILED: ${violations.length} violation(s)\n`)
  for (const violation of violations)
    console.error(`  [${violation.rule}] ${violation.file}${violation.key === undefined ? '' : ` ${violation.key}`}: ${violation.message}`)
  process.exit(1)
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main()
