import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzPasswordInput — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * `DzInput`'s shape plus one node: `toggle`, the show/hide control.
 *
 * `toggle` is outside the shared vocabulary. `action` and `trigger` were both
 * considered and both are worse — this button opens nothing and performs no
 * action on the value, it flips a presentation mode, and it is the single most
 * likely node in the component for a consumer to restyle or to hide outright
 * in a high-assurance context. A name that says what it is beats a vocabulary
 * word that says something else.
 */
export const anatomy = {
  parts: ['root', 'control', 'input', 'prefix', 'spinner', 'toggle', 'error'],

  /** `prefix` only when its slot is filled, `spinner` only while loading, `error` only when set. */
  optionalParts: ['prefix', 'spinner', 'error'],

  states: ['disabled', 'loading', 'readonly', 'required'],

  /**
   * Empty and measured: no `--dz-password-input-*` property exists. The field is
   * `DzInput`'s wrapper recipe and its tokens are `DzInput`'s to promise.
   */
  componentTokens: [],

  recipes: ['variant', 'size', 'tone'],

  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns focus and a value, and gates what is on screen. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzPasswordInputPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzPasswordInput. */
export type DzPasswordInputUi = UiOverrides<typeof anatomy>
