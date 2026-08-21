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
 * ## Feature set
 *
 * Column pinning, virtual scroll, and column resizing are implemented (see the
 * respective props below). Column sorting and row selection are intentionally
 * NOT part of DzTable — they live in the richer `DzDataGrid` component. DzTable
 * remains a lightweight, uncontrolled, slot-driven semantic table.
 *
 * ### Column pinning (implemented)
 *   `pin?: 'left' | 'right'` on DzTableCellProps sticks a column to the edge of
 *   the scroll container while other columns scroll horizontally. Cumulative
 *   offset for stacked pinned columns is supplied explicitly via `pinOffset`
 *   (a compound slot-driven table cannot measure sibling widths reliably).
 *   Pinned cells get `position: sticky`, `z-index: var(--dz-z-sticky)`, an
 *   opaque background, and an edge shadow on the boundary column.
 *
 * ### Virtual scroll (implemented)
 *   `virtualScroll` + `rowHeight` on DzTableProps enable windowed rendering of
 *   the DzTableBody default slot. Requires fixed row heights (`rowHeight`, px).
 *   Only the visible window (plus an overscan buffer) is rendered; top/bottom
 *   spacer rows preserve scroll geometry. Sticky pinned columns continue to work
 *   because stickiness is applied per-cell, not on the tbody.
 *
 * ### Column resizing (implemented)
 *   `resizable` + `colId` on DzTableCellProps (header cells) render a drag handle
 *   at the cell's right edge. Pointer drag updates `colWidths` in context; any
 *   cell sharing the same `colId` reads its width from that map. Min width is
 *   `--dz-table-col-min-width` (fallback 48px).
 *
 * ## Out of scope (intentionally in DzDataGrid, not DzTable)
 *
 *   - Column sorting (sort indicators, sort-change emits) → DzDataGrid.
 *   - Row selection (checkbox multi-select, select-all) → DzDataGrid.
 */

import type { BaseAccessibilityProps, CanonicalSize } from '@dzup-ui/contracts'
import type { InjectionKey, Ref } from 'vue'
import type { DzTableUi } from './DzTable.anatomy.ts'

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
  // ── Column resizing ──
  /**
   * Per-column widths (px), keyed by `colId`. A header DzTableCell with
   * `resizable` writes into this map on drag; any DzTableCell sharing the same
   * `colId` reads its width from it. Empty until a column is resized.
   */
  colWidths: Ref<Map<string, number>>
  /** Set the resolved width (px) for a column id (used by the resize handle). */
  setColWidth: (colId: string, width: number) => void
  // ── Virtual scroll ──
  /** Whether windowed (virtual) rendering is active for the body. */
  virtualScroll: Ref<boolean>
  /** Fixed row height (px) used for virtual-scroll geometry. */
  rowHeight: Ref<number>
  /** Overscan buffer (rows rendered above/below the visible window). */
  overscan: Ref<number>
  /** Current scroll offset (px) of the scroll container. */
  scrollTop: Ref<number>
  /** Current visible height (px) of the scroll container. */
  viewportHeight: Ref<number>
}

// ---------------------------------------------------------------------------
// Virtual scroll
// ---------------------------------------------------------------------------

/**
 * Windowed-render state derived by DzTableBody from container geometry + row
 * count. Only rows in `[startIndex, endIndex)` are rendered; spacer rows of
 * `paddingTop` / `paddingBottom` preserve the scrollbar geometry.
 */
export interface VirtualWindow {
  /** Index of the first rendered row (inclusive). */
  startIndex: number
  /** Index one past the last rendered row (exclusive). */
  endIndex: number
  /** Height (px) of the top spacer row that offsets the visible window. */
  paddingTop: number
  /** Height (px) of the bottom spacer row below the visible window. */
  paddingBottom: number
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
  /**
   * Per-part class overrides for the nodes DzTable itself renders — the scroll
   * container, the `<table>` and the `<caption>` (ADR-19).
   *
   * Rows and cells are part of the same anatomy but are NOT keys here: a
   * consumer writes `<DzTableRow>` and `<DzTableCell>` themselves, so `class`
   * at the call site already reaches them.
   *
   * `class` continues to apply to the scroll container.
   *
   * @example
   * ```vue
   * <DzTable :ui="{ content: 'table-fixed', title: 'text-left' }" />
   * ```
   */
  ui?: DzTableUi
  /**
   * Enable windowed (virtual) rendering of DzTableBody rows for large datasets.
   * Requires fixed row heights (`rowHeight`). Only visible rows plus an overscan
   * buffer are rendered; spacer rows preserve scroll geometry. Default `false`.
   */
  virtualScroll?: boolean
  /**
   * Fixed row height in pixels, used for virtual-scroll geometry. Only meaningful
   * when `virtualScroll` is set. Default `44`.
   */
  rowHeight?: number
  /**
   * Max height (CSS length) of the scroll container. Needed so virtual scroll has
   * a bounded, scrollable viewport (e.g. `'400px'`, `'60vh'`). When omitted while
   * `virtualScroll` is set, defaults to `'400px'`.
   */
  maxHeight?: string
  /**
   * Number of extra rows rendered above and below the visible window to reduce
   * blank flashes while scrolling. Only meaningful with `virtualScroll`.
   * Default `4`.
   */
  overscan?: number
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

/** Which edge a column is pinned (stuck) to while the table scrolls horizontally. */
export type TablePin = 'left' | 'right'

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
  /**
   * Pin this cell's column to the `left` or `right` edge of the scroll container
   * so it stays visible while other columns scroll horizontally. Apply the same
   * `pin` value to every cell in the column (header + body) for a coherent column.
   */
  pin?: TablePin
  /**
   * Cumulative offset (px) from the pinned edge, for stacking multiple pinned
   * columns. The first pinned column uses `0`; each subsequent pinned column uses
   * the summed width of the pinned columns before it. Ignored when `pin` is unset.
   */
  pinOffset?: number
  /**
   * Mark this pinned cell as the boundary column (the last pinned-left or first
   * pinned-right column) so it renders an edge shadow separating pinned from
   * scrolling content. Ignored when `pin` is unset.
   */
  pinBoundary?: boolean
  /**
   * Stable column id. Required to participate in column resizing: a `resizable`
   * header cell writes its width under this id, and body cells sharing the id
   * adopt that width.
   */
  colId?: string
  /**
   * Header cells only: render a drag handle at the right edge that resizes the
   * column. Requires `colId`. No-op on body cells.
   */
  resizable?: boolean
}

/** Slot definitions for DzTableCell */
export interface DzTableCellSlots {
  /** Cell content */
  default: () => unknown
}
