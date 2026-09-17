import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzStatCard — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * **Two nodes are deliberately left unaddressable.** The metric itself and the
 * trend chip have no word in the ADR-19 shared vocabulary. `value` and `trend`
 * are the names the template's own tv() slots use, both are outside the
 * vocabulary, and ADR-19 §3 makes a missing word a decision rather than an
 * invention — so they are recorded in the TASK-R5-O2 handoff as a vocabulary
 * request and are not emitted here. The metric is still reachable: it is the
 * only child of `header`'s sibling, and the `value` slot lets a consumer
 * replace it outright.
 */
export const anatomy = {
  parts: ['root', 'header', 'title', 'icon', 'description'],

  /**
   * `icon` renders only when the `icon` prop or slot is supplied, and
   * `description` only when `trendValue` or `description` is set.
   */
  optionalParts: ['icon', 'description'],

  /** `ready` — the single value the template emits. */
  states: ['ready'],

  /** Measured: the five `--dz-card-*` properties the variants read. */
  componentTokens: [
    '--dz-card-radius',
    '--dz-card-padding',
    '--dz-card',
    '--dz-card-foreground',
    '--dz-card-border-color',
  ],

  recipes: ['variant'],

  /**
   * Mirrors with the document — the header is a `flex … justify-between` row,
   * so the icon follows the reading direction, and every spacing utility in
   * `DzStatCard.variants.ts` is logical. `keyboard: 'none'`: it handles no keys.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Presentational.
   */
  keyboard: 'none',

  /** Tier A — presentational; it takes no focus of its own. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzStatCard. */
export type DzStatCardPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzStatCard — every node comes from this template. */
export type DzStatCardUi = UiOverrides<typeof anatomy>
