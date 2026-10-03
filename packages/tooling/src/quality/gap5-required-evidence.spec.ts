import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

describe('gap5-02 bounded required evidence repayment', () => {
  it('credits the nine exercised selection-control cells without waiving portal or AT debt', () => {
    const matrix = buildCapabilityMatrix()
    const kinds = ['contract-spec', 'axe', 'controlled-uncontrolled', 'data-scenarios']
    const owed = matrix.rows
      .filter(row => ['DzCascader', 'DzTransfer'].includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => kinds.includes(cell.kind) || (row.component === 'DzCascader' && cell.kind === 'keyboard-spec'))
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(9)
    expect(owed.filter(cell => cell.state === 'unrun').map(cell => `${cell.component}:${cell.kind}`)).toEqual([])
    const cascader = matrix.rows.find(row => row.component === 'DzCascader')!
    expect(cascader.cells.find(cell => cell.kind === 'portal-hydration')?.state).toBe('unrun')
    expect(cascader.cells.find(cell => cell.kind === 'at-manual')?.state).toBe('unrun')
  })
})
