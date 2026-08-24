/**
 * Distribution statistics and the ratchet policy (TASK-OSS-P5-05).
 *
 * Every performance assertion in this repository was, until this packet, a
 * single wall-clock number compared to a fixed constant:
 *
 * ```ts
 * expect(result.average).toBeLessThan(3_000)
 * ```
 *
 * That has already cost two recorded flakes — `perf-bench > DzDataGrid with
 * 100 rows` and `DzMasonry` — both of which fail in a full run and pass in
 * isolation, because a benchmark competing with 429 other test files for CPU is
 * measuring the scheduler as much as the component. A single run cannot tell a
 * regression from noise, and a constant threshold cannot say how much noise
 * there is. So the answer is not a bigger constant: it is measuring the spread
 * and deriving the threshold from it.
 *
 * The two committed baselines are here rather than in the spec so the policy is
 * one thing a reader can check, and so nothing can quietly assert against a
 * number it made up locally.
 *
 * @module @dzup-ui/tooling/perf/statistics
 */

/** A measured distribution. All times in milliseconds, all sizes in bytes. */
export interface Distribution {
  /** Every observation, in the order taken. Kept so a reader can re-derive. */
  readonly samples: readonly number[]
  readonly runs: number
  readonly median: number
  readonly p95: number
  readonly mean: number
  readonly stddev: number
  /** stddev / median — the spread as a fraction of the signal. */
  readonly cv: number
}

/**
 * The fewest runs a baseline may be built from.
 *
 * TASK-OSS-P5-05 says five, and five is genuinely the floor rather than a round
 * number: with four, one outlier moves the median.
 */
export const MINIMUM_RUNS = 5

/**
 * The spread above which a metric is **not yet measurable**.
 *
 * At a coefficient of variation of 0.25, three standard deviations is 75% of
 * the median — so the smallest regression the threshold could catch is one that
 * nearly doubles the number. Publishing a threshold there would be publishing a
 * gate that only fires on catastrophe while reading as a budget.
 *
 * The ThemeRecipe ledger rejected two mobile-performance experiments on exactly
 * this ground: the effect was inside the distribution. This constant is that
 * judgment, written down.
 */
export const MEASURABLE_CV = 0.25

/** Percentile by linear interpolation, `p` in [0, 1]. */
export function percentile(samples: readonly number[], p: number): number {
  if (samples.length === 0)
    return Number.NaN
  const sorted = [...samples].sort((a, b) => a - b)
  if (sorted.length === 1)
    return sorted[0]!
  const index = p * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper)
    return sorted[lower]!
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (index - lower)
}

/** Summarize a set of observations. */
export function describe(samples: readonly number[]): Distribution {
  const runs = samples.length
  const mean = runs === 0 ? Number.NaN : samples.reduce((a, b) => a + b, 0) / runs
  // Sample standard deviation (n − 1): these are samples of a process, not the
  // population, and with five observations the difference is 12%.
  const variance = runs < 2
    ? 0
    : samples.reduce((acc, x) => acc + (x - mean) ** 2, 0) / (runs - 1)
  const stddev = Math.sqrt(variance)
  const median = percentile(samples, 0.5)
  return {
    samples: [...samples],
    runs,
    median,
    p95: percentile(samples, 0.95),
    mean,
    stddev,
    cv: median === 0 ? 0 : stddev / median,
  }
}

/** Why a metric has no threshold. */
export type UnmeasurableReason = 'too-few-runs' | 'variance-exceeds-signal'

export interface Threshold {
  readonly value: number
  /** `median + max(3 * stddev, 5% of median)`, spelled out for the report. */
  readonly formula: string
}

/**
 * The threshold a distribution earns, or why it earns none.
 *
 * `median + max(3σ, 5%)`: three sigma so a clean run passes ~99.7% of the time,
 * and a 5% floor so a metric with a suspiciously tight spread does not produce
 * a threshold a rounding error trips.
 */
export function thresholdFor(
  distribution: Distribution,
): { threshold: Threshold } | { unmeasurable: UnmeasurableReason } {
  if (distribution.runs < MINIMUM_RUNS)
    return { unmeasurable: 'too-few-runs' }
  if (distribution.cv > MEASURABLE_CV)
    return { unmeasurable: 'variance-exceeds-signal' }

  const sigma3 = 3 * distribution.stddev
  const fivePercent = 0.05 * distribution.median
  const headroom = Math.max(sigma3, fivePercent)
  return {
    threshold: {
      value: distribution.median + headroom,
      formula: `median ${distribution.median.toFixed(2)} + max(3σ ${sigma3.toFixed(2)}, `
        + `5% ${fivePercent.toFixed(2)}) = ${(distribution.median + headroom).toFixed(2)}`,
    },
  }
}

/**
 * Whether a new distribution may replace a recorded one.
 *
 * **Only downward, and only on evidence.** A threshold that moves up whenever
 * the number moves up is not a budget; it is a log of what happened. So an
 * improvement ratchets and a regression does not — a regression is a
 * conversation with an owner, which is the reassessment's rule ("a budget
 * increase needs a recorded user benefit and owner; it is not the default
 * response to regression").
 */
export function mayRatchet(
  recorded: Distribution,
  fresh: Distribution,
): { ratchet: true } | { ratchet: false, reason: string } {
  if (fresh.runs < MINIMUM_RUNS)
    return { ratchet: false, reason: `${fresh.runs} runs; ${MINIMUM_RUNS} is the floor` }
  if (fresh.cv > MEASURABLE_CV) {
    return {
      ratchet: false,
      reason: `variance exceeds signal (cv ${fresh.cv.toFixed(2)} > ${MEASURABLE_CV})`,
    }
  }
  if (fresh.median >= recorded.median) {
    return {
      ratchet: false,
      reason: `median did not improve (${fresh.median.toFixed(2)} >= `
        + `${recorded.median.toFixed(2)}); raising a budget needs an owner, not a run`,
    }
  }
  return { ratchet: true }
}

/**
 * Whether an observation is a regression against a recorded threshold.
 *
 * Takes a whole distribution, never one number: the recorded threshold was
 * derived from a spread, and comparing a single sample against it re-introduces
 * exactly the coin-flip this module exists to remove.
 */
export function isRegression(
  fresh: Distribution,
  threshold: number,
): { regression: boolean, detail: string } {
  const regression = fresh.median > threshold
  return {
    regression,
    detail: `median ${fresh.median.toFixed(2)} vs threshold ${threshold.toFixed(2)} `
      + `(p95 ${fresh.p95.toFixed(2)}, cv ${fresh.cv.toFixed(2)}, n=${fresh.runs})`,
  }
}
