import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R11-01-20261006-R1 (GAP5-ui-dzup-ui-02 slice): a running axe test
// mounts each of the thirteen Tier C components that had none.
const COMPONENTS = [
  'DzCalendar',
  'DzColorPicker',
  'DzCommandPalette',
  'DzDataGrid',
  'DzDataView',
  'DzDateRangePicker',
  'DzMention',
  'DzOrderList',
  'DzPersonaSelector',
  'DzSidebar',
  'DzTimePicker',
  'DzTour',
  'DzTreeSelect',
]

describe('gap5-02 r11 axe repayment', () => {
  it('credits the thirteen axe cells without waiving their other debt', () => {
    const matrix = buildCapabilityMatrix()
    const owed = matrix.rows
      .filter(row => COMPONENTS.includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => cell.kind === 'axe')
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(13)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => `${cell.component}:${cell.note}`)).toEqual([])
    const required = matrix.rows
      .filter(row => row.tier === 'C' || row.tier === 'D')
      .flatMap(row => row.cells.filter(cell => cell.kind === 'axe' && cell.state === 'unrun'))
    expect(required).toEqual([])
  })
})
