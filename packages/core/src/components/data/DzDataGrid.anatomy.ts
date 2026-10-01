import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzDataGrid — declared anatomy for the data grid family (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy declared on the parent**, the `DzTable` pattern:
 * `DzDataGridHeader`, `DzDataGridBody` and `DzDataGridPagination` are
 * `compound-part`s of `DzDataGrid` in the ownership manifest; they emit
 * `header` / `body` / `footer` and the `row`, `cell`, `indicator` and `panel`
 * names inside them, never `root`, so a composed grid conforms to one
 * declaration.
 *
 * The tabular names are the same three TASK-R5-O1 folded into the vocabulary
 * for `DzTable` — `body`, `row`, `cell` — deliberately: a consumer who has
 * themed a table should not have to learn a second spelling for a grid.
 *
 * `panel` is the per-column filter popover. It is a `role="dialog"` this
 * component renders inside a header cell, it has no call site, and a grid whose
 * filter popover cannot be themed is a grid whose filters look like a different
 * product.
 *
 * The controls inside it — `DzInput`, `DzSelect`, `DzButton`, `DzIconButton`,
 * `DzCheckbox` — are separate components. Four of the five already declare an
 * anatomy and are boundaries; `DzCheckbox` is in the `forms` family and is
 * blocked on owner decision D15 (S1-D4), which is why the family spec exercises
 * the grid without `selectable="multiple"` and says so.
 */
export const anatomy = {
  parts: [
    'root',
    'loader',
    'empty',
    'content',
    'header',
    'body',
    'row',
    'cell',
    'indicator',
    'panel',
    'footer',
  ],

  /**
   * `loader` and `empty` replace the table rather than joining it; `row` and
   * `cell` repeat; `indicator` is the sort glyph on a sortable column; `panel`
   * exists only while a filter is open; `footer` only under `pagination`.
   * Only the root is unconditional — the `content` table itself is swapped out
   * by the loading and empty branches.
   */
  optionalParts: [
    'loader',
    'empty',
    'content',
    'header',
    'body',
    'row',
    'cell',
    'indicator',
    'panel',
    'footer',
  ],

  /**
   * `ready` / `loading` on the root and `selected` on a row — all three already
   * emitted. Sort direction is `aria-sort`, which is the accessible fact, and
   * is deliberately not duplicated as a state.
   */
  states: ['ready', 'loading', 'selected'],

  /**
   * Empty and measured: `DzDataGrid.tokens.ts` maps to global semantic tokens
   * and owns no `--dz-data-grid-*` property of its own.
   */
  componentTokens: [],

  recipes: ['size', 'density'],

  /**
   * Mirrors with the document — column order follows the reading direction, the
   * same contract `DzTable` declares. `keyboard: 'swap-horizontal'`: cell
   * navigation moves along the inline axis, so ArrowRight advances in LTR and
   * retreats in RTL.
   *
   * `icons: ['indicator']`: the sort glyph is a caret whose direction carries
   * meaning.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `grid` over the cells, plus the
   * sort keys `useDataGridHeader` implements on a column header.
   *
   * ## `D-RES14-1`, decided by RESIDUAL-15: the six cell rows are IMPLEMENTED
   *
   * RESIDUAL-14 §2.2.4 called this "the largest single false green" its census
   * found and deliberately gave no recommendation. The measurement: `role="grid"`
   * on the `<table>`, `role="gridcell"` twice in `DzDataGridBody.vue`, and **no
   * cell navigation anywhere in the family** — no arrow handling, no roving
   * `tabindex`, no `reka-ui` import. The gate's citation for all six rows was
   * `reka-ui/dist/RovingFocus/utils.js`, reached through the row-selection
   * **checkbox**, and its own `what` field printed `CheckboxIndicator`. Six WCAG
   * 2.1.1 claims with nothing behind them.
   *
   * **Implemented rather than withdrawn**, and the component's structure is the
   * reason it was tractable:
   *
   * - The cells are **this family's own**, not a consumer's. `DzDataGridBody.vue`
   *   renders `<tr role="row">` / `<td role="gridcell">` from a `v-for` over
   *   `ctx.columns`; the only `<slot />` is *inside* a cell (`#cell`), never around
   *   one. Withdrawal would have been the answer for a slotted grid, and this is
   *   not one.
   * - The grid ARIA was **already complete and correct** — `grid`, `rowgroup`,
   *   `row`, `columnheader`, `gridcell` — so nothing had to be restructured to
   *   make navigation announceable.
   * - The root renders a real `<table>`, so `HTMLTableElement.rows` /
   *   `row.cells` is an exact, order-true cell address; header and body render the
   *   **same** number of cells. No parallel index to register or keep in step.
   * - Header and body already inject one `DZ_DATA_GRID_KEY` context, so one focus
   *   state reaches both.
   * - The mechanisms are the ones this repository already uses: `DzToolbar`'s
   *   roving `tabindex`, `useDzDirection()` for the inline mirror this anatomy's
   *   `rtl.keyboard: 'swap-horizontal'` declares, and `DzCalendar`'s
   *   direction-resolved arrow pair.
   *
   * `PageUp` / `PageDown` are **new rows**, declared in the same change as the
   * handler that serves them so `maxUndeclaredHandlers` stays at 0. They are the
   * rest of the APG `grid` key set and they are what makes a long grid usable by
   * keyboard; `useDataGridNavigation`'s `PAGE_ROWS` records why the step is ten.
   *
   * **Rejected alternatives**, both costed:
   *
   * - **(b) Withdraw the six rows.** Cheap, and RESIDUAL-14 said itself that it
   *   "leaves a grid that announces a grid pattern to a screen reader and does not
   *   implement it, which is arguably worse than an untrue docs table". On the
   *   component `DzTable.types.ts:41` points buyers at for advanced features, and
   *   with every structural precondition for the real thing already in place.
   * - **(c) Withdraw the rows and the `role="grid"`.** Consistent, and a published
   *   ARIA change that removes a capability rather than adding one.
   * - **Inside (a), the strict single-tab-stop grid.** The letter of the pattern
   *   makes the whole grid one tab stop and reaches a cell's widget with Enter or
   *   F2. Rejected: it removes the per-column header tab stops that
   *   `DzDataGrid.contract.spec.ts:136`/`:158` and `DzDataGrid.spec.ts:146` assert
   *   and a keyboard user already has, takes every consumer's `#cell` control out
   *   of the tab order, and introduces a modal cell-entry idiom nothing else here
   *   uses — in exchange for conformance with a part of the pattern **no row
   *   below states**, since this table declares no `Tab` row at all. What is
   *   implemented is what the rows claim: arrow, Home, End and page movement
   *   between cells, with the body reachable through one roving tab stop.
   *   `useDataGridNavigation`'s module docblock carries the same record.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move focus one cell to the inline end.',
      wcag: ['2.1.1'],
      apg: 'grid',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move focus one cell to the inline start.',
      wcag: ['2.1.1'],
      apg: 'grid',
      rtl: 'mirrored',
    },
    { key: 'ArrowDown', action: 'Move focus one row down.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'ArrowUp', action: 'Move focus one row up.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'Home', action: 'Move focus to the first cell of the row.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'End', action: 'Move focus to the last cell of the row.', wcag: ['2.1.1'], apg: 'grid' },
    {
      key: 'PageDown',
      action: 'Move focus down ten rows, or to the last row.',
      wcag: ['2.1.1'],
      apg: 'grid',
    },
    {
      key: 'PageUp',
      action: 'Move focus up ten rows, or to the header row.',
      wcag: ['2.1.1'],
      apg: 'grid',
    },
    { key: 'Enter', when: 'header', action: 'Cycle the focused column sort.', wcag: ['2.1.1'], apg: 'grid' },
    { key: ' ', when: 'header', action: 'Cycle the focused column sort.', wcag: ['2.1.1'], apg: 'grid' },
    {
      key: 'Enter',
      modifiers: ['Shift'],
      when: 'header',
      action: 'Add the focused column to the existing sort rather than replacing it.',
      wcag: ['2.1.1'],
      apg: 'grid',
    },
    {
      key: 'Escape',
      when: 'filter open',
      action: 'Close the column filter popover.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'grid',
    },
  ],

  /**
   * Tier C — composite. Sorting, filtering, selection, pagination and column
   * sizing share one grid state, and at realistic row counts correctness and
   * speed stop being separable questions.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names across the data grid family. */
export type DzDataGridPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzDataGrid — every part.
 *
 * The three sub-components are rendered by `DzDataGrid` itself rather than by
 * the consumer (unlike `DzTable`, whose rows and cells are written at the call
 * site), so there is no node `class` already reaches and no key to leave out.
 */
export type DzDataGridUi = UiOverrides<typeof anatomy>
