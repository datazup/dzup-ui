import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCheckbox — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * The four-node shape every checkbox converges on, and every name here is
 * already in `ANATOMY_PART_VOCABULARY`: the `<label>` this component renders is
 * `root`, Reka's `CheckboxRoot` (the box that owns focus and the checked value)
 * is `control`, `CheckboxIndicator` is `indicator`, and the text column is
 * `label`.
 *
 * `control` rather than a second `root`: the box is Reka's element, not another
 * dzup-ui component, so it is inside this component's anatomy boundary and
 * naming it `root` would make `expectAnatomy` stop there and never see the
 * indicator.
 *
 * Deliberately unaddressable: the Minus / Check glyphs. They are swapped by
 * state, not by theme, and `indicator` is the node a consumer restyles to
 * change either of them.
 */
export const anatomy = {
  parts: ['root', 'control', 'indicator', 'label'],

  /**
   * Reka mounts `CheckboxIndicator` only while the box is checked or
   * indeterminate, and the text column renders only when the default slot is
   * filled — a bare checkbox in a table cell has neither.
   */
  optionalParts: ['indicator', 'label'],

  /**
   * `checked` / `unchecked` / `indeterminate` are emitted as `data-state` by
   * both the label and Reka's box; `disabled` and `required` are the
   * presence-only attributes ADR-19 section 4 defines, and `required` is the
   * one this component added so a stylesheet could show a required field as
   * required.
   */
  states: ['checked', 'unchecked', 'indeterminate', 'disabled', 'required'],

  /**
   * Empty and measured: `DzCheckbox.tokens.ts` maps to global control and
   * semantic tokens (`--dz-control-focus-ring-*`, `--dz-primary`, `--dz-border`)
   * and owns no `--dz-checkbox-*` property a consumer could set.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document — box then label runs with the text, and every
   * utility in `DzCheckbox.variants.ts` is logical. `keyboard: 'none'`: Space
   * toggles and has no inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Reka `CheckboxRoot`, which implements
   * the APG `checkbox` pattern. Space toggles; Enter does NOT, because
   * the control is not a button.
   */
  keyboard: [
    {
      key: ' ',
      action: 'Toggle the checkbox, cycling through the indeterminate state when the control is tri-state.',
      wcag: ['2.1.1'],
      apg: 'checkbox',
    },
  ],

  /** Tier B — owns focus, a form value and a tri-state contract. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzCheckboxPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCheckbox. */
export type DzCheckboxUi = UiOverrides<typeof anatomy>
