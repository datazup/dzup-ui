#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Deprecation-record validator (TASK-S2-O2).
 *
 * 08-11 doc 06 §"API compatibility and deprecation" says a deprecation ships
 * with **eight** things: a runtime development warning when practical, a typed
 * annotation, docs, a replacement example, a codemod or adapter where feasible,
 * the first deprecated version, the earliest removal version, and a rollback
 * path. `packages/contracts/VERSIONING.md` §4 repeats the requirement and then
 * says, in its own words, that nothing enforces it:
 *
 * > **There is no repository-wide ledger of deprecated symbols.** Three partial
 * > ones exist … Nothing records a deprecated *prop*, *part* or *state*. That
 * > gap is recorded, not closed here.
 *
 * This closes it. `packages/contracts/deprecations.json` is the ledger; this
 * file is the gate that keeps it honest in both directions.
 *
 * ## The four failure modes
 *
 * 1. **annotated without a record** — an `@deprecated` JSDoc no record claims.
 *    This is the ratchet: the count must reach and stay at 0.
 * 2. **record without an annotation** — a record whose symbol is no longer
 *    annotated (removed, or the annotation was dropped). A ledger that keeps
 *    entries for symbols nobody deprecated is a ledger nobody trusts.
 * 3. **earliest removal has passed** — `earliestRemoval <= the package's
 *    current version` while the symbol is still annotated. The window closed
 *    and nothing acted on it.
 * 4. **codemod that no codemod provides** — a `codemod` id with no
 *    `packages/codemods/src/transforms/<id>.ts` behind it.
 *
 * Plus the schema rules the record shape itself carries: a replacement is never
 * null; `codemod: null` requires written `migration` instructions (VERSIONING.md
 * §4's stated alternative); and a `runtimeWarning` that is `absent` or
 * `not-applicable` requires a reason, because doc 06 says "when practical" and
 * an unexplained absence is indistinguishable from an oversight.
 *
 * ## Why prose is separated mechanically, not by an allowlist
 *
 * Three files at `4e4e46f` *write about* the tag rather than carrying it —
 * `packages/tokens/src/dtcg.ts` (×2, the doc comment on `DEPRECATED_TOKENS`)
 * and `packages/tooling/src/meta/component-meta.ts` (×1, the doc comment on the
 * `deprecated` field). All three spell it inside backticks, and every real
 * annotation spells it bare, because that is what JSDoc requires. Stripping
 * inline-code spans before matching therefore separates them by the grammar
 * rather than by a hand-maintained exception list that the next prose mention
 * would have to be added to.
 *
 * Usage:
 *   node node_modules/tsx/dist/cli.mjs packages/tooling/src/validators/deprecations.ts
 *   … --json            machine-readable report on stdout
 *
 * Exit code 1 on any violation.
 *
 * @module @dzup-ui/tooling/validators/deprecations
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')
export const REGISTRY_PATH = resolve(ROOT, 'packages/contracts/deprecations.json')

// --- The record shape -------------------------------------------------------

/**
 * The runtime development warning doc 06 asks for "when practical".
 *
 * `absent` and `not-applicable` are conformant states — a CSS custom property
 * genuinely has no runtime call site — but only with a `reason`. An absence
 * with no reason is an oversight wearing a schema.
 */
export interface RuntimeWarning {
  status: 'present' | 'absent' | 'not-applicable'
  mechanism?: string | null
  evidence?: string | null
  reason?: string
}

/** One deprecated symbol, as `packages/contracts/deprecations.json` records it. */
export interface DeprecationRecord {
  symbol: string
  package: string
  kind: 'component' | 'function' | 'module' | 'prop' | 'token'
  annotation: { file: string, anchor?: string }
  replacement: string
  replacementExample?: string
  firstDeprecated: string
  firstDeprecatedBasis?: string
  earliestRemoval: string
  earliestRemovalBasis?: string
  codemod: string | null
  codemodGap?: string
  migration?: string
  runtimeWarning: RuntimeWarning
  rollback: string
  owner: string
  docs: string
}

export interface DeprecationRegistry {
  $schemaVersion: string
  $rules: { annotationWindow: number, scanGlobs: string[], [k: string]: unknown }
  records: DeprecationRecord[]
}

export function readRegistry(path: string = REGISTRY_PATH): DeprecationRegistry {
  return JSON.parse(readFileSync(path, 'utf8')) as DeprecationRegistry
}

// --- Scanning ---------------------------------------------------------------

/** One `@deprecated` JSDoc annotation found in source. */
export interface Annotation {
  /** Repo-relative, forward-slashed. */
  file: string
  /** 1-based. */
  line: number
  text: string
}

/**
 * Is this line a real annotation, or prose (or code) that merely names the tag?
 *
 * Two rules, both taken from the JSDoc grammar rather than from an allowlist:
 *
 * 1. **Inline-code spans are removed first.** A tag written inside backticks is
 *    a document describing the tag, and JSDoc would not parse it either.
 * 2. **A block tag opens its line.** After the comment marker (`*`, the opening
 *    of a one-line block, or `//`) the tag is the first token. JSDoc requires
 *    this; prose that mentions the tag mid-sentence does not satisfy it, and
 *    neither does a regex literal or a template string that contains the word.
 *
 * Rule 2 was added after the first run of this validator reported **four**
 * annotations that do not exist — all four in *its own source*, where the word
 * appears in a regex, in two template literals and in one sentence of this very
 * doc comment. A scanner that cannot tell a tag from a mention of a tag would
 * have put four permanent false entries into the ledger it exists to keep
 * honest. Same class as TASK-S2-O1's finding F6, produced the same way: by the
 * new gate's first run, against itself.
 */
export function isAnnotationLine(line: string): boolean {
  const withoutCodeSpans = line.replaceAll(/`[^`]*`/g, '')
  return /^\s*(?:\/\*{2,}|\*|\/\/)\s*@deprecated\b/.test(withoutCodeSpans)
}

/**
 * Every `.ts` / `.vue` file under each package's `src`, excluding build output.
 *
 * Spelled without the glob on purpose: `packages/<star>/src` inside a JSDoc
 * block closes the comment at the `<star>/`, and the rest of the line is then
 * parsed as code. It cost a run here; it is written out so it does not cost
 * another one.
 */
export function sourceFiles(root: string = ROOT): string[] {
  const out: string[] = []
  const packagesDir = join(root, 'packages')
  if (!existsSync(packagesDir))
    return out

  const skip = new Set(['node_modules', 'dist', '.turbo', 'coverage', '__fixtures__'])
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (skip.has(entry))
        continue
      const full = join(dir, entry)
      if (statSync(full).isDirectory())
        walk(full)
      else if (/\.(?:ts|vue)$/.test(entry))
        out.push(relative(root, full).replaceAll('\\', '/'))
    }
  }

  for (const pkg of readdirSync(packagesDir)) {
    const src = join(packagesDir, pkg, 'src')
    if (existsSync(src) && statSync(src).isDirectory())
      walk(src)
  }
  return out.sort()
}

export function scanAnnotations(root: string = ROOT, files: string[] = sourceFiles(root)): Annotation[] {
  const found: Annotation[] = []
  for (const file of files) {
    const lines = readFileSync(join(root, file), 'utf8').split(/\r?\n/)
    lines.forEach((text, i) => {
      if (isAnnotationLine(text))
        found.push({ file, line: i + 1, text: text.trim() })
    })
  }
  return found
}

// --- Version comparison -----------------------------------------------------

/**
 * Compare two `0.x`-era versions. Returns <0, 0 or >0.
 *
 * Prerelease handling matters here and only here: every package in this
 * repository that has never shipped is on a `-alpha.0` tail, and
 * `0.1.0-alpha.0 < 0.1.0` has to hold or "the removal window has passed" fires
 * on packages that have not had a window at all.
 */
export function compareVersions(a: string, b: string): number {
  const split = (v: string): { nums: number[], pre: string[] } => {
    const parts = v.split('-')
    const core = parts[0] ?? v
    const pre = parts.slice(1).join('-')
    return {
      nums: core.split('.').map(n => Number.parseInt(n, 10) || 0),
      pre: pre === '' ? [] : pre.split('.'),
    }
  }
  const left = split(a)
  const right = split(b)
  for (let i = 0; i < 3; i++) {
    const d = (left.nums[i] ?? 0) - (right.nums[i] ?? 0)
    if (d !== 0)
      return d
  }
  // A version WITH a prerelease tail precedes the same version without one.
  if (left.pre.length === 0 && right.pre.length > 0)
    return 1
  if (left.pre.length > 0 && right.pre.length === 0)
    return -1
  for (let i = 0; i < Math.max(left.pre.length, right.pre.length); i++) {
    const l = left.pre[i]
    const r = right.pre[i]
    if (l === r)
      continue
    if (l === undefined)
      return -1
    if (r === undefined)
      return 1
    const ln = Number.parseInt(l, 10)
    const rn = Number.parseInt(r, 10)
    if (!Number.isNaN(ln) && !Number.isNaN(rn))
      return ln - rn
    return l < r ? -1 : 1
  }
  return 0
}

export function packageVersions(root: string = ROOT): Record<string, string> {
  const versions: Record<string, string> = {}
  const packagesDir = join(root, 'packages')
  if (!existsSync(packagesDir))
    return versions
  for (const dir of readdirSync(packagesDir)) {
    const manifest = join(packagesDir, dir, 'package.json')
    if (!existsSync(manifest))
      continue
    const pkg = JSON.parse(readFileSync(manifest, 'utf8')) as { name?: string, version?: string }
    if (pkg.name)
      versions[pkg.name] = pkg.version ?? '0.0.0'
  }
  return versions
}

// --- The check --------------------------------------------------------------

export type DeprecationRule
  = | 'annotated-without-record'
    | 'record-without-annotation'
    | 'ambiguous-annotation'
    | 'removal-overdue'
    | 'missing-codemod'
    | 'schema'

export interface DeprecationViolation {
  rule: DeprecationRule
  subject: string
  detail: string
  remedy: string
}

export interface DeprecationReport {
  /** Real annotations found in source (prose excluded). */
  annotations: number
  /** Annotations a record claims. */
  withRecord: number
  /** Annotations no record claims — the ratchet. */
  withoutRecord: number
  records: number
  /** Records whose `runtimeWarning.status` is not `present`, with a reason. */
  withoutRuntimeWarning: number
  /** Records with no codemod, carrying written instructions instead. */
  withoutCodemod: number
  violations: DeprecationViolation[]
  unclaimed: Annotation[]
}

/**
 * Pair each record with the annotation it claims, then check both directions.
 *
 * Matching is by file, narrowed by `anchor` when a file carries more than one
 * annotation: the anchor is a literal substring that must appear within
 * `annotationWindow` lines *after* the tag, and the closest qualifying
 * annotation wins. Line numbers are deliberately not part of the key — they
 * drift on every edit above them, and a ledger that goes red because someone
 * added an import is a ledger that gets deleted.
 */
export function checkDeprecations(
  registry: DeprecationRegistry,
  annotations: Annotation[],
  versions: Record<string, string>,
  root: string = ROOT,
): DeprecationReport {
  const violations: DeprecationViolation[] = []
  const window = registry.$rules.annotationWindow ?? 15
  const claimed = new Map<string, DeprecationRecord>()

  const key = (a: Annotation): string => `${a.file}:${a.line}`

  for (const record of registry.records) {
    const inFile = annotations.filter(a => a.file === record.annotation.file)

    if (inFile.length === 0) {
      violations.push({
        rule: 'record-without-annotation',
        subject: record.symbol,
        detail: `no \`@deprecated\` annotation in ${record.annotation.file}`,
        remedy: 'restore the annotation, or delete the record if the symbol was removed',
      })
      continue
    }

    let chosen: Annotation | undefined
    if (record.annotation.anchor === undefined) {
      if (inFile.length > 1) {
        violations.push({
          rule: 'ambiguous-annotation',
          subject: record.symbol,
          detail: `${record.annotation.file} carries ${inFile.length} annotations and this record declares no \`anchor\``,
          remedy: 'add `annotation.anchor` — a literal substring of the declaration that follows the tag',
        })
        continue
      }
      chosen = inFile[0]
    }
    else {
      const lines = readFileSync(join(root, record.annotation.file), 'utf8').split(/\r?\n/)
      const candidates = inFile
        .map((a) => {
          const slice = lines.slice(a.line, a.line + window)
          const offset = slice.findIndex(l => l.includes(record.annotation.anchor as string))
          return { annotation: a, offset }
        })
        .filter(c => c.offset !== -1)
        .sort((x, y) => x.offset - y.offset)
      chosen = candidates[0]?.annotation
      if (chosen === undefined) {
        violations.push({
          rule: 'record-without-annotation',
          subject: record.symbol,
          detail: `no annotation in ${record.annotation.file} is followed within ${window} lines by \`${record.annotation.anchor}\``,
          remedy: 'fix `annotation.anchor`, or restore the annotation next to the declaration',
        })
        continue
      }
    }

    /* c8 ignore next 2 -- both branches above either assign `chosen` or `continue`; this narrows the type for the compiler. */
    if (chosen === undefined)
      continue

    const existing = claimed.get(key(chosen))
    if (existing !== undefined) {
      violations.push({
        rule: 'ambiguous-annotation',
        subject: record.symbol,
        detail: `claims the same annotation as \`${existing.symbol}\` (${key(chosen)})`,
        remedy: 'give each record an `anchor` that resolves to its own declaration',
      })
      continue
    }
    claimed.set(key(chosen), record)

    // --- Per-record schema and policy rules ---
    const current = versions[record.package]
    if (current === undefined) {
      violations.push({
        rule: 'schema',
        subject: record.symbol,
        detail: `package \`${record.package}\` is not a workspace package`,
        remedy: 'correct the `package` field',
      })
    }
    else if (compareVersions(record.earliestRemoval, current) <= 0) {
      violations.push({
        rule: 'removal-overdue',
        subject: record.symbol,
        detail: `earliestRemoval ${record.earliestRemoval} <= ${record.package}@${current}, and the symbol is still annotated`,
        remedy: 'remove the symbol in the next minor, or move `earliestRemoval` forward with a recorded `earliestRemovalBasis`',
      })
    }

    if (record.codemod !== null) {
      const transform = join(root, 'packages/codemods/src/transforms', `${record.codemod}.ts`)
      if (!existsSync(transform)) {
        violations.push({
          rule: 'missing-codemod',
          subject: record.symbol,
          detail: `codemod \`${record.codemod}\` has no packages/codemods/src/transforms/${record.codemod}.ts`,
          remedy: 'write the transform, or set `codemod: null` and add written `migration` instructions',
        })
      }
    }
    else if (!record.migration) {
      violations.push({
        rule: 'schema',
        subject: record.symbol,
        detail: '`codemod` is null and no written `migration` instructions are recorded',
        remedy: 'VERSIONING.md §4 allows written instructions where the change is not mechanical — write them',
      })
    }

    if (!record.replacement) {
      violations.push({
        rule: 'schema',
        subject: record.symbol,
        detail: 'no `replacement` — VERSIONING.md §4 requires a named one',
        remedy: 'name the replacement, or this is a removal announcement rather than a deprecation',
      })
    }
    if (!record.rollback) {
      violations.push({ rule: 'schema', subject: record.symbol, detail: 'no `rollback` path', remedy: 'state what a consumer does if the replacement does not work for them' })
    }
    if (record.runtimeWarning.status !== 'present' && !record.runtimeWarning.reason) {
      violations.push({
        rule: 'schema',
        subject: record.symbol,
        detail: `runtimeWarning.status is \`${record.runtimeWarning.status}\` with no \`reason\``,
        remedy: 'doc 06 says "when practical" — say why it is not, or add the warning',
      })
    }
  }

  const unclaimed = annotations.filter(a => !claimed.has(key(a)))
  for (const a of unclaimed) {
    violations.push({
      rule: 'annotated-without-record',
      subject: `${a.file}:${a.line}`,
      detail: a.text.length > 110 ? `${a.text.slice(0, 110)}…` : a.text,
      remedy: 'add a record to packages/contracts/deprecations.json',
    })
  }

  return {
    annotations: annotations.length,
    withRecord: claimed.size,
    withoutRecord: unclaimed.length,
    records: registry.records.length,
    withoutRuntimeWarning: registry.records.filter(r => r.runtimeWarning.status !== 'present').length,
    withoutCodemod: registry.records.filter(r => r.codemod === null).length,
    violations,
    unclaimed,
  }
}

/** The whole check, at the repository's current state. */
export function runDeprecationCheck(root: string = ROOT): DeprecationReport {
  return checkDeprecations(readRegistry(), scanAnnotations(root), packageVersions(root), root)
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const report = runDeprecationCheck()

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2))
    process.exit(report.violations.length === 0 ? 0 : 1)
  }

  console.warn(
    `deprecations: ${report.annotations} \`@deprecated\` symbol(s) in packages/*/src — `
    + `${report.withRecord} WITH a record, ${report.withoutRecord} WITHOUT.`,
  )
  console.warn(
    `  ${report.records} record(s) in packages/contracts/deprecations.json · `
    + `${report.withoutCodemod} with written instructions instead of a codemod · `
    + `${report.withoutRuntimeWarning} without a runtime dev warning (each with a recorded reason)`,
  )

  if (report.violations.length === 0) {
    console.warn('✓ every annotation is accounted for and every record still has its annotation')
    process.exit(0)
  }

  for (const v of report.violations) {
    console.error(`✗ [${v.rule}] ${v.subject}: ${v.detail}`)
    console.error(`  → ${v.remedy}`)
  }
  console.error(`\n${report.violations.length} deprecation violation(s).`)
  console.error('  The ledger is packages/contracts/deprecations.json; doc 06 and VERSIONING.md §4 are the contract.')
  process.exit(1)
}
/* c8 ignore stop */
