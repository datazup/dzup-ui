import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSpeedDial — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * Three parts, and the two that are missing are missing on purpose.
 *
 * The fan-out trigger is a nested `DzFab` and each action is a nested
 * `DzIconButton`, and **both of those now declare an anatomy of their own**.
 * Putting `data-part="trigger"` on the `<DzFab>` tag would land in that
 * component's `$attrs` and overwrite its own `data-part="root"` — a composed
 * `DzFab` would stop being addressable as a `DzFab`. So this component names
 * only nodes it writes itself, and a consumer reaching the trigger selects the
 * nested component's own `root` inside this component's `root`. That is a
 * property of the composition, not a gap in it.
 *
 * `list` and `item` are the shared-vocabulary names for the menu and its rows;
 * `item` repeats once per action and is therefore optional.
 */
export const anatomy = {
  parts: ['root', 'list', 'item'],
  optionalParts: ['item'],

  /** No `data-state` is emitted today; openness is carried by `aria-expanded` on the trigger. */
  states: [],

  /** Empty and measured: no `--dz-speed-dial-*` property is referenced. */
  componentTokens: [],
  recipes: ['variant', 'size', 'tone'],

  /**
   * The dial is anchored with logical insets and fans out along the block or
   * inline axis depending on `direction`, so it flips with the document.
   * `keyboard: 'none'`: the roving focus moves with ArrowUp/ArrowDown along the
   * fan, which does not swap.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /** Tier B — owns a roving focus contract and an expanded/collapsed disclosure. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzSpeedDialPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSpeedDial. */
export type DzSpeedDialUi = UiOverrides<typeof anatomy>
