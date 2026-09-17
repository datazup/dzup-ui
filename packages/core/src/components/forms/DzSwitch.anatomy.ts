import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSwitch — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `root` is the `<label>`, `control` is Reka's `SwitchRoot` (the track that
 * owns focus and the checked value), `indicator` is `SwitchThumb`, and `label`
 * is the text column.
 *
 * The names are the checkbox's names on purpose. The track/thumb pair reads
 * naturally as `track` / `thumb`, and both were rejected: neither is in the
 * ADR-19 vocabulary, both would be one component's private words, and
 * `control` / `indicator` say the same thing in the words every other selection
 * control in this catalogue already uses.
 *
 * This declaration also closes a check the previous packet recorded as blocked:
 * `DzColorModeToggle`'s `switch` variant renders a `DzSwitch`, which was not an
 * anatomy boundary while it declared nothing, so its `checked` / `unchecked`
 * leaked into the toggle's subtree (D20).
 */
export const anatomy = {
  parts: ['root', 'control', 'indicator', 'label'],

  /** The thumb always renders; the text column only when the slot is filled. */
  optionalParts: ['label'],

  /**
   * `checked` / `unchecked` are emitted as `data-state` by both the label and
   * Reka's track; `disabled` and `required` are the presence-only attributes.
   */
  states: ['checked', 'unchecked', 'disabled', 'required'],

  /** Empty and measured — `DzSwitch.tokens.ts` maps to global control tokens. */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document, and the thumb is direction-bearing: "on" is the
   * end of the track the reader travels towards, so the travel flips with the
   * layout.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['indicator'] },

  /**
   * Keyboard contract (TASK-R5-O5). Reka `SwitchRoot` renders a `button`,
   * so Enter activates as well as Space. APG names Space; the Enter row
   * is what this implementation actually does.
   */
  keyboard: [
    { key: ' ', action: 'Toggle the switch.', wcag: ['2.1.1'], apg: 'switch' },
    {
      key: 'Enter',
      action: 'Toggle the switch — the underlying element is a button, so Enter activates it.',
      wcag: ['2.1.1'],
      apg: 'switch',
    },
  ],

  /** Tier B — owns focus and a boolean form value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzSwitchPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSwitch. */
export type DzSwitchUi = UiOverrides<typeof anatomy>
