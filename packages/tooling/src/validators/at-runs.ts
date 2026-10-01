/**
 * `validate:at-runs` — the archived AT session records agree with the matrix
 * (TASK-S1-O1).
 *
 * ## What this gate is for
 *
 * `at:ingest` writes in two places: it appends eight-column rows to
 * `e2e/at-matrix/{Component}.md`, and it archives the full JSON session record
 * under `e2e/at-matrix/runs/`. The markdown is the matrix a human reads; the
 * JSON is the whole record, including the fields the table has no column for
 * (`os`, the per-step `expected`, the defect ids).
 *
 * Two artifacts describing one session can disagree, and the ways they can
 * disagree are precisely the ways manual evidence quietly stops being evidence:
 *
 * - **An archive with no rows.** The ingest was interrupted, or somebody deleted
 *   the rows and left the JSON. The matrix reads `unrun`, so the cell is
 *   honest* — but twenty-one hours of somebody's work is sitting in a
 *   directory nothing reads, and nobody will notice until the next sweep is
 *   scheduled to redo it.
 * - **A hand-edited row.** Somebody corrected a `fail` to a `pass` in the
 *   markdown. This is the failure mode with teeth: the matrix would publish the
 *   edit, the resolver would believe it, and the archive that contradicts it
 *   would sit beside it silently.
 * - **A malformed archive.** A JSON dropped into `runs/` by hand, bypassing the
 *   ingest lane and its refusals entirely.
 *
 * ## Why it exits 0 today
 *
 * There are **no archived records at HEAD**, because there have been no
 * sessions: 534 cells, 0 executed. A gate over an empty directory looks like
 * theatre, and this one is deliberately built before the evidence rather than
 * after, for the same reason the ingest lane is: the first tester's records are
 * the ones most likely to be mishandled, and a gate written after the first
 * mishandling is a gate that documents it rather than prevents it.
 *
 * It reports the record count, so an empty run is visibly empty rather than
 * silently passing.
 *
 * Exit code 1 if any archived record is malformed or disagrees with the matrix.
 */

import type { IngestRefusal } from '../quality/at-ingest.ts'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { checkRunRecord, renderRunRows, RULES } from '../quality/at-ingest.ts'
import { AT_MATRIX_DIR, buildAtIndex } from '../quality/generate-at-matrix.ts'
import { readCommittedMatrix } from '../quality/generate-quality-matrix.ts'

export const AT_RUNS_DIR = resolve(AT_MATRIX_DIR, 'runs')

export interface AtRunViolation {
  rule: string
  message: string
}

/**
 * Rules that are about *ingest time*, not about a stored record, and would
 * therefore fire on every correctly archived record:
 *
 * - `duplicate` — an archived record's rows are supposed to be in the matrix.
 *   That is the thing this gate checks for, not a collision.
 * - `fixture` — a fixture cannot reach `e2e/at-matrix/` at all (the CLI refuses
 *   the path), so its presence here is caught by {@link NO_FIXTURES} instead,
 *   with a message that says what actually went wrong.
 */
const INGEST_TIME_RULES = new Set<string>([RULES.duplicate, RULES.fixture])

const NO_FIXTURES = 'archive/fixture'

/** Pure core: check every archived record against the matrix. */
export function checkAtRuns(
  archived: readonly { readonly name: string, readonly json: unknown }[],
  markdownFor: (component: string) => string | undefined,
  contextFor: (component: string) => Parameters<typeof checkRunRecord>[1],
): AtRunViolation[] {
  const violations: AtRunViolation[] = []

  for (const { name, json } of archived) {
    const record = json as { component?: string, fixture?: boolean }

    if (record?.fixture === true) {
      violations.push({
        rule: NO_FIXTURES,
        message: `e2e/at-matrix/runs/${name} is marked \`"fixture": true\`. A synthetic record `
          + `may never live in the real matrix — it exists to prove the lane, in a scratch `
          + `directory, and is deleted. Remove it; it is not evidence and must not sit where `
          + `evidence sits.`,
      })
      continue
    }

    const refusals: IngestRefusal[] = checkRunRecord(json, contextFor(record?.component ?? ''))
      .filter(r => !INGEST_TIME_RULES.has(r.rule))
    for (const r of refusals) {
      violations.push({
        rule: `archive/${r.rule}`,
        message: `e2e/at-matrix/runs/${name}: ${r.message}`,
      })
    }
    if (refusals.length > 0)
      continue

    const markdown = markdownFor(record.component!)
    if (markdown === undefined) {
      violations.push({
        rule: 'archive/orphan',
        message: `e2e/at-matrix/runs/${name} records a session against ${record.component}, `
          + `which has no scaffold file.`,
      })
      continue
    }

    // eslint-disable-next-line ts/no-explicit-any -- validated above by checkRunRecord
    for (const row of renderRunRows(json as any)) {
      if (!markdown.includes(row)) {
        violations.push({
          rule: 'archive/drift',
          message: `e2e/at-matrix/runs/${name} archives a row the matrix does not carry:\n`
            + `      ${row}\n`
            + `    Either the ingest did not finish — in which case a human's session is sitting `
            + `in a directory nothing reads — or the row was hand-edited after it was ingested. `
            + `Do not "fix" this by editing the archive: the archive is what the tester submitted, `
            + `and a row that disagrees with it is the row that is wrong.`,
        })
      }
    }
  }

  return violations
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  console.warn('Archived AT run records — TASK-S1-O1\n')

  const files = existsSync(AT_RUNS_DIR)
    ? readdirSync(AT_RUNS_DIR).filter(f => f.endsWith('.json')).sort()
    : []

  const matrix = readCommittedMatrix()
  if (matrix === undefined) {
    console.error('✗ quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')
    process.exit(1)
  }

  const read = (component: string): string | undefined => {
    const path = resolve(AT_MATRIX_DIR, `${component}.md`)
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined
  }
  const index = buildAtIndex(matrix.components, read)

  const archived: { name: string, json: unknown }[] = []
  const unreadable: AtRunViolation[] = []
  for (const file of files) {
    try {
      archived.push({ name: file, json: JSON.parse(readFileSync(resolve(AT_RUNS_DIR, file), 'utf8')) })
    }
    catch (error) {
      unreadable.push({
        rule: 'archive/json',
        message: `e2e/at-matrix/runs/${file} is not valid JSON: ${(error as Error).message}`,
      })
    }
  }

  const violations = [
    ...unreadable,
    ...checkAtRuns(archived, read, component => ({
      entry: index.entries.find(e => e.component === component),
      knownComponents: index.entries.map(e => e.component),
      now: new Date(),
    })),
  ]

  const rows = index.entries.flatMap(e => e.rows)
  console.warn(`  archived records       ${files.length}`)
  console.warn(`  executed cells         ${rows.filter(r => r.result !== 'unrun').length} `
    + `of ${rows.length}`)
  console.warn('')

  if (violations.length > 0) {
    console.error(`✗ at-runs: ${violations.length} problem(s).\n`)
    for (const v of violations)
      console.error(`  [${v.rule}] ${v.message}`)
    process.exit(1)
  }

  if (files.length === 0) {
    console.warn('✓ at-runs: no archived session records yet — 534 cells, 0 executed, which is')
    console.warn('  the honest state. This gate becomes load-bearing the day wave 1 is ingested.')
    console.warn(`  Runbook: docs/program-2026-09-22-architecture/reports/`
      + `TASK-S1-O1-wave-1-schedule.md`)
  }
  else {
    console.warn(`✓ at-runs: ${files.length} archived record(s), every row present in the matrix `
      + `and every record well-formed.`)
    console.warn(`  components: ${[...new Set(archived.map(a => basename(a.name).split('-')[0]))]
      .join(', ')}`)
  }
}
/* c8 ignore stop */
