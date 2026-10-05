import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R6-01-20261006-R1 (GAP5-ui-dzup-ui-02 slice): Tree, Mention and
// OrderList specs exercise every declared key and both model ownership paths.
describe('gap5-02 r6 keyboard and model-ownership repayment', () => {
  it('credits the six exercised cells without waiving their other debt', () => {
    const matrix = buildCapabilityMatrix()
    const owed = matrix.rows
      .filter(row => ['DzTree', 'DzMention', 'DzOrderList'].includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => cell.kind === 'keyboard-spec' || cell.kind === 'controlled-uncontrolled')
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(6)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => `${cell.component}:${cell.kind}`)).toEqual([])
    const mention = matrix.rows.find(row => row.component === 'DzMention')!
    expect(mention.cells.find(cell => cell.kind === 'at-manual')?.state).toBe('unrun')
  })
})
