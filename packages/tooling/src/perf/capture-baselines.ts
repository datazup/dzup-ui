/**
 * Baseline capture (TASK-OSS-P5-05).
 *
 * Runs the runtime benchmarks several times over, measures a tree-shaken bundle
 * size for each Tier C/D component, and writes
 * `packages/core/perf/baselines.json`.
 *
 * **Separate from the test run, deliberately.** A suite that recorded its own
 * baseline every time it ran would ratchet upward forever: each slow run would
 * become the new normal, and the file would end up documenting the worst
 * machine that ever ran it. Capture is therefore an owner action with a
 * command of its own, and `mayRatchet` refuses to lower a recorded median
 * without evidence and refuses to raise one at all.
 *
 * **Why the runtime measurement runs vitest in child processes.** The two
 * flakes this packet exists to fix are cross-process: they appear when the
 * benchmark shares a machine with 429 other test files and vanish in isolation.
 * Iterating inside one process would measure a warm JIT and a quiet CPU, which
 * is the distribution that produced the constant that keeps failing. Running
 * the file R times gives R × ITERATIONS samples that include process start-up
 * and whatever else the machine was doing.
 *
 * Usage:
 *   tsx packages/tooling/src/perf/capture-baselines.ts            # 5 runs
 *   tsx packages/tooling/src/perf/capture-baselines.ts --runs 9
 *   tsx packages/tooling/src/perf/capture-baselines.ts --skip-sizes
 *   tsx packages/tooling/src/perf/capture-baselines.ts --propose <path>
 *
 * **`--propose` (TASK-R2-O7).** Writes the captured file to `<path>` and leaves
 * `packages/core/perf/baselines.json` untouched. Adding a lane and replacing a
 * baseline are different acts with different authority: an agent or a
 * contributor may measure and propose, and the owner decides whether the
 * numbers become the budget. Without it the distinction had no expression in
 * the tooling — the only way to see what a new lane would record was to
 * overwrite the file that thirty-three existing metrics depend on.
 */

import type { Baseline, BaselineFile } from './baselines.ts'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { arch, cpus, platform } from 'node:os'
import { dirname, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { compareSymbols } from '../ownership/ownership-manifest.types.ts'
import { readCommittedMatrix } from '../quality/generate-quality-matrix.ts'
import { BASELINE_SCHEMA_VERSION } from './baselines.ts'
import { measureExportSizes } from './export-sizes.ts'
import { harnessIdentity } from './harness-hash.ts'
import { BASELINES_PATH } from './read-baselines.ts'
import {
  MEASURABLE_CV,
  MINIMUM_RUNS,
  describe as summarize,
  thresholdFor,
} from './statistics.ts'

const SAMPLE_FILE = resolve(ROOT, '.perf-samples.ndjson')
const SPEC = 'packages/tooling/src/perf-bench.spec.ts'

/**
 * The leak / long-task / memory / hydration lanes (TASK-R2-O7).
 *
 * A config rather than a path because those lanes live outside the root
 * config's `include` globs on purpose — see `perf-lanes/vitest.config.ts`. They
 * are captured in the **same** process runs as the benchmark spec so a recorded
 * distribution sees the same cross-process variance; that is the whole reason
 * this file spawns child processes instead of looping in one.
 */
const LANES_CONFIG = 'packages/tooling/perf-lanes/vitest.config.ts'

function gitHead(): string {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim()
  }
  catch {
    return 'unknown'
  }
}

const HOST = {
  platform: platform(),
  arch: arch(),
  cpus: cpus().length,
  node: process.version,
}

/** Run the benchmark spec `runs` times, collecting every sample it emits. */
export function captureRuntimeSamples(runs: number, includeLanes = true): Map<string, number[]> {
  rmSync(SAMPLE_FILE, { force: true })
  writeFileSync(SAMPLE_FILE, '', 'utf8')

  const vitest = resolve(ROOT, 'node_modules/vitest/vitest.mjs')
  const invocations: string[][] = [
    [vitest, 'run', SPEC],
    ...(includeLanes ? [[vitest, 'run', '-c', LANES_CONFIG]] : []),
  ]

  for (let run = 0; run < runs; run++) {
    for (const argv of invocations) {
      execFileSync(process.execPath, argv, {
        cwd: ROOT,
        stdio: 'pipe',
        env: { ...process.env, DZUP_PERF_CAPTURE: SAMPLE_FILE },
      })
    }
    process.stderr.write(`  run ${run + 1}/${runs} done\n`)
  }

  const byId = new Map<string, number[]>()
  for (const line of readFileSync(SAMPLE_FILE, 'utf8').split('\n')) {
    if (line.trim() === '')
      continue
    const { id, samples } = JSON.parse(line) as { id: string, samples: number[] }
    byId.set(id, [...(byId.get(id) ?? []), ...samples])
  }
  rmSync(SAMPLE_FILE, { force: true })
  return byId
}

/** Turn a sample set into a `Baseline`, threshold and all. */
export function toBaseline(input: {
  id: string
  kind: Baseline['kind']
  component: string
  tier: Baseline['tier']
  scenario: string
  unit: Baseline['unit']
  samples: readonly number[]
  sourceCommit: string
}): Baseline {
  const distribution = summarize(input.samples)
  const verdict = thresholdFor(distribution)
  const measured = 'threshold' in verdict

  return {
    id: input.id,
    kind: input.kind,
    component: input.component,
    tier: input.tier,
    scenario: input.scenario,
    unit: input.unit,
    distribution,
    threshold: measured ? verdict.threshold.value : null,
    thresholdFormula: measured ? verdict.threshold.formula : null,
    unmeasurable: measured ? null : verdict.unmeasurable,
    sourceCommit: input.sourceCommit,
    host: HOST,
  }
}

/**
 * What a captured metric id means (TASK-R2-O7).
 *
 * Every sample arrives as `{ id, samples }` over one NDJSON channel, and the id
 * is the only thing that says which family it belongs to. Before the four new
 * lanes there was one family and the mapping was three inline literals; with
 * six it becomes a function, so the id grammar is stated once and a new lane
 * cannot be recorded as a millisecond by accident.
 *
 * Grammar: `<kind>:<component>:<scenario>`, or `<kind>:<component>` for `size`.
 * `hydration` uses the middle field for the *variant* (`core-only`, `core-pro`)
 * rather than a component, because the thing measured is a page, not a control.
 */
export function describeMetricId(id: string): {
  kind: Baseline['kind']
  component: string
  scenario: string
  unit: Baseline['unit']
} {
  const [head = '', middle = 'unknown', ...rest] = id.split(':')
  const scenario = rest.join(':')

  switch (head) {
    case 'leak':
      return { kind: 'leak', component: middle, scenario, unit: 'count' }
    case 'longtask':
      // `over-50ms` counts breaches; `worst-span` is the millisecond it went to.
      return {
        kind: 'longtask',
        component: middle,
        scenario,
        unit: scenario.startsWith('worst') ? 'ms' : 'count',
      }
    case 'memory':
      return { kind: 'memory', component: middle, scenario, unit: 'bytes' }
    case 'hydration':
      return { kind: 'hydration', component: middle, scenario, unit: 'ms' }
    case 'size':
      return { kind: 'size', component: middle, scenario, unit: 'bytes' }
    default:
      return { kind: 'runtime', component: middle, scenario, unit: 'ms' }
  }
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const runsFlag = process.argv.indexOf('--runs')
  const runs = runsFlag >= 0 ? Number(process.argv[runsFlag + 1]) : MINIMUM_RUNS
  const skipSizes = process.argv.includes('--skip-sizes')
  const skipLanes = process.argv.includes('--skip-lanes')
  const proposeFlag = process.argv.indexOf('--propose')
  const proposeTo = proposeFlag >= 0 ? resolve(process.argv[proposeFlag + 1] ?? '') : undefined
  const outputPath = proposeTo ?? BASELINES_PATH

  const matrix = readCommittedMatrix()
  if (matrix === undefined) {
    console.error('quality-matrix.json is missing. Run `yarn generate:quality-matrix` first.')
    process.exit(1)
  }

  const sourceCommit = gitHead()
  const tierOf = new Map(matrix.components.map(row => [row.component, row.tier]))
  const baselines: Baseline[] = []

  // --- runtime + the four TASK-R2-O7 lanes ---------------------------------
  console.warn(
    `perf:capture — runtime, ${runs} process runs of ${SPEC}`
    + `${skipLanes ? '' : ` and ${LANES_CONFIG}`}`,
  )
  const samples = captureRuntimeSamples(runs, !skipLanes)
  for (const [id, values] of [...samples.entries()].sort((a, b) => compareSymbols(a[0], b[0]))) {
    const { kind, component, scenario, unit } = describeMetricId(id)
    baselines.push(toBaseline({
      id,
      kind,
      component,
      // A hydration metric names a variant, not a component, so there is no
      // tier to look up; it is the page's tier, and the page is the catalogue.
      tier: tierOf.get(component) ?? 'C',
      scenario,
      unit,
      samples: values,
      sourceCommit,
    }))
  }

  // --- size ----------------------------------------------------------------
  if (!skipSizes) {
    const tierCd = matrix.components
      .filter(row => row.tier === 'C' || row.tier === 'D')
      .map(row => row.component)
    console.warn(`perf:capture — bundle size, ${tierCd.length} tree-shaken fixture builds`)
    for (const { component, gzipBytes } of measureExportSizes(tierCd)) {
      baselines.push(toBaseline({
        id: `size:${component}`,
        kind: 'size',
        component,
        tier: tierOf.get(component) ?? 'C',
        scenario: 'gzipped bytes of a fixture importing only this export',
        unit: 'bytes',
        // A build is deterministic, so one observation IS the distribution.
        // Repeated MINIMUM_RUNS times rather than special-cased, so the file
        // has one shape and a size that ever starts varying becomes visible
        // instead of being averaged away by a branch nobody reads.
        samples: Array.from({ length: MINIMUM_RUNS }, () => gzipBytes),
        sourceCommit,
      }))
    }
  }

  const file: BaselineFile = {
    schemaVersion: BASELINE_SCHEMA_VERSION,
    policy: {
      minimumRuns: MINIMUM_RUNS,
      measurableCv: MEASURABLE_CV,
      threshold: 'median + max(3 * stddev, 5% of median)',
      ratchet: 'downward only, on >= 5 runs whose cv is within the measurable limit; '
        + 'raising a threshold needs a recorded owner decision, not a slower run',
    },
    // D90: the instrument that produced these numbers, recorded beside them.
    harness: harnessIdentity(),
    baselines: baselines.sort((a, b) => compareSymbols(a.id, b.id)),
  }

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(file, null, 2)}\n`, 'utf8')

  const measurable = baselines.filter(b => b.threshold !== null).length
  console.warn(
    `\nperf:capture: ${baselines.length} metrics — ${measurable} with a threshold, `
    + `${baselines.length - measurable} not yet measurable`,
  )
  for (const b of baselines.filter(b => b.threshold === null))
    console.warn(`  · ${b.id}: ${b.unmeasurable} (cv ${b.distribution.cv.toFixed(2)})`)
  console.warn(`  → ${relative(ROOT, outputPath).replace(/\\/g, '/')}`)
  if (proposeTo !== undefined) {
    console.warn(
      '  (proposal only — packages/core/perf/baselines.json is unchanged. '
      + 'Adopting these numbers as budgets is an owner action.)',
    )
  }

  if (!existsSync(outputPath))
    process.exit(1)
}
/* c8 ignore stop */
