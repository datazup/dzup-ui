import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R11-02-20261006-R1 (GAP5-ui-dzup-ui-02 slice): each of the eight
// Tier C components with no dataset story gets one, and its play function
// asserts the state the story is named for.
const COMPONENTS = [
  'DzCommandPalette',
  'DzMegaMenu',
  'DzMention',
  'DzMultiSelect',
  'DzOrderList',
  'DzSidebar',
  'DzTour',
  'DzTreeSelect',
]

describe('gap5-02 r11 data-scenarios repayment', () => {
  it('credits the eight data-scenarios cells without waiving their other debt', () => {
    const matrix = buildCapabilityMatrix()
    const owed = matrix.rows
      .filter(row => COMPONENTS.includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => cell.kind === 'data-scenarios')
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(8)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => cell.component)).toEqual([])
    const required = matrix.rows
      .filter(row => row.tier === 'C' || row.tier === 'D')
      .flatMap(row => row.cells.filter(cell => cell.kind === 'data-scenarios' && cell.state === 'unrun'))
    expect(required).toEqual([])
  })
})
