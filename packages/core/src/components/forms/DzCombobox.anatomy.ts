import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCombobox — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * One of the **seven `DzOptionsState` hosts**, and the first field of this
 * declaration to read is the last three parts. `DzOptionsState.vue` is an
 * unexported internal that renders the one row a selection control shows while
 * its options are loading, empty or failed; it emits `options-state`,
 * `options-message` and `options-retry` into every control that imports it.
 * Owner decision **D15 / S1-D4 was taken as option (d)** — *every host declares
 * the three itself* — which is exactly the rule `validate:anatomy-parts`
 * already implements for an unmanifested internal, so no schema change and no
 * new mechanism were needed. Declaring them here is what makes that row part of
 * **this** component's contract rather than an orphan emission.
 *
 * The rest is the `DzSelect` pilot's shape: `control` is Reka's
 * `ComboboxAnchor` (the field box, and the target `class` already had),
 * `input` the text field, `clear` the cancel button, `trigger` the disclosure
 * button and `icon` the chevron inside it, then `content` / `viewport` /
 * `item` / `item-indicator` / `item-label` / `empty` in the portalled panel.
 *
 * The `DzSpinner` the trigger renders while loading declares its own anatomy
 * and emits `data-part="root"`, so the boundary rule stops there — the reason
 * that component was declared out of tier order in the first packet.
 *
 * `content` and everything under it render into a **portal**, so a conformance
 * check on the mounted wrapper sees only the field side.
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
   * `clear` renders only with a value, `icon` only while not loading, the whole
   * panel only while open, the items repeat, and the three `options-*` parts
   * render only when the control is fed by an async source that is loading,
   * empty or failed.
   */
  optionalParts: [
    'clear',
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
   * `idle` / `disabled` are this component's own `data-state` on the anchor;
   * `disabled`, `invalid`, `required` and `loading` are presence-only;
   * `open` / `closed` and `checked` / `unchecked` come from Reka, and a
   * component that re-exports a primitive's state still owns the promise.
   */
  states: [
    'idle',
    'disabled',
    'invalid',
    'required',
    'loading',
    'open',
    'closed',
    'checked',
    'unchecked',
  ],

  /**
   * Empty and measured: `DzCombobox.tokens.ts` maps to global input and
   * semantic tokens and owns no `--dz-combobox-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document, and the chevron is direction-bearing — it points
   * at the panel it opens. `keyboard: 'none'`: a listbox navigates the block
   * axis, and ArrowUp/ArrowDown do not swap in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). Reka combobox primitives over APG
   * `combobox`, with the text field filtering the list.
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
      action: 'Select the highlighted option and close the list.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'Escape',
      action: 'Close the list without changing the value.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'combobox',
    },
    { key: 'Tab', action: 'Move out of the control, closing the list.', wcag: ['2.1.2'], apg: 'combobox' },
  ],

  /** Tier C — portalled, async-fed, focus-managing, form-bearing. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzComboboxPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCombobox. */
export type DzComboboxUi = UiOverrides<typeof anatomy>
