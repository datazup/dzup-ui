import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R10-03-20261006-R1 (GAP5-ui-dzup-ui-02 slice): the contract specs of
// the last seven required Tier C/D components touch the surfaces they declare.
const COMPONENTS = ['DzCalendar', 'DzCommandPalette', 'DzFileUpload', 'DzMegaMenu', 'DzSidebar', 'DzTour', 'DzTreeSelect']

describe('gap5-02 r10 contract-spec surface repayment', () => {
  it('credits the seven contract-spec cells without waiving their other debt', () => {
    const matrix = buildCapabilityMatrix()
    const owed = matrix.rows
      .filter(row => COMPONENTS.includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => cell.kind === 'contract-spec')
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(7)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => `${cell.component}:${cell.note}`)).toEqual([])
    const required = matrix.rows
      .filter(row => row.tier === 'C' || row.tier === 'D')
      .flatMap(row => row.cells.filter(cell => cell.kind === 'contract-spec' && cell.state === 'unrun'))
    expect(required).toEqual([])
  })
})
