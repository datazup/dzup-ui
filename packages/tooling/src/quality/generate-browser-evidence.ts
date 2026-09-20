/**
 * Browser-evidence ledger generator (TASK-R2-O1).
 *
 * Reads one or more Playwright JSON reports produced by the existing browser
 * matrix and projects them into the tracked per-component ledger
 * `e2e/matrix/browser-evidence.json`. It adds no lane, no config and no
 * assertion: every number it writes was measured by `e2e/matrix/*.spec.ts`
 * running under `playwright.config.ts`. It is a projection, not a second
 * harness.
 *
 * **Merge-forward, and why it is not laundering.** A sweep runs one engine at a
 * time (owner decision D123: a single 24-project invocation exits 1 on a worker
 * force-kill *after* every cell has reported). So one invocation of this
 * generator sees one engine's eight projects. Projects it does not see keep the
 * cells they already had — **together with the run record that produced them**,
 * which carries that run's own `sourceCommit`, `date` and `worktreeDirty`. A
 * kept cell therefore still says which checkout it was measured on. What is
 * never done is the opposite: a cell is never written from a prose ledger, a
 * handoff paragraph or a previous task's summary. If no report covers a project,
 * its run is `state: "unrun"` with a reason and all 88 of its cells are `unrun`.
 *
 * Usage:
 *   tsx packages/tooling/src/quality/generate-browser-evidence.ts \
 *     --report <playwright-json> [--report <another>] [--reset] \
 *     [--engine-versions <json>] [--wall-clock chromium=16.4m]
 *
 *   tsx packages/tooling/src/quality/generate-browser-evidence.ts --probe-engines <out.json>
 *     launches each engine once and writes `{ engine: version }`. Separate
 *     because it needs browsers, and the projection must not.
 *
 * Reports must be written OUTSIDE `test-results/`: Playwright empties
 * `outputDir` at the start of every run, which is how the 2026-08-25 chromium
 * record N1-O2 decision D1 set out to protect came to be destroyed by R2-O5's
 * sweep. Pass `PLAYWRIGHT_JSON_OUTPUT=<dir outside test-results>/…json`.
 */

import type {
  BrowserCellResult,
  BrowserEvidenceComponent,
  BrowserEvidenceLedger,
  BrowserEvidenceRun,
} from './browser-evidence.ts'
import type { MatrixTarget } from './generate-matrix-targets.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import {
  BROWSER_EVIDENCE_PATH,
  BROWSER_EVIDENCE_SCHEMA_VERSION,
  cellKey,
  readBrowserEvidence,
  readDeclaredMatrixProjects,
  serializeBrowserEvidence,
} from './browser-evidence.ts'
import { buildMatrixTargets } from './generate-matrix-targets.ts'

// ---------------------------------------------------------------------------
// Playwright JSON report → per-project, per-component results
// ---------------------------------------------------------------------------

interface PwResult { readonly status?: string, readonly duration?: number }
interface PwTest {
  readonly projectName?: string
  readonly status?: string
  readonly results?: readonly PwResult[]
  readonly annotations?: readonly { type?: string }[]
}
interface PwSpec { readonly title?: string, readonly tests?: readonly PwTest[] }
interface PwSuite {
  readonly title?: string
  readonly file?: string
  readonly specs?: readonly PwSpec[]
  readonly suites?: readonly PwSuite[]
}
interface PwReport {
  readonly config?: { readonly version?: string }
  readonly suites?: readonly PwSuite[]
  readonly stats?: { readonly startTime?: string, readonly duration?: number }
}

/** What one project measured, before it is folded into the ledger. */
interface ProjectMeasurement {
  readonly project: string
  readonly engine: string
  readonly condition: string
  /** component → result. Only components the report actually names. */
  readonly results: Map<string, BrowserCellResult>
  cellsRun: number
  passed: number
  failed: number
  knownFailures: number
  skipped: number
  unattributed: number
  durationMs: number
}

/**
 * The component a spec belongs to.
 *
 * Two shapes, both real: `conditions.spec.ts` and `motion-policy.spec.ts` wrap
 * each component in `test.describe(component)`, while `non-drag.spec.ts` uses
 * one describe for the criterion and puts the component in the test title as
 * `DzX — operation`. A spec that matches neither is counted as
 * `unattributedTests` on the run rather than dropped: a test nobody can attribute
 * is a hole in the ledger, and a hole that is counted is one somebody can close.
 */
function attribute(
  ancestors: readonly string[],
  specTitle: string,
  targets: ReadonlySet<string>,
): string | undefined {
  for (const title of ancestors) {
    if (targets.has(title))
      return title
  }
  const head = specTitle.split(/\s+—\s+/)[0]?.trim()
  if (head !== undefined && targets.has(head))
    return head
  return undefined
}

/** A recorded result outranks a pass in the same cell — never resolved upward. */
function worse(a: BrowserCellResult, b: BrowserCellResult): BrowserCellResult {
  if (a === 'fail' || b === 'fail')
    return 'fail'
  if (a === 'pass' || b === 'pass')
    return 'pass'
  return 'unrun'
}

function walk(
  suite: PwSuite,
  ancestors: readonly string[],
  targets: ReadonlySet<string>,
  byProject: Map<string, ProjectMeasurement>,
  engines: readonly string[],
): void {
  const chain = suite.title === undefined ? ancestors : [suite.title, ...ancestors]

  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const project = test.projectName ?? ''
      if (!project.startsWith('matrix-'))
        continue
      const engine = engines.find(e => project.startsWith(`matrix-${e}-`))
      if (engine === undefined)
        continue
      const condition = project.slice(`matrix-${engine}-`.length)

      let measurement = byProject.get(project)
      if (measurement === undefined) {
        measurement = {
          project,
          engine,
          condition,
          results: new Map(),
          cellsRun: 0,
          passed: 0,
          failed: 0,
          knownFailures: 0,
          skipped: 0,
          unattributed: 0,
          durationMs: 0,
        }
        byProject.set(project, measurement)
      }

      for (const result of test.results ?? [])
        measurement.durationMs += result.duration ?? 0

      const status = test.status ?? 'unexpected'
      const component = attribute(chain, spec.title ?? '', targets)
      if (component === undefined) {
        measurement.unattributed++
        continue
      }

      // `expected` covers both a plain pass and a `test.fail()` cell from
      // known-failures.json that failed as the ledger says it must. Playwright
      // reports an *unexpected pass* there as `unexpected`, so the ratchet keeps
      // working and a fixed cell still turns this red until the entry is removed.
      const expectedFailure = (test.annotations ?? []).some(a => a.type === 'fail')
      let cell: BrowserCellResult
      if (status === 'skipped') {
        measurement.skipped++
        cell = 'unrun'
      }
      else if (status === 'expected' || status === 'flaky') {
        measurement.cellsRun++
        measurement.passed++
        if (expectedFailure)
          measurement.knownFailures++
        cell = 'pass'
      }
      else {
        measurement.cellsRun++
        measurement.failed++
        cell = 'fail'
      }

      const seen = measurement.results.get(component)
      measurement.results.set(component, seen === undefined ? cell : worse(seen, cell))
    }
  }

  for (const child of suite.suites ?? [])
    walk(child, chain, targets, byProject, engines)
}

export interface ParsedReport {
  readonly path: string
  readonly playwrightVersion?: string
  readonly startedAt?: string
  readonly projects: ProjectMeasurement[]
}

/** Parse one Playwright JSON report into per-project measurements. */
export function parsePlaywrightReport(
  path: string,
  targets: ReadonlySet<string>,
  engines: readonly string[],
): ParsedReport {
  const report = JSON.parse(readFileSync(path, 'utf8')) as PwReport
  const byProject = new Map<string, ProjectMeasurement>()
  for (const suite of report.suites ?? [])
    walk(suite, [], targets, byProject, engines)
  return {
    path,
    playwrightVersion: report.config?.version,
    startedAt: report.stats?.startTime,
    projects: [...byProject.values()],
  }
}

// ---------------------------------------------------------------------------
// Provenance
// ---------------------------------------------------------------------------

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
}

export interface Provenance {
  readonly sourceCommit: string
  readonly worktreeDirty: boolean
  readonly dirtyPathCount: number
  readonly date: string
  readonly platform: string
  readonly node: string
}

/**
 * The checkout a run happened on, measured rather than declared.
 *
 * `worktreeDirty` and `dirtyPathCount` are first-class because every sweep this
 * repository has produced was measured on a dirty tree and the fact lived only
 * in prose. A stamp that claimed a clean tree it did not have is the exact
 * failure TASK-R2-O1 exists to end, so the count travels with the number.
 */
export function readProvenance(): Provenance {
  const dirty = git(['status', '--porcelain']).split('\n').filter(l => l.trim() !== '')
  return {
    sourceCommit: git(['rev-parse', '--short=7', 'HEAD']),
    worktreeDirty: dirty.length > 0,
    dirtyPathCount: dirty.length,
    date: new Date().toISOString().slice(0, 10),
    platform: process.platform,
    node: process.version,
  }
}

// ---------------------------------------------------------------------------
// The projection
// ---------------------------------------------------------------------------

const LEDGER_COMMENT
  = 'Tracked browser-matrix evidence (TASK-R2-O1). GENERATED by '
    + '`yarn generate:browser-evidence` from Playwright JSON reports; never edit a cell by hand. '
    + 'It replaces test-results/matrix-report.json as the capability matrix\'s `browser-matrix` '
    + 'input, because that file is git-ignored (N0-05 F4) AND lives inside the directory '
    + 'Playwright empties at the start of every run — which is how the 2026-08-25 record N1-O2 '
    + 'decision D1 set out to protect was destroyed. One result per {component, engine, '
    + 'condition}; the provenance of each result is the `runs` entry with the same engine and '
    + 'condition. A `pass` here may not become `unrun` or `fail` without a measured reason: '
    + '`validate:capability-matrix` fails on it and names the cell.'

const ADMISSIBILITY_DIRTY
  = 'LOCALLY QUALIFIED ONLY. At least one run was measured on a worktree with uncommitted '
    + 'changes (see each run\'s `worktreeDirty` / `dirtyPathCount`), so no row here is release '
    + 'or CI evidence. Full commit-binding requires the owner to commit the tree and re-run the '
    + 'lane; that is an owner action and no agent may perform it.'

const ADMISSIBILITY_CLEAN
  = 'Locally qualified. Every run was measured on a clean worktree at the stated commit. Still '
    + 'not CI evidence: these numbers come from a developer machine, not from a runner.'

export interface GenerateOptions {
  readonly reports: readonly string[]
  readonly reset: boolean
  readonly engineVersions: Readonly<Record<string, string>>
  readonly wallClock: Readonly<Record<string, string>>
  readonly previous?: BrowserEvidenceLedger
}

export function buildBrowserEvidence(
  options: GenerateOptions,
  targets: readonly MatrixTarget[] = buildMatrixTargets(),
  provenance: Provenance = readProvenance(),
): BrowserEvidenceLedger {
  const { engines, conditions } = readDeclaredMatrixProjects()
  const runnable = targets.filter(t => t.tier !== 'A')
  const names = new Set(runnable.map(t => t.component))

  const parsed = options.reports.map(path => parsePlaywrightReport(path, names, engines))
  const measured = new Map<string, { m: ProjectMeasurement, from: ParsedReport }>()
  for (const report of parsed) {
    for (const m of report.projects)
      measured.set(m.project, { m, from: report })
  }

  const previous = options.reset ? undefined : options.previous
  const previousRuns = new Map(
    (previous?.runs ?? []).map(r => [cellKey(r.engine, r.condition), r]),
  )
  const previousCells = new Map(
    (previous?.components ?? []).map(c => [c.component, c.cells]),
  )

  const runs: BrowserEvidenceRun[] = []
  for (const engine of engines) {
    for (const condition of conditions) {
      const key = cellKey(engine, condition)
      const hit = measured.get(`matrix-${engine}-${condition}`)
      if (hit === undefined) {
        const kept = previousRuns.get(key)
        runs.push(kept ?? {
          engine,
          condition,
          state: 'unrun',
          reason: 'No Playwright report covering this project has been projected into this '
            + 'ledger. The cells below are `unrun` because the lane was not run into a report — '
            + 'not because the evidence failed.',
        })
        continue
      }
      const { m, from } = hit
      runs.push({
        engine,
        condition,
        state: 'run',
        sourceCommit: provenance.sourceCommit,
        worktreeDirty: provenance.worktreeDirty,
        dirtyPathCount: provenance.dirtyPathCount,
        date: provenance.date,
        engineVersion: options.engineVersions[engine],
        playwrightVersion: from.playwrightVersion,
        platform: `${provenance.platform} — node ${provenance.node}`,
        report: reportProvenance(from.path),
        cellsRun: m.cellsRun,
        passed: m.passed,
        failed: m.failed,
        knownFailures: m.knownFailures,
        skipped: m.skipped,
        unattributedTests: m.unattributed,
        wallClock: options.wallClock[engine] ?? `${(m.durationMs / 60_000).toFixed(1)}m of test time`,
        exitStatus: m.failed === 0
          ? 'every attributed test in this project reported expected'
          : `${m.failed} unexpected result(s) in this project`,
      })
    }
  }

  const components: BrowserEvidenceComponent[] = runnable
    .slice()
    .sort((a, b) => a.component.localeCompare(b.component))
    .map((target) => {
      const cells: Record<string, BrowserCellResult> = {}
      for (const engine of engines) {
        for (const condition of conditions) {
          const key = cellKey(engine, condition)
          const hit = measured.get(`matrix-${engine}-${condition}`)
          cells[key] = hit === undefined
            ? (previousCells.get(target.component)?.[key] ?? 'unrun')
            : (hit.m.results.get(target.component) ?? 'unrun')
        }
      }
      return { component: target.component, tier: target.tier, story: target.story, cells }
    })

  let pass = 0
  let fail = 0
  let unrun = 0
  for (const component of components) {
    for (const result of Object.values(component.cells)) {
      if (result === 'pass')
        pass++
      else if (result === 'fail')
        fail++
      else unrun++
    }
  }

  const anyDirty = runs.some(r => r.state === 'run' && r.worktreeDirty === true)

  return {
    schemaVersion: BROWSER_EVIDENCE_SCHEMA_VERSION,
    $comment: LEDGER_COMMENT,
    sourceCommit: provenance.sourceCommit,
    worktreeDirty: provenance.worktreeDirty,
    dirtyPathCount: provenance.dirtyPathCount,
    generatedAt: provenance.date,
    admissibility: anyDirty ? ADMISSIBILITY_DIRTY : ADMISSIBILITY_CLEAN,
    rowShape: '| component | tier | engine | condition | result | sourceCommit | date | — '
      + 'component/tier/result from `components[].cells`, engine/condition from the cell key, '
      + 'sourceCommit/date from the `runs[]` entry with that engine and condition.',
    engines,
    conditions,
    totals: {
      projects: engines.length * conditions.length,
      projectsRun: runs.filter(r => r.state === 'run').length,
      components: components.length,
      cells: pass + fail + unrun,
      pass,
      fail,
      unrun,
    },
    runs,
    components,
  }
}

function rel(path: string): string {
  return resolve(path).replace(ROOT, '').replaceAll('\\', '/').replace(/^\//, '')
}

/**
 * Where a run's numbers came from, without writing a machine-specific path into
 * a tracked artifact.
 *
 * A report outside the repository is named by its file name only. The absolute
 * path would be a temp directory on one laptop — noise in every future diff, and
 * a false promise that a reader could open it. What the ledger owes is the
 * kind* of source and the fact that it does not survive; the numbers themselves
 * are here, which is the point of the file.
 */
function reportProvenance(path: string): string {
  const relative = rel(path)
  const inside = !relative.startsWith('..') && !/^[a-z]:/i.test(relative)
  return inside
    ? `${relative} (Playwright JSON reporter output, git-ignored; this ledger is the tracked record)`
    : `${basename(path)}, written outside the repository (Playwright JSON reporter output; it `
      + `must NOT be written under test-results/, which Playwright empties at the start of every `
      + `run — this ledger is the tracked record)`
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
function flagValues(argv: readonly string[], flag: string): string[] {
  const out: string[] = []
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === flag && argv[i + 1] !== undefined)
      out.push(argv[i + 1]!)
  }
  return out
}

function pairs(values: readonly string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const value of values) {
    const eq = value.indexOf('=')
    if (eq > 0)
      out[value.slice(0, eq)] = value.slice(eq + 1)
  }
  return out
}

/**
 * Launch each engine once and record `browser.version()`.
 *
 * `@playwright/test` is imported dynamically, and inside a function rather than
 * at the top level, so the projection never pays for it: this module is reached
 * from `validate:all` through `generate-capability-matrix.ts`, and a validator
 * that reads a JSON file must not pull a browser driver into its module graph.
 */
async function probeEngines(out: string): Promise<void> {
  const { chromium, firefox, webkit } = await import('@playwright/test')
  const versions: Record<string, string> = {}
  for (const [name, type] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await type.launch()
    versions[name] = browser.version()
    await browser.close()
  }
  writeFileSync(out, `${JSON.stringify(versions, null, 2)}\n`, 'utf8')
  console.warn(`browser-evidence: engine versions → ${out}`)
  for (const [name, version] of Object.entries(versions))
    console.warn(`  ${name.padEnd(9)} ${version}`)
}

/** Every `--report` path, refusing rather than silently skipping a missing one. */
function reportPaths(argv: readonly string[]): string[] {
  const given = flagValues(argv, '--report')
  const missing = given.filter(path => !existsSync(path))
  if (missing.length > 0) {
    for (const path of missing)
      console.error(`✗ --report ${path} does not exist.`)
    process.exit(1)
  }
  return given
}

/** Write the ledger from the reports named on the command line. */
function runProjection(argv: readonly string[]): void {
  const reports = reportPaths(argv)
  const versionsFile = flagValues(argv, '--engine-versions')[0]
  const engineVersions = versionsFile === undefined
    ? {}
    : JSON.parse(readFileSync(versionsFile, 'utf8')) as Record<string, string>

  const ledger = buildBrowserEvidence({
    reports,
    reset: [...argv].includes('--reset'),
    engineVersions,
    wallClock: pairs(flagValues(argv, '--wall-clock')),
    previous: readBrowserEvidence(),
  })

  writeFileSync(BROWSER_EVIDENCE_PATH, serializeBrowserEvidence(ledger), 'utf8')

  const t = ledger.totals
  console.warn(
    `browser-evidence: ${t.components} components × ${t.projects} projects = ${t.cells} cells`,
  )
  console.warn(`  pass ${t.pass}  ·  fail ${t.fail}  ·  unrun ${t.unrun}`)
  console.warn(`  projects run ${t.projectsRun}/${t.projects}`)
  for (const run of ledger.runs) {
    if (run.state !== 'run')
      continue
    console.warn(
      `  matrix-${run.engine}-${run.condition}: ${run.passed}/${run.cellsRun} passed, `
      + `${run.failed} failed, ${run.skipped} skipped, ${run.unattributedTests} unattributed`,
    )
  }
  const notRun = ledger.runs.filter(r => r.state !== 'run')
  if (notRun.length > 0)
    console.warn(`  ! ${notRun.length} project(s) unrun: ${notRun.map(r => `matrix-${r.engine}-${r.condition}`).join(', ')}`)
  if (ledger.worktreeDirty)
    console.warn(`  ! worktree dirty (${ledger.dirtyPathCount} paths) — locally qualified only`)
  console.warn(`\n  → e2e/matrix/browser-evidence.json`)
}

const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const argv = process.argv.slice(2)
  const probe = flagValues(argv, '--probe-engines')[0]
  if (probe === undefined)
    runProjection(argv)
  else
    void probeEngines(probe)
}
/* c8 ignore stop */
