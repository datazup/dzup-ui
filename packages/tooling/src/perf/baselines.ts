/**
 * The performance-baseline file format (TASK-OSS-P5-05).
 *
 * `packages/core/perf/baselines.json` records, per metric, the distribution it
 * was measured from and the threshold that distribution earned — never a bare
 * number. A reader can therefore answer "is 240ms a regression?" without
 * running anything, and can see whether the answer is trustworthy.
 *
 * Two metric families:
 *
 *   - **`size`** — per-export gzipped bytes from a tree-shaken fixture build.
 *     Deterministic: the same source produces the same bytes, so its
 *     "distribution" has a variance of zero and its threshold is the 5% floor.
 *     Recorded through the same shape anyway, because a size that suddenly
 *     starts varying is worth seeing rather than hiding behind a special case.
 *   - **`runtime`** — mount and interaction timings, which are noisy and whose
 *     whole point is the spread.
 *
 * @module @dzup-ui/tooling/perf/baselines
 */

import type { RiskTier } from '@dzup-ui/contracts'
import type { Distribution, UnmeasurableReason } from './statistics.ts'

export type MetricKind = 'size' | 'runtime'

export interface Baseline {
  /** Stable metric id, e.g. `size:DzDataGrid` or `runtime:DzDataGrid:mount-1000`. */
  readonly id: string
  readonly kind: MetricKind
  readonly component: string
  readonly tier: RiskTier
  /** What was measured, in words a reader can act on. */
  readonly scenario: string
  readonly unit: 'bytes' | 'ms'
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

export interface BaselineFile {
  readonly schemaVersion: string
  readonly policy: {
    readonly minimumRuns: number
    readonly measurableCv: number
    readonly threshold: string
    readonly ratchet: string
  }
  readonly baselines: readonly Baseline[]
}

export const BASELINE_SCHEMA_VERSION = '1.0.0'
