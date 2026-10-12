import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

const COMPONENTS = ['DzCalendar', 'DzColorPicker', 'DzCombobox', 'DzCommandPalette', 'DzDataGrid', 'DzDataView', 'DzDatePicker', 'DzDateRangePicker', 'DzMultiSelect', 'DzPersonaSelector', 'DzSidebar', 'DzTimePicker', 'DzTour', 'DzTreeSelect']

describe('dzup-ui-r11-03 controlled and uncontrolled evidence', () => {
  it('credits executable value ownership paths for fourteen required components', () => {
    const owed = buildCapabilityMatrix().rows.filter(row => COMPONENTS.includes(row.component)).flatMap(row => row.cells.filter(cell => cell.kind === 'controlled-uncontrolled')
      .map(cell => ({ component: row.component, ...cell })))
    expect(owed).toHaveLength(14)
    expect(owed.filter(cell => cell.state !== 'present').map(cell => `${cell.component}:${cell.note}`)).toEqual([])
  })

  it('does not promote legacy-only reset specs without a controlled update listener', () => {
    const legacy = ['DzInplace', 'DzKnob', 'DzRating', 'DzTagsInput']
    const cells = buildCapabilityMatrix().rows.filter(row => legacy.includes(row.component)).flatMap(row => row.cells.filter(cell => cell.kind === 'controlled-uncontrolled'))
    expect(cells).toHaveLength(4)
    expect(cells.map(cell => cell.state)).toEqual(['unrun', 'unrun', 'unrun', 'unrun'])
  })
})
