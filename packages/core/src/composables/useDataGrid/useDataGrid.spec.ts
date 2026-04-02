import type { ColumnDef } from '../../components/data/DzDataGrid.types.ts'
/**
 * useDataGrid — Unit tests.
 */
import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useDataGrid } from './useDataGrid.ts'

interface TestRow extends Record<string, unknown> {
  id: number
  name: string
  age: number
}

const testColumns: ColumnDef<TestRow>[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'age', header: 'Age', sortable: true },
]

const testData: TestRow[] = [
  { id: 1, name: 'Charlie', age: 35 },
  { id: 2, name: 'Alice', age: 30 },
  { id: 3, name: 'Bob', age: 25 },
  { id: 4, name: 'Diana', age: 28 },
  { id: 5, name: 'Eve', age: 32 },
]

describe('useDataGrid — Display data', () => {
  it('returns all data when no sorting/pagination', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
    })
    expect(grid.displayData.value).toHaveLength(5)
  })

  it('returns reactive data', async () => {
    const data = ref([...testData])
    const grid = useDataGrid({
      data,
      columns: testColumns,
    })
    expect(grid.displayData.value).toHaveLength(5)

    data.value = data.value.slice(0, 2)
    await nextTick()
    expect(grid.displayData.value).toHaveLength(2)
  })
})

describe('useDataGrid — Sorting', () => {
  it('sorts ascending on first click', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      sortable: true,
    })

    grid.sort('name')
    expect(grid.sortModel.value).toEqual([{ field: 'name', direction: 'asc' }])
    expect(grid.displayData.value[0]!.name).toBe('Alice')
  })

  it('sorts descending on second click', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      sortable: true,
    })

    grid.sort('name')
    grid.sort('name')
    expect(grid.sortModel.value).toEqual([{ field: 'name', direction: 'desc' }])
    expect(grid.displayData.value[0]!.name).toBe('Eve')
  })

  it('clears sort on third click', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      sortable: true,
    })

    grid.sort('name')
    grid.sort('name')
    grid.sort('name')
    expect(grid.sortModel.value).toEqual([])
  })

  it('does nothing when sortable is false', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      sortable: false,
    })

    grid.sort('name')
    expect(grid.sortModel.value).toEqual([])
  })

  it('calls onSortChange callback', () => {
    const onSortChange = vi.fn()
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      sortable: true,
      onSortChange,
    })

    grid.sort('name')
    expect(onSortChange).toHaveBeenCalledWith([{ field: 'name', direction: 'asc' }])
  })

  it('getSortDirection returns correct value', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      sortable: true,
    })

    expect(grid.getSortDirection('name')).toBeUndefined()
    grid.sort('name')
    expect(grid.getSortDirection('name')).toBe('asc')
  })
})

describe('useDataGrid — Pagination', () => {
  it('paginates data with pageSize', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      pagination: { pageSize: 2 },
    })

    expect(grid.displayData.value).toHaveLength(2)
    expect(grid.totalRows.value).toBe(5)
    expect(grid.totalPages.value).toBe(3)
    expect(grid.currentPage.value).toBe(1)
  })

  it('navigates to next page', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      pagination: { pageSize: 2 },
    })

    grid.goToPage(2)
    expect(grid.currentPage.value).toBe(2)
    expect(grid.displayData.value).toHaveLength(2)
  })

  it('clamps page to valid range', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      pagination: { pageSize: 2 },
    })

    grid.goToPage(100)
    expect(grid.currentPage.value).toBe(3) // max page

    grid.goToPage(0)
    expect(grid.currentPage.value).toBe(1) // min page
  })

  it('resets to page 1 when changing page size', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      pagination: { pageSize: 2 },
    })

    grid.goToPage(2)
    grid.changePageSize(5)
    expect(grid.currentPage.value).toBe(1)
    expect(grid.pageSize.value).toBe(5)
  })

  it('calls onPageChange callback', () => {
    const onPageChange = vi.fn()
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      pagination: { pageSize: 2 },
      onPageChange,
    })

    grid.goToPage(2)
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('calls onPageSizeChange callback', () => {
    const onPageSizeChange = vi.fn()
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      pagination: { pageSize: 2 },
      onPageSizeChange,
    })

    grid.changePageSize(10)
    expect(onPageSizeChange).toHaveBeenCalledWith(10)
  })

  it('returns all data when pagination is false', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      pagination: false,
    })

    expect(grid.displayData.value).toHaveLength(5)
    expect(grid.totalPages.value).toBe(1)
  })
})

describe('useDataGrid — Selection (single)', () => {
  it('selects a row', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'single',
      rowKey: 'id',
    })

    grid.toggleRowSelection(testData[0]!)
    expect(grid.selectedRows.value).toHaveLength(1)
    expect(grid.isRowSelected(testData[0]!)).toBe(true)
  })

  it('deselects a row on second toggle', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'single',
      rowKey: 'id',
    })

    grid.toggleRowSelection(testData[0]!)
    grid.toggleRowSelection(testData[0]!)
    expect(grid.selectedRows.value).toHaveLength(0)
  })

  it('replaces selection when selecting another row in single mode', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'single',
      rowKey: 'id',
    })

    grid.toggleRowSelection(testData[0]!)
    grid.toggleRowSelection(testData[1]!)
    expect(grid.selectedRows.value).toHaveLength(1)
    expect(grid.isRowSelected(testData[1]!)).toBe(true)
    expect(grid.isRowSelected(testData[0]!)).toBe(false)
  })
})

describe('useDataGrid — Selection (multiple)', () => {
  it('selects multiple rows', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'multiple',
    })

    grid.toggleRowSelection(testData[0]!)
    grid.toggleRowSelection(testData[1]!)
    expect(grid.selectedRows.value).toHaveLength(2)
  })

  it('toggleAllSelection selects all display rows', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'multiple',
      rowKey: 'id',
    })

    grid.toggleAllSelection()
    expect(grid.selectedRows.value).toHaveLength(5)
    expect(grid.isAllSelected.value).toBe(true)
  })

  it('toggleAllSelection deselects all when all are selected', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'multiple',
      rowKey: 'id',
    })

    grid.toggleAllSelection()
    grid.toggleAllSelection()
    expect(grid.selectedRows.value).toHaveLength(0)
    expect(grid.isAllSelected.value).toBe(false)
  })

  it('isSomeSelected is true when partially selected', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'multiple',
      rowKey: 'id',
    })

    grid.toggleRowSelection(testData[0]!)
    expect(grid.isSomeSelected.value).toBe(true)
    expect(grid.isAllSelected.value).toBe(false)
  })

  it('calls onSelectionChange callback', () => {
    const onSelectionChange = vi.fn()
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'multiple',
      onSelectionChange,
    })

    grid.toggleRowSelection(testData[0]!)
    expect(onSelectionChange).toHaveBeenCalledWith([testData[0]])
  })

  it('does nothing when selectable is false', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: false,
    })

    grid.toggleRowSelection(testData[0]!)
    expect(grid.selectedRows.value).toHaveLength(0)
  })
})

describe('useDataGrid — Row key', () => {
  it('uses rowKey for identity comparison', () => {
    const grid = useDataGrid({
      data: testData,
      columns: testColumns,
      selectable: 'single',
      rowKey: 'id',
    })

    grid.toggleRowSelection(testData[0]!)
    // Create a new object with the same id
    const duplicate: TestRow = { ...testData[0]! }
    expect(grid.isRowSelected(duplicate)).toBe(true)
  })
})
