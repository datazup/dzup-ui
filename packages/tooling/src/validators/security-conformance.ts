/**
 * Security-conformance drift gate (TASK-S3-O3).
 *
 * `validate:security-corpus` next door proves the fixture **format** is
 * well-formed: three copies of the record shape agreeing, every data file valid
 * against both the JSON Schema and the checker. It says nothing about whether
 * any sanitizer actually neutralises any of those payloads, because a format
 * cannot.
 *
 * This gate closes that. It runs `@dzup-ui/testing/security-conformance` — the
 * published runner — against **this repository's own adapter**, the one
 * `useDzSanitizer` hands a component when a host has installed nothing:
 * `resolveSanitizer()` wrapping `DZ_ESCAPING_SANITIZER`. The per-fixture verdicts
 * it produces are compared with the recorded reference in
 * `packages/core/security/sanitizer-conformance.reference.json`.
 *
 * What it fails on, in order of severity:
 *
 * 1. **A fail-closed property that no longer holds.** The runner measures four
 *    (absent adapter refused, throwing adapter blocks, identity adapter
 *    non-conforming, empty applicable set refused). If any is
 *    `NOT FAIL-CLOSED`, every other number in the run is unreliable, because the
 *    runner could then report a pass for an adapter that is absent or a stub.
 * 2. **A non-conforming cell.** Core's adapter failing a fixture is a defect in
 *    Core, not in the reference, and it fails whatever the reference says.
 * 3. **A verdict that changed.** The reference records
 *    `"<fixtureId>:<sink>" → verdict`. A cell whose verdict moved, appeared or
 *    disappeared is drift, and the gate names the cell and both verdicts. This
 *    is the check the seeded proof exercises.
 * 4. **A version or fingerprint mismatch.** The runner version, the corpus
 *    content version, the corpus schema version and the corpus fingerprint are
 *    all recorded. A corpus edit without a version bump lands here.
 * 5. **An unasserted cell that changed.** A cell can only be unasserted for a
 *    named reason; one silently leaving the list (because the fixture was
 *    deleted) would otherwise look like progress.
 *
 * The `sourceCommit` in the reference is **provenance, not an assertion**. A gate
 * spelled `sourceCommit === HEAD` is red on the commit that lands the
 * regeneration, which is the commit where the artifact is most correct — see
 * `evidence-binding.json`'s own `$whyNotEqualsHead`. It is reported and never
 * compared.
 *
 * Usage:
 *   tsx packages/tooling/src/validators/security-conformance.ts
 *   tsx packages/tooling/src/validators/security-conformance.ts --reference <path>
 *   tsx packages/tooling/src/validators/security-conformance.ts --write
 *
 * `--reference` exists for seeded-failure proofs against a copy. `--write`
 * records a new reference; it replaces recorded evidence, so it is an owner
 * action and prints a warning saying so.
 *
 * Exit code 1 on any violation.
 *
 * @module @dzup-ui/tooling/validators/security-conformance
 */

import type { SecurityConformanceReport } from '../../../testing/src/security-conformance.ts'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { DZ_ESCAPING_SANITIZER, resolveSanitizer } from '../../../core/src/security/sanitize.ts'
import {
  formatConformanceReport,
  runSecurityConformance,
  SECURITY_CONFORMANCE_RUNNER_VERSION,
} from '../../../testing/src/security-conformance.ts'
import { headCommit } from '../quality/git.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../')

/** Where the recorded reference lives, beside Core's other security artifacts. */
export const REFERENCE_PATH: string = resolve(ROOT, 'packages/core/security/sanitizer-conformance.reference.json')

/**
 * How Core's adapter identifies itself in every report.
 *
 * It names the **seam**, not just the default, because the two are not the same
 * adapter: `DZ_ESCAPING_SANITIZER` escapes and nothing else, while
 * `resolveSanitizer()` wrapping it also enforces `DzSanitizeLimits` before
 * `sanitize` is reached. A reference that said only "escaping default" would
 * describe an adapter no component ever gets.
 */
export const CORE_ADAPTER_NAME = '@dzup-ui/core:dzup-ui (seam-resolved escaping default, ADR-20 A6)'

/**
 * The adapter a component receives from `useDzSanitizer` when nothing is
 * installed anywhere — Core's real answer, not a test double.
 */
export function coreAdapter(): ReturnType<typeof resolveSanitizer> {
  return resolveSanitizer(() => undefined, DZ_ESCAPING_SANITIZER)
}

/** Run the runner against Core's adapter. */
export function measureCoreConformance(sourceCommit?: string): SecurityConformanceReport {
  return runSecurityConformance(coreAdapter(), {
    adapterName: CORE_ADAPTER_NAME,
    ...(sourceCommit === undefined ? {} : { sourceCommit }),
  })
}

/** The fields a reference records. Everything else in a report is derived. */
export interface ConformanceReference {
  readonly $comment: string
  readonly runner: string
  readonly runnerVersion: string
  readonly corpusVersion: string
  readonly corpusSchemaVersion: string
  readonly corpusFingerprint: string
  readonly adapter: string
  readonly policyName: string
  readonly limits: { readonly maxLength: number, readonly maxDepth: number }
  readonly sourceCommit: string
  readonly recordedBy: string
  readonly fixtures: number
  readonly cells: number
  readonly counts: Readonly<Record<string, number>>
  readonly lossy: number
  readonly nonConforming: number
  readonly failClosed: Readonly<Record<string, string>>
  readonly unasserted: readonly { readonly fixtureId: string, readonly sink: string, readonly required: string, readonly reason: string }[]
  readonly verdicts: Readonly<Record<string, string>>
}

const REFERENCE_COMMENT
  = 'The reference conformance result for THIS repository\'s own sanitizer adapter, measured by '
    + '@dzup-ui/testing/security-conformance over the versioned security corpus. Generated: run '
    + '`yarn validate:security-conformance --write`, never hand-edit. `verdicts` is the authority — '
    + 'it is what the gate diffs, per fixture and sink. LOCALLY QUALIFIED ONLY: a green run here is '
    + 'not CI, release or production evidence. `sourceCommit` is provenance, not an assertion: the '
    + 'gate reports it and never compares it to HEAD, for the reason evidence-binding.json states.'

/** Build the reference record from a report. */
export function toReference(report: SecurityConformanceReport, recordedBy: string): ConformanceReference {
  return {
    $comment: REFERENCE_COMMENT,
    runner: report.runner,
    runnerVersion: report.runnerVersion,
    corpusVersion: report.corpusVersion,
    corpusSchemaVersion: report.corpusSchemaVersion,
    corpusFingerprint: report.corpusFingerprint,
    adapter: report.adapter,
    policyName: report.policyName,
    limits: report.limits,
    sourceCommit: report.sourceCommit ?? 'unknown',
    recordedBy,
    fixtures: report.fixtures,
    cells: report.cells,
    counts: report.counts,
    lossy: report.lossy,
    nonConforming: report.nonConforming,
    // Spread through entries rather than assigned: `FailClosedRecord` is an
    // interface, so it has no implicit index signature and does not satisfy
    // `Record<string, string>`. The reference is deliberately typed loosely —
    // it has to be able to hold a property this runner version no longer
    // measures, which is one of the drifts the gate reports.
    failClosed: Object.fromEntries(Object.entries(report.failClosed)),
    unasserted: report.unasserted.map(cell => ({
      fixtureId: cell.fixtureId,
      sink: cell.sink,
      required: cell.required,
      reason: cell.reason,
    })),
    verdicts: report.verdicts,
  }
}

/**
 * Compare a run with a reference.
 *
 * Returns every violation rather than the first, because an adapter change that
 * moved six verdicts should report six.
 */
export function compareWithReference(
  report: SecurityConformanceReport,
  reference: ConformanceReference,
): string[] {
  const violations: string[] = []

  // 1 — fail-closed first: if the runner can be fooled, nothing below it means anything.
  for (const [property, value] of Object.entries(report.failClosed)) {
    if (value === 'NOT FAIL-CLOSED') {
      violations.push(
        `fail-closed property "${property}" DOES NOT HOLD. This outranks every other violation: `
        + 'the runner can report a pass for an adapter that is absent, throwing or a stub.',
      )
    }
    const recorded = reference.failClosed[property]
    if (recorded !== undefined && recorded !== value)
      violations.push(`fail-closed property "${property}": recorded "${recorded}", measured "${value}"`)
  }
  for (const property of Object.keys(reference.failClosed)) {
    if (!(property in report.failClosed))
      violations.push(`fail-closed property "${property}" is recorded but the runner no longer measures it`)
  }

  // 2 — a non-conforming cell is a defect in the adapter, whatever the reference says.
  for (const cell of report.cellDetail) {
    if (!cell.conforms) {
      violations.push(
        `${cell.fixtureId} in a ${cell.sink} sink requires "${cell.required}"; the adapter measured `
        + `"${cell.verdict}" (${cell.detail})`,
      )
    }
  }

  // 3 — verdict drift, named per cell.
  for (const [key, verdict] of Object.entries(report.verdicts)) {
    const recorded = reference.verdicts[key]
    if (recorded === undefined)
      violations.push(`${key}: measured "${verdict}" but the reference records no verdict for this cell — a new cell must be recorded deliberately`)
    else if (recorded !== verdict)
      violations.push(`${key}: VERDICT CHANGED — reference "${recorded}", measured "${verdict}"`)
  }
  for (const key of Object.keys(reference.verdicts)) {
    if (!(key in report.verdicts))
      violations.push(`${key}: the reference records verdict "${reference.verdicts[key]}" but the run produced no such cell — a fixture or a sink disappeared`)
  }

  // 4 — versions and fingerprint.
  const pairs: readonly [string, string, string][] = [
    ['runner', reference.runner, report.runner],
    ['runnerVersion', reference.runnerVersion, report.runnerVersion],
    ['corpusVersion', reference.corpusVersion, report.corpusVersion],
    ['corpusSchemaVersion', reference.corpusSchemaVersion, report.corpusSchemaVersion],
    ['corpusFingerprint', reference.corpusFingerprint, report.corpusFingerprint],
    ['adapter', reference.adapter, report.adapter],
    ['policyName', reference.policyName, report.policyName],
  ]
  for (const [field, recorded, measured] of pairs) {
    if (recorded === measured)
      continue
    const hint = field === 'corpusFingerprint'
      ? ' — the corpus content changed. Bump SECURITY_CORPUS_VERSION, add its fingerprint, and re-record.'
      : ''
    violations.push(`${field}: reference "${recorded}", measured "${measured}"${hint}`)
  }
  if (reference.limits.maxLength !== report.limits.maxLength || reference.limits.maxDepth !== report.limits.maxDepth) {
    violations.push(
      `limits: reference maxLength ${reference.limits.maxLength}/maxDepth ${reference.limits.maxDepth}, `
      + `measured maxLength ${report.limits.maxLength}/maxDepth ${report.limits.maxDepth}`,
    )
  }

  // 5 — unasserted cells. A cell is unasserted for a NAMED reason or not at all.
  const measuredUnasserted = new Map(report.unasserted.map(cell => [`${cell.fixtureId}:${cell.sink}`, cell]))
  const recordedUnasserted = new Map(reference.unasserted.map(cell => [`${cell.fixtureId}:${cell.sink}`, cell]))
  for (const [key, cell] of measuredUnasserted) {
    if (!recordedUnasserted.has(key))
      violations.push(`${key}: newly UNASSERTED (${cell.reason.slice(0, 120)}) — an unasserted cell is not a passing one and must be recorded`)
  }
  for (const key of recordedUnasserted.keys()) {
    if (!measuredUnasserted.has(key))
      violations.push(`${key}: recorded as unasserted but the run does not report it — either it became assertable (re-record) or its fixture is gone`)
  }

  return violations
}

/** Read the reference, or say why it could not be read. */
export function readReference(path: string): { value?: ConformanceReference, error?: string } {
  if (!existsSync(path))
    return { error: `missing. Record it with \`yarn validate:security-conformance --write\` (owner action).` }
  try {
    return { value: JSON.parse(readFileSync(path, 'utf8')) as ConformanceReference }
  }
  catch (error) {
    return { error: error instanceof Error ? error.message : String(error) }
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const argv = process.argv.slice(2)
  const refFlag = argv.indexOf('--reference')
  const referencePath = refFlag === -1 ? REFERENCE_PATH : resolve(argv[refFlag + 1] ?? REFERENCE_PATH)
  const write = argv.includes('--write')

  let commit = 'unknown'
  try {
    commit = headCommit()
  }
  catch {
    commit = 'unknown'
  }

  const report = measureCoreConformance(commit)
  const where = relative(ROOT, referencePath).split('\\').join('/') || referencePath

  if (write) {
    const recordedBy = argv.includes('--recorded-by') ? (argv[argv.indexOf('--recorded-by') + 1] ?? 'unknown') : 'unknown'
    writeFileSync(referencePath, `${JSON.stringify(toReference(report, recordedBy), null, 2)}\n`, 'utf8')
    console.warn(
      `⚠ security-conformance: RECORDED a new reference at ${where}.\n`
      + '  This replaces recorded security evidence and is an owner action — the gate itself never writes.\n'
      + `  ${formatConformanceReport(report)}`,
    )
    process.exit(0)
  }

  const reference = readReference(referencePath)
  if (reference.value === undefined) {
    console.error(`✗ security-conformance FAILED — reference ${where}: ${reference.error ?? 'unknown'}`)
    console.error(`    measured now: ${formatConformanceReport(report)}`)
    process.exit(1)
  }

  const violations = compareWithReference(report, reference.value)
  if (violations.length === 0) {
    console.warn(
      `✓ security-conformance: ${formatConformanceReport(report)}\n`
      + `  reference: ${where} (recorded at ${reference.value.sourceCommit} by ${reference.value.recordedBy}; `
      + 'provenance, not an assertion)\n'
      + `  runner ${SECURITY_CONFORMANCE_RUNNER_VERSION}; LOCALLY QUALIFIED ONLY — not CI, release or production evidence`,
    )
    process.exit(0)
  }

  console.error(`✗ security-conformance FAILED — ${violations.length} violation(s) against ${where}`)
  for (const violation of violations.slice(0, 60))
    console.error(`    ${violation}`)
  if (violations.length > 60)
    console.error(`    … and ${violations.length - 60} more`)
  console.error(`    measured: ${formatConformanceReport(report)}`)
  process.exit(1)
}
/* c8 ignore stop */
