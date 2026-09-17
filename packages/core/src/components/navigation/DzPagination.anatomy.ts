import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzPagination — declared anatomy for the pager (TASK-R5-O2, ADR-19).
 *
 * Every node except the `<nav>` is generated from `total` and `pageSize`, so
 * `class` reaches the wrapper and nothing else. The five part names split the
 * generated tree the way a consumer actually addresses it:
 *
 * - `action` — the four *edge* controls (first, previous, next, last). They are
 *   one name rather than four because they share a recipe slot
 *   (`styles.button()`) and a consumer styling "the arrows" means all of them;
 *   `first` / `last` / `prev` / `next` are reachable individually through the
 *   slots the component already exposes for exactly that purpose.
 * - `item` — one page number.
 * - `separator` — the ellipsis. It is not an `indicator`: it stands *between*
 *   two runs of pages and marks the gap, which is what a separator does.
 *   Recorded here because the choice is arguable and the next reader should not
 *   have to re-derive it.
 */
export const anatomy = {
  parts: ['root', 'list', 'item', 'action', 'separator'],

  /**
   * `action` repeats and the edge pair renders only under `showEdges`; `item`
   * repeats; `separator` appears only once the page count exceeds the sibling
   * window. `list` is always present.
   */
  optionalParts: ['item', 'action', 'separator'],

  /**
   * `idle` / `disabled` on the root, both already emitted. `selected` is the
   * presence-only marker Reka's `PaginationListItem` puts on the current page
   * (`data-selected`) — undeclared before this change, and the sort of value
   * ADR-19 §4 exists to pull into a per-component enum rather than leave to a
   * primitive.
   */
  states: ['idle', 'disabled', 'selected'],

  /**
   * Empty and measured. Every property `DzPagination.tokens.ts` reads is either
   * a global semantic token or one of `DzButton`'s height tokens, which the
   * pager borrows to match control heights. Borrowing another component's token
   * is not a promise this component may make about it.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document. `keyboard: 'swap-horizontal'`: the pager is a
   * horizontal run of controls and Reka's roving focus moves along the inline
   * axis, so ArrowRight advances in LTR and retreats in RTL.
   *
   * `icons: ['action']`: the chevrons in the edge controls point at the
   * direction they move the page, which is direction-bearing by definition.
   * They are supplied through the `first` / `prev` / `next` / `last` slots, so
   * this entry is a statement to whoever fills those slots, not only to the
   * theme.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['action'] },

  /**
   * Keyboard contract (TASK-R5-O5). Reka pagination primitives. Every
   * page control is a button and is its own tab stop; the component adds
   * no arrow navigation of its own.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next page control; each control is its own tab stop.',
      wcag: ['2.1.2'],
    },
    { key: 'Enter', action: 'Go to the focused page.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', action: 'Go to the focused page.', wcag: ['2.1.1'], apg: 'button' },
  ],

  /** Tier B — a roving-focus control group that owns the page value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on the pager. */
export type DzPaginationPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzPagination — every part; the tree is generated. */
export type DzPaginationUi = UiOverrides<typeof anatomy>
