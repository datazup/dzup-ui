import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R11-02-20261006-R1 (GAP5-ui-dzup-ui-02 slice): the unit specs of
// six Tier C components dispatch every key their anatomy declares. DzTimePicker
// was admitted with them and is held back: its option-activation row says the
// list closes and the component leaves it open (finding F4), so that key stays
// unasserted and the cell stays unrun until the owner settles which is right.
const COMPONENTS = ['DzCalendar', 'DzDataView', 'DzMegaMenu', 'DzSidebar', 'DzTable', 'DzTour']

describe('gap5-02 r11 keyboard-spec repayment', () => {
  it('credits the six keyboard-spec cells without waiving their other debt', () => {
    const matrix = buildCapabilityMatrix()
    const owed = matrix.rows
      .filter(row => COMPONENTS.includes(row.component))
      .flatMap(row => row.cells
        .filter(cell => cell.kind === 'keyboard-spec')
        .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(6)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => `${cell.component}:${cell.note}`)).toEqual([])
  })

  it('leaves DzTimePicker unrun on the one key whose declared action it does not perform', () => {
    const cell = buildCapabilityMatrix().rows.find(row => row.component === 'DzTimePicker')?.cells.find(candidate => candidate.kind === 'keyboard-spec')
    expect(cell?.state).toBe('unrun')
    expect(cell?.note).toContain('asserts no key event for `Enter`.')
  })
})
