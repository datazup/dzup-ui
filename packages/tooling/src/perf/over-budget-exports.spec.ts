import { describe, expect, it } from 'vitest'
import { measureExportSizes } from './export-sizes.ts'
import { readBaselines } from './read-baselines.ts'
import { checkSizes } from './size-gate.ts'

describe('GAP5-01 per-export size regression', () => {
  it('keeps Cascader and Transfer within their unchanged consumer budgets', () => {
    const components = ['DzCascader', 'DzTransfer']
    const budgets = [...readBaselines().values()]
      .filter(b => b.kind === 'size' && components.includes(b.component))
    expect(budgets).toHaveLength(2)
    const verdicts = checkSizes(budgets, measureExportSizes(components))
    expect(verdicts.filter(v => !v.ok).map(v => v.detail)).toEqual([])
  }, 60_000)
})
