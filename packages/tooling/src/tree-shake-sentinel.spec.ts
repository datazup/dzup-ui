/**
 * Specs for the tree-shake sentinel matcher.
 *
 * The regression these pin: `validate:tree-shake` used
 * `bundleContent.includes(sentinel)`, so the i18n catalog's message-group keys
 * `DzDataGridHeader` / `DzDataGridPagination` made every single-component
 * bundle look as if `DzDataGrid` had leaked into it. The gate therefore failed
 * on a bundle that was tree-shaken correctly, and — worse — could no longer
 * tell that case apart from a real leak.
 */

import { describe, expect, it } from 'vitest'

import { sentinelPresent } from './tree-shake-sentinel.ts'

describe('sentinelPresent', () => {
  describe('the false positive that broke the gate', () => {
    it('does not fire on a longer identifier that starts with the sentinel', () => {
      expect(sentinelPresent('const k="DzDataGridHeader"', 'DzDataGrid')).toBe(false)
      expect(sentinelPresent('const k="DzDataGridPagination"', 'DzDataGrid')).toBe(false)
    })

    it('does not fire on the real catalog shape that shipped in every bundle', () => {
      // The literal shape from packages/core/src/i18n/messages.ts.
      const catalog = 'DzDataGridHeader:{selectAllRows:"Select all rows"},'
        + 'DzDataGridPagination:{rowsPerPage:"Rows per page"}'
      expect(sentinelPresent(catalog, 'DzDataGrid')).toBe(false)
    })

    it('does not fire on a longer identifier that ends with the sentinel', () => {
      expect(sentinelPresent('const MyDzDataGrid=1', 'DzDataGrid')).toBe(false)
    })
  })

  describe('a real leak is still caught', () => {
    it('fires on the bare identifier', () => {
      expect(sentinelPresent('import{DzDataGrid}from"./x.js"', 'DzDataGrid')).toBe(true)
    })

    it('fires on a quoted occurrence', () => {
      expect(sentinelPresent('name:"DzDataGrid"', 'DzDataGrid')).toBe(true)
    })

    it('fires on a member access', () => {
      expect(sentinelPresent('lib.DzDataGrid.render()', 'DzDataGrid')).toBe(true)
    })

    it('fires at the very start and the very end of a bundle', () => {
      expect(sentinelPresent('DzDataGrid', 'DzDataGrid')).toBe(true)
      expect(sentinelPresent('x=DzDataGrid', 'DzDataGrid')).toBe(true)
      expect(sentinelPresent('DzDataGrid=x', 'DzDataGrid')).toBe(true)
    })

    it('finds a real occurrence that follows a false one', () => {
      // The scan must not stop at the first substring hit.
      expect(sentinelPresent('DzDataGridHeader;DzDataGrid', 'DzDataGrid')).toBe(true)
    })
  })

  describe('absence', () => {
    it('is false when the sentinel does not occur at all', () => {
      expect(sentinelPresent('import{DzButton}from"./x.js"', 'DzDataGrid')).toBe(false)
    })

    it('is false for an empty bundle', () => {
      expect(sentinelPresent('', 'DzDataGrid')).toBe(false)
    })
  })

  describe('the other two sentinels behave the same way', () => {
    it.each([
      ['DzGantt', 'DzGanttRow'],
      ['DzKanban', 'DzKanbanColumn'],
    ])('%s does not fire on %s', (sentinel, longer) => {
      expect(sentinelPresent(`x="${longer}"`, sentinel)).toBe(false)
      expect(sentinelPresent(`x="${sentinel}"`, sentinel)).toBe(true)
    })
  })
})
