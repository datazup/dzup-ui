import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzRadioGroup — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * One node, for the same reason as `DzCheckboxGroup`: this component is Reka's
 * `RadioGroupRoot` with a layout recipe on it, and every `DzRadio` inside is a
 * declaring component and therefore a boundary.
 */
export const anatomy = {
  parts: ['root'],

  /** Nothing is conditional: the container always renders. */
  optionalParts: [],

  /**
   * `ready` / `disabled` as `data-state`, plus the presence-only `disabled` and
   * `required` the root carries.
   */
  states: ['ready', 'disabled', 'required'],

  /**
   * Empty and measured: `DzRadioGroup.tokens.ts` reads two spacing tokens from
   * the global scale.
   */
  componentTokens: [],

  recipes: ['orientation'],

  /**
   * Mirrors with the document, and unlike the checkbox group this one **does**
   * own a keyboard contract: Reka's roving focus moves with ArrowLeft and
   * ArrowRight on a horizontal group, and those swap in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `radio-group` roving focus. The
   * horizontal arrows follow the writing direction, which is why
   * `rtl.keyboard` is `swap-horizontal`.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move to and select the next radio.',
      wcag: ['2.1.1'],
      apg: 'radio-group',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move to and select the previous radio.',
      wcag: ['2.1.1'],
      apg: 'radio-group',
      rtl: 'mirrored',
    },
    { key: 'ArrowDown', action: 'Move to and select the next radio.', wcag: ['2.1.1'], apg: 'radio-group' },
    { key: 'ArrowUp', action: 'Move to and select the previous radio.', wcag: ['2.1.1'], apg: 'radio-group' },
    { key: ' ', action: 'Select the focused radio.', wcag: ['2.1.1'], apg: 'radio-group' },
    {
      key: 'Tab',
      action: 'Move out of the group; the group is one tab stop.',
      wcag: ['2.1.2'],
      apg: 'radio-group',
    },
  ],

  /** Tier B — owns focus management and a single form value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzRadioGroupPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzRadioGroup. */
export type DzRadioGroupUi = UiOverrides<typeof anatomy>
