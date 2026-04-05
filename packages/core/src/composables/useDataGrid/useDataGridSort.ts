/**
 * useDataGridSort — Sorting logic extracted from useDataGrid.
 *
 * Handles multi-column sorting with direction cycling (asc → desc → none).
 *
 * @module @dzip-ui/core/composables/useDataGrid
 */

import type { ComputedRef, Ref } from 'vue'
import type {
  ColumnDef,
  DzDataGridFilter,
  FilterOperator,
  SortDirection,
  SortModel,
} from '../../components/data/DzDataGrid.types.ts'
import { computed, ref } from 'vue'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useDataGridSort composable */
export interface UseDataGridSortOptions<T> {
  /** Raw data rows */
  data: Readonly<Ref<T[]>>
  /** Column definitions */
  columns: Readonly<Ref<ColumnDef<T>[]>>
  /** Whether sorting is enabled */
  sortable: Readonly<Ref<boolean>>
  /** Whether filtering is enabled */
  filterable: Readonly<Ref<boolean>>
  /** Initial sort model */
  initialSortModel?: SortModel[]
  /** Initial filter state */
  initialFilters?: DzDataGridFilter[]
  /** Callback when sort changes */
  onSortChange?: (sortModel: SortModel[]) => void
  /** Callback when filter changes */
  onFilterChange?: (filters: DzDataGridFilter[]) => void
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return value of the useDataGridSort composable */
export interface UseDataGridSortReturn<T> {
  /** Current sort model */
  sortModel: Ref<SortModel[]>
  /** Current filter state */
  filters: Ref<DzDataGridFilter[]>
  /** Sorted and filtered data (before pagination) */
  sortedData: ComputedRef<T[]>
  /** Sort by a column field */
  sort: (field: string) => void
  /** Set a filter on a column */
  setFilter: (column: string, filter: DzDataGridFilter) => void
  /** Clear a filter on a column */
  clearFilter: (column: string) => void
  /** Clear all filters */
  clearAllFilters: () => void
  /** Get sort direction for a column */
  getSortDirection: (field: string) => SortDirection | undefined
  /** Reset current page (called by filter changes -- set via ref) */
  resetPageRef: Ref<(() => void) | undefined> | undefined
}

// ---------------------------------------------------------------------------
// Filter helpers
// ---------------------------------------------------------------------------

/** Evaluate whether a cell value matches a filter condition */
function applyFilter(cellValue: unknown, filter: DzDataGridFilter): boolean {
  if (filter.value === '' || filter.value === undefined)
    return true

  const operators: Record<FilterOperator, (cell: unknown, val: string | number) => boolean> = {
    contains: (cell, val) => {
      const strCell = String(cell ?? '').toLowerCase()
      const strFilter = String(val).toLowerCase()
      return strCell.includes(strFilter)
    },
    equals: (cell, val) => {
      if (typeof val === 'number')
        return Number(cell) === val
      return String(cell ?? '').toLowerCase() === String(val).toLowerCase()
    },
    gt: (cell, val) => Number(cell) > Number(val),
    lt: (cell, val) => Number(cell) < Number(val),
    gte: (cell, val) => Number(cell) >= Number(val),
    lte: (cell, val) => Number(cell) <= Number(val),
  }

  const evaluator = operators[filter.operator]
  return evaluator ? evaluator(cellValue, filter.value) : true
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Manages sorting and filtering logic for the data grid.
 *
 * @typeParam T - Row data type
 */
export function useDataGridSort<T>(
  options: UseDataGridSortOptions<T>,
  resetPageRef?: Ref<(() => void) | undefined>,
): UseDataGridSortReturn<T> {
  const sortModel = ref<SortModel[]>(options.initialSortModel ?? []) as Ref<SortModel[]>
  const filters = ref<DzDataGridFilter[]>(options.initialFilters ?? []) as Ref<DzDataGridFilter[]>

  // ── Filtered data (applied before sorting) ──
  const filteredData = computed<T[]>(() => {
    const raw = options.data.value
    if (!options.filterable.value || filters.value.length === 0)
      return raw

    return raw.filter((row) => {
      return filters.value.every((filter) => {
        const cellValue = row[filter.column as keyof T]
        return applyFilter(cellValue, filter)
      })
    })
  })

  // ── Sorted data ──
  const sortedData = computed<T[]>(() => {
    const raw = filteredData.value
    if (!options.sortable.value || sortModel.value.length === 0)
      return raw

    const sorted = [...raw]
    const sorts = sortModel.value

    sorted.sort((a, b) => {
      for (const sortEntry of sorts) {
        const field = sortEntry.field as keyof T
        const aVal = a[field]
        const bVal = b[field]
        const dir = sortEntry.direction === 'asc' ? 1 : -1

        if (aVal < bVal)
          return -1 * dir
        if (aVal > bVal)
          return 1 * dir
      }
      return 0
    })

    return sorted
  })

  // ── Sort action ──
  function sort(field: string): void {
    if (!options.sortable.value)
      return

    const col = options.columns.value.find(c => c.field === field)
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

  // ── Filter actions ──
  function setFilter(column: string, filter: DzDataGridFilter): void {
    if (!options.filterable.value)
      return

    const existing = filters.value.findIndex(f => f.column === column)
    if (existing >= 0) {
      const updated = [...filters.value]
      updated[existing] = filter
      filters.value = updated
    }
    else {
      filters.value = [...filters.value, filter]
    }
    resetPageRef?.value?.()
    options.onFilterChange?.(filters.value)
  }

  function clearFilter(column: string): void {
    filters.value = filters.value.filter(f => f.column !== column)
    resetPageRef?.value?.()
    options.onFilterChange?.(filters.value)
  }

  function clearAllFilters(): void {
    filters.value = []
    resetPageRef?.value?.()
    options.onFilterChange?.(filters.value)
  }

  function getSortDirection(field: string): SortDirection | undefined {
    return sortModel.value.find(s => s.field === field)?.direction
  }

  return {
    sortModel,
    filters,
    sortedData,
    sort,
    setFilter,
    clearFilter,
    clearAllFilters,
    getSortDirection,
    resetPageRef,
  }
}
