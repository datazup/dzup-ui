import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzPersonaSelector — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * This component renders **no element of its own**: its root *is* a
 * `DzCombobox`, configured with a persona item template. That makes it the
 * wrapper-covers-union* case (the composition rule this rollout wrote down,
 * clause 3, and the shape `DzBackTop` → `DzFab` took in the previous packet):
 * every node in this component's DOM belongs to the combobox, those nodes are
 * genuinely inside this component's boundary and genuinely addressable, so the
 * declaration is the **union** of what the DOM emits rather than a shorter list
 * that would make a conformance check report a defect that is not one.
 *
 * The three `options-*` parts are here for the same reason they are on the
 * other seven hosts (**D15 / S1-D4, option (d)**) — a persona list fed from an
 * API shows exactly that row while it loads or fails.
 *
 * `ui` forwards straight through to the combobox, so one map reaches every part
 * this declaration names.
 *
 * Left unaddressable, with the reason: the avatar image, the initial fallback
 * and the name/role column in the persona row. The avatar needs `media` or
 * `image`, which `ANATOMY_PART_VOCABULARY` does not have — the same request
 * three components in two other families already made (D17) — and the text
 * column is reachable through `ui.item`.
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
   * **Every part is optional here, and that is the honest reading.** This
   * component's own source emits no `data-part` at all — the combobox it
   * renders emits all of them — so from this file's point of view every node is
   * conditional on a child. Marking them optional is what keeps
   * `validate:anatomy-parts` accurate rather than reporting sixteen
   * declarations with nothing behind them; the DOM-level check still requires
   * the root element to carry `data-part="root"`, and it does, because the
   * combobox's root *is* this component's root.
   */
  optionalParts: [
    'root',
    'control',
    'input',
    'trigger',
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

  /** As `DzCombobox`, whose DOM this is. */
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

  /** Empty and measured: it owns no tokens because it owns no element. */
  componentTokens: [],

  /** No recipe of its own: the combobox's `size` and `variant` are not re-exposed. */
  recipes: [],

  /** As `DzCombobox`: mirrors with the document and the chevron flips. */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `listbox` over the persona
   * options.
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
  ],

  /**
   * A pure wrapper: this component renders **no element of its own**. Its root
   * is* a `DzCombobox`, and `$attrs` passes straight through to it.
   *
   * `delegatesTo` is the answer to owner decision D26. Without it the only way
   * to describe this component was to mark all sixteen parts `optional`, which
   * tells a docs reader that a combobox sometimes has no input — false, and a
   * different claim from "another component renders this". `optionalParts`
   * means "sometimes absent, sometimes many"; delegation means "not ours to
   * render", and collapsing the two loses the distinction a consumer needs.
   */
  fallthrough: {
    target: 'root',
    delegatesTo: 'DzCombobox',
    reason:
      'D26: renders no element of its own — the root IS a DzCombobox, which sets '
      + '`inheritAttrs: false` and re-binds `$attrs` onto its own control.',
  },

  /** Tier C — it inherits the combobox's risk surface whole. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzPersonaSelectorPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzPersonaSelector — forwarded to the combobox it renders. */
export type DzPersonaSelectorUi = UiOverrides<typeof anatomy>
