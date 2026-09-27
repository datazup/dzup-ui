/**
 * The tracked browser-matrix evidence ledger (TASK-R2-O1).
 *
 * **Why this file exists.** Until now the capability matrix's `browser-matrix`
 * column was resolved from `test-results/matrix-report.json` — Playwright's JSON
 * reporter output, which `.gitignore` excludes (N0-05 finding F4). Three
 * consequences followed, and all three were measured rather than feared:
 *
 *  1. A fresh clone had **no** browser evidence at all, so every Tier B–D cell
 *     read `unrun` and `validate:capability-matrix` failed on `DzFileUpload`
 *     (Tier D) for want of an artifact that cannot be committed.
 *  2. The report is written into `outputDir`, which Playwright **wipes at the
 *     start of every run**. The 2026-08-25 chromium record that N1-O2 decision
 *     D1 set out to protect, and that TASK-R2-O5 deliberately declined to
 *     overwrite, no longer exists: `test-results/` was cleared by R2-O5's own
 *     sweep on 2026-09-18. Protecting a file inside the directory the tool
 *     empties is not protection.
 *  3. Its presence was used as a *boolean*: the cell resolver only asked whether
 *     the file existed, so one chromium/default project made all 88 components
 *     read `pass` on all three engines. The report could not say which of the
 *     24 projects had run, which is the whole claim the cell makes.
 *
 * So the truth is persisted here instead, as a per-component summary rather than
 * the full report: smaller diffs, the same truth, and every number in it is
 * derived from a Playwright run by `generate-browser-evidence.ts` — never typed
 * by hand and never copied from a narrative ledger.
 *
 * **The row shape** the 08-11 spec asks for is derived, not stored twice:
 *
 * ```text
 * | component | tier | engine | condition | result | sourceCommit | date |
 * ```
 *
 * `component`, `tier` and `result` come from {@link BrowserEvidenceComponent};
 * `engine`/`condition` are the two halves of the cell key; `sourceCommit` and
 * `date` come from the {@link BrowserEvidenceRun} that produced that cell. The
 * provenance lives on the run and not on 2,112 rows because a sweep runs one
 * project at a time (D123), so a run is exactly the unit that shares a commit
 * and a date. {@link deriveEvidenceRows} performs the join.
 *
 * **The degradation gate** lives here too ({@link checkBrowserDegradation}) and
 * is called from `validators/capability-matrix.ts`. A cell that a committed
 * ledger records as `pass` and the working tree now records as `unrun` or `fail`
 * is an error naming the component, the engine and the condition. That is the
 * one direction evidence may not move silently: `unrun` is how a lane that
 * quietly stopped running looks, and it is indistinguishable from a lane that
 * was never wired up unless something refuses it.
 *
 * @module @dzup-ui/tooling/quality/browser-evidence
 */

import type { RiskTier } from '@dzup-ui/contracts'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'

/** The committed ledger the capability matrix reads. */
export const BROWSER_EVIDENCE_PATH = resolve(ROOT, 'e2e/matrix/browser-evidence.json')

export const BROWSER_EVIDENCE_SCHEMA_VERSION = '1.0.0'

/**
 * What one `{component, engine, condition}` cell is known to be.
 *
 * Only three values, and deliberately not {@link
 * import('./capability-matrix.ts').CellState}'s six: a browser cell either ran
 * green, ran red, or did not run. `stale` is not a state a run can be in — it is
 * a comparison between the run's commit and the component's, which the
 * capability matrix performs with `evidenceIsCurrent` and reports there.
 *
 * `pass` covers an *expected* failure (`test.fail()` from
 * `known-failures.json`): Playwright fails the run when such a cell passes
 * unexpectedly, so an expected failure is the ledger behaving, and the
 * `knownFailures` count on the run records how many there were.
 */
export type BrowserCellResult = 'pass' | 'fail' | 'unrun'

export const BROWSER_CELL_RESULTS: readonly BrowserCellResult[] = ['pass', 'fail', 'unrun']

/** One `matrix-{engine}-{condition}` project, and what running it cost. */
export interface BrowserEvidenceRun {
  readonly engine: string
  readonly condition: string
  /** `run` — a Playwright report was read. `unrun` — it was not, and why. */
  readonly state: 'run' | 'unrun'
  /** Required when `state` is `unrun`: why the cells below are empty. */
  readonly reason?: string
  /** `git rev-parse --short HEAD` at the moment of the run. */
  readonly sourceCommit?: string
  /**
   * Whether the worktree carried uncommitted changes when the run happened.
   *
   * Recorded rather than assumed absent. Every sweep this repository has ever
   * produced was measured on a dirty tree, and each time the fact lived only in
   * a handoff paragraph. A consumer that wants release evidence reads this field
   * and rejects the row; a consumer that wants "did this ever pass anywhere"
   * reads the result. Collapsing the two is what made N1's green lanes
   * unciteable.
   */
  readonly worktreeDirty?: boolean
  readonly dirtyPathCount?: number
  /** ISO date, `YYYY-MM-DD`. */
  readonly date?: string
  readonly engineVersion?: string
  readonly playwrightVersion?: string
  readonly platform?: string
  readonly node?: string
  /** Where the Playwright JSON came from. It is git-ignored; this is a trail. */
  readonly report?: string
  readonly cellsRun?: number
  readonly passed?: number
  readonly failed?: number
  readonly knownFailures?: number
  readonly skipped?: number
  /** Tests in the project that no target claimed — never silently dropped. */
  readonly unattributedTests?: number
  readonly wallClock?: string
  readonly exitStatus?: string
}

/** One component's row: its tier, its story, and one result per project. */
export interface BrowserEvidenceComponent {
  readonly component: string
  readonly tier: RiskTier
  /** Storybook story id, or `null` when there is nothing to drive. */
  readonly story: string | null
  /** `${engine}/${condition}` → result. Every declared project is present. */
  readonly cells: Readonly<Record<string, BrowserCellResult>>
}

export interface BrowserEvidenceLedger {
  readonly schemaVersion: string
  readonly $comment: string
  /** HEAD when the ledger was last written. Excluded from byte comparisons. */
  readonly sourceCommit: string
  readonly worktreeDirty: boolean
  readonly dirtyPathCount: number
  readonly generatedAt: string
  readonly admissibility: string
  readonly rowShape: string
  readonly engines: readonly string[]
  readonly conditions: readonly string[]
  readonly totals: {
    readonly projects: number
    readonly projectsRun: number
    readonly components: number
    readonly cells: number
    readonly pass: number
    readonly fail: number
    readonly unrun: number
  }
  readonly runs: readonly BrowserEvidenceRun[]
  readonly components: readonly BrowserEvidenceComponent[]
}

/** The provenance keys a freshness comparison must ignore. */
export const BROWSER_EVIDENCE_PROVENANCE_KEYS: readonly string[] = [
  'sourceCommit',
  'worktreeDirty',
  'dirtyPathCount',
  'generatedAt',
]

/** `${engine}/${condition}` — the one spelling of a cell key. */
export function cellKey(engine: string, condition: string): string {
  return `${engine}/${condition}`
}

/** Where the lane's shape is declared, and the only place it is declared. */
export const PLAYWRIGHT_CONFIG_PATH = resolve(ROOT, 'playwright.config.ts')

/**
 * The engines and conditions `playwright.config.ts` actually declares, read from
 * its source.
 *
 * Read rather than imported: importing the config pulls `@playwright/test` into
 * `validate:all`, and read rather than transcribed because a fourth hand-typed
 * copy of this list is the defect TASK-R2-O5 spent a section on — the lane went
 * from six conditions to eight and three documents went on saying six. The
 * ledger stores its own copy so a reader needs one file; this function is what
 * makes the two agree, and `validate:capability-matrix` fails when they do not.
 *
 * Throws when either list cannot be found: a silent empty list would make the
 * cross-check vacuous, which is the same class of defect as the copy it
 * replaces.
 */
export function readDeclaredMatrixProjects(
  path: string = PLAYWRIGHT_CONFIG_PATH,
): { engines: string[], conditions: string[] } {
  const source = readFileSync(path, 'utf8')

  const conditionBlock = /export const MATRIX_CONDITIONS = \[([^\]]*)\]/.exec(source)
  if (conditionBlock === null)
    throw new Error(`${path}: no \`export const MATRIX_CONDITIONS = [...]\` to read.`)
  const conditions = [...conditionBlock[1]!.matchAll(/'([^']+)'/g)].map(m => m[1]!)

  const engineBlock = /const ENGINES = \{([\s\S]*?)\n\} as const/.exec(source)
  if (engineBlock === null)
    throw new Error(`${path}: no \`const ENGINES = { ... } as const\` to read.`)
  const engines = [...engineBlock[1]!.matchAll(/^\s*(\w+):/gm)].map(m => m[1]!)

  if (conditions.length === 0 || engines.length === 0)
    throw new Error(`${path}: parsed ${engines.length} engine(s) and ${conditions.length} condition(s).`)

  return { engines, conditions }
}

/** The inverse of {@link cellKey}. */
export function splitCellKey(key: string): { engine: string, condition: string } {
  const slash = key.indexOf('/')
  return { engine: key.slice(0, slash), condition: key.slice(slash + 1) }
}

/** One derived row of the shape the 08-11 spec asks for. */
export interface BrowserEvidenceRow {
  readonly component: string
  readonly tier: RiskTier
  readonly engine: string
  readonly condition: string
  readonly result: BrowserCellResult
  /** The run's commit, or `undefined` when the project never ran. */
  readonly sourceCommit?: string
  readonly date?: string
}

/**
 * The `| component | tier | engine | condition | result | sourceCommit | date |`
 * projection, joined from the components and the runs.
 *
 * Derived rather than stored so the two halves cannot disagree: a run that is
 * re-measured moves every one of its cells' provenance in one edit.
 */
export function deriveEvidenceRows(ledger: BrowserEvidenceLedger): BrowserEvidenceRow[] {
  const runs = new Map(ledger.runs.map(r => [cellKey(r.engine, r.condition), r]))
  const rows: BrowserEvidenceRow[] = []
  for (const component of ledger.components) {
    for (const [key, result] of Object.entries(component.cells)) {
      const { engine, condition } = splitCellKey(key)
      const run = runs.get(key)
      rows.push({
        component: component.component,
        tier: component.tier,
        engine,
        condition,
        result,
        sourceCommit: run?.sourceCommit,
        date: run?.date,
      })
    }
  }
  return rows
}

/** The committed ledger, or `undefined` when it has never been written. */
export function readBrowserEvidence(
  path: string = BROWSER_EVIDENCE_PATH,
): BrowserEvidenceLedger | undefined {
  if (!existsSync(path))
    return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as BrowserEvidenceLedger
}

/** Serialize with a trailing newline, as every other generated artifact does. */
export function serializeBrowserEvidence(ledger: BrowserEvidenceLedger): string {
  return `${JSON.stringify(ledger, null, 2)}\n`
}

// ---------------------------------------------------------------------------
// The degradation gate
// ---------------------------------------------------------------------------

export interface BrowserDegradation {
  readonly component: string
  readonly engine: string
  readonly condition: string
  readonly from: BrowserCellResult
  readonly to: BrowserCellResult | 'absent'
  readonly message: string
}

/**
 * Cells a committed ledger recorded as `pass` and a current ledger does not.
 *
 * The asymmetry is the point. `unrun → pass` is progress and needs no gate;
 * `pass → unrun` is how a lane that stopped being run looks from the outside,
 * and it is *indistinguishable from never having been wired up* unless something
 * refuses it. `pass → fail` is a regression in the component. Both fail, and the
 * message names the component, the engine and the condition, because "the
 * browser matrix got worse" is not something anyone can act on.
 *
 * A component that disappears from the ledger while holding passes is reported
 * as `absent` rather than skipped: deleting a row is the cheapest way to make a
 * failing cell stop failing, and a gate that only compared cells it found in
 * both files would reward it.
 *
 * Pure, and driven directly by `browser-evidence.spec.ts` — the seeded
 * regression that proves the gate fires does not need a browser.
 */
export function checkBrowserDegradation(
  baseline: BrowserEvidenceLedger,
  current: BrowserEvidenceLedger,
): BrowserDegradation[] {
  const now = new Map(current.components.map(c => [c.component, c]))
  const out: BrowserDegradation[] = []

  for (const was of baseline.components) {
    const is = now.get(was.component)
    for (const [key, from] of Object.entries(was.cells)) {
      if (from !== 'pass')
        continue
      const { engine, condition } = splitCellKey(key)
      const to: BrowserCellResult | 'absent' = is === undefined
        ? 'absent'
        : (is.cells[key] ?? 'absent')
      if (to === 'pass')
        continue
      const what = to === 'absent'
        ? is === undefined
          ? `the component is no longer in the ledger`
          : `the cell is no longer in the ledger`
        : `it is now \`${to}\``
      out.push({
        component: was.component,
        engine,
        condition,
        from,
        to,
        message: `${was.component} / ${engine} / ${condition}: the committed ledger records `
          + `\`pass\` and ${what}. A browser cell may move \`unrun\` → \`pass\`; it may not `
          + `move back without a measured reason. Re-run \`--project=matrix-${engine}-${condition}\`, `
          + `or record the failure in e2e/matrix/known-failures.json with a number and an owner.`,
      })
    }
  }

  return out
}
