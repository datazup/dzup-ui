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
   * Keyboard contract (TASK-R5-O5, three rows corrected by RESIDUAL-14). APG
   * `listbox` for selection, plus the reordering keys handled in `DzOrderList.vue`.
   *
   * **Reordering is a grab, not a modifier.** The table used to say `Alt`+`ArrowUp` /
   * `Alt`+`ArrowDown` *"move the selected item"*, and `Space` *"select the focused
   * option"*. Measured against `DzOrderList.vue`:
   *
   * - `case ' ': case 'Spacebar':` at `:501` calls `toggleGrab(index)`. Space **grabs
   *   and drops**; it does not select. `Enter` at `:506` is what calls
   *   `toggleSelection`, and it already said so.
   * - the `ArrowUp` / `ArrowDown` arms at `:475` / `:482` move the item when
   *   `grabbedIndex !== null` and move the focus otherwise. **`altKey` is read in
   *   exactly one place in the file** — inside `typeAhead`, where it *rejects* the
   *   key — so `Alt`+`ArrowUp` has never done anything `ArrowUp` does not, and the
   *   precondition is the grab.
   *
   * So the three rows now name the grab, and `when: 'grabbed'` is the declared state
   * that distinguishes them from the two focus-navigation rows carrying the same keys.
   * The behaviour is unchanged and is still the SC 2.1.1 / 2.5.7 keyboard alternative
   * to dragging — it is the *description* that was wrong.
   *
   * `yarn validate:anatomy-keyboard` read all three as `backed` because it keyed on
   * `binding.key` and never on `binding.modifiers`, and because `keysNamedIn` records
   * the first line a key appears on, which for `' '` is the type-ahead's exclusion of
   * it. Both are fixed; these rows would have failed the first.
   *
   * **The rejected alternative was to implement `Alt`+arrow as declared** and keep the
   * rows. It was rejected because the grab model is the one APG describes for a
   * reorderable list, it is what the component's `grabbed` state, `itemGrabbed` style
   * and `Escape`-cancels-the-reorder row are all built around, and adding a second
   * way to do the same thing would double the surface to document and to test in
   * order to make a sentence true that was simply mis-transcribed.
   */
  keyboard: [
    { key: 'ArrowDown', action: 'Move focus to the next option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'ArrowUp', action: 'Move focus to the previous option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'Home', action: 'Move focus to the first option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'End', action: 'Move focus to the last option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'Enter', action: 'Select the focused option.', wcag: ['2.1.1'], apg: 'listbox' },
    {
      key: ' ',
      action: 'Grab the focused item for reordering, or drop it when it is already grabbed.',
      wcag: ['2.1.1', '2.5.7'],
    },
    {
      key: '<character>',
      action: 'Move focus to the next option whose label starts with that character.',
      wcag: ['2.1.1'],
      apg: 'listbox',
    },
    {
      key: 'ArrowUp',
      when: 'grabbed',
      action: 'Move the grabbed item one position earlier.',
      wcag: ['2.1.1', '2.5.7'],
    },
    {
      key: 'ArrowDown',
      when: 'grabbed',
      action: 'Move the grabbed item one position later.',
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
