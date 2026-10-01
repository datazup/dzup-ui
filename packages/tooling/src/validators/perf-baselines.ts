/**
 * `validate:perf-baselines` — the half of the performance contract that needs
 * no host (TASK-S1-O4).
 *
 * The split is TASK-S1-O3's, and its reason is stated there: a check that is
 * legitimately red on every developer machine acquires a `--skip` flag within
 * the week. "Am I on the capture host" is therefore a refusal inside
 * `yarn perf:capture`, where it belongs; "is the committed perf evidence
 * coherent, provenanced and not quietly shrinking" is a repository-state
 * question, needs no stopwatch, and belongs in `validate:all`.
 *
 * What it refuses, in one line each:
 *
 *  - no declared capture environment at all;
 *  - a profile id that resolves to nothing;
 *  - baselines whose `host` contradicts the profile the file claims they are on;
 *  - a baseline with no `sourceCommit` (a cell fed by it can never be told
 *    current from stale, which is the whole defect TASK-S1-O2 traced the 22
 *    stale capability cells to);
 *  - a threshold derived from fewer than `MINIMUM_RUNS` samples, or from a
 *    distribution whose `cv` exceeds `MEASURABLE_CV`;
 *  - a designated authoritative host that no committed baseline is on — a gate
 *    that can never pass honestly;
 *  - either one-way ratchet moving, in either direction, without its ceiling.
 *
 * It deliberately does **not** check that `sourceCommit` equals HEAD. A
 * baseline file is committed *by* a commit whose hash did not exist when the
 * capture ran, so "stamp equals HEAD" is satisfiable only in the seconds
 * between capture and commit and is false forever after. TASK-S0-O1 recorded
 * that class of defect; staleness is measured against each component's own
 * last-change commit in `generate-capability-matrix.ts`, where it is answerable.
 *
 * @module @dzup-ui/tooling/validators/perf-baselines
 */

import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  checkPerfBaselines,
  familiesWithBaseline,
  METRIC_KINDS,
  readCaptureEnvironment,
  readPerfCeilings,
} from '../perf/capture-environment.ts'
import { readBaselineFile } from '../perf/read-baselines.ts'

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
const isMain = process.argv[1] !== undefined
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const file = readBaselineFile()
  const environment = readCaptureEnvironment()
  const ceilings = readPerfCeilings()
  const violations = checkPerfBaselines(file, environment, ceilings)

  console.warn('Perf baselines — TASK-OSS-P5-05 / TASK-R2-O7 / TASK-S1-O4\n')

  if (file !== undefined) {
    const withThreshold = file.baselines.filter(b => b.threshold !== null).length
    const present = familiesWithBaseline(file)
    const absent = METRIC_KINDS.filter(kind => !present.has(kind))
    console.warn(`  schema     ${file.schemaVersion}`
      + `${file.harness === undefined ? ' (no harness identity — pre-1.1.0 capture)' : ''}`)
    console.warn(`  metrics    ${file.baselines.length} recorded · ${withThreshold} with a `
      + `threshold · ${file.baselines.length - withThreshold} not yet measurable`)
    console.warn(`  families   with a baseline: ${[...present].sort().join(', ') || '(none)'}`)
    console.warn(`             WITHOUT one:     ${absent.join(', ') || '(none)'}`
      + `${absent.length > 0 ? '  ← these lanes run, report, and cannot fail' : ''}`)
  }

  const designated = environment?.authoritative.designated === true
    && environment.authoritative.profileId !== null
  console.warn(`  capture    authoritative host: ${
    designated ? environment!.authoritative.profileId : '(undesignated — in-place capture is refused)'
  }`)
  console.warn(`             committed evidence: ${environment?.committed?.profileId ?? '(undeclared)'}`)

  if (ceilings !== undefined) {
    console.warn(`  ratchets   metricFamiliesWithoutBaseline ≤ ${ceilings.metricFamiliesWithoutBaseline.ceiling}`
      + ` · unmeasurableMetrics ≤ ${ceilings.unmeasurableMetrics.ceiling}`)
  }

  if (violations.length === 0) {
    console.warn('\n✓ perf-baselines: every recorded metric is provenanced, sample-disciplined '
      + 'and on the host the file declares.')
    process.exit(0)
  }

  console.error('')
  for (const v of violations)
    console.error(`✗ [${v.rule}] ${v.message}`)
  console.error(`\n${violations.length} perf-baseline violation(s).`)
  process.exit(1)
}
/* c8 ignore stop */
