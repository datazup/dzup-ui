/**
 * useDataGrid — Composable managing data grid state (sorting, pagination, selection).
 *
 * Encapsulates the core logic for the DzDataGrid compound component.
 * Phase 1 scope: sorting, pagination, row selection.
 *
 * @module @dzup-ui/core/composables/useDataGrid
 */

import type { MaybeRef, Ref } from 'vue'
import type {
  ColumnDef,
  PaginationConfig,
  SortDirection,
  SortModel,
} from '../../components/data/DzDataGrid.types.ts'
import { computed, ref, toRef, toValue } from 'vue'

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
  /** Selection mode */
  selectable?: MaybeRef<boolean | 'single' | 'multiple'>
  /** Initially selected rows */
  selectedRows?: MaybeRef<T[]>
  /** Key field for row identity */
  rowKey?: keyof T & string
  /** Callback when sort changes */
  onSortChange?: (sortModel: SortModel[]) => void
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
  const selectableMode = toRef(() => toValue(options.selectable) ?? false)
  const paginationConfig = toRef(() => toValue(options.pagination) ?? false)
  const rowKey = options.rowKey

  // ── Sort state ──
  const sortModel = ref<SortModel[]>(toValue(options.sortModel) ?? []) as Ref<SortModel[]>

  // ── Pagination state ──
  const currentPage = ref(1)
  const pageSize = ref<number>(
    typeof toValue(options.pagination) === 'object'
      ? (toValue(options.pagination) as PaginationConfig).pageSize
      : 10,
  )

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

  // ── Sorted data ──
  const sortedData = computed<T[]>(() => {
    const raw = data.value
    if (!sortable.value || sortModel.value.length === 0)
      return raw

    const sorted = [...raw]
    const sorts = sortModel.value

    sorted.sort((a, b) => {
      for (const sort of sorts) {
        const field = sort.field as keyof T
        const aVal = a[field]
        const bVal = b[field]
        const dir = sort.direction === 'asc' ? 1 : -1

        if (aVal < bVal)
          return -1 * dir
        if (aVal > bVal)
          return 1 * dir
      }
      return 0
    })

    return sorted
  })

  // ── Total rows ──
  const totalRows = computed(() => sortedData.value.length)

  // ── Total pages ──
  const totalPages = computed(() => {
    if (!paginationConfig.value)
      return 1
    return Math.max(1, Math.ceil(totalRows.value / pageSize.value))
  })

  // ── Display data (sorted + paginated) ──
  const displayData = computed<T[]>(() => {
    const sorted = sortedData.value
    if (!paginationConfig.value)
      return sorted

    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sorted.slice(start, end)
  })

  // ── Selection computed ──
  const isAllSelected = computed(() => {
    if (!selectableMode.value || displayData.value.length === 0)
      return false
    return displayData.value.every(row =>
      selectedRows.value.some(sel => rowsEqual(sel, row)),
    )
  })

  const isSomeSelected = computed(() => {
    if (!selectableMode.value || displayData.value.length === 0)
      return false
    const someSelected = displayData.value.some(row =>
      selectedRows.value.some(sel => rowsEqual(sel, row)),
    )
    return someSelected && !isAllSelected.value
  })

  // ── Sort action ──
  function sort(field: string): void {
    if (!sortable.value)
      return

    const col = columns.value.find(c => c.field === field)
    if (col && col.sortable === false)
      return

    const existing = sortModel.value.find(s => s.field === field)

    let newModel: SortModel[]
    if (!existing) {
      newModel = [{ field, direction: 'asc' }]
    }
    else if (existing.direction === 'asc') {
      newModel = [{ field, direction: 'desc' }]
    }
    else {
      newModel = []
    }

    sortModel.value = newModel
    options.onSortChange?.(newModel)
  }

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
      selectedRows.value = [...displayData.value]
    }

    options.onSelectionChange?.(selectedRows.value)
  }

  // ── Pagination actions ──
  function goToPage(page: number): void {
    const clamped = Math.max(1, Math.min(page, totalPages.value))
    currentPage.value = clamped
    options.onPageChange?.(clamped)
  }

  function changePageSize(size: number): void {
    pageSize.value = size
    currentPage.value = 1
    options.onPageSizeChange?.(size)
  }

  function getSortDirection(field: string): SortDirection | undefined {
    return sortModel.value.find(s => s.field === field)?.direction
  }

  return {
    displayData,
    totalRows,
    sortModel,
    currentPage,
    pageSize,
    totalPages,
    selectedRows,
    isAllSelected,
    isSomeSelected,
    sort,
    toggleRowSelection,
    toggleAllSelection,
    isRowSelected,
    goToPage,
    changePageSize,
    getSortDirection,
  }
}
