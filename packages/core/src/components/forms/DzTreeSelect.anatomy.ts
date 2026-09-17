import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTreeSelect — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * A `DzOptionsState` host: the three `options-*` parts are declared here under
 * owner decision **D15 / S1-D4, option (d)**.
 *
 * `trigger` is the combobox button (the target `class` already had), `label`
 * the value column inside it and `icon` the chevron. The panel is a `DzPopover`
 * pair: `DzPopover` renders no element of its own and `DzPopoverContent` emits
 * `content` and `indicator` as **compound parts of its parent**, not as a root
 * — so by the *wrapper-covers-union* clause those two names are inside this
 * component's boundary and are declared here rather than hidden. `input` is the
 * filter field, `empty` the nothing-to-show row.
 *
 * The tree itself is a `DzTree`, which declares its own anatomy and emits
 * `data-part="root"`, so the boundary rule stops there: this component promises
 * nothing about a node's internals.
 *
 * **This declaration closes the check the previous packet recorded as blocked**
 * (D20): `DzTreeSelect.vue:746` emits `:data-state="checkboxState(node.key)"`,
 * one of the six expressions `validate:anatomy-parts` cannot resolve to a
 * literal. The static gate still cannot read the call — that is a limit of
 * reading source, not of the contract — but the function's three possible
 * return values are `'checked' | 'indeterminate' | 'unchecked'` and all three
 * are declared below, so the values are governed by the anatomy and asserted in
 * `forms.anatomy.spec.ts`. An unresolvable expression whose whole range is
 * declared is a different thing from an ungoverned one.
 *
 * **The selected-value chips in the multiple-selection trigger are deliberately
 * unaddressable** — the same vocabulary stop as `DzMultiSelect`: the word they
 * need is `tag`, and `ANATOMY_PART_VOCABULARY` does not have it.
 */
export const anatomy = {
  parts: [
    'root',
    'trigger',
    'label',
    'icon',
    'content',
    'indicator',
    'input',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * Everything from `content` down renders only while the panel is open;
   * `indicator` is the popover arrow, which this component turns off;
   * `input` needs `filter`; the three `options-*` parts need an async source
   * that is loading, empty or failed.
   */
  optionalParts: [
    'content',
    'indicator',
    'input',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * `idle` / `open` / `disabled` are this component's own `data-state` on the
   * trigger; `disabled`, `invalid`, `readonly`, `required` and `loading` are
   * presence-only; `closed` comes from Reka's popover; and `checked` /
   * `unchecked` / `indeterminate` are the three values `checkboxState()` can
   * return on a node's tick box — see the note above.
   */
  states: [
    'idle',
    'open',
    'closed',
    'disabled',
    'invalid',
    'readonly',
    'required',
    'loading',
    'checked',
    'unchecked',
    'indeterminate',
  ],

  /** Empty and measured — the tokens file maps to global input tokens. */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document, and the chevron is direction-bearing — it points
   * at the panel it opens. `keyboard: 'none'` on this component: the tree's own
   * ArrowLeft/ArrowRight collapse/expand contract belongs to `DzTree`, which
   * declares it, and re-declaring it here would make two components own one
   * promise.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['icon'] },

  /** Tier C — portalled, async-fed, tri-state selection over a recursive tree. */
  /**
   * Keyboard contract (TASK-R5-O5). A tree inside a combobox: the list
   * keys are APG `combobox`, the expand and collapse keys are APG
   * `treeview`, and both are handled in `DzTreeSelect.vue`. The
   * horizontal rows carry no `rtl` marker: this component declares
   * `rtl.keyboard: 'none'`, and a row marked mirrored would contradict it
   * (owner decision D36).
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
    { key: 'ArrowRight', action: 'Expand the focused node.', wcag: ['2.1.1'], apg: 'treeview' },
    {
      key: 'ArrowLeft',
      action: 'Collapse the focused node, or move to its parent.',
      wcag: ['2.1.1'],
      apg: 'treeview',
    },
    { key: ' ', action: 'Select the focused node.', wcag: ['2.1.1'], apg: 'listbox' },
  ],

  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzTreeSelectPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTreeSelect. */
export type DzTreeSelectUi = UiOverrides<typeof anatomy>
