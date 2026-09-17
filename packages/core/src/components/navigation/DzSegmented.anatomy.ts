import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSegmented — declared anatomy for the segmented control
 * (TASK-R5-O2, ADR-19).
 *
 * Two nodes, both generated from the `items` prop: the `ToggleGroupRoot` track
 * and one `ToggleGroupItem` per entry. `class` lands on the track, so `ui.item`
 * is the only way to reach a segment without a descendant selector.
 *
 * Declaring this component was also a prerequisite for `DzColorModeToggle` and
 * `DzDataView`, both of which render one: until it emitted `data-part="root"`
 * it was not an anatomy boundary, so its `on`/`off` values were inside their
 * subtrees with nothing to stop them. Same mechanism `DzSpinner` needed in the
 * previous slice.
 */
export const anatomy = {
  parts: ['root', 'item'],

  /** One segment per entry; an empty `items` array legitimately renders none. */
  optionalParts: ['item'],

  /**
   * `idle` / `disabled` on the track, both already emitted, plus the `on` /
   * `off` pair Reka's `ToggleGroupItem` puts on each segment. The last two are
   * a primitive's vocabulary rather than this library's, and declaring them is
   * how they stop being invisible: a consumer writing
   * `[data-part="item"][data-state="on"]` is relying on them either way.
   *
   * `active` is the fourth, and it was found by the conformance check rather
   * than by reading the template: Reka's `RovingFocusItem` puts `data-active`
   * on the segment holding the group's single tab stop. It is a real,
   * presence-only state a consumer can and does select on, and it was
   * undeclared and undocumented until this declaration.
   */
  states: ['idle', 'disabled', 'on', 'off', 'active'],

  /**
   * Empty and measured: `DzSegmented.tokens.ts` maps to global semantic tokens
   * and owns no `--dz-segmented-*` property.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * Mirrors with the document, and `keyboard: 'swap-horizontal'` because Reka's
   * toggle group is a roving-focus row: ArrowRight moves to the next segment
   * along the inline axis, which reverses in an Arabic document.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `radio-group` roving focus over
   * the segments.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move to and select the next segment.',
      wcag: ['2.1.1'],
      apg: 'radio-group',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move to and select the previous segment.',
      wcag: ['2.1.1'],
      apg: 'radio-group',
      rtl: 'mirrored',
    },
    { key: 'ArrowDown', action: 'Move to and select the next segment.', wcag: ['2.1.1'], apg: 'radio-group' },
    {
      key: 'ArrowUp',
      action: 'Move to and select the previous segment.',
      wcag: ['2.1.1'],
      apg: 'radio-group',
    },
    { key: ' ', action: 'Select the focused segment.', wcag: ['2.1.1'], apg: 'radio-group' },
    {
      key: 'Tab',
      action: 'Move out of the group; the group is one tab stop.',
      wcag: ['2.1.2'],
      apg: 'radio-group',
    },
  ],

  /** Tier B — an interactive primitive that owns a value and focus. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on the segmented control. */
export type DzSegmentedPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzSegmented — both parts; the tree is generated. */
export type DzSegmentedUi = UiOverrides<typeof anatomy>
