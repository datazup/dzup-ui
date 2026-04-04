/**
 * useDataGridHeader — Extracted header logic for DzDataGridHeader.
 *
 * Manages filter popover state, column alignment/styling helpers,
 * keyboard navigation, and filter input/operator handling.
 *
 * @module @dzup-ui/core/composables/useDataGridHeader
 */

import type { Ref } from 'vue'
import type {
  ColumnDef,
  DzDataGridContext,
  FilterOperator,
} from '../../components/data/DzDataGrid.types.ts'
import { ref } from 'vue'

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/** Options for the useDataGridHeader composable */
export interface UseDataGridHeaderOptions {
  /** Injected DzDataGrid context (ADR-08) */
  ctx: DzDataGridContext
}

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** Return value of the useDataGridHeader composable */
export interface UseDataGridHeaderReturn {
  /** Which column's filter popover is currently open (null = none) */
  openFilterField: Ref<string | null>
  /** Get text-alignment class for a column */
  getAlignClass: (align?: 'left' | 'center' | 'right') => string
  /** Get inline style for column width */
  getColumnStyle: (col: ColumnDef<Record<string, unknown>>) => string | undefined
  /** Handle keyboard sort trigger on header cell */
  handleHeaderKeyDown: (event: KeyboardEvent, field: string) => void
  /** Check if a column supports filtering */
  isColumnFilterable: (col: ColumnDef<Record<string, unknown>>) => boolean
  /** Check if a column has an active filter */
  hasActiveFilter: (field: string) => boolean
  /** Get the current filter value for a column */
  getFilterValue: (field: string) => string | number
  /** Get the current filter operator for a column */
  getFilterOperator: (field: string) => FilterOperator
  /** Toggle a column's filter popover open/closed */
  toggleFilterPopover: (event: Event, field: string) => void
  /** Handle text/number filter input changes */
  handleFilterInput: (field: string, value: string, col: ColumnDef<Record<string, unknown>>) => void
  /** Handle filter operator selection changes */
  handleOperatorChange: (field: string, operator: FilterOperator) => void
  /** Handle keyboard events within the filter popover (Escape to close) */
  handleFilterKeyDown: (event: KeyboardEvent) => void
  /** Handle clearing a column's filter */
  handleClearFilter: (event: Event, field: string) => void
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Extracts header interaction logic from DzDataGridHeader.
 *
 * Keeps the component file as a thin rendering layer while
 * this composable owns all stateful logic and event handlers.
 */
export function useDataGridHeader(
  options: UseDataGridHeaderOptions,
): UseDataGridHeaderReturn {
  const { ctx } = options

  /** Track which column's filter popover is open */
  const openFilterField = ref<string | null>(null)

  function getAlignClass(align?: 'left' | 'center' | 'right'): string {
    if (align === 'center')
      return 'text-center'
    if (align === 'right')
      return 'text-right'
    return 'text-left'
  }

  function getColumnStyle(col: ColumnDef<Record<string, unknown>>): string | undefined {
    if (!col.width)
      return undefined
    const w = typeof col.width === 'number' ? `${col.width}px` : col.width
    return `width: ${w}; min-width: ${w}`
  }

  function handleHeaderKeyDown(event: KeyboardEvent, field: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      ctx.sort(field)
    }
  }

  function isColumnFilterable(col: ColumnDef<Record<string, unknown>>): boolean {
    return ctx.filterable.value && col.filterable !== false
  }

  function hasActiveFilter(field: string): boolean {
    return ctx.filters.value.some(f => f.column === field)
  }

  function getFilterValue(field: string): string | number {
    const filter = ctx.filters.value.find(f => f.column === field)
    return filter?.value ?? ''
  }

  function getFilterOperator(field: string): FilterOperator {
    const filter = ctx.filters.value.find(f => f.column === field)
    return filter?.operator ?? 'contains'
  }

  function toggleFilterPopover(event: Event, field: string): void {
    event.stopPropagation()
    openFilterField.value = openFilterField.value === field ? null : field
  }

  function handleFilterInput(
    field: string,
    value: string,
    col: ColumnDef<Record<string, unknown>>,
  ): void {
    const filterType = col.filterType ?? 'text'
    const operator: FilterOperator
      = filterType === 'number'
        ? getFilterOperator(field)
        : filterType === 'select'
          ? 'equals'
          : 'contains'

    if (value === '') {
      ctx.clearFilter(field)
      return
    }

    const filterValue = filterType === 'number' ? Number(value) : value
    ctx.setFilter(field, { column: field, value: filterValue, operator })
  }

  function handleOperatorChange(field: string, operator: FilterOperator): void {
    const currentValue = getFilterValue(field)
    if (currentValue === '' || currentValue === undefined)
      return
    ctx.setFilter(field, { column: field, value: currentValue, operator })
  }

  function handleFilterKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      openFilterField.value = null
    }
  }

  function handleClearFilter(event: Event, field: string): void {
    event.stopPropagation()
    ctx.clearFilter(field)
  }

  return {
    openFilterField,
    getAlignClass,
    getColumnStyle,
    handleHeaderKeyDown,
    isColumnFilterable,
    hasActiveFilter,
    getFilterValue,
    getFilterOperator,
    toggleFilterPopover,
    handleFilterInput,
    handleOperatorChange,
    handleFilterKeyDown,
    handleClearFilter,
  }
}
