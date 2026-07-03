/**
 * DzTable — type definitions for the compound Table family.
 *
 * DzTable is a simple semantic table wrapper with styling.
 * For advanced features (sorting, pagination, selection), use DzDataGrid.
 *
 * DzTable provides context to sub-parts via inject (ADR-08).
 *
 * @module @dzup-ui/core/components/data/DzTable
 *
 * ## Missing features (tracked TODOs)
 *
 * TODO(DzTable-column-pinning): Sticky/pinned column support.
 *   Required by CapabilityMatrixView (skill names column must stay fixed while
 *   category columns scroll horizontally). Design: add `pin?: 'left' | 'right'`
 *   to DzTableCellProps; DzTableCell emits its offsetLeft into DzTableContext;
 *   DzTable wrapper applies `position: sticky; left: <offset>` via inline style
 *   and `z-index: var(--dz-z-sticky)` on pinned cells. Shadow on the right edge
 *   of the last pinned column via `box-shadow: inset -4px 0 var(--dz-shadow-xs)`.
 *   Requires token `--dz-z-sticky` in @dzup-ui/tokens.
 *
 * TODO(DzTable-column-sorting): Per-column sort indicator and sort-change emit.
 *   Add `sortable?: boolean`, `sortDirection?: 'asc' | 'desc' | 'none'` to
 *   DzTableCellProps (header cells only). DzTableCell renders a sort icon and
 *   emits `sort` with the column key. DzTable emits
 *   `sort-change: [key: string, direction: 'asc' | 'desc']`.
 *   Caller owns sort state; DzTable is uncontrolled (no internal sort logic).
 *
 * TODO(DzTable-row-selection): Checkbox-based multi-row selection.
 *   Add `selectable?: boolean` to DzTableProps; DzTable provides
 *   `selected: Ref<Set<string>>` and `toggleRow(id: string)` in context.
 *   DzTableRow accepts `rowId?: string`; renders a leading DzCheckbox cell when
 *   selectable context is active. DzTable emits `selection-change: [ids: string[]]`.
 *   Select-all checkbox in DzTableHeader.
 *
 * TODO(DzTable-virtual-scroll): Windowed rendering for large datasets.
 *   Add `virtualScroll?: boolean` and `rowHeight?: number` to DzTableProps.
 *   Use @vueuse/core useVirtualList on the scroll container. Requires fixed row
 *   heights. Column pinning must work with virtual rows (sticky on container,
 *   not tbody).
 *
 * TODO(DzTable-expandable-rows): Accordion-style row detail expansion.
 *   Add `expandable?: boolean` to DzTableRow. DzTableRow renders a toggle cell
 *   (chevron icon) and conditionally renders a `<tr class="expand-row">` with
 *   `<td :colspan="colCount">` for the `#expand` slot. DzTableContext tracks
 *   `expandedRows: Ref<Set<string>>`. DzTable emits `row-expand`/`row-collapse`.
 *
 * TODO(DzTable-column-resizing): Drag-to-resize column widths.
 *   Add `resizable?: boolean` to DzTableCellProps (header cells only). DzTableCell
 *   renders a drag handle at the right edge; pointer events update
 *   `colWidths: Ref<Map<string, number>>` in context. Requires `colId` prop on
 *   DzTableCell. Min-width via `--dz-table-col-min-width` token.
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'

// ---------------------------------------------------------------------------
// Context (ADR-08)
// ---------------------------------------------------------------------------

/** Context provided to DzTable sub-parts via inject */
export interface DzTableContext {
  /** Component size */
  size: Ref<CanonicalSize>
  /** Whether rows have striped backgrounds */
  striped: Ref<boolean>
  /** Whether rows are hoverable */
  hoverable: Ref<boolean>
  /** Table density */
  density: Ref<TableDensity>
  /** Whether the table is in a loading state */
  loading: Ref<boolean>
}

/** Typed injection key for DzTable context (ADR-08, SCREAMING_SNAKE) */
export const DZ_TABLE_KEY: InjectionKey<DzTableContext> = Symbol('dz-table')

// ---------------------------------------------------------------------------
// Variant types
// ---------------------------------------------------------------------------

/** Table density options */
export type TableDensity = 'compact' | 'default' | 'comfortable'

/** Visual variants for the DzTable component */
export type TableVariant = 'default' | 'bordered' | 'striped'

// ---------------------------------------------------------------------------
// DzTable Props
// ---------------------------------------------------------------------------

/** Props for the DzTable root component */
export interface DzTableProps extends BaseAccessibilityProps {
  /** Component size */
  size?: CanonicalSize
  /** Visual style variant */
  variant?: TableVariant
  /** Whether rows have striped backgrounds */
  striped?: boolean
  /** Whether rows are hoverable */
  hoverable?: boolean
  /** Table density */
  density?: TableDensity
  /** Loading state */
  loading?: boolean
  /**
   * Make the `caption` slot visibly rendered instead of screen-reader-only.
   * Default `false` preserves the original `sr-only` behaviour.
   */
  captionVisible?: boolean
}

// ---------------------------------------------------------------------------
// DzTable Slots
// ---------------------------------------------------------------------------

/** Slot definitions for DzTable */
export interface DzTableSlots {
  /** Table header, body, and footer sub-parts */
  default: () => unknown
  /** Caption for the table */
  caption?: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableHeader Props
// ---------------------------------------------------------------------------

/** Props for the DzTableHeader component */
export interface DzTableHeaderProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzTableHeader */
export interface DzTableHeaderSlots {
  /** Table header rows */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableBody Props
// ---------------------------------------------------------------------------

/** Props for the DzTableBody component */
export interface DzTableBodyProps {
  /** Additional class name */
  class?: string
  /** Number of skeleton rows to render while the table is loading */
  skeletonRows?: number
}

/** Slot definitions for DzTableBody */
export interface DzTableBodySlots {
  /** Table body rows */
  default: () => unknown
  /**
   * Custom empty-state content, rendered inside a full-width placeholder row
   * when the `default` slot yields zero rows (and not `loading`). Defaults to
   * a `DzEmpty` with "No records found." when not provided.
   */
  empty?: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableRow Props
// ---------------------------------------------------------------------------

/** Props for the DzTableRow component */
export interface DzTableRowProps {
  /** Whether this row is currently selected */
  selected?: boolean
}

/** Slot definitions for DzTableRow */
export interface DzTableRowSlots {
  /** Table cells */
  default: () => unknown
}

// ---------------------------------------------------------------------------
// DzTableCell Props
// ---------------------------------------------------------------------------

/** Props for the DzTableCell component */
export interface DzTableCellProps {
  /** Whether this cell is a header cell (<th> vs <td>) */
  header?: boolean
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Column span */
  colspan?: number
  /** Row span */
  rowspan?: number
}

/** Slot definitions for DzTableCell */
export interface DzTableCellSlots {
  /** Cell content */
  default: () => unknown
}
