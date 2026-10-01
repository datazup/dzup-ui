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

  /**
   * Keyboard contract (TASK-R5-O5). APG `menu-button`. Home, End and
   * Escape are handled in `DzSpeedDial.vue`; the corner `position` is
   * physical on purpose and no key moves it.
   */
  keyboard: [
    {
      key: 'Enter',
      when: 'trigger',
      action: 'Open or close the action list.',
      wcag: ['2.1.1'],
      apg: 'menu-button',
    },
    {
      key: ' ',
      when: 'trigger',
      action: 'Open or close the action list.',
      wcag: ['2.1.1'],
      apg: 'menu-button',
    },
    /*
     * Added 2026-09-28 (RESIDUAL-12, `undeclared-handler`). `onMenuKeydown` in
     * `DzSpeedDial.vue` has always moved the roving focus along the fan with
     * these four keys — `nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'` —
     * and the table declared only Home, End and Escape, so a reader of the
     * published keyboard section learned that the fan has ends and not that it
     * has steps. The comment above this contract already said *"the roving focus
     * moves with ArrowUp/ArrowDown along the fan"*: the behaviour was known, and
     * only the declaration was missing.
     *
     * `rtl: 'fixed'` on the horizontal pair, and it agrees with this anatomy's
     * `rtl.keyboard: 'none'`: the fan is laid out from a physical corner the
     * user can see, the handler reads `isVertical` and never the document
     * direction, so ArrowRight means "further along the fan" in both writing
     * directions. Declaring `mirrored` here would contradict the rtl contract
     * and `quality/keyboard-contract.spec.ts` would say so.
     */
    { key: 'ArrowDown', when: 'open', action: 'Move focus to the next action in a vertical fan.', wcag: ['2.1.1'], apg: 'menu' },
    { key: 'ArrowUp', when: 'open', action: 'Move focus to the previous action in a vertical fan.', wcag: ['2.1.1'], apg: 'menu' },
    { key: 'ArrowRight', when: 'open', action: 'Move focus to the next action in a horizontal fan.', wcag: ['2.1.1'], apg: 'menu', rtl: 'fixed' },
    { key: 'ArrowLeft', when: 'open', action: 'Move focus to the previous action in a horizontal fan.', wcag: ['2.1.1'], apg: 'menu', rtl: 'fixed' },
    { key: 'Home', when: 'open', action: 'Move focus to the first action.', wcag: ['2.1.1'], apg: 'menu' },
    { key: 'End', when: 'open', action: 'Move focus to the last action.', wcag: ['2.1.1'], apg: 'menu' },
    {
      key: 'Escape',
      action: 'Close the action list and return focus to the trigger.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'menu-button',
    },
  ],

  /** Tier B — owns a roving focus contract and an expanded/collapsed disclosure. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzSpeedDialPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSpeedDial. */
export type DzSpeedDialUi = UiOverrides<typeof anatomy>
