import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCaption — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * One node: the `<small>` element. `parts: ['root']` rather than `'none'` —
 * the component renders a real element, and `'none'` is reserved for the
 * renderless case.
 */
export const anatomy = {
  parts: ['root'],
  states: [],

  /** Empty and measured: no `--dz-caption-*` property is referenced. */
  componentTokens: [],
  recipes: ['tone'],
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzCaptionPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCaption. */
export type DzCaptionUi = UiOverrides<typeof anatomy>
