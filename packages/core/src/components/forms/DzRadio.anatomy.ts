import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzRadio — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * The same four nodes as `DzCheckbox`, deliberately: a consumer who has themed
 * one selection control should not have to learn a second vocabulary for the
 * other. `root` is the `<label>`, `control` is Reka's `RadioGroupItem`,
 * `indicator` is `RadioGroupIndicator`, and `label` is the text column.
 *
 * The filled dot inside the indicator is left unaddressable: it is a `<span>`
 * with no job but to be the visible mark, and `indicator` already reaches it.
 */
export const anatomy = {
  parts: ['root', 'control', 'indicator', 'label'],

  /** Reka mounts the indicator only while the item is selected. */
  optionalParts: ['indicator', 'label'],

  /**
   * `idle` / `disabled` are this component's own `data-state`; `checked` and
   * `unchecked` come from Reka's item, and `disabled` / `invalid` are the
   * presence-only attributes the label carries.
   *
   * `active` is the one nobody had written down (the same class of finding as
   * `DzSegmented`'s in the previous packet): Reka's `RovingFocusItem` marks the
   * member holding the group's single tab stop with `data-active`. It has
   * shipped since this component was written, it is selectable, and it was
   * undeclared and undocumented until the conformance check reported it.
   */
  states: ['idle', 'checked', 'unchecked', 'disabled', 'invalid', 'active'],

  /** Empty and measured — `DzRadio.tokens.ts` maps to global control tokens. */
  componentTokens: [],

  recipes: ['size'],

  /** Mirrors with the document; arrow keys move on the group's axis, not this one. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). One radio inside a group. The arrow
   * keys belong to the group, which is the single tab stop; this row set
   * is what a focused radio itself answers.
   */
  keyboard: [
    { key: ' ', action: 'Select the focused radio.', wcag: ['2.1.1'], apg: 'radio-group' },
  ],

  /** Tier B — owns focus and a form value inside a roving-focus group. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzRadioPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzRadio. */
export type DzRadioUi = UiOverrides<typeof anatomy>
