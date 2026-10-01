/**
 * Ingest a human tester's AT session record into the manual AT matrix
 * (TASK-S1-O1, phase 1 + phase 3).
 *
 * ## What this is for
 *
 * `e2e/at-matrix/` holds 534 cells and 0 executed runs, and it has held exactly
 * that since TASK-OSS-P5-04 generated the scaffold, because the only thing that
 * can fill a cell is a person driving a component with a screen reader.
 * TASK-N1-O4 wrote the 22 executable scripts, TASK-R2-O2 fixed the resolver
 * defects that would have falsified the first results and produced the wave-1
 * runbook. The remaining hole was the other end: a tester finishes twenty-one
 * hours of work holding a session record, and the only documented way to get it
 * into the repository is to hand-edit eight-column markdown rows into 22 files
 * without transposing a column.
 *
 * This module is that path. It takes a structured session record, refuses it if
 * it is not a genuine record, and appends the rows it implies beneath the
 * append-only marker.
 *
 * ## The rule this module exists to not break
 *
 * `<evidence_rules>`: **an agent never fills a manual AT result cell.** This
 * module does not generate results; it transcribes results a named human
 * produced, and it refuses a record that does not carry the evidence of a human
 * having produced it. That is why the refusal list below is longer than the
 * validator's: `validate:at-matrix` checks that a row in the matrix is
 * well-formed, while this checks that a record *deserves to become a row*. The
 * two questions are different, and the second one is where a fabricated or
 * empty record gets caught.
 *
 * ## Fail closed
 *
 * Every refusal is an exit-1 refusal and nothing is written. There is no
 * "ingest what parses and warn about the rest" mode, because the failure this
 * programme keeps catching is a lane that accepts a malformed or empty input
 * and reports success — an aggregate that reads green over evidence that is not
 * there. A partial ingest of a session record is exactly that shape: some rows
 * land, the tester believes the session is recorded, and the matrix carries a
 * pairing that looks driven and is not.
 *
 * ## Append-only, enforced rather than promised
 *
 * {@link appendRunRows} re-parses the file it produced and asserts that the
 * rows already present are still present, unchanged, in the same order, as a
 * prefix of the result. A regex that appends to the wrong table, a stray edit
 * to the header, or a CRLF round-trip that re-renders existing rows all fail
 * that assertion, and the write does not happen. The history is what
 * distinguishes a new regression from a known one; a tool that can quietly
 * rewrite it is a tool that eventually does.
 */

import type { RiskTier } from '@dzup-ui/contracts'
import type { AtMatrixEntry, AtResult } from './at-matrix.ts'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ALL_TASKS, AT_PAIRS, AT_RESULTS } from './at-matrix.ts'
import {
  AT_MATRIX_DIR,
  AT_MATRIX_INDEX,
  buildAtIndex,
  parseResults,
  RESULTS_MARKER,
  serializeIndex,
} from './generate-at-matrix.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'

// ---------------------------------------------------------------------------
// The record format
// ---------------------------------------------------------------------------

/** One scripted step a tester drove, and what the AT did. */
export interface AtRunStep {
  /** A task id from the component's Tasks table. `*` is never valid here. */
  readonly id: string
  /** The announcement the script said to listen for. */
  readonly expected: string
  /** What happened. `unrun` is refused — see {@link RULES}. */
  readonly result: AtResult
  /** What the tester actually heard. Required on `fail` and `partial`. */
  readonly observed: string
}

/**
 * One tester's session with one component on one AT/browser pairing.
 *
 * The JSON record is the archive and carries more than the matrix row does
 * (`os`, `expected`, `defects`, the per-step split). The markdown row is the
 * matrix's *projection* of it. Keeping both means the matrix stays an
 * eight-column table a human can read while nothing the tester observed is
 * thrown away — `os` in particular is the field that turns "NVDA said blank"
 * into a reproducible bug report, and there is no column for it.
 */
export interface AtRunRecord {
  readonly component: string
  readonly tier?: RiskTier
  readonly pair: string
  /** Assistive technology **and version**, e.g. `NVDA 2026.2`. */
  readonly at: string
  /** Browser **and version**, e.g. `Firefox 141.0`. */
  readonly browser: string
  /** Operating system and build, e.g. `Windows 11 26200`. */
  readonly os: string
  /** A real name or handle. Never `-`, `n/a`, `anonymous`. */
  readonly tester: string
  /** ISO `YYYY-MM-DD`, the day the session ran. Never in the future. */
  readonly date: string
  /** `git rev-parse HEAD` at the moment the session ran. */
  readonly sourceCommit: string
  readonly steps: readonly AtRunStep[]
  readonly verdict: AtResult
  readonly defects?: readonly string[]
  /**
   * Marks a record as synthetic. A `true` here makes the record **refused
   * against the real matrix** under every circumstance; it can only be ingested
   * into a scratch directory with `--allow-fixture`.
   *
   * This exists so that the end-to-end proof of this lane is impossible to
   * confuse with evidence, in either direction: a fixture cannot leak into
   * `e2e/at-matrix/`, and a real record cannot be dismissed as "probably the
   * fixture".
   */
  readonly fixture?: boolean
}

/** One reason a record was refused, named so a test can assert the reason. */
export interface IngestRefusal {
  readonly rule: string
  readonly message: string
}

/**
 * The rule ids, as a closed set, so that the spec asserts against a constant
 * rather than a string literal it can drift from.
 */
export const RULES = {
  shape: 'record/shape',
  component: 'record/component',
  pair: 'record/pair',
  tester: 'record/tester',
  at: 'record/at',
  browser: 'record/browser',
  os: 'record/os',
  date: 'record/date',
  sourceCommit: 'record/source-commit',
  steps: 'record/steps',
  stepTask: 'record/step-task',
  stepResult: 'record/step-result',
  observed: 'record/observed',
  verdict: 'record/verdict',
  duplicate: 'record/duplicate',
  delimiter: 'record/delimiter',
  fixture: 'record/fixture',
} as const

/** Values that mean "nothing", matching `validate:at-matrix`'s own BLANK set. */
const BLANK = new Set(['', '-', '–', 'n/a', 'na', 'tbd', 'unknown', 'anonymous', 'tester'])

const PAIR_IDS = new Set(AT_PAIRS.map(p => p.id))
const RESULT_VALUES = new Set<string>(AT_RESULTS)
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const COMMIT = /^[0-9a-f]{7,40}$/i
/** A version is "has a digit in it". Deliberately loose: it catches `NVDA`, not `NVDA latest`. */
const HAS_VERSION = /\d/

function isBlank(value: unknown): boolean {
  return typeof value !== 'string' || BLANK.has(value.trim().toLowerCase())
}

/**
 * A `|` or a newline in any field would corrupt the markdown table — the pipe
 * by splitting a cell in two and shifting every column after it, the newline by
 * ending the row mid-record. Both are refused rather than escaped, because an
 * escaped pipe in a results table is a thing a later reader has to decode, and
 * the tester can rephrase.
 */
function hasDelimiter(value: string): boolean {
  return value.includes('|') || /[\r\n]/.test(value)
}

// ---------------------------------------------------------------------------
// The refusals
// ---------------------------------------------------------------------------

export interface IngestContext {
  /** The component's entry from the AT index, or `undefined` if it has no cell. */
  readonly entry: AtMatrixEntry | undefined
  /** Every component that has a cell, for the "did you mean" half of the message. */
  readonly knownComponents: readonly string[]
  /** "Today", injected so the future-date refusal is deterministic under test. */
  readonly now: Date
  /** True when the target is a scratch directory and `--allow-fixture` was passed. */
  readonly allowFixture?: boolean
}

/**
 * Every reason this record is not a genuine session record.
 *
 * Returns **all** refusals rather than the first, because a tester fixing a
 * record one round-trip at a time is the reason a lane gets bypassed, and a
 * bypassed lane is how hand-edited rows start appearing.
 */
export function checkRunRecord(input: unknown, ctx: IngestContext): IngestRefusal[] {
  const out: IngestRefusal[] = []
  const push = (rule: string, message: string): void => void out.push({ rule, message })

  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    push(RULES.shape, 'A run record must be a JSON object. See the record schema in '
    + 'docs/qa/at-run-record.md.')
    return out
  }

  const r = input as Partial<AtRunRecord>

  // --- identity of the cell -------------------------------------------------
  if (isBlank(r.component)) {
    push(RULES.component, 'No `component`. A record must name the component the session drove.')
  }
  else if (ctx.entry === undefined) {
    push(RULES.component, `\`${r.component}\` has no cell in the AT matrix. It is either Tier A `
    + `(excluded from the scaffold by design), misspelled, or new and unscaffolded — run `
    + `\`yarn generate:at-matrix\` first. ${ctx.knownComponents.length} components have cells.`)
  }

  if (isBlank(r.pair)) {
    push(RULES.pair, 'No `pair`. A record must name the AT/browser pairing it was run on.')
  }
  else if (!PAIR_IDS.has(r.pair!)) {
    push(RULES.pair, `\`${r.pair}\` is not one of the six pairings: ${[...PAIR_IDS].join(', ')}.`)
  }

  // --- who, with what, when -------------------------------------------------
  if (isBlank(r.tester)) {
    push(RULES.tester, 'No `tester`. A result with no named human behind it is worse than '
    + '`unrun`, because `unrun` is true. A real name or handle — not `-`, `anonymous` or `tbd`.')
  }

  for (const [field, rule, example] of [
    ['at', RULES.at, 'NVDA 2026.2'],
    ['browser', RULES.browser, 'Firefox 141.0'],
  ] as const) {
    const value = r[field]
    if (isBlank(value)) {
      push(rule, `No \`${field}\`. Record the ${field} **and its version**, e.g. \`${example}\`. `
      + `An AT bug is version-specific; a row that does not say which version heard what cannot `
      + `be reproduced or retired.`)
    }
    else if (!HAS_VERSION.test(value as string)) {
      push(rule, `\`${field}: "${value}"\` carries no version. Write \`${example}\`, not a bare `
      + `product name or "latest" — "latest" is a different program every month.`)
    }
  }

  if (isBlank(r.os)) {
    push(RULES.os, 'No `os`. Record the operating system and build, e.g. `Windows 11 26200`. '
    + 'The AT/browser pair does not identify the platform on its own and a reproduction needs it.')
  }

  if (isBlank(r.date)) {
    push(RULES.date, 'No `date`. Record the ISO date the session ran.')
  }
  else if (!ISO_DATE.test(r.date!)) {
    push(RULES.date, `\`date: "${r.date}"\` is not ISO \`YYYY-MM-DD\`.`)
  }
  else {
    const parsed = new Date(`${r.date}T00:00:00Z`)
    // Round-trip rather than a NaN check: `new Date('2026-02-30T00:00:00Z')` is
    // not NaN, it is the 2nd of March. A silent roll-over would put the row a
    // few days away from the session it records, which is exactly the kind of
    // small wrongness a staleness comparison later reads as fact.
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== r.date) {
      push(RULES.date, `\`date: "${r.date}"\` is not a real calendar day.`)
    }
    else {
      // Compare date-only, in UTC, so a tester a day ahead of the ingesting
      // machine is not refused for being in a later timezone.
      const today = new Date(Date.UTC(
        ctx.now.getUTCFullYear(),
        ctx.now.getUTCMonth(),
        ctx.now.getUTCDate(),
      ))
      if (parsed.getTime() > today.getTime()) {
        push(RULES.date, `\`date: "${r.date}"\` is in the future (today is `
        + `${today.toISOString().slice(0, 10)}). A session that has not happened yet has no `
        + `result, and a future date is the single cheapest way for a fabricated record to `
        + `look plausible.`)
      }
    }
  }

  if (isBlank(r.sourceCommit)) {
    push(RULES.sourceCommit, 'No `sourceCommit`. Record `git rev-parse HEAD` as it was when you '
    + 'ran the session — it is what lets the row go stale honestly when the component changes, '
    + 'instead of reading as current forever.')
  }
  else if (!COMMIT.test(r.sourceCommit!)) {
    push(RULES.sourceCommit, `\`sourceCommit: "${r.sourceCommit}"\` is not a git commit sha `
    + `(7–40 hex characters).`)
  }

  // --- the session itself ---------------------------------------------------
  const steps = Array.isArray(r.steps) ? r.steps : undefined
  if (steps === undefined) {
    push(RULES.steps, 'No `steps` array. A record with no steps is an empty record, and an empty '
    + 'record that ingests successfully is the exact failure this lane exists to prevent.')
  }
  else if (steps.length === 0) {
    push(RULES.steps, '`steps` is empty. A session that drove nothing is not a session. If '
    + 'the AT or the device was unavailable, do not submit a record — the generated `unrun` row '
    + 'already says that, truthfully.')
  }
  else {
    if (steps.every(s => (s as AtRunStep)?.result === 'unrun')) {
      push(RULES.steps, 'Every step is `unrun`, which is an empty record wearing a result. If the '
      + 'session could not proceed, record the steps you started as `blocked`; if it never '
      + 'started, submit nothing.')
    }

    const owed = ctx.entry?.tasks ?? []
    const seen = new Set<string>()
    steps.forEach((raw, i) => {
      const s = raw as Partial<AtRunStep>
      const where = `step ${i + 1}`

      if (isBlank(s.id)) {
        push(RULES.stepTask, `${where} has no \`id\`. Each step names the task it is evidence `
        + `about${owed.length > 0 ? `: ${owed.join(', ')}` : ''}.`)
      }
      else if (s.id === ALL_TASKS) {
        push(RULES.stepTask, `${where} uses \`${ALL_TASKS}\`. That id is reserved for the `
        + `generated "nobody ran this pairing" rows; a real result may not use it, because a `
        + `pass over every task at once is the aggregate this matrix exists to refuse.`)
      }
      else if (ctx.entry !== undefined && !owed.includes(s.id!)) {
        push(RULES.stepTask, `${where} records task \`${s.id}\`, which ${r.component} does not `
        + `owe. Its tasks are: ${owed.join(', ')}. Either the id is a typo or the scaffold has `
        + `been regenerated since the script was printed — check which before forcing it.`)
      }
      else if (seen.has(s.id!)) {
        push(RULES.stepTask, `${where} repeats task \`${s.id}\` within one record. One row per `
        + `{task, pair}; a re-test is a new record, not a second line in this one.`)
      }
      if (typeof s.id === 'string')
        seen.add(s.id)

      if (isBlank(s.result)) {
        push(RULES.stepResult, `${where} has no \`result\`.`)
      }
      else if (!RESULT_VALUES.has(s.result as string)) {
        push(RULES.stepResult, `${where} records result \`${s.result}\`, which is not one of `
        + `${AT_RESULTS.join(', ')}.`)
      }
      else if (s.result === 'unrun') {
        push(RULES.stepResult, `${where} records \`unrun\`. Inside a submitted session that is `
        + `indistinguishable from an omission. Use \`blocked\` if you started the step and `
        + `could not finish it, or leave the step out if you never drove it.`)
      }
      else if ((s.result === 'fail' || s.result === 'partial') && isBlank(s.observed)) {
        push(RULES.observed, `${where} records \`${s.result}\` with no \`observed\`. On a failure, `
        + `name what you heard — a defect that lives only in a result column is a defect nobody `
        + `can fix.`)
      }

      for (const [field, value] of Object.entries(s)) {
        if (typeof value === 'string' && hasDelimiter(value)) {
          push(RULES.delimiter, `${where}'s \`${field}\` contains a \`|\` or a newline, which `
          + `would split the markdown row into the wrong columns. Rephrase it.`)
        }
      }
    })
  }

  for (const field of ['component', 'pair', 'at', 'browser', 'os', 'tester', 'notes'] as const) {
    const value = (r as Record<string, unknown>)[field]
    if (typeof value === 'string' && hasDelimiter(value)) {
      push(RULES.delimiter, `\`${field}\` contains a \`|\` or a newline, which would split the `
      + `markdown row into the wrong columns. Rephrase it.`)
    }
  }

  // --- the verdict must not outrank the steps -------------------------------
  if (isBlank(r.verdict)) {
    push(RULES.verdict, 'No `verdict`. State the session\'s own conclusion, so that a disagreement '
    + 'between it and the steps is visible rather than inferred.')
  }
  else if (!RESULT_VALUES.has(r.verdict as string)) {
    push(RULES.verdict, `\`verdict: "${r.verdict}"\` is not one of ${AT_RESULTS.join(', ')}.`)
  }
  else if (steps !== undefined && steps.length > 0) {
    const failing = steps.filter(s =>
      (s as AtRunStep)?.result === 'fail' || (s as AtRunStep)?.result === 'partial')
    if (failing.length > 0 && r.verdict === 'pass') {
      push(RULES.verdict, `\`verdict: "pass"\` over ${failing.length} failing step(s) `
      + `(${failing.map(s => (s as AtRunStep).id).join(', ')}). A verdict may not be stronger `
      + `than the steps beneath it; that inversion is the resolver defect TASK-R2-O2 fixed, `
      + `arriving through the front door.`)
    }
    const blocked = steps.filter(s => (s as AtRunStep)?.result === 'blocked')
    if (failing.length === 0 && blocked.length > 0 && r.verdict === 'pass') {
      push(RULES.verdict, `\`verdict: "pass"\` over ${blocked.length} blocked step(s). A session `
      + `that could not finish proves nothing green.`)
    }
  }

  // --- fixture containment --------------------------------------------------
  if (r.fixture === true && ctx.allowFixture !== true) {
    push(RULES.fixture, 'This record is marked `"fixture": true` and is refused. A synthetic '
    + 'record may only be ingested into a scratch matrix directory, with `--matrix-dir` and '
    + '`--allow-fixture`. It may never enter e2e/at-matrix/.')
  }

  // --- duplicates -----------------------------------------------------------
  if (ctx.entry !== undefined && steps !== undefined && !isBlank(r.pair)) {
    const existing = new Set(
      ctx.entry.rows
        .filter(row => row.result !== 'unrun')
        .map(row => `${row.pair} ${row.task} ${row.tester} ${row.date}`),
    )
    for (const raw of steps) {
      const s = raw as Partial<AtRunStep>
      if (typeof s.id !== 'string')
        continue
      const key = `${r.pair} ${s.id} ${r.tester} ${r.date}`
      if (existing.has(key)) {
        push(RULES.duplicate, `${r.component} / ${r.pair} / ${s.id} already has a row from `
        + `${r.tester} on ${r.date}. Ingesting it again would double-count one session. A `
        + `re-test is a new record with a later date, which supersedes by date; a correction to `
        + `what was written is an owner's hand-edit, never this lane's.`)
      }
    }
  }

  return out
}

// ---------------------------------------------------------------------------
// Rendering and appending
// ---------------------------------------------------------------------------

/** The `versions` column, in the shape the wave-1 runbook §3 documents. */
export function renderVersions(record: AtRunRecord): string {
  return `${record.at.trim()} / ${record.browser.trim()}`
}

/**
 * Project a record onto one eight-column markdown row per step.
 *
 * `os` and `expected` are not columns and stay in the archived JSON; the
 * `notes` column carries what the tester heard plus any defect ids, which is
 * what a reader of the matrix needs in order to decide whether to open the
 * archive.
 */
export function renderRunRows(record: AtRunRecord): string[] {
  const versions = renderVersions(record)
  const defects = record.defects !== undefined && record.defects.length > 0
    ? ` [${record.defects.join(', ')}]`
    : ''
  return record.steps.map((step) => {
    const observed = step.observed.trim()
    const note = observed === '' ? 'as expected' : observed
    return `| ${record.pair} | ${step.id} | ${step.result} | ${versions} | ${record.tester} `
      + `| ${record.date} | ${record.sourceCommit} | ${note}${defects} |`
  })
}

/**
 * Append rows beneath the results marker, and prove nothing above them moved.
 *
 * Throws rather than returning an error, because every caller has already run
 * {@link checkRunRecord}: reaching here with a broken file is a defect in this
 * module, not a bad submission, and it must not be handled quietly.
 */
export function appendRunRows(markdown: string, rows: readonly string[]): string {
  if (!markdown.includes(RESULTS_MARKER)) {
    throw new Error('The scaffold file has no results marker, so there is no append-only region '
      + 'to append to. Regenerate it with `yarn generate:at-matrix`.')
  }
  const before = parseResults(markdown)
  const trimmed = markdown.replace(/\s+$/, '')
  const next = `${trimmed}\n${rows.join('\n')}\n`

  const after = parseResults(next)
  if (after.length !== before.length + rows.length)
    throw new Error(`Append produced ${after.length} rows from ${before.length} + ${rows.length}.`)
  for (const [i, row] of before.entries()) {
    const now = after[i]!
    if (JSON.stringify(row) !== JSON.stringify(now)) {
      throw new Error(`Append rewrote existing row ${i + 1} `
        + `(${row.pair}/${row.task}). Rows are append-only and this is refused.`)
    }
  }
  return next
}

/** A stable archive filename for the record: component, pair, date, tester. */
export function archiveName(record: AtRunRecord): string {
  const slug = (s: string): string =>
    s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${record.component}-${record.pair}-${record.date}-${slug(record.tester)}.json`
}

/* c8 ignore start -- CLI entry point, exercised end to end via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  // Parse argv left to right so that a positional is never confused with a
  // flag's value — `at:ingest --matrix-dir tmp/at rec.json` must find `rec.json`.
  const argv = process.argv.slice(2)
  const VALUED = new Set(['--matrix-dir'])
  let dryRun = false
  let allowFixture = false
  let matrixDirArg: string | undefined
  const positionals: string[] = []
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!
    if (arg === '--dry-run') {
      dryRun = true
    }
    else if (arg === '--allow-fixture') {
      allowFixture = true
    }
    else if (VALUED.has(arg)) {
      i += 1
      matrixDirArg = argv[i]
    }
    else if (arg.startsWith('--')) {
      console.error(`✗ unknown flag ${arg}`)
      process.exit(1)
    }
    else {
      positionals.push(arg)
    }
  }
  const matrixDir = matrixDirArg === undefined
    ? AT_MATRIX_DIR
    : resolve(process.cwd(), matrixDirArg)
  const recordPath = positionals[0]

  console.warn('AT run-record ingest — TASK-S1-O1\n')

  if (recordPath === undefined) {
    console.error('usage: at:ingest <record.json> [--matrix-dir <dir>] [--dry-run] '
      + '[--allow-fixture]')
    console.error('\nThe record schema is documented in docs/qa/at-run-record.md.')
    process.exit(1)
  }

  const isRealMatrix = resolve(matrixDir) === resolve(AT_MATRIX_DIR)
  if (allowFixture && isRealMatrix) {
    console.error('✗ --allow-fixture is refused against e2e/at-matrix/. A synthetic record may '
      + 'only be ingested into a scratch directory passed with --matrix-dir.')
    process.exit(1)
  }

  const abs = resolve(process.cwd(), recordPath)
  if (!existsSync(abs)) {
    console.error(`✗ no such record: ${recordPath}`)
    process.exit(1)
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(abs, 'utf8'))
  }
  catch (error) {
    console.error(`✗ ${recordPath} is not valid JSON: ${(error as Error).message}`)
    process.exit(1)
  }

  const matrix = readCommittedMatrix()
  if (matrix === undefined) {
    console.error('✗ quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')
    process.exit(1)
  }

  const index = buildAtIndex(matrix.components, (component) => {
    const path = resolve(matrixDir, `${component}.md`)
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined
  })

  const record = parsed as Partial<AtRunRecord>
  const entry = index.entries.find(e => e.component === record.component)

  const refusals = checkRunRecord(parsed, {
    entry,
    knownComponents: index.entries.map(e => e.component),
    now: new Date(),
    allowFixture: allowFixture && !isRealMatrix,
  })

  console.warn(`  record                 ${basename(abs)}`)
  console.warn(`  target                 ${isRealMatrix ? 'e2e/at-matrix/ (REAL)' : matrixDir}`)
  console.warn(`  component / pair       ${record.component ?? '—'} / ${record.pair ?? '—'}`)
  console.warn(`  steps                  ${Array.isArray(record.steps) ? record.steps.length : 0}`)
  console.warn('')

  if (refusals.length > 0) {
    console.error(`✗ at:ingest refused this record — ${refusals.length} problem(s). `
      + 'Nothing was written.\n')
    for (const r of refusals)
      console.error(`  [${r.rule}] ${r.message}`)
    console.error('\nA record is refused whole. Fix every line above and resubmit — an ingest '
      + 'that accepted the valid half would leave a pairing looking driven that is not.')
    process.exit(1)
  }

  const full = parsed as AtRunRecord
  const file = resolve(matrixDir, `${full.component}.md`)
  const rows = renderRunRows(full)
  const next = appendRunRows(readFileSync(file, 'utf8'), rows)

  if (dryRun) {
    console.warn('✓ accepted (--dry-run: nothing written). Rows that would be appended:\n')
    for (const row of rows)
      console.warn(`  ${row}`)
    process.exit(0)
  }

  writeFileSync(file, next, 'utf8')

  const archiveDir = resolve(matrixDir, 'runs')
  mkdirSync(archiveDir, { recursive: true })
  writeFileSync(
    resolve(archiveDir, archiveName(full)),
    `${JSON.stringify(full, null, 2)}\n`,
    'utf8',
  )

  // Rebuild the index from the markdown, so the artifact and the files agree
  // without a second command a tester can forget.
  const rebuilt = buildAtIndex(matrix.components, (component) => {
    const path = resolve(matrixDir, `${component}.md`)
    return existsSync(path) ? readFileSync(path, 'utf8') : undefined
  })
  const indexPath = isRealMatrix ? AT_MATRIX_INDEX : resolve(matrixDir, 'index.json')
  writeFileSync(indexPath, serializeIndex(rebuilt), 'utf8')

  const executed = rebuilt.entries.flatMap(e => e.rows).filter(r => r.result !== 'unrun').length
  const total = rebuilt.entries.flatMap(e => e.rows).length

  console.warn(`✓ ingested ${rows.length} row(s) into ${basename(file)} (append-only).`)
  console.warn(`  archive              ${resolve(archiveDir, archiveName(full))}`)
  console.warn(`  executed cells       ${executed} of ${total}`)
  console.warn('')
  console.warn('  Next: yarn validate:at-matrix && yarn generate:capability-matrix')
  console.warn('  Then file every fail/partial as a task — a defect in a notes column is a defect')
  console.warn('  nobody is going to fix.')
}
/* c8 ignore stop */
