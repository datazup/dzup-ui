import type { Baseline } from './baselines.ts'
import { describe, expect, it } from 'vitest'
import { readBaselines } from './read-baselines.ts'
import { checkSizes } from './size-gate.ts'

function budget(component: string, threshold: number | null, kind: Baseline['kind'] = 'size'): Baseline {
  return {
    id: `${kind}:${component}`,
    kind,
    component,
    tier: 'C',
    scenario: 'gzipped bytes of a fixture importing only this export',
    unit: 'bytes',
    distribution: { samples: [1000, 1000, 1000, 1000, 1000], runs: 5, median: 1000, p95: 1000, mean: 1000, stddev: 0, cv: 0 },
    threshold,
    thresholdFormula: threshold === null ? null : 'median + max(3σ, 5% of median)',
    unmeasurable: null,
    sourceCommit: 'test',
    host: { platform: 'linux', arch: 'x64', cpus: 1, node: 'v24' },
  }
}

describe('size gate (D140)', () => {
  it('passes a size at or under its threshold', () => {
    const [atLimit, under] = checkSizes(
      [budget('DzA', 1050), budget('DzB', 1050)],
      [{ component: 'DzA', gzipBytes: 1050 }, { component: 'DzB', gzipBytes: 900 }],
    )
    expect(atLimit?.ok).toBe(true)
    expect(under?.ok).toBe(true)
  })

  it('fails a size over its threshold and names it', () => {
    const [verdict] = checkSizes([budget('DzA', 1050)], [{ component: 'DzA', gzipBytes: 1051 }])
    expect(verdict?.ok).toBe(false)
    expect(verdict?.detail).toContain('size:DzA')
    expect(verdict?.detail).toContain('1051 B > 1050 B')
  })

  it('fails a budget that was not measured or has no threshold', () => {
    const verdicts = checkSizes(
      [budget('DzA', 1050), budget('DzB', null)],
      [{ component: 'DzB', gzipBytes: 10 }],
    )
    expect(verdicts.map(v => v.ok)).toEqual([false, false])
  })

  it('ignores non-size metrics', () => {
    expect(checkSizes([budget('DzA', 1, 'runtime')], [])).toEqual([])
  })

  it('reads 22 size budgets, each with a threshold, from the committed file', () => {
    const sizes = [...readBaselines().values()].filter(b => b.kind === 'size')
    expect(sizes).toHaveLength(22)
    expect(sizes.every(b => b.threshold !== null)).toBe(true)
  })
})
