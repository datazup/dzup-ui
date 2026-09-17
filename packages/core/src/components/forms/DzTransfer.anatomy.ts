import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTransfer — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * A `DzOptionsState` host: the three `options-*` parts are declared here under
 * owner decision **D15 / S1-D4, option (d)**.
 *
 * The shape is two of everything, and `optionalParts` is what records that:
 * `list` is one of the two panes, `header` its caption row, `hint` its
 * "selected / total" counter, `input` its search field, `body` its scrolling
 * option region and `empty` its nothing-to-show row — each appearing **twice**,
 * once for the source and once for the target. `group` is the column of
 * transfer buttons between them, `action` one of those buttons and `icon` the
 * chevron inside it.
 *
 * `body` rather than a second `viewport`: TASK-R5-O1 folded `body` into the
 * vocabulary as "the repeating region of a tabular or sectioned component",
 * which is exactly what each pane's option region is.
 */
export const anatomy = {
  parts: [
    'root',
    'control',
    'list',
    'header',
    'hint',
    'input',
    'body',
    'item',
    'item-indicator',
    'item-label',
    'empty',
    'group',
    'action',
    'icon',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * Everything from `list` down appears once per pane, so all of it repeats;
   * `input` needs `searchable`; `empty` needs a pane with nothing in it; the
   * three `options-*` parts need an async source that is loading, empty or
   * failed.
   */
  optionalParts: [
    'list',
    'header',
    'hint',
    'input',
    'body',
    'item',
    'item-indicator',
    'item-label',
    'empty',
    'action',
    'icon',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * `disabled` is both a `data-state` value and a presence-only attribute;
   * `invalid` and `required` are presence-only on the group; `checked` marks a
   * selected option's tick box, and it is emitted as `data-checked="true"`,
   * which ADR-19 §4 counts as present.
   */
  states: ['disabled', 'invalid', 'required', 'checked'],

  /**
   * Empty and measured: `DzTransfer.tokens.ts` maps to global semantic tokens
   * and owns no `--dz-transfer-*` property.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document, and the two transfer chevrons are the clearest
   * direction-bearing icons in the family: "move to target" points at the pane
   * the reader travels towards, so it flips with the layout.
   * `keyboard: 'none'`: the panes are `role="listbox"` navigated on the block
   * axis, and the transfer buttons are plain buttons.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). Two listboxes and the controls
   * between them; the listbox keys are APG `listbox` and the move is the
   * buttons own activation.
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
      key: 'Enter',
      when: 'transfer action',
      action: 'Move the selected items to the other list.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
  ],

  /** Tier C — two focus regions, a multi-value form contract and an async source. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzTransferPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTransfer. */
export type DzTransferUi = UiOverrides<typeof anatomy>
