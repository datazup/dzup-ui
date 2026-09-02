import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzHeading — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * One node, whose element type is the `tag` prop: `h1`…`h6`. The part name is
 * stable even though the tag is not, which is the whole point of addressing
 * nodes by role rather than by selector.
 */
export const anatomy = {
  parts: ['root'],
  states: [],

  /** Empty and measured: no `--dz-heading-*` property is referenced. */
  componentTokens: [],
  recipes: ['size'],

  /**
   * Headings follow the document direction. `DzHeading.variants.ts` carries the
   * `rtl-physical-ok` marker for its explicit `text-left` / `text-right`
   * alignment values, which are an author's stated choice rather than layout.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier A — presentational. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzHeadingPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzHeading. */
export type DzHeadingUi = UiOverrides<typeof anatomy>
