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
  /** Set of currently-expanded row ids (accordion-style detail rows) */
  expandedRows: Ref<Set<string>>
  /** Toggle the expanded state of the row with the given id */
  toggleExpand: (rowId: string) => void
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
// DzTable Emits
// ---------------------------------------------------------------------------

/**
 * Emit definitions for the DzTable root component.
 *
 * Following the repo convention (cf. DzDataGrid `rowClick`), events are declared
 * camelCase and consumed kebab-case in templates (`@row-expand` / `@row-collapse`).
 */
export interface DzTableEmits {
  /** Emitted when a row is expanded, with the row's id */
  rowExpand: [rowId: string]
  /** Emitted when a row is collapsed, with the row's id */
  rowCollapse: [rowId: string]
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
// DzTableFooter Props
// ---------------------------------------------------------------------------

/** Props for the DzTableFooter component */
export interface DzTableFooterProps {
  /** Additional class name */
  class?: string
}

/** Slot definitions for DzTableFooter */
export interface DzTableFooterSlots {
  /** Table footer rows */
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
  /**
   * Whether this row can be expanded to reveal accordion-style detail content
   * (rendered via the `#expand` slot). When set, a leading toggle cell with a
   * chevron icon is rendered and an id-tracked detail `<tr class="expand-row">`
   * is conditionally shown.
   */
  expandable?: boolean
  /**
   * Stable id used to track this row's expanded state in DzTableContext.
   * Required for `expandable` rows; if omitted, a per-instance id is generated.
   */
  rowId?: string
}

/** Slot definitions for DzTableRow */
export interface DzTableRowSlots {
  /** Table cells */
  default: () => unknown
  /** Accordion-style detail content shown when an `expandable` row is expanded */
  expand?: () => unknown
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
