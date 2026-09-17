import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCalendar — declared anatomy for the date grid (TASK-R5-O2, ADR-19).
 *
 * Every node is written by this component's own template — there is no
 * sub-component and no consumer markup outside the `day` slot — so `class`
 * reaches the wrapper and nothing else. Nine part names is not verbosity here;
 * it is the difference between "restyle the calendar" and "restyle the
 * calendar's selected day".
 *
 * The grid's three tiers reuse the tabular vocabulary TASK-R5-O1 folded in for
 * `DzTable`: `row` for the weekday header row and each week, `cell` for a
 * weekday label and for a day's grid cell, and `item` for the day button
 * itself — the node that owns focus, the selection and the range treatment.
 *
 * The live region is deliberately unaddressable, for the reason the previous
 * slice recorded for `DzLightbox` and `DzTour`: a part name on a `sr-only`
 * announcer invites a consumer to make it visible, and a visible announcer is a
 * defect.
 */
export const anatomy = {
  parts: ['root', 'header', 'title', 'group', 'action', 'content', 'row', 'cell', 'item'],

  /**
   * `action` is the three navigation controls, `row` the header row plus one
   * per week, `cell` one per weekday label and per day, `item` one per day.
   * All four legitimately render more than once, which is what `optionalParts`
   * records; the rest are unconditional.
   */
  optionalParts: ['action', 'row', 'cell', 'item'],

  /**
   * `disabled` and `selected` are the presence-only markers the root and the
   * day buttons already carried. `today`, `in-range` and `outside-month` are
   * the same shape — presence-only attributes this component sets — and ADR-19
   * §4 puts those in `states` beside the `data-state` values. They were
   * emitted and undeclared before this change, which is precisely the gap the
   * field exists to close: a theme selecting `[data-today]` was relying on an
   * implementation detail.
   */
  states: ['disabled', 'selected', 'today', 'in-range', 'outside-month'],

  /** The `--dz-calendar-*` surface, measured from `DzCalendar.tokens.ts`. */
  componentTokens: [
    '--dz-calendar-cell-size',
    '--dz-calendar-cell-radius',
    '--dz-calendar-cell-foreground',
    '--dz-calendar-cell-hover-bg',
    '--dz-calendar-selected-bg',
    '--dz-calendar-selected-foreground',
    '--dz-calendar-range-bg',
    '--dz-calendar-today-ring',
    '--dz-calendar-header-foreground',
    '--dz-calendar-weekday-foreground',
    '--dz-calendar-outside-foreground',
    '--dz-calendar-outside-opacity',
    '--dz-calendar-disabled-opacity',
  ],

  recipes: ['size'],

  /**
   * Mirrors with the document: in an Arabic calendar the week runs right to
   * left, which is what the logical grid already does.
   * `keyboard: 'swap-horizontal'`: ArrowRight moves to the next day along the
   * inline axis, so it has to retreat in RTL or the grid walks backwards.
   *
   * `icons: ['action']`: the previous / next chevrons point along the reading
   * direction and mirror with it.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['action'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `grid` over the day cells; every
   * row below is handled in `DzCalendar.vue`.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      action: 'Move focus one day to the inline end.',
      wcag: ['2.1.1'],
      apg: 'grid',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      action: 'Move focus one day to the inline start.',
      wcag: ['2.1.1'],
      apg: 'grid',
      rtl: 'mirrored',
    },
    { key: 'ArrowDown', action: 'Move focus one row down.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'ArrowUp', action: 'Move focus one row up.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'Home', action: 'Move focus to the first day of the row.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'End', action: 'Move focus to the last day of the row.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'PageDown', action: 'Move to the next month.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'PageUp', action: 'Move to the previous month.', wcag: ['2.1.1'], apg: 'grid' },
    { key: 'PageDown', modifiers: ['Shift'], action: 'Move to the next year.', wcag: ['2.1.1'], apg: 'grid' },
    {
      key: 'PageUp',
      modifiers: ['Shift'],
      action: 'Move to the previous year.',
      wcag: ['2.1.1'],
      apg: 'grid',
    },
    { key: 'Enter', action: 'Select the focused day.', wcag: ['2.1.1'], apg: 'grid' },
    { key: ' ', action: 'Select the focused day.', wcag: ['2.1.1'], apg: 'grid' },
  ],

  /**
   * Tier C — composite. A roving-focus grid, a range model and month
   * boundaries share one focused-date state, and a mis-stepped arrow key is a
   * correctness failure a primitive alone cannot catch.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names across the calendar. */
export type DzCalendarPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzCalendar — every part; the whole tree is generated. */
export type DzCalendarUi = UiOverrides<typeof anatomy>
