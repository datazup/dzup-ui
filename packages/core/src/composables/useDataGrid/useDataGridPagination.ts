/**
 * useDataGridPagination — Pagination logic extracted from useDataGrid.
 *
 * Handles page state, page size, and slicing of sorted data for display.
 *
 * @module @dzip-ui/core/composables/useDataGrid
 */

import type { ComputedRef, Ref } from 'vue'
import type { PaginationConfig } from '../../components/data/DzDataGrid.types.ts'
import { computed, ref } from 'vue'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useDataGridPagination composable */
export interface UseDataGridPaginationOptions<T> {
  /** Sorted (pre-pagination) data */
  sortedData: ComputedRef<T[]>
  /** Pagination configuration (false = disabled) */
  paginationConfig: Readonly<Ref<boolean | PaginationConfig>>
  /** Initial page size override */
  initialPageSize?: number
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return value of the useDataGridPagination composable */
export interface UseDataGridPaginationReturn<T> {
  /** Paginated data for current view */
  displayData: ComputedRef<T[]>
  /** Total number of rows (before pagination) */
  totalRows: ComputedRef<number>
  /** Current page (1-based) */
  currentPage: Ref<number>
  /** Current page size */
  pageSize: Ref<number>
  /** Total number of pages */
  totalPages: ComputedRef<number>
  /** Go to a specific page */
  goToPage: (page: number) => void
  /** Change page size */
  changePageSize: (size: number) => void
  /** Reset page to 1 (used by sort/filter changes) */
  resetPage: () => void
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Manages pagination state and data slicing for the data grid.
 *
 * @typeParam T - Row data type
 */
export function useDataGridPagination<T>(
  options: UseDataGridPaginationOptions<T>,
): UseDataGridPaginationReturn<T> {
  const currentPage = ref(1)

  const defaultPageSize = (() => {
    if (options.initialPageSize !== undefined)
      return options.initialPageSize
    const config = options.paginationConfig.value
    if (typeof config === 'object')
      return config.pageSize
    return 10
  })()

  const pageSize = ref<number>(defaultPageSize)

  // ── Total rows ──
  const totalRows = computed(() => options.sortedData.value.length)

  // ── Total pages ──
  const totalPages = computed(() => {
    if (!options.paginationConfig.value)
      return 1
    return Math.max(1, Math.ceil(totalRows.value / pageSize.value))
  })

  // ── Display data (sorted + paginated) ──
  const displayData = computed<T[]>(() => {
    const sorted = options.sortedData.value
    if (!options.paginationConfig.value)
      return sorted

    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return sorted.slice(start, end)
  })

  // ── Actions ──
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

  function resetPage(): void {
    currentPage.value = 1
  }

  return {
    displayData,
    totalRows,
    currentPage,
    pageSize,
    totalPages,
    goToPage,
    changePageSize,
    resetPage,
  }
}
