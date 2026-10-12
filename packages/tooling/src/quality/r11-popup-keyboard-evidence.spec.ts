import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

describe('r11 popup keyboard evidence', () => {
  it('credits Combobox only after all declared keys have unit evidence', () => {
    const cell = buildCapabilityMatrix().rows.find(row => row.component === 'DzCombobox')?.cells.find(cell => cell.kind === 'keyboard-spec')
    expect(cell?.state).toBe('present')
  })
})

// DZUP-UI-R11-05B-20261006-C1: red-first admission probe; credit only passing contracts.
describe('r11 remaining popup evidence', () => {
  it('earns the admitted popup contracts', () => {
    const matrix = buildCapabilityMatrix()
    for (const component of ['DzCommandPalette', 'DzMultiSelect', 'DzTreeSelect']) {
      const cell = matrix.rows.find(row => row.component === component)?.cells.find(cell => cell.kind === 'keyboard-spec')
      expect(cell?.state, component).toBe('present')
    }
  })
})

describe('r11 held popup contracts', () => {
  it('does not credit the three reproduced contract mismatches', () => {
    const matrix = buildCapabilityMatrix()
    for (const component of ['DzDatePicker', 'DzDateRangePicker', 'DzPersonaSelector']) {
      expect(matrix.rows.find(row => row.component === component)?.cells.find(cell => cell.kind === 'keyboard-spec')?.state, component).toBe('unrun')
    }
  })
})
