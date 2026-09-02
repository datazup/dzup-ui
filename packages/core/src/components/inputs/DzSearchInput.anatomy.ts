import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSearchInput — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * `DzInput`'s shape with the affixes specialised: the leading node is always a
 * magnifying glass this component renders itself, so it is `icon` rather than
 * `prefix`, and `clear` matches the name `DzInput` already uses for the same
 * job. The trailing `suffix` is a bare slot with no wrapper element of its own,
 * so it is **not** a part — a part names a node, and there is no node.
 */
export const anatomy = {
  parts: ['root', 'control', 'icon', 'input', 'spinner', 'clear', 'error'],

  /** `spinner` only while loading, `clear` only when there is something to clear, `error` only when set. */
  optionalParts: ['spinner', 'clear', 'error'],

  states: ['disabled', 'readonly', 'loading', 'required'],

  /**
   * Empty and measured: no `--dz-search-input-*` property exists. The field is
   * `DzInput`'s wrapper recipe.
   */
  componentTokens: [],

  recipes: ['variant', 'size', 'tone'],

  /**
   * `icons` names the direction-bearing icons, and a magnifying glass is not
   * one — the anatomy type's own example says so. It mirrors its layout and
   * mirrors none of its glyphs.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus, a value and an Escape/Enter keyboard contract. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzSearchInputPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSearchInput. */
export type DzSearchInputUi = UiOverrides<typeof anatomy>
