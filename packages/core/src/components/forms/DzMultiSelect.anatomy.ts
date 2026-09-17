import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzMultiSelect — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * A `DzOptionsState` host: the three `options-*` parts are declared here under
 * owner decision **D15 / S1-D4, option (d)** — every host of the unexported
 * internal declares them, which is what makes the emission governed.
 *
 * The field side is `control` (Reka's `ComboboxAnchor`), `input`, `clear` and
 * `trigger` with its `icon`; the portalled panel is `content` / `viewport` /
 * `item` / `item-indicator` / `item-label` / `empty`.
 *
 * **The selected-value chips in the field are deliberately unaddressable**, and
 * this is a vocabulary stop rather than an oversight. They are a second
 * repeating collection inside the same component, and the only word that fits
 * them is `tag`, which `ANATOMY_PART_VOCABULARY` does not have. Naming them
 * `item` would make one `ui.item` key hit two visually different things — a
 * chip in the field and a row in the list — which is worse than leaving them to
 * `ui.control` and a descendant selector until the word exists. Recorded, not
 * invented (ADR-19 §3).
 */
export const anatomy = {
  parts: [
    'root',
    'control',
    'input',
    'clear',
    'trigger',
    'icon',
    'content',
    'viewport',
    'item',
    'item-indicator',
    'item-label',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * `clear` renders only with a selection, the whole panel only while open, the
   * items repeat, and the three `options-*` parts render only for an async
   * source that is loading, empty or failed.
   */
  optionalParts: [
    'clear',
    'content',
    'viewport',
    'item',
    'item-indicator',
    'item-label',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /** As `DzCombobox`: its own `idle` / `disabled`, the presence-only set, and Reka's pairs. */
  states: [
    'idle',
    'disabled',
    'invalid',
    'required',
    'open',
    'closed',
    'checked',
    'unchecked',
  ],

  /** Empty and measured — the tokens file maps to global input tokens. */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /** As `DzCombobox`: mirrors with the document, chevron flips, block-axis keys. */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). Reka combobox primitives; Enter
   * toggles rather than closes, because the control keeps accepting
   * selections.
   */
  keyboard: [
    {
      key: 'ArrowDown',
      action: 'Open the list when closed, otherwise move to the next option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'ArrowUp',
      action: 'Open the list when closed, otherwise move to the previous option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    { key: 'Home', when: 'list open', action: 'Move to the first option.', wcag: ['2.1.1'], apg: 'combobox' },
    { key: 'End', when: 'list open', action: 'Move to the last option.', wcag: ['2.1.1'], apg: 'combobox' },
    {
      key: 'Enter',
      action: 'Toggle the highlighted option; the list stays open.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'Escape',
      action: 'Close the list without changing the selection.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'combobox',
    },
    {
      key: 'Backspace',
      when: 'input empty',
      action: 'Remove the last selected value when the text field is empty.',
      wcag: ['2.1.1'],
    },
  ],

  /** Tier C — portalled, async-fed, multi-value, focus-managing. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzMultiSelectPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzMultiSelect. */
export type DzMultiSelectUi = UiOverrides<typeof anatomy>
