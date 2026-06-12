/**
 * DzDataView — type definitions.
 *
 * A pure-presentation collection renderer that displays `items` as either a
 * vertical list or a card grid, with an optional layout toggle, built-in
 * paging (DzPagination), and client-side sorting. It fills the space between
 * DzList (simple) and DzDataGrid (tabular) — product catalogs, galleries,
 * dashboards.
 *
 * Layout, paging offset, and sort state are exposed through `defineModel`
 * (ADR-16): `v-model:layout`, `v-model:first`, `v-model:sortField`,
 * `v-model:sortOrder`.
 *
 * @module @dzup-ui/core/components/data/DzDataView
 */

import type {
  BaseAccessibilityProps,
  CanonicalSize,
} from '@dzup-ui/contracts'
import type { GridCols, LayoutGap, ResponsiveCols } from '../layout/DzGrid.types.ts'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

/** Display layout for the collection */
export type DataViewLayout = 'list' | 'grid'

/**
 * Sort direction:
 * - `1`  → ascending
 * - `-1` → descending
 * - `0`  → unsorted (original order)
 */
export type DataViewSortOrder = 1 | -1 | 0

/** A selectable sort definition rendered by the default sort control */
export interface DataViewSortOption {
  /** Display label */
  label: string
  /** Field path (supports dot notation, e.g. `'price'` or `'meta.rank'`) */
  field: string
  /** Direction applied when chosen (defaults to ascending) */
  order?: 1 | -1
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/** Props for the DzDataView component */
export interface DzDataViewProps<T = Record<string, unknown>> extends BaseAccessibilityProps {
  /** Records to render */
  items?: T[]
  /** Field path used to derive stable keys (falls back to index) */
  dataKey?: string
  /** Render the list/grid layout toggle (segmented control) */
  layoutToggle?: boolean
  /** Grid columns (fixed count or responsive object) for the grid layout */
  cols?: GridCols | ResponsiveCols
  /** Gap between grid cells */
  gap?: LayoutGap
  /** Enable the built-in paginator */
  paginator?: boolean
  /** Page size (records per page) when paginated */
  rows?: number
  /** Sort options rendered by the default sort control */
  sortOptions?: DataViewSortOption[]
  /** Loading state — renders skeleton placeholders */
  loading?: boolean
  /** Number of skeleton placeholders to render while loading */
  loadingRows?: number
  /** Title for the built-in empty state */
  emptyTitle?: string
  /** Description for the built-in empty state */
  emptyDescription?: string
  /** Component size */
  size?: CanonicalSize
  /** Disabled state — prevents layout/sort/paging interaction */
  disabled?: boolean
}

// ---------------------------------------------------------------------------
// Emits
// ---------------------------------------------------------------------------

/** Payload emitted when the sort state changes */
export interface DataViewSortPayload {
  /** Active sort field path */
  sortField: string
  /** Active sort direction */
  sortOrder: DataViewSortOrder
}

/**
 * Events emitted by DzDataView.
 *
 * Note: `update:layout`, `update:first`, `update:sortField`, and
 * `update:sortOrder` are produced implicitly by their respective `defineModel`
 * calls (ADR-16) and are therefore NOT redeclared here.
 */
export interface DzDataViewEmits {
  /** Page changed — payload is the new first-record offset */
  page: [first: number]
  /** Sort state changed */
  sort: [payload: DataViewSortPayload]
}

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

/** Props passed to the `#item` slot for each rendered record */
export interface DzDataViewItemSlotProps<T = unknown> {
  /** The record */
  item: T
  /** Index within the processed (sorted) collection */
  index: number
  /** Active layout — lets the consumer render list rows vs. grid cards */
  layout: DataViewLayout
}

/** Props passed to the `#sort` slot for a custom sort control */
export interface DzDataViewSortSlotProps {
  /** Active sort field path */
  sortField: string
  /** Active sort direction */
  sortOrder: DataViewSortOrder
  /** Imperatively apply a sort (resets to the first page) */
  setSort: (field: string, order?: DataViewSortOrder) => void
}

/** Slot definitions for DzDataView */
export interface DzDataViewSlots<T = unknown> {
  /** Per-record cell content (required for meaningful output) */
  item?: (props: DzDataViewItemSlotProps<T>) => unknown
  /** Toolbar leading content (titles, filters) */
  header?: () => unknown
  /** Footer content rendered alongside the paginator */
  footer?: () => unknown
  /** Empty-state content (overrides the built-in DzEmpty) */
  empty?: () => unknown
  /** Loading-state content (overrides the built-in skeletons) */
  loading?: () => unknown
  /** Custom sort control (overrides the built-in select) */
  sort?: (props: DzDataViewSortSlotProps) => unknown
}
