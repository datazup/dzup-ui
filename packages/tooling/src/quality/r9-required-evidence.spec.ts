import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R9-01-20261006-R1 (GAP5-ui-dzup-ui-02 slice): the contract specs of
// six Tier C form pickers touch the `slots` and `aria` surfaces they declare.
const COMPONENTS = ['DzColorPicker', 'DzCombobox', 'DzDatePicker', 'DzDateRangePicker', 'DzMultiSelect', 'DzTimePicker']

describe('gap5-02 r9 contract-spec surface repayment', () => {
  it('credits the six contract-spec cells without waiving their other debt', () => {
    const matrix = buildCapabilityMatrix()
    const owed = matrix.rows
      .filter(row => COMPONENTS.includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => cell.kind === 'contract-spec')
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(6)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => `${cell.component}:${cell.note}`)).toEqual([])
    const timePicker = matrix.rows.find(row => row.component === 'DzTimePicker')!
    expect(timePicker.cells.find(cell => cell.kind === 'axe')?.state).toBe('unrun')
  })
})
