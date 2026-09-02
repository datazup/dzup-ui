import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCopyButton — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * `parts: ['root']`, deliberately, even though the template writes two icons
 * and two label spans. Every one of them lives **inside a slot with a default**
 * — `#icon` and the default slot — so a consumer who fills the slot replaces
 * the node entirely. A part is a promise about identity, and a node that
 * disappears the moment someone uses the documented extension point cannot
 * carry one.
 *
 * `copied` is the state that matters here and it is already emitted:
 * `data-state="copied"` is how a consumer styles the confirmation without
 * reaching for a class name.
 */
export const anatomy = {
  parts: ['root'],
  states: ['idle', 'copied', 'disabled'],

  /** Empty and measured: no `--dz-copy-button-*` property is referenced. */
  componentTokens: [],
  recipes: ['variant', 'size', 'tone'],
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — a real button: focus, keyboard activation, and a clipboard write. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzCopyButtonPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCopyButton. */
export type DzCopyButtonUi = UiOverrides<typeof anatomy>
