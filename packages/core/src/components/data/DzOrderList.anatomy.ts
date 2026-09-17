import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzOrderList — declared anatomy for the reorderable list (TASK-R5-O2, ADR-19).
 *
 * The move controls are `DzIconButton`s and are their own anatomy boundaries,
 * so `group` names the toolbar that holds them rather than the buttons
 * themselves; `control` is the drag handle, which this component does render.
 *
 * The live region is deliberately unaddressable, for the reason recorded for
 * `DzLightbox` and `DzTour`: it announces the new position after a move, and a
 * part name invites a consumer to make it visible.
 */
export const anatomy = {
  parts: ['root', 'group', 'list', 'item', 'control', 'item-label', 'empty'],

  /**
   * The toolbar renders only under `showControls`, the handle only under
   * `dragHandle`, `item` and `item-label` once per entry, and the placeholder
   * only while the model is empty.
   */
  optionalParts: ['group', 'item', 'control', 'item-label', 'empty'],

  /**
   * `selected` and `grabbed` are the two `data-state` values a row already
   * emitted, and `disabled` the presence-only marker on the root. `grabbed` is
   * this component's own word for "picked up for a keyboard move" and has no
   * synonym in the shared set — which is exactly why states are per-component
   * (ADR-19 §4) rather than a closed union.
   */
  states: ['disabled', 'selected', 'grabbed'],

  /** The `--dz-order-list-*` surface, measured from `DzOrderList.tokens.ts`. */
  componentTokens: [
    '--dz-order-list-gap',
    '--dz-order-list-radius',
    '--dz-order-list-border',
    '--dz-order-list-control-gap',
    '--dz-order-list-item-gap',
    '--dz-order-list-item-bg',
    '--dz-order-list-item-hover-bg',
    '--dz-order-list-item-padding-x',
    '--dz-order-list-item-padding-y',
    '--dz-order-list-item-selected-bg',
    '--dz-order-list-item-selected-fg',
    '--dz-order-list-item-grab-bg',
    '--dz-order-list-grab-shadow',
    '--dz-order-list-handle-color',
    '--dz-order-list-handle-hover',
    '--dz-order-list-drop-indicator-color',
    '--dz-order-list-drop-indicator-size',
    '--dz-order-list-disabled-opacity',
  ],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document — the toolbar's `controlsPosition` is expressed
   * as flex order rather than as a physical side, so it follows the reading
   * direction already. `keyboard: 'none'`: reordering is ArrowUp / ArrowDown,
   * which have no inline axis to reverse.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `listbox` for selection, plus the
   * reordering keys handled in `DzOrderList.vue`. Alt with an arrow moves
   * the item rather than the focus, which is the keyboard alternative SC
   * 2.1.1 requires of a drag-and-drop list.
   */
  keyboard: [
    { key: 'ArrowDown', action: 'Move focus to the next option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'ArrowUp', action: 'Move focus to the previous option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'Home', action: 'Move focus to the first option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'End', action: 'Move focus to the last option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'Enter', action: 'Select the focused option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: ' ', action: 'Select the focused option.', wcag: ['2.1.1'], apg: 'listbox' },
    {
      key: '<character>',
      action: 'Move focus to the next option whose label starts with that character.',
      wcag: ['2.1.1'],
      apg: 'listbox',
    },
    {
      key: 'ArrowUp',
      modifiers: ['Alt'],
      action: 'Move the selected item one position earlier.',
      wcag: ['2.1.1', '2.5.7'],
    },
    {
      key: 'ArrowDown',
      modifiers: ['Alt'],
      action: 'Move the selected item one position later.',
      wcag: ['2.1.1', '2.5.7'],
    },
    {
      key: 'Escape',
      action: 'Cancel the reorder and restore the original position.',
      wcag: ['2.1.1', '2.1.2'],
    },
  ],

  /**
   * Tier C — composite. A roving-focus list, a selection model, a keyboard
   * grab-and-move mode and HTML drag-and-drop share one ordering state.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names on the reorderable list. */
export type DzOrderListPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzOrderList — every part; the tree is generated. */
export type DzOrderListUi = UiOverrides<typeof anatomy>
