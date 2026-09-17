import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzScrollArea — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * **Three nodes are deliberately left unaddressable, and this is a vocabulary
 * stop rather than an omission.** The variants file names five regions —
 * `root`, `viewport`, `scrollbar`, `thumb`, `corner` — and the ADR-19 shared
 * vocabulary has words for only the first two. `indicator` does not mean a
 * scrollbar, and inventing `scrollbar` / `thumb` / `corner` here would be
 * exactly the drift ADR-19 §3 forbids: a name ships, and renaming a shipped
 * part name is breaking. They are recorded in the TASK-R5-O2 handoff as a
 * vocabulary request; until the vocabulary grows, those nodes stay reachable
 * through `scrollbarClass` and the component's own props.
 */
export const anatomy = {
  parts: ['root', 'viewport'],

  /**
   * Neither is conditional: reka-ui's `ScrollAreaRoot` always renders a
   * viewport, and it is the node a consumer needs when the scroll surface has
   * to take padding the scrollbars do not.
   */
  states: [],

  /**
   * Empty and measured: `DzScrollArea.variants.ts` reads global semantic
   * tokens (`--dz-border`, `--dz-radius-*`) and owns no `--dz-scroll-area-*`
   * property.
   */
  componentTokens: [],

  recipes: ['orientation'],

  /**
   * Mirrors with the document — reka-ui places the vertical scrollbar on the
   * inline-end edge, so an RTL document gets it on the left, which is correct.
   * `keyboard: 'swap-horizontal'`: the horizontal scrollbar moves along the
   * inline axis, so ArrowRight advances in LTR and retreats in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). Reka scroll-area primitives.
   * Scrolling by keyboard is the platform contract on the focused
   * viewport; the component adds no key of its own, and its
   * `rtl.keyboard` is `swap-horizontal` because the viewport scroll
   * origin follows the writing direction.
   */
  keyboard: 'none',

  /**
   * Tier B — it owns a focusable scroll region and its scrollbars are
   * interactive; a defect strands content a keyboard user cannot reach.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzScrollArea. */
export type DzScrollAreaPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzScrollArea. */
export type DzScrollAreaUi = UiOverrides<typeof anatomy>
