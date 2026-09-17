import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCascader — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * A `DzOptionsState` host: the three `options-*` parts are declared here under
 * owner decision **D15 / S1-D4, option (d)**.
 *
 * The field side is `trigger` (the combobox button `class` already targeted),
 * `label` (the value or the placeholder text inside it), `clear` and `icon`.
 * The portalled panel is `content` → `panel`, an optional `input` for the path
 * filter, then the region of choices.
 *
 * **`list` names that region in both layouts, on purpose** — the same call the
 * `DzTimePicker` declaration makes. With a filter query the panel renders a
 * flat list of matching paths; without one it renders sliding columns. They are
 * two renderings of one job, and giving them one name lets a theme target "the
 * choices" without branching on state. What differs inside is declared:
 * `group` is one column and exists only in the column layout.
 *
 * Left unaddressable, with the reason: the `<li>` wrappers around the column
 * options are presentational (`role="presentation"`) and giving them a name
 * would offer two selectors for one visual box — the precedent
 * `DzMegaMenu` set; the `type="hidden"` input that posts the path with a native
 * form has no box; the wrapper around the filter field is a layout box
 * `ui.input` already reaches.
 */
export const anatomy = {
  parts: [
    'root',
    'trigger',
    'label',
    'clear',
    'icon',
    'content',
    'panel',
    'input',
    'list',
    'group',
    'item',
    'item-label',
    'item-indicator',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * Everything from `content` down renders only while the panel is open;
   * `group`, `item`, `item-label` and `item-indicator` repeat; `clear` needs a
   * value; `input` needs `filter`; the three `options-*` parts need an async
   * source that is loading, empty or failed.
   */
  optionalParts: [
    'clear',
    'content',
    'panel',
    'input',
    'list',
    'group',
    'item',
    'item-label',
    'item-indicator',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * `disabled` is both this component's `data-state` and a presence-only
   * attribute; `invalid`, `readonly`, `required` and `loading` are
   * presence-only; `open` / `closed` come from Reka's popover; `selected` and
   * `active` are this component's own markers on a column option — `active`
   * being the cell holding the panel's single tab stop.
   */
  states: [
    'disabled',
    'invalid',
    'readonly',
    'required',
    'loading',
    'open',
    'closed',
    'selected',
    'active',
  ],

  /** Empty and measured — the tokens file maps to global input tokens. */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document, and both chevrons are direction-bearing: the
   * trigger's points at the panel it opens, and the per-option arrow points at
   * the column that opens next, which is the direction the reader travels.
   * `swap-horizontal`: ArrowLeft and ArrowRight move between columns, so they
   * swap with the layout.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['icon', 'item-indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). Reka combobox primitives plus the
   * column movement handled in `DzCascader.vue`. The horizontal arrows
   * cross columns and follow the writing direction.
   */
  keyboard: [
    {
      key: 'ArrowDown',
      action: 'Open the panel when closed, otherwise move to the next option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'ArrowUp',
      action: 'Open the panel when closed, otherwise move to the previous option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    { key: 'Home', when: 'list open', action: 'Move to the first option.', wcag: ['2.1.1'], apg: 'combobox' },
    { key: 'End', when: 'list open', action: 'Move to the last option.', wcag: ['2.1.1'], apg: 'combobox' },
    {
      key: 'Enter',
      action: 'Select the highlighted option and close the panel.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'Escape',
      action: 'Close the panel without changing the value.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'combobox',
    },
    { key: 'Tab', action: 'Move out of the control, closing the panel.', wcag: ['2.1.2'], apg: 'combobox' },
    {
      key: 'ArrowRight',
      action: 'Move into the focused option child column.',
      wcag: ['2.1.1'],
      apg: 'combobox',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move back to the parent column.',
      wcag: ['2.1.1'],
      apg: 'combobox',
      rtl: 'mirrored',
    },
    { key: ' ', action: 'Select the highlighted option.', wcag: ['2.1.1'], apg: 'combobox' },
  ],

  /** Tier C — portalled, async-fed, multi-column, focus-managing. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzCascaderPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCascader. */
export type DzCascaderUi = UiOverrides<typeof anatomy>
