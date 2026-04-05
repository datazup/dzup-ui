/**
 * DzDataGrid — type definitions for the compound DataGrid family.
 *
 * DzDataGrid is the most complex core component. Phase 1 scope:
 * sorting, pagination, and row selection.
 *
 * Context injection via DZ_DATA_GRID_KEY (ADR-08).
 *
 * @module @dzip-ui/core/components/data/DzDataGrid
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzip-ui/contracts'
import type { Component, InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Column definition
// ---------------------------------------------------------------------------

/** Column definition for the data grid */
export interface ColumnDef<T> {
  /** Field key to access the data from the row */
  field: keyof T & string
  /** Header label text */
  header: string
  /** Column width (number = px, string = CSS value) */
  width?: number | string
  /** Whether this column is sortable */
  sortable?: boolean
  /** Whether this column is filterable */
  filterable?: boolean
  /** Filter type for this column */
  filterType?: FilterType
  /** Filter options for select type filter */
  filterOptions?: string[]
  /** Custom cell renderer component */
  cellRenderer?: Component
  /** Custom header renderer component */
  headerRenderer?: Component
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Pin column to left or right */
  pinned?: 'left' | 'right'
}

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

/** Filter type for column filtering */
export type FilterType = 'text' | 'number' | 'select'

/** Filter comparison operator */
export type FilterOperator = 'contains' | 'equals' | 'gt' | 'lt' | 'gte' | 'lte'

/** Filter state for a single column */
export interface DzDataGridFilter {
  /** Column field key being filtered */
  column: string
  /** Filter value */
  value: string | number
  /** Comparison operator */
  operator: FilterOperator
}

// ---------------------------------------------------------------------------
// Sort model
// ---------------------------------------------------------------------------

/** Sort direction */
export type SortDirection = 'asc' | 'desc'

/** Sort model for a single column */
export interface SortModel {
  /** Field key being sorted */
  field: string
  /** Sort direction */
  direction: SortDirection
}

// ---------------------------------------------------------------------------
// Pagination config
// ---------------------------------------------------------------------------

/** Pagination configuration */
export interface PaginationConfig {
  /** Number of items per page */
  pageSize: number
  /** Available page size options */
  pageSizeOptions?: number[]
}

// ---------------------------------------------------------------------------
// Grid density
// ---------------------------------------------------------------------------

/** Grid row density */
export type GridDensity = 'compact' | 'default' | 'comfortable'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzDataGrid sub-parts via inject */
export interface DzDataGridContext<T = Record<string, unknown>> {
  /** Column definitions */
  columns: Ref<ColumnDef<T>[]>
  /** Current data rows */
  data: Ref<T[]>
  /** Row density */
  density: Ref<GridDensity>
  /** Size */
  size: Ref<CanonicalSize>
  /** Whether sorting is enabled */
  sortable: Ref<boolean>
  /** Current sort model */
  sortModel: Ref<SortModel[]>
  /** Whether filtering is enabled */
  filterable: Ref<boolean>
  /** Current filter state */
  filters: Ref<DzDataGridFilter[]>
  /** Whether selection is enabled */
  selectable: Ref<boolean | 'single' | 'multiple'>
  /** Currently selected rows */
  selectedRows: Ref<T[]>
  /** Loading state */
  loading: Ref<boolean>
  /** Sort a column */
  sort: (field: string) => void
  /** Set a filter on a column */
  setFilter: (column: string, filter: DzDataGridFilter) => void
  /** Clear a filter on a column */
  clearFilter: (column: string) => void
  /** Clear all filters */
  clearAllFilters: () => void
  /** Toggle row selection */
  toggleRowSelection: (row: T) => void
  /** Toggle all row selection */
  toggleAllSelection: () => void
  /** Check if a row is selected */
  isRowSelected: (row: T) => boolean
  /** Check if all rows are selected */
  isAllSelected: Ref<boolean>
  /** Check if some rows are selected (indeterminate) */
  isSomeSelected: Ref<boolean>
}

/** Typed injection key for DzDataGrid context (ADR-08, SCREAMING_SNAKE) */
export const DZ_DATA_GRID_KEY: InjectionKey<DzDataGridContext> = Symbol('dz-data-grid')

// ---------------------------------------------------------------------------
// DzDataGrid Props
// ---------------------------------------------------------------------------

/** Props for the DzDataGrid root component */
export interface DzDataGridProps<T = Record<string, unknown>> extends BaseAccessibilityProps {
  /** Data rows to display */
  data: T[]
  /** Column definitions */
  columns: ColumnDef<T>[]
  /** Loading state */
  loading?: boolean
  /** Whether sorting is enabled */
  sortable?: boolean
  /** Current sort model (controlled) */
  sortModel?: SortModel[]
  /** Whether column filtering is enabled */
  filterable?: boolean
  /** Current filter state (controlled) */
  filters?: DzDataGridFilter[]
  /** Whether pagination is enabled */
  pagination?: boolean | PaginationConfig
  /** Selection mode */
  selectable?: boolean | 'single' | 'multiple'
  /** Currently selected rows */
  selectedRows?: T[]
  /** Row density */
  density?: GridDensity
  /** Component size */
  size?: CanonicalSize
  /** Function to get unique row key */
  rowKey?: keyof T & string
}

// ---------------------------------------------------------------------------
// DzDataGrid Emits
// ---------------------------------------------------------------------------

/** Events emitted by DzDataGrid */
export interface DzDataGridEmits<T = Record<string, unknown>> {
  /** Sort model changed */
  'update:sortModel': [value: SortModel[]]
  /** Filter state changed */
  'update:filters': [value: DzDataGridFilter[]]
  /** Selected rows changed */
  'update:selectedRows': [value: T[]]
  /** A row was clicked */
  'rowClick': [row: T, index: number]
  /** Sort changed (convenience alias) */
  'sort': [sortModel: SortModel[]]
  /** Filter changed (convenience alias) */
  'filter': [filters: DzDataGridFilter[]]
  /** Page changed */
  'pageChange': [page: number]
  /** Page size changed */
  'pageSizeChange': [pageSize: number]
}

// ---------------------------------------------------------------------------
// DzDataGrid Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzDataGrid */
export interface DzDataGridSlots<T = Record<string, unknown>> {
  /** Custom header content */
  header?: () => unknown
  /** Custom body content */
  body?: () => unknown
  /** Custom cell content */
  cell?: (props: { row: T, column: ColumnDef<T>, value: unknown }) => unknown
  /** Content shown when data is empty */
  empty?: () => unknown
  /** Custom loading indicator */
  loading?: () => unknown
  /** Custom pagination content */
  pagination?: () => unknown
}

// ---------------------------------------------------------------------------
// Sub-part types
// ---------------------------------------------------------------------------

/** Props for DzDataGridHeader */
export interface DzDataGridHeaderProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzDataGridHeader */
export interface DzDataGridHeaderSlots {
  /** Header cell content */
  default?: () => unknown
}

/** Props for DzDataGridBody */
export interface DzDataGridBodyProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzDataGridBody */
export interface DzDataGridBodySlots {
  /** Body row content */
  default?: () => unknown
}

/** Props for DzDataGridRow */
export interface DzDataGridRowProps<T = Record<string, unknown>> {
  /** The data row */
  row: T
  /** Row index */
  index: number
}

/** Slot definitions for DzDataGridRow */
export interface DzDataGridRowSlots {
  /** Row cell content */
  default?: () => unknown
}

/** Props for DzDataGridCell */
export interface DzDataGridCellProps<T = Record<string, unknown>> {
  /** The data row */
  row: T
  /** Column definition */
  column: ColumnDef<T>
}

/** Slot definitions for DzDataGridCell */
export interface DzDataGridCellSlots {
  /** Cell content */
  default?: () => unknown
}

/** Props for DzDataGridPagination */
export interface DzDataGridPaginationProps {
  /** Current page (1-based) */
  page: number
  /** Items per page */
  pageSize: number
  /** Total number of items */
  total: number
  /** Available page size options */
  pageSizeOptions?: number[]
}

/** Events emitted by DzDataGridPagination */
export interface DzDataGridPaginationEmits {
  /** Page changed */
  'update:page': [page: number]
  /** Page size changed */
  'update:pageSize': [pageSize: number]
}

/** Slot definitions for DzDataGridPagination */
export interface DzDataGridPaginationSlots {
  /** Custom pagination content */
  default?: () => unknown
}
