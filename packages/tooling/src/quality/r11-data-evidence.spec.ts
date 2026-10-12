import { describe, expect, it } from 'vitest'
import { buildCapabilityMatrix } from './generate-capability-matrix.ts'

// DZUP-UI-R11-07-20261007-C1: red-first join against real Storybook data scenarios.
describe('r11 data scenario evidence', () => {
  it('earns the eight admitted data scenarios', () => {
    const matrix = buildCapabilityMatrix()
    for (const component of ['DzCommandPalette', 'DzMegaMenu', 'DzMention', 'DzMultiSelect', 'DzOrderList', 'DzSidebar', 'DzTour', 'DzTreeSelect']) {
      const cell = matrix.rows.find(row => row.component === component)?.cells.find(cell => cell.kind === 'data-scenarios')
      expect(cell?.state, component).toBe('present')
    }
  })
})
