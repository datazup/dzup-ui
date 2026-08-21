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
  parts: ['root', 'content', 'title', 'header', 'body', 'row', 'cell', 'footer'],

  /**
   * Only the scroll container and the `<table>` are unconditional. A caption
   * needs a slot; header, body, footer, rows and cells are composed by the
   * consumer, and under `virtualScroll` the rows present are a window onto the
   * data rather than all of it.
   */
  optionalParts: ['title', 'header', 'body', 'row', 'cell', 'footer'],

  /**
   * `ready`/`loading` on the root, `selected` on a row. `data-virtual` is a
   * rendering MODE, not a state, and is not declared: it says how the table
   * draws itself, not what condition it is in.
   */
  states: ['ready', 'loading', 'selected'],

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

  riskTier: 'B',
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
