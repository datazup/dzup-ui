/**
 * useDataGrid — Composable managing data grid state (sorting, pagination, selection).
 *
 * Orchestrates useDataGridSort and useDataGridPagination, adding row selection.
 * Phase 1 scope: sorting, pagination, row selection.
 *
 * @module @dzip-ui/core/composables/useDataGrid
 */

import type { MaybeRef, Ref } from 'vue'
import type {
  ColumnDef,
  DzDataGridFilter,
  PaginationConfig,
  SortDirection,
  SortModel,
} from '../../components/data/DzDataGrid.types.ts'
import { computed, ref, toRef, toValue } from 'vue'
import { useDataGridPagination } from './useDataGridPagination.ts'
import { useDataGridSort } from './useDataGridSort.ts'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useDataGrid composable */
export interface UseDataGridOptions<T> {
  /** Data rows */
  data: MaybeRef<T[]>
  /** Column definitions */
  columns: MaybeRef<ColumnDef<T>[]>
  /** Whether sorting is enabled */
  sortable?: MaybeRef<boolean>
  /** Initial sort model */
  sortModel?: MaybeRef<SortModel[]>
  /** Pagination configuration */
  pagination?: MaybeRef<boolean | PaginationConfig>
  /** Whether filtering is enabled */
  filterable?: MaybeRef<boolean>
  /** Initial filter state */
  filters?: MaybeRef<DzDataGridFilter[]>
  /** Selection mode */
  selectable?: MaybeRef<boolean | 'single' | 'multiple'>
  /** Initially selected rows */
  selectedRows?: MaybeRef<T[]>
  /** Key field for row identity */
  rowKey?: keyof T & string
  /** Callback when sort changes */
  onSortChange?: (sortModel: SortModel[]) => void
  /** Callback when filter changes */
  onFilterChange?: (filters: DzDataGridFilter[]) => void
  /** Callback when selection changes */
  onSelectionChange?: (rows: T[]) => void
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return value of the useDataGrid composable */
export interface UseDataGridReturn<T> {
  /** Sorted and paginated data for current view */
  displayData: Ref<T[]>
  /** Total number of rows (before pagination) */
  totalRows: Ref<number>
  /** Current sort model */
  sortModel: Ref<SortModel[]>
  /** Current filter state */
  filters: Ref<DzDataGridFilter[]>
  /** Current page (1-based) */
  currentPage: Ref<number>
  /** Current page size */
  pageSize: Ref<number>
  /** Total number of pages */
  totalPages: Ref<number>
  /** Currently selected rows */
  selectedRows: Ref<T[]>
  /** Whether all current rows are selected */
  isAllSelected: Ref<boolean>
  /** Whether some (but not all) current rows are selected */
  isSomeSelected: Ref<boolean>
  /** Sort by a column field */
  sort: (field: string) => void
  /** Set a filter on a column */
  setFilter: (column: string, filter: DzDataGridFilter) => void
  /** Clear a filter on a column */
  clearFilter: (column: string) => void
  /** Clear all filters */
  clearAllFilters: () => void
  /** Toggle selection on a row */
  toggleRowSelection: (row: T) => void
  /** Toggle all rows selection */
  toggleAllSelection: () => void
  /** Check if a specific row is selected */
  isRowSelected: (row: T) => boolean
  /** Go to a specific page */
  goToPage: (page: number) => void
  /** Change page size */
  changePageSize: (size: number) => void
  /** Get sort direction for a column */
  getSortDirection: (field: string) => SortDirection | undefined
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Manages data grid state including sorting, pagination, and row selection.
 *
 * @typeParam T - Row data type
 */
export function useDataGrid<T>(options: UseDataGridOptions<T>): UseDataGridReturn<T> {
  const data = toRef(() => toValue(options.data))
  const columns = toRef(() => toValue(options.columns))
  const sortable = toRef(() => toValue(options.sortable) ?? false)
  const filterableMode = toRef(() => toValue(options.filterable) ?? false)
  const selectableMode = toRef(() => toValue(options.selectable) ?? false)
  const paginationConfig = toRef(() => toValue(options.pagination) ?? false)
  const rowKey = options.rowKey

  // ── Pagination (created first so resetPage is available) ──
  const initialPageSize = typeof toValue(options.pagination) === 'object'
    ? (toValue(options.pagination) as PaginationConfig).pageSize
    : undefined

  // Shared ref for resetPage callback (set after pagination is created)
  const resetPageRef = ref<(() => void) | undefined>(undefined)

  // ── Sort + Filter ──
  const sortResult = useDataGridSort<T>(
    {
      data,
      columns,
      sortable,
      filterable: filterableMode,
      initialSortModel: toValue(options.sortModel) ?? undefined,
      initialFilters: toValue(options.filters) ?? undefined,
      onSortChange: options.onSortChange,
      onFilterChange: options.onFilterChange,
    },
    resetPageRef,
  )

  // ── Pagination ──
  const paginationResult = useDataGridPagination<T>({
    sortedData: sortResult.sortedData,
    paginationConfig,
    initialPageSize,
    onPageChange: options.onPageChange,
    onPageSizeChange: options.onPageSizeChange,
  })

  // Wire resetPage into sort/filter operations
  resetPageRef.value = paginationResult.resetPage

  // ── Selection state ──
  const selectedRows = ref<T[]>(toValue(options.selectedRows) ?? []) as Ref<T[]>

  // ── Row identity ──
  function getRowId(row: T): unknown {
    if (rowKey)
      return row[rowKey]
    return row
  }

  function rowsEqual(a: T, b: T): boolean {
    return getRowId(a) === getRowId(b)
  }

  // ── Selection computed ──
  const isAllSelected = computed(() => {
    if (!selectableMode.value || paginationResult.displayData.value.length === 0)
      return false
    return paginationResult.displayData.value.every(row =>
      selectedRows.value.some(sel => rowsEqual(sel, row)),
    )
  })

  const isSomeSelected = computed(() => {
    if (!selectableMode.value || paginationResult.displayData.value.length === 0)
      return false
    const someSelected = paginationResult.displayData.value.some(row =>
      selectedRows.value.some(sel => rowsEqual(sel, row)),
    )
    return someSelected && !isAllSelected.value
  })

  // ── Selection actions ──
  function isRowSelected(row: T): boolean {
    return selectedRows.value.some(sel => rowsEqual(sel, row))
  }

  function toggleRowSelection(row: T): void {
    if (!selectableMode.value)
      return

    const mode = selectableMode.value
    const alreadySelected = isRowSelected(row)

    if (mode === 'single' || mode === true) {
      selectedRows.value = alreadySelected ? [] : [row]
    }
    else if (mode === 'multiple') {
      if (alreadySelected) {
        selectedRows.value = selectedRows.value.filter(sel => !rowsEqual(sel, row))
      }
      else {
        selectedRows.value = [...selectedRows.value, row]
      }
    }

    options.onSelectionChange?.(selectedRows.value)
  }

  function toggleAllSelection(): void {
    if (!selectableMode.value || selectableMode.value === 'single')
      return

    if (isAllSelected.value) {
      selectedRows.value = []
    }
    else {
      selectedRows.value = [...paginationResult.displayData.value]
    }

    options.onSelectionChange?.(selectedRows.value)
  }

  return {
    displayData: paginationResult.displayData,
    totalRows: paginationResult.totalRows,
    sortModel: sortResult.sortModel,
    filters: sortResult.filters,
    currentPage: paginationResult.currentPage,
    pageSize: paginationResult.pageSize,
    totalPages: paginationResult.totalPages,
    selectedRows,
    isAllSelected,
    isSomeSelected,
    sort: sortResult.sort,
    setFilter: sortResult.setFilter,
    clearFilter: sortResult.clearFilter,
    clearAllFilters: sortResult.clearAllFilters,
    toggleRowSelection,
    toggleAllSelection,
    isRowSelected,
    goToPage: paginationResult.goToPage,
    changePageSize: paginationResult.changePageSize,
    getSortDirection: sortResult.getSortDirection,
  }
}
