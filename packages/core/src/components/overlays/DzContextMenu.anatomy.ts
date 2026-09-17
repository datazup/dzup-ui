import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzContextMenu — declared anatomy for the context-menu family
 * (TASK-R5-O2, ADR-19).
 *
 * The same shape as `DzDropdownMenu.anatomy.ts`, and for the same reasons: no
 * `root` (the component renders reka-ui's `ContextMenuRoot` around a bare
 * slot), and no `trigger` part (the trigger renders `as-child`, so a part name
 * would be stamped on the consumer's own element — N2-S1 S1-F3/S1-D2).
 *
 * It is a separate declaration rather than a shared one because the two
 * families have separate compound parts, separate ownership entries and
 * separate docs pages; one declaration covering both would answer "what can I
 * style?" for a component the reader is not looking at.
 */
export const anatomy = {
  parts: ['content', 'item', 'prefix', 'suffix', 'separator'],

  /** Every part is composed by the consumer, and all but `content` repeat. */
  optionalParts: ['content', 'item', 'prefix', 'suffix', 'separator'],

  /**
   * `open` / `closed` from reka-ui's `ContextMenuContent`; `disabled` is the
   * presence-only flag on a disabled item. `data-highlighted` is reka's
   * roving-focus cursor, not a state.
   */
  states: ['open', 'closed', 'disabled'],

  /** Empty and measured: global semantic tokens only. */
  componentTokens: [],

  /**
   * Mirrors with the document — the menu opens toward the reading direction
   * and the item padding is logical. `keyboard: 'none'`: movement is on the
   * block axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['suffix'] },

  /** Tier B — focus trap, roving focus, typeahead, Escape. */
  /**
   * Keyboard contract (TASK-R5-O5). APG `menu`, opened by Shift+F10 or
   * the context-menu key rather than by a trigger. The horizontal rows
   * carry no `rtl` marker: this component declares `rtl.keyboard:
   * 'none'`, and a row marked mirrored would contradict it (owner
   * decision D36).
   */
  keyboard: [
    {
      key: 'ArrowDown',
      action: 'Move focus to the next item, wrapping at the end.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    {
      key: 'ArrowUp',
      action: 'Move focus to the previous item, wrapping at the start.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    { key: 'Home', action: 'Move focus to the first item.', wcag: ['2.1.1'], apg: 'menu' },
    { key: 'End', action: 'Move focus to the last item.', wcag: ['2.1.1'], apg: 'menu' },
    { key: 'Enter', action: 'Invoke the focused item and close the menu.', wcag: ['2.1.1'], apg: 'menu' },
    { key: ' ', action: 'Invoke the focused item and close the menu.', wcag: ['2.1.1'], apg: 'menu' },
    {
      key: 'ArrowRight',
      when: 'item with a submenu',
      action: 'Open the focused item submenu and focus its first item.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    {
      key: 'ArrowLeft',
      when: 'submenu open',
      action: 'Close the current submenu and return to its parent item.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
    {
      key: 'Escape',
      action: 'Close the menu and return focus to the trigger.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'menu',
    },
    {
      key: '<character>',
      action: 'Move focus to the next item whose label starts with that character.',
      wcag: ['2.1.1'],
      apg: 'menu',
    },
  ],

  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the context-menu family. */
export type DzContextMenuPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for the context-menu family. */
export type DzContextMenuUi = UiOverrides<typeof anatomy>
