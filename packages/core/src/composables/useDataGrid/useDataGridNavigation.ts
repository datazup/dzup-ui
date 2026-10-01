/**
 * useDataGridNavigation — APG `grid` cell navigation for DzDataGrid.
 *
 * **Why this exists (RESIDUAL-15, closing `D-RES14-1`).** `DzDataGrid.anatomy.ts`
 * has published six `apg: 'grid'` cell-navigation rows since TASK-R5-O5 —
 * ArrowLeft/ArrowRight along the inline axis, ArrowUp/ArrowDown between rows,
 * Home/End to the ends of a row — and RESIDUAL-14 §2.2.4 measured that the whole
 * family navigated no cells at all: no arrow handling, no roving `tabindex`, no
 * `reka-ui` import anywhere in it. The gate's citation for all six was
 * `reka-ui/dist/RovingFocus/utils.js`, reached through the row-selection
 * **checkbox**, and a one-dimensional roving-focus group cannot implement a
 * two-dimensional grid. Six WCAG 2.1.1 claims with nothing behind them, on the
 * component `DzTable.types.ts:41` points buyers at for advanced features.
 *
 * ## The address space is the table, not a parallel model
 *
 * `DzDataGrid.vue` renders a real `<table role="grid">`, so `HTMLTableElement.rows`
 * and `HTMLTableRowElement.cells` are an exact, order-true address for every cell:
 * row `0` is `DzDataGridHeader`'s `<tr>`, rows `1…n` are `DzDataGridBody`'s, and
 * both render the *same* number of cells (an optional selection cell, then one per
 * column). Nothing has to be registered, counted or kept in step, and a cell moved
 * by a re-render cannot disagree with its address. That is why this navigates the
 * DOM rather than an index it maintains — the index is the DOM's.
 *
 * ## What it does NOT do, and the alternative that was rejected
 *
 * The strict APG `grid` pattern makes the whole grid **one** tab stop and reaches
 * a widget inside a cell with Enter or F2. This does not go that far, deliberately:
 *
 * - The **body** gets a roving `tabindex` — exactly one body cell is in the tab
 *   order and it follows the user — so the cells are reachable by keyboard at all,
 *   which they were not before.
 * - The **header** keeps the tab stops it already publishes:
 *   `:tabindex="sortable && col.sortable !== false ? 0 : undefined"` becomes
 *   `… : -1`, which adds no tab stop and makes a non-sortable header cell
 *   reachable by ArrowUp. Three checked-in specs assert that a sortable
 *   `role="columnheader"` carries `tabindex="0"`
 *   (`DzDataGrid.contract.spec.ts:136`, `:158`, `DzDataGrid.spec.ts:146`), and
 *   consumers can tab to every sortable column today.
 * - Controls rendered **inside** a cell — the selection `DzCheckbox`, the filter
 *   `DzIconButton`, the filter popover's `DzInput`/`DzSelect`/`DzButton`, and
 *   anything in the `#cell` slot — keep their own tab stops and their own keys.
 *
 * **Rejected alternative: collapse the grid to a single tab stop.** It is the
 * letter of the pattern, and it would remove the per-column header tab stops that
 * three specs assert and that a keyboard user already relies on, replace them with
 * an Enter/F2 "enter the cell" mode that nothing else in this library uses, and
 * take every consumer's `#cell` control out of the tab order. That is a published
 * tab-order change on a flagship component in exchange for conformance with a part
 * of the pattern **no declared row states** — the anatomy declares no `Tab` row at
 * all. What the six rows claim is arrow, Home and End movement between cells, and
 * that is what this implements. The anatomy's keyboard comment records the same
 * decision beside the rows.
 *
 * @module @dzup-ui/core/composables/useDataGrid/useDataGridNavigation
 */

import type { Ref } from 'vue'
import { ref } from 'vue'
import { useDzDirection } from '../provider/useDzLocale.ts'

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

/** A cell's position in the body, as `DzDataGridBody` renders it. */
export interface DataGridCellPosition {
  /** Zero-based body row index — the `v-for` index, not the table row index. */
  row: number
  /** Zero-based cell index within the row, selection cell included. */
  col: number
}

/** Return value of the useDataGridNavigation composable */
export interface UseDataGridNavigationReturn {
  /**
   * The body cell that currently holds the body's single tab stop.
   *
   * Starts at the first cell of the first row and follows the user, which is what
   * makes leaving the grid and coming back land where they were.
   */
  activeCell: Ref<DataGridCellPosition>
  /** Whether this body cell is the one in the tab order. */
  isActiveCell: (row: number, col: number) => boolean
  /**
   * ArrowLeft / ArrowRight / ArrowUp / ArrowDown / Home / End / PageUp / PageDown
   * over the grid's cells. Bound on every `<th>` and `<td>`; safe on both.
   */
  onCellKeydown: (event: KeyboardEvent) => void
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * How many rows a page key moves.
 *
 * APG leaves this to the author ("an author-determined number of rows"). Ten is
 * the page size `DzDataGrid`'s own pagination defaults to
 * (`DzDataGrid.vue`'s `pageSizeOptions` starts `[10, …]`), so a page key moves a
 * screenful in the same units the component already thinks in.
 */
const PAGE_ROWS = 10

export function useDataGridNavigation(): UseDataGridNavigationReturn {
  const dzDirection = useDzDirection()

  const activeCell = ref<DataGridCellPosition>({ row: 0, col: 0 })

  function isActiveCell(row: number, col: number): boolean {
    return activeCell.value.row === row && activeCell.value.col === col
  }

  /** Clamp into the table and focus, moving the body's tab stop with it. */
  function focusCell(rows: readonly HTMLTableRowElement[], row: number, col: number): void {
    const targetRow = rows[Math.max(0, Math.min(row, rows.length - 1))]
    if (targetRow === undefined)
      return
    const cells = targetRow.cells
    if (cells.length === 0)
      return
    const targetCol = Math.max(0, Math.min(col, cells.length - 1))
    const cell = cells[targetCol]
    if (cell === undefined)
      return
    // Row 0 is the header, which keeps its own tab stops; only a body cell can
    // hold the body's roving one, and `row - 1` is the `v-for` index again.
    if (targetRow.parentElement?.tagName === 'TBODY')
      activeCell.value = { row: Array.from(targetRow.parentElement.children).indexOf(targetRow), col: targetCol }
    cell.focus()
  }

  function onCellKeydown(event: KeyboardEvent): void {
    // The key belongs to the cell only when the cell is what has focus. A
    // checkbox, a filter button, a popover field or a consumer's `#cell` control
    // keeps its own arrows and its own Home/End — the concern
    // `utilities/keyboardTargets.ts` was written for, answered here by identity
    // rather than by a predicate, because a cell IS the focus target when it is
    // the thing being navigated.
    if (event.target !== event.currentTarget)
      return
    const cell = event.currentTarget
    if (!(cell instanceof HTMLTableCellElement))
      return
    const table = cell.closest('table')
    const row = cell.parentElement
    if (table === null || !(row instanceof HTMLTableRowElement))
      return
    const rows = Array.from(table.rows)
    const currentRow = rows.indexOf(row)
    if (currentRow === -1)
      return
    const currentCol = cell.cellIndex

    // The inline pair mirrors in a RTL document, which is what this anatomy's
    // `rtl: { keyboard: 'swap-horizontal' }` and the two `rtl: 'mirrored'` rows
    // declare: ArrowRight moves to the inline END, which is the next column in
    // LTR and the previous one in RTL. `DzCalendar` and `DzToolbar` resolve the
    // same pair the same way.
    const inlineEnd = dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
    const inlineStart = dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

    let target: DataGridCellPosition | null = null
    switch (event.key) {
      case inlineEnd:
        target = { row: currentRow, col: currentCol + 1 }
        break
      case inlineStart:
        target = { row: currentRow, col: currentCol - 1 }
        break
      case 'ArrowDown':
        target = { row: currentRow + 1, col: currentCol }
        break
      case 'ArrowUp':
        target = { row: currentRow - 1, col: currentCol }
        break
      case 'Home':
        target = { row: currentRow, col: 0 }
        break
      case 'End':
        target = { row: currentRow, col: row.cells.length - 1 }
        break
      case 'PageDown':
        target = { row: currentRow + PAGE_ROWS, col: currentCol }
        break
      case 'PageUp':
        target = { row: currentRow - PAGE_ROWS, col: currentCol }
        break
      default:
        return
    }

    // Consumed even at an edge, where `focusCell` clamps to the cell already
    // focused. All eight keys scroll a document by default and the grid owns
    // them: letting ArrowDown scroll the page away from the last row is the
    // defect, not the courtesy. **No wrapping** — APG's `grid` pattern moves and
    // stops; a ring is the `toolbar`/`menu` behaviour.
    event.preventDefault()
    focusCell(rows, target.row, target.col)
  }

  return { activeCell, isActiveCell, onCellKeydown }
}
