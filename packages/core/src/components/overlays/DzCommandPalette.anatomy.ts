import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCommandPalette — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * No `root`: everything is portalled out of the component's own position, the
 * same shape as `DzDialogContent`'s declaration.
 *
 * `control` is the search field's visual wrapper — the box a consumer restyles
 * when they want the input to look different — and `input` is the field itself,
 * which is exactly the split `DzInput` established. The visually hidden dialog
 * title and description get no part: they are accessibility affordances, and a
 * part name would invite a consumer to reveal them.
 */
export const anatomy = {
  parts: [
    'overlay',
    'content',
    'control',
    'icon',
    'input',
    'list',
    'group',
    'group-label',
    'item',
    'item-label',
    'suffix',
    'empty',
  ],

  /**
   * `group` and `group-label` render only when `groups` is supplied; `item`,
   * `item-label` and `icon` repeat once per result and `icon` only for items
   * that carry one; `suffix` is the keyboard shortcut, which most items do not
   * have; `empty` shows only when the filter matches nothing.
   */
  optionalParts: ['icon', 'group', 'group-label', 'item', 'item-label', 'suffix', 'empty'],

  /**
   * `open` / `closed` from reka-ui's `DialogContent`; `disabled` and
   * `selected` are the presence-only flags reka writes on a combobox item.
   * `data-highlighted` is the roving cursor, not a condition, and is not
   * declared.
   */
  states: ['open', 'closed', 'disabled', 'selected'],

  /**
   * Empty and measured: the variants read `--dz-overlay-bg`, `--dz-popover`
   * and the global scales, and own no `--dz-command-palette-*` property.
   */
  componentTokens: [],

  /**
   * Mirrors with the document — the search icon leads the field on the inline
   * axis and every row is a logical flex. `keyboard: 'none'`: movement through
   * results is ArrowUp/ArrowDown, on the block axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A dialog shell around a combobox.
   * Meta+K and Control+K are handled by a document-level listener in
   * `DzCommandPalette.vue`, and Escape always closes the palette — a
   * deliberate override of the nested Reka combobox, which would
   * otherwise swallow it.
   */
  keyboard: [
    {
      key: 'k',
      modifiers: ['Meta'],
      action: 'Open the palette from anywhere in the document.',
      wcag: ['2.1.1'],
    },
    {
      key: 'k',
      modifiers: ['Control'],
      action: 'Open the palette from anywhere in the document.',
      wcag: ['2.1.1'],
    },
    { key: 'ArrowDown', action: 'Move to the next result.', wcag: ['2.1.1'], apg: 'combobox' },
    { key: 'ArrowUp', action: 'Move to the previous result.', wcag: ['2.1.1'], apg: 'combobox' },
    { key: 'Enter', action: 'Run the highlighted command.', wcag: ['2.1.1'], apg: 'combobox' },
    { key: 'Escape', action: 'Close the palette.', wcag: ['2.1.1', '2.1.2'], apg: 'dialog' },
  ],

  /**
   * Tier C — a modal, a combobox, a filter and a grouped virtualised result
   * list sharing one selection; correctness and speed stop being separable at
   * a realistic command count.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzCommandPalette. */
export type DzCommandPalettePart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCommandPalette — every node comes from this template. */
export type DzCommandPaletteUi = UiOverrides<typeof anatomy>
