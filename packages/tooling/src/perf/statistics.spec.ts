import { describe, expect, it } from 'vitest'
import {
  isRegression,
  mayRatchet,
  MEASURABLE_CV,
  MINIMUM_RUNS,
  percentile,
  describe as summarize,
  thresholdFor,
} from './statistics.ts'

/**
 * Samples with an exactly known median and coefficient of variation.
 *
 * `[m-d, m-d, m, m+d, m+d]` has mean `m`, median `m`, and sample standard
 * deviation exactly `d` — so `cv` is exactly `d/m`. Built this way rather than
 * as a ramp because a ramp's standard deviation is a function of its length,
 * and a test of a cv threshold that does not control cv tests nothing.
 */
function around(median: number, cv: number): number[] {
  const d = median * cv
  return [median - d, median - d, median, median + d, median + d]
}

describe('percentile', () => {
  it('interpolates rather than picking a neighbour', () => {
    expect(percentile([1, 2, 3, 4], 0.5)).toBe(2.5)
  })

  it('handles the degenerate sizes', () => {
    expect(percentile([], 0.5)).toBeNaN()
    expect(percentile([7], 0.95)).toBe(7)
  })

  it('is order-independent', () => {
    expect(percentile([9, 1, 5], 0.5)).toBe(percentile([1, 5, 9], 0.5))
  })
})

describe('describe', () => {
  it('uses the sample standard deviation, not the population one', () => {
    // n-1 on purpose: these are samples of a process. With five observations
    // the two differ by 12%, which is the difference between a threshold and a
    // slightly-too-tight threshold.
    const d = summarize([2, 4, 4, 4, 5, 5, 7, 9])
    expect(d.stddev).toBeCloseTo(2.138, 2)
  })

  it('reports cv as spread over signal', () => {
    const d = summarize([100, 100, 100])
    expect(d.cv).toBe(0)
  })

  it('keeps the samples so a reader can re-derive', () => {
    const d = summarize([3, 1, 2])
    expect(d.samples).toEqual([3, 1, 2])
    expect(d.runs).toBe(3)
  })
})

describe('thresholdFor', () => {
  it('refuses a threshold under the run floor', () => {
    const verdict = thresholdFor(summarize([10, 10, 10]))
    expect(verdict).toEqual({ unmeasurable: 'too-few-runs' })
  })

  it('refuses a threshold when variance swamps the signal', () => {
    // The real case: `DzDataGrid:mount-1` measured cv 2.53 over 35 samples.
    // A threshold there would only fire on a regression that quadrupled the
    // number, while reading like a budget.
    const verdict = thresholdFor(summarize(around(10, 3)))
    expect(verdict).toEqual({ unmeasurable: 'variance-exceeds-signal' })
  })

  it('derives median + 3σ for a noisy-but-measurable metric', () => {
    const d = summarize(around(500, 0.2))
    const verdict = thresholdFor(d)
    expect('threshold' in verdict).toBe(true)
    if ('threshold' in verdict) {
      expect(verdict.threshold.value).toBeCloseTo(d.median + 3 * d.stddev, 6)
      expect(verdict.threshold.formula).toContain('3σ')
    }
  })

  it('floors the headroom at 5% when the spread is tiny', () => {
    // A deterministic metric — a gzipped byte count — has zero variance, and
    // 3σ of zero is a threshold a single byte trips.
    const d = summarize(Array.from({ length: MINIMUM_RUNS }, () => 19_200))
    const verdict = thresholdFor(d)
    expect('threshold' in verdict).toBe(true)
    if ('threshold' in verdict)
      expect(verdict.threshold.value).toBeCloseTo(19_200 * 1.05, 6)
  })

  it('puts the boundary exactly at MEASURABLE_CV', () => {
    const under = summarize(around(100, MEASURABLE_CV * 0.9))
    const over = summarize(around(100, MEASURABLE_CV * 4))
    expect('threshold' in thresholdFor(under)).toBe(true)
    expect('unmeasurable' in thresholdFor(over)).toBe(true)
  })
})

describe('mayRatchet', () => {
  const recorded = summarize(around(500, 0.1))

  it('allows an improvement', () => {
    expect(mayRatchet(recorded, summarize(around(400, 0.1)))).toEqual({ ratchet: true })
  })

  it('refuses a regression, and says an owner decides', () => {
    const verdict = mayRatchet(recorded, summarize(around(700, 0.1)))
    expect(verdict.ratchet).toBe(false)
    if (!verdict.ratchet)
      expect(verdict.reason).toContain('owner')
  })

  it('refuses an unchanged median — a budget is not a log of what happened', () => {
    expect(mayRatchet(recorded, recorded).ratchet).toBe(false)
  })

  it('refuses a noisy improvement', () => {
    // Faster on the median but with the spread of a coin flip: not evidence.
    const verdict = mayRatchet(recorded, summarize(around(400, 3)))
    expect(verdict.ratchet).toBe(false)
    if (!verdict.ratchet)
      expect(verdict.reason).toContain('variance')
  })

  it('refuses too few runs even when the number improved', () => {
    expect(mayRatchet(recorded, summarize([1, 1, 1])).ratchet).toBe(false)
  })
})

describe('isRegression', () => {
  it('compares the median, not a single sample', () => {
    // The whole point. `[10, 10, 10, 10, 900]` has one terrible sample and a
    // median of 10; the old fixed-constant assertion failed the build on the
    // 900 and this does not.
    const spiky = summarize([10, 10, 10, 10, 900])
    expect(isRegression(spiky, 20).regression).toBe(false)
  })

  it('flags a genuine shift', () => {
    expect(isRegression(summarize([100, 105, 110, 108, 102]), 20).regression).toBe(true)
  })

  it('puts the distribution in the message, so the next reader can judge', () => {
    const detail = isRegression(summarize([1, 2, 3, 4, 5]), 2).detail
    expect(detail).toContain('p95')
    expect(detail).toContain('cv')
    expect(detail).toContain('n=5')
  })
})
