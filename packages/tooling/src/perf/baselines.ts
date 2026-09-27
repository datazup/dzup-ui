/**
 * The performance-baseline file format (TASK-OSS-P5-05).
 *
 * `packages/core/perf/baselines.json` records, per metric, the distribution it
 * was measured from and the threshold that distribution earned — never a bare
 * number. A reader can therefore answer "is 240ms a regression?" without
 * running anything, and can see whether the answer is trustworthy.
 *
 * Six metric families:
 *
 *   - **`size`** — per-export gzipped bytes from a tree-shaken fixture build.
 *     Deterministic: the same source produces the same bytes, so its
 *     "distribution" has a variance of zero and its threshold is the 5% floor.
 *     Recorded through the same shape anyway, because a size that suddenly
 *     starts varying is worth seeing rather than hiding behind a special case.
 *   - **`runtime`** — mount and interaction timings, which are noisy and whose
 *     whole point is the spread.
 *   - **`leak`** (TASK-R2-O7) — net listener / observer / portal-node /
 *     document-node growth after 50 mount+unmount cycles. A **count**, and the
 *     only metric family whose correct value is a hard zero: the threshold a
 *     distribution of zeros earns under the standing formula is exactly `0`
 *     (`median 0 + max(3σ 0, 5% 0)`), so no special case is needed to express
 *     "tolerance 0" — the policy already says it.
 *   - **`longtask`** (TASK-R2-O7) — the number of synchronous task spans over
 *     50 ms during a scripted interaction. A count, for the same reason the
 *     runtime family is a distribution: on a contended host the *duration* is
 *     the machine, but "did any single task block the main thread past the
 *     responsiveness budget" survives the noise better than the millisecond.
 *   - **`memory`** (TASK-R2-O7) — heap bytes retained after the cycle lane and
 *     a forced collection. Noisy by nature; recorded so the spread is visible
 *     and thresholded only when it earns one.
 *   - **`hydration`** (TASK-R2-O7) — server-render + client-hydrate wall clock,
 *     Core-only and Core+Pro, the comparison the Pro program measures against.
 *
 * @module @dzup-ui/tooling/perf/baselines
 */

import type { RiskTier } from '@dzup-ui/contracts'
import type { Distribution, UnmeasurableReason } from './statistics.ts'

export type MetricKind = 'size' | 'runtime' | 'leak' | 'longtask' | 'memory' | 'hydration'

export interface Baseline {
  /** Stable metric id, e.g. `size:DzDataGrid` or `runtime:DzDataGrid:mount-1000`. */
  readonly id: string
  readonly kind: MetricKind
  readonly component: string
  readonly tier: RiskTier
  /** What was measured, in words a reader can act on. */
  readonly scenario: string
  readonly unit: 'bytes' | 'ms' | 'count'
  readonly distribution: Distribution
  /**
   * The gate, or `null` with a reason.
   *
   * `null` is the honest outcome for a metric whose noise swamps its signal,
   * and TASK-OSS-P5-05's stop condition asks for exactly it: "stop if variance
   * exceeds the signal (report as 'not yet measurable')". A baseline that
   * invented a threshold there would be a gate that fires at random.
   */
  readonly threshold: number | null
  readonly thresholdFormula: string | null
  readonly unmeasurable: UnmeasurableReason | null
  /** Repository HEAD the measurement was taken at. */
  readonly sourceCommit: string
  /** Where it was measured — a threshold is only portable with this attached. */
  readonly host: {
    readonly platform: string
    readonly arch: string
    readonly cpus: number
    readonly node: string
  }
}

/**
 * The identity of the measuring apparatus (TASK-R2-O7, owner decision **D90**).
 *
 * TASK-R5-O9 had to check a stop condition worded "alters the perf harness's
 * config hash" and found that **no such hash existed**: the file recorded a
 * schema version, a policy, a source commit and a host, and nothing at all
 * about the code that did the measuring. Its phase 1 therefore *defined* one
 * out-of-band — a `sha256sum` manifest in a report directory — and raised D90
 * with option (b), "add a real config hash to `baselines.json`", pointing here.
 *
 * This block is that hash, and it answers a question `sourceCommit` cannot.
 * `sourceCommit` says which product code was measured; `configHash` says which
 * instrument measured it. A threshold captured by a different harness is not
 * comparable even when the component is byte-identical — the whole reason
 * P5-05 records a host block as well as a number.
 *
 * What is hashed: the list `harnessFiles()` derives — the benchmark spec, every module
 * under `packages/tooling/src/perf/`, the lane specs and lane config, and the
 * three vitest files that decide the environment they all run in.
 * `packages/core/perf/baselines.json` is **deliberately excluded**: a hash a
 * file records about itself can never be checked against the file it is in.
 * (R5-O9's *migration* manifest does include it, and correctly — byte-identity
 * of the outputs is a different claim from identity of the instrument.)
 */
export interface HarnessIdentity {
  /** sha256 over the harness sources, in the order `harnessFiles()` lists them. */
  readonly configHash: string
  /** The exact file list the hash was taken over, so a reader can re-derive it. */
  readonly files: readonly string[]
  /**
   * The runner whose child processes produced the samples.
   *
   * The harness shells out to `node_modules/vitest/vitest.mjs`, so a Vitest
   * major changes what is measured even when every hashed file is untouched
   * (R5-O9 §4c). The version therefore belongs to the instrument's identity
   * exactly as much as the source hash does.
   */
  readonly vitest: string
}

export interface BaselineFile {
  readonly schemaVersion: string
  readonly policy: {
    readonly minimumRuns: number
    readonly measurableCv: number
    readonly threshold: string
    readonly ratchet: string
  }
  /** Absent in files captured before schema 1.1.0 — see {@link HarnessIdentity}. */
  readonly harness?: HarnessIdentity
  readonly baselines: readonly Baseline[]
}

/**
 * 1.1.0 (TASK-R2-O7): adds the `leak`, `longtask`, `memory` and `hydration`
 * metric kinds, the `count` unit, and the {@link HarnessIdentity} block.
 *
 * Additive: every 1.0.0 file is a valid 1.1.0 file with `harness` absent, and
 * readers treat an absent block as "captured before the instrument had a name".
 */
export const BASELINE_SCHEMA_VERSION = '1.1.0'
