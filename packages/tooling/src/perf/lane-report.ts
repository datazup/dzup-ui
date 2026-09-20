/**
 * The shared plumbing of a perf lane (TASK-R2-O7).
 *
 * `perf-bench.spec.ts` established the contract every lane in this repository
 * follows, and it is a contract about *honesty* rather than about timing:
 *
 *   - a metric with no recorded baseline **reports and passes**, so adding a
 *     benchmark is not a breaking change;
 *   - a metric whose recorded spread swamped its signal **reports and passes**,
 *     because there is no threshold to be under;
 *   - a run whose own variance exceeds its signal **reports and passes**,
 *     because it proves nothing either way;
 *   - a regression **reports always** and **fails only under
 *     `DZUP_PERF_GATE=1`**, with the whole distribution in the message.
 *
 * This module is that contract, extracted so the four new lanes obey it by
 * construction instead of by four re-readings of the same 40 lines.
 * `perf-bench.spec.ts` keeps its own copy: rewriting a file whose bytes are
 * part of the recorded harness identity, in the same task that introduces
 * identity checking, would invalidate the comparison on its first use.
 *
 * The policy itself — `median + max(3σ, 5 %)`, ≥5 runs, downward ratchet — is
 * imported from `statistics.ts` and not restated here. There is one policy.
 *
 * @module @dzup-ui/tooling/perf/lane-report
 */

import type { Baseline } from './baselines.ts'
import type { Distribution } from './statistics.ts'
import { appendFileSync } from 'node:fs'
import process from 'node:process'
import { compareHarness, harnessIdentity } from './harness-hash.ts'
import { readBaselineFile } from './read-baselines.ts'
import { isRegression, MEASURABLE_CV, describe as summarize } from './statistics.ts'

/** Set by `yarn perf:capture` to the NDJSON file samples are appended to. */
const CAPTURE_TO = process.env.DZUP_PERF_CAPTURE

/**
 * Whether a threshold breach may fail the build.
 *
 * Same flag and same reasoning as `perf-bench.spec.ts`: a wall-clock benchmark
 * on a shared developer machine measures the machine, so the gate is a
 * declaration that this host is a measurement host, not a preference.
 *
 * It covers the **count** lanes too, even though a listener count is
 * deterministic where a millisecond is not, because `<requirements><policy>`
 * for this task says the gate stays behind the flag until the lanes are stable.
 * The lanes' own instrument checks — the seeded failures — are unconditional,
 * so a broken detector still fails loudly with the flag off.
 */
export const PERF_GATE = process.env.DZUP_PERF_GATE === '1'

const FILE = readBaselineFile()
const BASELINES = new Map<string, Baseline>(
  (FILE?.baselines ?? []).map(baseline => [baseline.id, baseline]),
)

/** The instrument the working tree holds, versus the one that captured the file. */
export const HARNESS = compareHarness(FILE?.harness, harnessIdentity())

function report(message: string): void {
  // eslint-disable-next-line no-console
  console.log(`  ${message}`)
}

/** Print the harness verdict once per lane file. */
export function reportHarness(): void {
  if (HARNESS.state === 'match')
    return
  report(`harness ${HARNESS.state}: ${HARNESS.detail}`)
}

/**
 * Record a sample set for `id` and return its distribution.
 *
 * The samples are appended to the capture file in exactly the shape
 * `perf-bench.spec.ts` uses, so `yarn perf:capture` collects both halves of the
 * harness through one reader and no second capture format exists.
 */
export function record(id: string, samples: readonly number[]): Distribution {
  const distribution = summarize(samples)
  if (CAPTURE_TO !== undefined)
    appendFileSync(CAPTURE_TO, `${JSON.stringify({ id, samples })}\n`, 'utf8')
  return distribution
}

export interface LaneVerdict {
  /** `true` when the gate should fail the test. */
  readonly fail: boolean
  readonly message: string
}

/**
 * Judge a fresh distribution against its recorded baseline.
 *
 * `unit` only changes how the numbers are spelled. A count lane and a
 * millisecond lane are judged by the same rule, which is the property that
 * makes "tolerance 0" fall out of the standing policy rather than needing a
 * clause of its own: a recorded distribution of zeros has median 0, σ 0 and
 * therefore a threshold of exactly 0, so any growth at all is a regression.
 */
export function judge(
  id: string,
  fresh: Distribution,
  unit: 'ms' | 'bytes' | 'count',
): LaneVerdict {
  const baseline = BASELINES.get(id)
  const shown = format(fresh, unit)

  if (baseline === undefined) {
    report(`${id}: no baseline — ${shown}`)
    return { fail: false, message: 'no baseline' }
  }
  if (baseline.threshold === null) {
    report(`${id}: not yet measurable (${baseline.unmeasurable}) — ${shown}`)
    return { fail: false, message: 'not yet measurable' }
  }
  // A count baseline of zero has zero spread, so the `cv` guard below — which
  // exists to stop a noisy *timing* run from claiming anything — must not swing
  // at it. `cv` is 0 for an all-zero distribution by construction (`median === 0`
  // short-circuits), so the guard only bites where it was meant to.
  if (fresh.cv > MEASURABLE_CV) {
    report(
      `${id}: this run's own variance exceeds its signal (cv ${fresh.cv.toFixed(2)}), `
      + `so it proves nothing either way — ${shown}`,
    )
    return { fail: false, message: 'run too noisy' }
  }

  const verdict = isRegression(fresh, baseline.threshold)
  report(
    `${id}: ${verdict.regression ? 'REGRESSION' : 'ok'} — ${verdict.detail}`
    + `${verdict.regression && !PERF_GATE ? ' [reported; set DZUP_PERF_GATE=1 to gate]' : ''}`,
  )

  return {
    fail: PERF_GATE && verdict.regression,
    message: `${id} regressed against the baseline recorded at `
      + `${baseline.sourceCommit.slice(0, 8)} on ${baseline.host.platform}/${baseline.host.arch} `
      + `with ${baseline.host.cpus} CPUs: ${verdict.detail}. `
      + `Threshold was ${baseline.thresholdFormula}.${
        HARNESS.state === 'match'
          ? ''
          : ` NOTE: the harness is ${HARNESS.state} (${HARNESS.detail}), so this `
            + `comparison is between different instruments.`}`,
  }
}

function format(d: Distribution, unit: 'ms' | 'bytes' | 'count'): string {
  const suffix = unit === 'ms' ? 'ms' : unit === 'bytes' ? 'B' : ''
  return `median=${d.median.toFixed(unit === 'count' ? 0 : 2)}${suffix} `
    + `p95=${d.p95.toFixed(unit === 'count' ? 0 : 2)}${suffix} `
    + `cv=${d.cv.toFixed(2)} n=${d.runs}`
}

/** Print a per-component line whether or not a baseline exists. */
export function note(message: string): void {
  report(message)
}
