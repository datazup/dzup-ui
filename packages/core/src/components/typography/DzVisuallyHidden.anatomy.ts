import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzVisuallyHidden — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * One node, and the one component in the catalogue where restyling the part is
 * usually a mistake: the whole contract is that this element is off-screen but
 * available to assistive technology. It is declared anyway, because *the
 * declaration is what makes the promise reviewable* — a consumer who overrides
 * `root` here should be able to see, in the anatomy, that there is exactly one
 * node and that it is the clipping box.
 */
export const anatomy = {
  parts: ['root'],
  states: [],

  /** Empty and measured: no `--dz-visually-hidden-*` property is referenced. */
  componentTokens: [],
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational, and load-bearing for assistive technology. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzVisuallyHiddenPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzVisuallyHidden. */
export type DzVisuallyHiddenUi = UiOverrides<typeof anatomy>
