import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R8-01-20261006-R1 (GAP5-ui-dzup-ui-02 slice): the contract specs of
// six Tier C components touch every Contract Spec v1 surface they declare.
const COMPONENTS = ['DzDataGrid', 'DzDataView', 'DzMention', 'DzOrderList', 'DzPersonaSelector', 'DzTree']

describe('gap5-02 r8 contract-spec surface repayment', () => {
  it('credits the six contract-spec cells without waiving their other debt', () => {
    const matrix = buildCapabilityMatrix()
    const owed = matrix.rows
      .filter(row => COMPONENTS.includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => cell.kind === 'contract-spec')
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(6)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => `${cell.component}:${cell.note}`)).toEqual([])
    const mention = matrix.rows.find(row => row.component === 'DzMention')!
    expect(mention.cells.find(cell => cell.kind === 'axe')?.state).toBe('unrun')
  })
})
