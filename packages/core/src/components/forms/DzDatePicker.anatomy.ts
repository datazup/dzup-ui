import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzDatePicker — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * Two halves, and the declaration names both. The **field** half is always
 * rendered: `control` is Reka's `DatePickerField`, `input` is one date segment
 * (day, month, year and the literal separators between them — it repeats),
 * `trigger` opens the panel and `icon` is the calendar glyph inside it. The
 * **panel** half exists only while open: `content`, then `panel` for the
 * calendar, `header` / `title` / `action` for the navigation strip, and
 * `group` / `row` / `cell` / `item` for the month grid.
 *
 * The grid vocabulary is **`DzCalendar`'s vocabulary**, on purpose. The two
 * components render the same thing and a consumer who has themed one month grid
 * should not have to learn a second set of names for the other; `group` is one
 * month, `row` one week, `cell` one day box and `item` the day control inside
 * it, exactly as `DzCalendar.anatomy.ts` declares them.
 *
 * **`class` reaches `control`, not `root`.** The wrapper is a bare box and
 * every class this component has accepted has landed on the field; documented
 * rather than moved. `ui.root` is the route to the wrapper.
 *
 * Left unaddressable, with the reason: the placeholder span and the segment
 * wrapper are `v-show` text containers with no independent styling job, and
 * `ui.control` reaches both by descendant.
 */
export const anatomy = {
  parts: [
    'root',
    'control',
    'input',
    'trigger',
    'icon',
    'content',
    'panel',
    'header',
    'title',
    'action',
    'group',
    'row',
    'cell',
    'item',
    'error',
  ],

  /**
   * `input`, `action`, `group`, `row`, `cell` and `item` all repeat; everything
   * from `content` down renders only while the panel is open; `error` only with
   * an `error` prop.
   */
  optionalParts: [
    'input',
    'content',
    'panel',
    'header',
    'title',
    'action',
    'group',
    'row',
    'cell',
    'item',
    'error',
  ],

  /**
   * `idle` / `disabled` are this component's own `data-state` on the field;
   * `disabled`, `required` and `invalid` are presence-only; `open` / `closed`
   * and `selected` come from Reka, and a component that re-exports a
   * primitive's state still owns the promise.
   */
  states: ['idle', 'disabled', 'required', 'invalid', 'open', 'closed', 'selected'],

  /**
   * Empty and measured: `DzDatePicker.tokens.ts` maps to global input and
   * semantic tokens and owns no `--dz-date-picker-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document, and the two navigation chevrons are
   * direction-bearing — "previous month" points at the edge the reader came
   * from. `swap-horizontal`: the grid's ArrowLeft/ArrowRight move by one day
   * along the inline axis, which Reka swaps under `dir="rtl"`.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['action', 'icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). A calendar grid inside a combobox:
   * the trigger keys are APG `combobox`, the in-grid keys are APG `grid`
   * and belong to DzCalendar.
   */
  keyboard: [
    {
      key: 'ArrowDown',
      action: 'Open the calendar when closed, otherwise move to the next option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'ArrowUp',
      action: 'Open the calendar when closed, otherwise move to the previous option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    { key: 'Home', when: 'list open', action: 'Move to the first option.', wcag: ['2.1.1'], apg: 'combobox' },
    { key: 'End', when: 'list open', action: 'Move to the last option.', wcag: ['2.1.1'], apg: 'combobox' },
    {
      key: 'Enter',
      action: 'Select the highlighted option and close the calendar.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'Escape',
      action: 'Close the calendar without changing the value.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'combobox',
    },
    {
      key: 'Tab',
      action: 'Move out of the control, closing the calendar.',
      wcag: ['2.1.2'],
      apg: 'combobox',
    },
    {
      key: 'ArrowRight',
      when: 'calendar open',
      action: 'Move one day towards the inline end.',
      wcag: ['2.1.1'],
      apg: 'grid',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      when: 'calendar open',
      action: 'Move one day towards the inline start.',
      wcag: ['2.1.1'],
      apg: 'grid',
      rtl: 'mirrored',
    },
  ],

  /** `class` reaches `control` — the field, not the labelled wrapper (D24). */
  fallthrough: {
    target: 'control',
    reason:
      'D24: `$attrs` binds to `DatePickerField` (`control`). The field is the '
      + 'element a consumer sizes and labels.',
  },

  /** Tier C — a portalled, locale-aware, segmented form control. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzDatePickerPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzDatePicker. */
export type DzDatePickerUi = UiOverrides<typeof anatomy>
