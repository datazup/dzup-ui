import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzDataView — declared anatomy for the layout-switching collection
 * (TASK-R5-O2, ADR-19).
 *
 * The component's own DOM is a toolbar, a body and a footer; the controls
 * inside them — `DzSegmented`, `DzPagination`, `DzSkeleton`, `DzEmpty` — are
 * separate components and each is its own anatomy boundary once it declares.
 * Two of the four now do, in this same packet, which is why this declaration is
 * possible at all: before `DzSegmented` and `DzPagination` emitted
 * `data-part="root"`, their states were inside this component's subtree with
 * nothing to stop them.
 *
 * `item` names the wrapper around one record in **both** layouts — the grid
 * cell and the list `<li>`. One name rather than two on purpose: a consumer
 * styling "a record" means the same thing whichever layout is active, and the
 * layout is already selectable as `data-layout` on the root.
 */
export const anatomy = {
  parts: ['root', 'header', 'control', 'list', 'item', 'footer'],

  /**
   * The toolbar renders only when there is something to put in it, the sort
   * `control` only when `sortOptions` is non-empty and the consumer has not
   * taken the slot, the `list` only in list layout, `item` once per record, and
   * the footer only with a paginator or a footer slot.
   */
  optionalParts: ['header', 'control', 'list', 'item', 'footer'],

  /**
   * `disabled` only — the presence-only marker the root already carried.
   * `data-layout` and `data-size` are recipe/mode attributes, not states: they
   * say how the component draws itself, not what condition it is in.
   */
  states: ['disabled'],

  /** Measured from `DzDataView.tokens.ts`. */
  componentTokens: [
    '--dz-data-view-gap',
    '--dz-data-view-toolbar-gap',
    '--dz-data-view-list-divider',
    '--dz-data-view-list-item-padding-x',
    '--dz-data-view-list-item-padding-y',
  ],

  recipes: ['size'],

  /**
   * Mirrors with the document — the toolbar's start and end regions are
   * logical, and the list divider is a logical border. `keyboard: 'none'`: the
   * component handles no keys of its own; the sort select and the paginator do.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A layout switcher over a data set;
   * the keys belong to the controls it renders, not to the view.
   */
  keyboard: [
    { key: 'Tab', action: 'Move between the layout controls and the rendered items.', wcag: ['2.1.2'] },
  ],

  /**
   * Tier C — composite. Two layouts, a sort model, a page window and four
   * delegated controls share one collection state.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names on the data view. */
export type DzDataViewPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzDataView — every part; the chrome is all internal. */
export type DzDataViewUi = UiOverrides<typeof anatomy>
