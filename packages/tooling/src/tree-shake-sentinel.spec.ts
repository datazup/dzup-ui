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

import { CATALOG_GROUP_KEYS, sentinelPresent } from './tree-shake-sentinel.ts'

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

    it('does not fire on the root DataGrid catalog group key', () => {
      // `DzDataGrid: { loading, empty }` from packages/core/src/i18n/messages.ts,
      // as the unminified library build prints it, and minified / quoted forms.
      const unminified = '  DzOrderList: { empty: "No items" },\n  DzDataGrid: { loading: "Loading data", empty: "No data available" },\n'
      expect(sentinelPresent(unminified, 'DzDataGrid')).toBe(false)
      expect(sentinelPresent('{DzDataGrid:{loading:"Loading data"}}', 'DzDataGrid')).toBe(false)
      expect(sentinelPresent('{"DzDataGrid": {"loading":"Loading data"}}', 'DzDataGrid')).toBe(false)
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

    it('fires on the compiled component definition next to a catalog key', () => {
      // A leaked SFC carries `__name: "DzDataGrid"`; the catalog key beside it
      // must not hide it.
      const leaked = '{ DzDataGrid: { loading: "Loading data" } };\nconst _sfc_main = { __name: "DzDataGrid", props: {} };'
      expect(sentinelPresent(leaked, 'DzDataGrid')).toBe(true)
      expect(sentinelPresent('const _sfc_main={__name:"DzDataGrid"}', 'DzDataGrid')).toBe(true)
    })

    it('excuses an object key only for a catalog group key', () => {
      // DzDataGrid is a catalog group; DzNotACatalogGroup is not, so a registry
      // that keys a leaked component by name still counts.
      expect(sentinelPresent('{DzDataGrid:{loading:"x"}}', 'DzDataGrid')).toBe(false)
      expect(sentinelPresent('{DzNotACatalogGroup:{loading:"x"}}', 'DzNotACatalogGroup')).toBe(true)
      expect(sentinelPresent('{DzDataGrid:{loading:"x"}}', 'DzDataGrid', new Set())).toBe(true)
    })

    it('reads the catalog group keys from the real catalog', () => {
      expect(CATALOG_GROUP_KEYS.has('DzDataGrid')).toBe(true)
      expect(CATALOG_GROUP_KEYS.has('DzDataGridHeader')).toBe(true)
      expect(CATALOG_GROUP_KEYS.has('DzButton')).toBe(false)
    })

    it('fires on a key-like use that is not an object key', () => {
      expect(sentinelPresent('x ? DzDataGrid : y', 'DzDataGrid')).toBe(true)
      expect(sentinelPresent('export { DzDataGrid }', 'DzDataGrid')).toBe(true)
      expect(sentinelPresent('export { DzDataGrid, DzButton }', 'DzDataGrid')).toBe(true)
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
