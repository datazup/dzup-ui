import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzDateRangePicker — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `DzDatePicker`'s anatomy with one node added: `separator`, the dash between
 * the start and end segment runs. Everything else is the same shape and the
 * same names, which is the point — a range picker is a date picker with two
 * segment runs, and the contract should read that way.
 *
 * **`class` reaches `control`, not `root`** — same existing target, documented
 * rather than moved.
 */
export const anatomy = {
  parts: [
    'root',
    'control',
    'input',
    'separator',
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
   * The segments repeat on both ends; everything from `content` down renders
   * only while the panel is open.
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

  /** As `DzDatePicker`. */
  states: ['idle', 'disabled', 'required', 'invalid', 'open', 'closed', 'selected'],

  /** Empty and measured — the tokens file maps to global input tokens. */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /** As `DzDatePicker`: mirrors with the document, chevrons and grid arrows flip. */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal', icons: ['action', 'icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). Two calendar grids inside one
   * combobox; the second Enter closes the range.
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
      'D24: `$attrs` binds to `DateRangePickerField` (`control`). Identical '
      + 'shape to DzDatePicker.',
  },

  /** Tier C — a portalled, locale-aware, two-ended segmented form control. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzDateRangePickerPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzDateRangePicker. */
export type DzDateRangePickerUi = UiOverrides<typeof anatomy>
