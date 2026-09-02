import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzText — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * One node, whose element type is the `as` prop.
 *
 * **`componentTokens: []` is deliberate and worth the paragraph.** This
 * component reads `--dz-text-xs` … `--dz-text-xl`, and the ownership
 * generator's prefix heuristic (`DzText` → `--dz-text-`) reports all five as
 * component tokens read but not declared. They are not this component's
 * tokens: `--dz-text-*` is the **global typography scale**, shared by every
 * component in the catalogue, and declaring them here would advertise that
 * re-mapping `--dz-text-sm` restyles `DzText` when in fact it restyles the
 * whole library. The report is right about the reference and wrong about the
 * ownership; the declaration is where the truth goes.
 */
export const anatomy = {
  parts: ['root'],
  states: [],
  componentTokens: [],
  recipes: ['size', 'tone'],

  /**
   * Prose follows the document direction. `DzText.variants.ts` carries the
   * `rtl-physical-ok` marker for its explicit alignment values.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzTextPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzText. */
export type DzTextUi = UiOverrides<typeof anatomy>
