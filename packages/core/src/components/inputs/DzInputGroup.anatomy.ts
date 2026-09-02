import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzInputGroup — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * The shell that seats a field between addons. `prefix` and `suffix` are the
 * addon boxes themselves — not the slot contents a consumer puts in them — and
 * `content` is the box the field sits in, which is what a consumer reaches for
 * when the field must stop or start growing.
 *
 * `root` is the flex row and carries `role="group"`, so it is also the node an
 * assistive technology reports; a consumer restyling the group's border is
 * restyling `root`.
 */
export const anatomy = {
  parts: ['root', 'prefix', 'content', 'suffix'],

  /** Both addons render only when their slot is filled. */
  optionalParts: ['prefix', 'suffix'],

  states: ['disabled'],

  /**
   * Empty, and measured rather than assumed: nothing under
   * `DzInputGroup.{vue,variants.ts,tokens.ts}` references a `--dz-input-group-*`
   * custom property. The group's geometry comes from the field it wraps and
   * from the global spacing scale, so there is no per-component override point
   * to promise. `ui` is the per-instance route.
   */
  componentTokens: [],

  recipes: ['size'],

  /** Addons sit on the inline axis, so the row flips with the document. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Tier A — a presentational shell. It owns no focus, no value and no keyboard
   * contract; the field it wraps owns all three.
   */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzInputGroupPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzInputGroup. */
export type DzInputGroupUi = UiOverrides<typeof anatomy>
