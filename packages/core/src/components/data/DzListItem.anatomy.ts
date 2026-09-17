import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzListItem — declared anatomy for one list row (TASK-R5-O2, ADR-19).
 *
 * A declaration of its own rather than two more names on `DzList`, because the
 * ownership manifest records `DzListItem` as a `public-component`: it is
 * exported, documented and usable outside a `DzList`, which is the property
 * that makes a component an anatomy boundary. `DzList` is Tier A and outside
 * this packet's scope; when it declares, this component's root will already be
 * the boundary that stops it.
 *
 * `prefix` and `suffix` are slots the consumer fills with their own markup and
 * are therefore reachable with `class` at the call site; the flexible middle
 * `<span>` is rendered by this component and is the node a truncation or
 * two-line-label treatment has to reach.
 */
export const anatomy = {
  parts: ['root', 'item-label'],

  /** Both are unconditional: the row and its content wrapper always render. */

  /**
   * `active` is the `data-state` value the row already emitted for the current
   * entry, and `disabled` the presence-only marker beside it. Neither is new.
   */
  states: ['active', 'disabled'],

  /**
   * Empty and measured: the list family's properties are all global semantic
   * tokens.
   */
  componentTokens: [],

  recipes: ['tone'],

  /**
   * Mirrors with the document — the row reads as text, and the prefix/suffix
   * slots sit at the inline start and end rather than at left and right.
   * `keyboard: 'none'`: activation is a click or Enter, with no inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A list row is presentational until it
   * is interactive, and then it answers the button keys.
   */
  keyboard: [
    { key: 'Enter', when: 'interactive', action: 'Activate the row.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', when: 'interactive', action: 'Activate the row.', wcag: ['2.1.1'], apg: 'button' },
  ],

  /** Tier B — an interactive row owns focus and activation. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on one list row. */
export type DzListItemPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzListItem — the row and its content wrapper.
 *
 * `class` keeps its existing target on the row; `ui['item-label']` is the only
 * route to the flexible middle span.
 */
export type DzListItemUi = UiOverrides<typeof anatomy>
