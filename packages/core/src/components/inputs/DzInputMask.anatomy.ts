import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzInputMask — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * Same five-node shape as `DzInput`, on purpose: a consumer who has learned
 * `root` / `control` / `input` on one text field should not have to learn a
 * second vocabulary for the masked one. `control` is the visual field — border,
 * background, focus ring — and is where a bare `class` lands, exactly as it does
 * on `DzInput`.
 *
 * `completed` is declared as a state because the template already emits
 * `data-completed` when the mask is fully filled. It is a real, useful hook (a
 * consumer can green the border the moment a card number is whole) and it was
 * public before it was declared; declaring it is what makes it reviewable.
 */
export const anatomy = {
  parts: ['root', 'control', 'input', 'prefix', 'suffix', 'error'],

  /** The two affixes render only when their slot is filled; `error` only when there is one. */
  optionalParts: ['prefix', 'suffix', 'error'],

  /**
   * `disabled` / `loading` / `readonly` are the `data-state` lifecycle values;
   * `required` and `completed` are presence-only booleans the root already sets.
   */
  states: ['disabled', 'loading', 'readonly', 'required', 'completed'],

  /**
   * Empty and measured: no `--dz-input-mask-*` property is referenced anywhere
   * in this component's own files. It reads `DzInput`'s tokens through the
   * shared wrapper recipe, and those are `DzInput`'s override points to
   * promise, not this component's to re-promise under a second name.
   */
  componentTokens: [],

  recipes: ['variant', 'size', 'tone'],

  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus, a value, and a keydown contract that rewrites input. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzInputMaskPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzInputMask. */
export type DzInputMaskUi = UiOverrides<typeof anatomy>
