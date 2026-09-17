import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTagsInput — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * Four nodes, and the reason there are only four is the boundary rule doing its
 * job: `root` is the wrapper (and the target `class` already had), `control`
 * the `role="group"` field, `input` the text field, `error` the `role="alert"`
 * line — and every committed token is a **`DzChip`**, which declares its own
 * anatomy and emits `data-part="root"`. The chips' surface is therefore
 * `DzChip`'s promise, not this component's, and a consumer restyling them
 * reaches for `DzChip`'s parts rather than a set this component would have to
 * keep in sync.
 *
 * That also makes this the answer to the question `DzMultiSelect` and
 * `DzTreeSelect` had to leave open: where a chip is a component, no `tag` part
 * name is needed at all.
 *
 * Deliberately unaddressable: the `sr-only` live region announcing the token
 * count (a part name invites making an announcer visible), and the
 * `type="hidden"` inputs that post the tokens with a native form.
 */
export const anatomy = {
  parts: ['root', 'control', 'input', 'error'],

  /** The error line is the only conditional node. */
  optionalParts: ['error'],

  /**
   * `disabled` is both a `data-state` value and a presence-only attribute; the
   * rest are presence-only on the root.
   */
  states: ['disabled', 'invalid', 'required', 'readonly', 'loading'],

  /**
   * Empty and measured: `DzTagsInput.tokens.ts` maps to global input and chip
   * tokens and owns no `--dz-tags-input-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document — tokens then caret run with the text.
   * `keyboard: 'none'`: Backspace removes the last token and Enter commits one,
   * and neither has an inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A text field that turns tokens into
   * tags. Every row is handled in `DzTagsInput.vue`.
   */
  keyboard: [
    { key: 'Enter', action: 'Commit the pending token as a tag.', wcag: ['2.1.1'] },
    {
      key: 'Backspace',
      when: 'input empty',
      action: 'Remove the last tag when the field is empty.',
      wcag: ['2.1.1'],
    },
    {
      key: '<character>',
      action: 'A configured delimiter character commits the pending token.',
      wcag: ['2.1.1'],
    },
  ],

  /** Tier B — owns focus transfer between chips and field, and a multi-value form contract. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzTagsInputPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTagsInput. */
export type DzTagsInputUi = UiOverrides<typeof anatomy>
