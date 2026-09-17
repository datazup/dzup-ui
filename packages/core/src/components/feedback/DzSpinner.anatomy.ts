import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSpinner — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * **Declared out of tier order, deliberately.** TASK-R5-O2's scope excludes
 * Tier A work "unless it unblocks a Tier B parent", and this is that case:
 * `DzSpinner` is rendered inside `DzInput`, `DzButton`, `DzTextarea` and
 * `DzBlockUI`, it emits `data-state="loading"`, and until it declared an
 * anatomy of its own it was not an **anatomy boundary** — so every parent that
 * composed it inherited a state it does not own. The N2-S1 handoff §10 named it
 * for exactly this reason ("should be declared next regardless of family
 * order"). Declaring `root` here is what makes the boundary rule in
 * `expectAnatomy` apply (a descendant carrying `data-part="root"` is another
 * component's root and is not descended into).
 *
 * Two nodes stay unaddressable on purpose: the `<svg>` glyph and the
 * screen-reader label. The glyph is the whole component — `root` reaches it —
 * and the visually hidden label is an accessibility affordance, not a styling
 * surface; giving it a part name would invite a consumer to style it visible.
 */
export const anatomy = {
  parts: ['root'],

  /** The single value the template emits, unconditionally. */
  states: ['loading'],

  /**
   * Empty and measured: `DzSpinner.variants.ts` reads the global size scale and
   * the semantic tone ramps, and owns no `--dz-spinner-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'tone'],

  /**
   * `mirrors: 'none'` — the animation spins clockwise in every writing
   * direction, which is what a progress indicator means, and there is no box
   * geometry to flip. `keyboard: 'none'`: it takes no focus.
   */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Presentational; it takes no focus.
   */
  keyboard: 'none',

  /** Tier A — presentational; a live-region status with no focus of its own. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzSpinner. */
export type DzSpinnerPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSpinner. Not wired: `root` is what `class` already targets. */
export type DzSpinnerUi = UiOverrides<typeof anatomy>
