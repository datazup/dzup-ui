import { describe, expect, it, vi } from 'vitest'
import { measureExportSizes } from './export-sizes.ts'
import { readBaselines } from './read-baselines.ts'
import { checkSizes } from './size-gate.ts'

describe('gap5-01 per-export size regression', () => {
  it('keeps Cascader and Transfer within their unchanged consumer budgets', () => {
    const components = ['DzCascader', 'DzTransfer']
    const budgets = [...readBaselines().values()]
      .filter(b => b.kind === 'size' && components.includes(b.component))
    expect(budgets).toHaveLength(2)
    // Match the production CLI gate rather than passing Vitest's NODE_ENV=test
    // into Vite (which retains development-only Vue branches).
    vi.stubEnv('NODE_ENV', 'production')
    try {
      const verdicts = checkSizes(budgets, measureExportSizes(components))
      expect(verdicts.filter(v => !v.ok).map(v => v.detail)).toEqual([])
    }
    finally {
      vi.unstubAllEnvs()
    }
  }, 60_000)
})
