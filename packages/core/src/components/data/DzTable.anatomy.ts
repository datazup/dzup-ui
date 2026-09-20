import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTable — declared anatomy for the table family (TASK-OSS-P3-03, ADR-19).
 *
 * The data-heavy pilot, substituted for the packet's `DzDataTable`: **there is
 * no `DzDataTable` in this catalog.** `DzTable` plus its five compound parts is
 * the data-heavy component, and it carries the property the pilot was chosen
 * for — a virtualised scroll window (`virtualScroll`), where the rendered rows
 * are a moving subset of the data.
 *
 * **This is a family anatomy, declared on the parent.** Unlike DzSelect, where
 * every node comes from one template, a table's nodes are spread across
 * `DzTableHeader`, `DzTableBody`, `DzTableRow`, `DzTableCell` and
 * `DzTableFooter`. Declaring each separately would answer "what can I style on
 * a table?" in six places, and would make a conformance check on a composed
 * table report its own children as undeclared parts.
 *
 * The `ui` prop follows the split that actually matters to a consumer:
 *
 * - nodes **DzTable itself renders** and nobody else can reach — the scroll
 *   container, the `<table>`, the `<caption>` — are `ui` keys;
 * - nodes the consumer **writes themselves** (`<DzTableRow>`, `<DzTableCell>`)
 *   already take `class` at the call site, so `ui` would be a second way to do
 *   what one line of markup already does.
 *
 * Three part names — `body`, `row`, `cell` — are outside the shared vocabulary
 * in `@dzup-ui/contracts`, deliberately. Table semantics have no synonym for
 * them, and ADR-19 §3 admits a component-specific name when the vocabulary has
 * none; `validate:ownership` lists such names so the vocabulary grows by
 * decision rather than by accident.
 */
export const anatomy = {
  parts: [
    'root',
    'content',
    'title',
    'header',
    'body',
    'row',
    'cell',
    'footer',
    'separator',
    'step-decrease',
    'step-increase',
  ],

  /**
   * Only the scroll container and the `<table>` are unconditional. A caption
   * needs a slot; header, body, footer, rows and cells are composed by the
   * consumer, and under `virtualScroll` the rows present are a window onto the
   * data rather than all of it.
   *
   * `separator` is the column-resize handle on a header cell — it has carried
   * `role="separator"` since TASK-R2-O5 and now carries the `data-part` to
   * match. `step-decrease` / `step-increase` are the WCAG 2.2 SC 2.5.7
   * single-pointer pair that overlays that header cell (owner decision **D117
   * option A**, 2026-09-19). All three render only on a header cell that sets
   * `resizable` and a `colId`, which is why none of them is unconditional.
   */
  optionalParts: [
    'title',
    'header',
    'body',
    'row',
    'cell',
    'footer',
    'separator',
    'step-decrease',
    'step-increase',
  ],

  /**
   * `ready`/`loading` on the root, `selected` and `expanded` on a row.
   * `data-virtual` is a rendering MODE, not a state, and is not declared: it
   * says how the table draws itself, not what condition it is in.
   *
   * `expanded` was added on 2026-09-04 by TASK-R5-O2, taking owner decision
   * **D11** option (a). `DzTableRow.vue:99` has emitted it on the expansion row
   * since before the state gate existed; TASK-R5-O1 could only initialise
   * `maxUndeclaredStates` at 1 because declaring it makes the ownership
   * manifest stale and that packet was not free to regenerate it. This one is,
   * so the declaration and the regeneration land together and the ceiling goes
   * to 0.
   */
  states: ['ready', 'loading', 'selected', 'expanded'],

  /**
   * Empty for the same reason as DzSelect: `DzTable.tokens.ts` maps to global
   * semantic tokens (`--dz-border`, `--dz-muted`, `--dz-transition-fast`) and
   * owns no `--dz-table-*` custom property of its own.
   */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Tier B: correct alone, breakable in combination. It is not focus-managing
   * in its own right, but virtualisation, pinned cells, expandable rows and
   * `aria-busy` interact — and a virtualised table that misreports its row set
   * is wrong in a way a screen reader cannot recover from.
   */
  /**
   * Mirrors with the document. Column order follows the reading direction,
   * which is what `text-start` on the header and body cells now expresses —
   * they were `text-left`, so an Arabic table left-aligned every cell against
   * the wrong edge.
   *
   * `keyboard: 'swap-horizontal'`: a data table's cell navigation moves along
   * the inline axis, so ArrowRight advances in LTR and retreats in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). A static table takes no keyboard of
   * its own; what it owns is the sort control on a sortable header,
   * implemented by `useDataGridHeader`.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next interactive cell or header control; the table itself is not a tab stop.',
      wcag: ['2.1.2'],
      apg: 'table',
    },
    {
      key: 'Enter',
      when: 'header sortable',
      action: 'Cycle the focused column sort.',
      wcag: ['2.1.1'],
      apg: 'table',
    },
    {
      key: ' ',
      when: 'header sortable',
      action: 'Cycle the focused column sort.',
      wcag: ['2.1.1'],
      apg: 'table',
    },
    {
      key: 'Enter',
      modifiers: ['Shift'],
      when: 'header sortable',
      action: 'Add the focused column to the existing sort rather than replacing it.',
      wcag: ['2.1.1'],
      apg: 'table',
    },
    // The column-resize handle. It has behaved this way since column resizing
    // shipped; TASK-R2-O5 declared it, because a keyboard contract nobody wrote
    // down is one a docs page cannot publish and a reviewer cannot check.
    // `2.5.7` sits beside `2.1.1` on both rows because the same step is now
    // reachable by a single pointer press on the stepper pair beside the
    // handle (owner decision D117 option A, 2026-09-19).
    {
      key: 'ArrowRight',
      when: 'header resizable',
      action: 'Widen the column by 8px, or 24px with Shift.',
      wcag: ['2.1.1', '2.5.7'],
      apg: 'table',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      when: 'header resizable',
      action: 'Narrow the column by 8px, or 24px with Shift, never below its minimum width.',
      wcag: ['2.1.1', '2.5.7'],
      apg: 'table',
      rtl: 'mirrored',
    },
  ],

  /**
   * Tier C — composite. Several primitives share one selection and sort state,
   * and at realistic row counts correctness and speed stop being separable
   * questions.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names across the table family. */
export type DzTablePart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzTable — the nodes DzTable itself renders.
 *
 * `row` and `cell` are reachable with `class` at the call site, so they are
 * part of the anatomy without being `ui` keys.
 */
export type DzTableUi = Pick<UiOverrides<typeof anatomy>, 'root' | 'content' | 'title'>
