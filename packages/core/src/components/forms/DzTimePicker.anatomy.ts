import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTimePicker — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * The field half is `control` (the row holding the trigger and the cleaner),
 * `trigger` (the combobox button), `label` (the value or the placeholder text
 * inside it), `icon` (the clock glyph) and `clear` (the cleaner button). The
 * panel half is `content`, `panel`, then `list` for the region of choices,
 * `group` for one unit column, `item` for one option, `input` for one native
 * `<select>`, `separator` for the colons, `footer` and `action` for the
 * confirm/cancel pair.
 *
 * **`list` names the same region in both layouts, on purpose.** `selection`
 * switches between a roll of scroll columns and a row of native selects; they
 * are two renderings of one job, and giving them one name is what lets a theme
 * target "the choices" without branching on a prop. What differs *inside* is
 * declared: `group` / `item` exist only in the roll layout, `input` only in the
 * select layout.
 *
 * Left unaddressable, with the reason: the `type="hidden"` input that makes the
 * picker post with a native form has no box, and `<option>` elements inside a
 * native `<select>` are not styleable in a way any part name could promise.
 */
export const anatomy = {
  parts: [
    'root',
    'control',
    'trigger',
    'label',
    'icon',
    'clear',
    'content',
    'panel',
    'list',
    'group',
    'item',
    'input',
    'separator',
    'footer',
    'action',
    'error',
  ],

  /**
   * Everything from `content` down renders only while the panel is open, and
   * `group` / `item` / `input` / `separator` / `action` repeat. `label` is one
   * of two mutually exclusive spans, `icon` renders under `indicator`, and
   * `clear` only when there is a value to clear.
   */
  optionalParts: [
    'label',
    'icon',
    'clear',
    'content',
    'panel',
    'list',
    'group',
    'item',
    'input',
    'separator',
    'footer',
    'action',
    'error',
  ],

  /**
   * `disabled` is both this component's `data-state` and a presence-only
   * attribute; `required` and `invalid` are presence-only; `open` / `closed`
   * come from Reka's popover; `selected` marks the chosen option in each roll
   * column.
   */
  states: ['disabled', 'required', 'invalid', 'open', 'closed', 'selected'],

  /**
   * Empty and measured: `DzTimePicker.tokens.ts` maps to global input and
   * semantic tokens and owns no `--dz-time-picker-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document — the unit columns read in the same order as the
   * text and the popper is placed by Reka's `dir`-aware positioning.
   * `keyboard: 'none'`: the columns scroll on the block axis and the options are
   * plain buttons, so there is no inline arrow contract to swap.
   */
  rtl: { mirrors: 'layout', keyboard: 'none', icons: ['icon'] },

  /**
   * Keyboard contract (TASK-R5-O5). APG `combobox` over a list of times;
   * the arrows move by the configured step.
   *
   * **The four navigation rows were implemented in RESIDUAL-13** (RESIDUAL-12 §4
   * `F3`). `Enter` was already real, because the trigger is a native `<button>`,
   * which is what made the gap precise: the list opened and nothing moved the
   * highlight once it was open. `onTriggerKeydown` owns the "open the list when
   * closed" clause and `onColumnKeydown` owns the movement — per **column**,
   * because a time is chosen from two to four independent unit listboxes and "the
   * next option" in an hours column is the next hour. The `select` layout needs
   * none of it: a native `<select>` owns all four keys itself.
   */
  keyboard: [
    {
      key: 'ArrowDown',
      action: 'Open the time list when closed, otherwise move to the next option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'ArrowUp',
      action: 'Open the time list when closed, otherwise move to the previous option.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    { key: 'Home', when: 'list open', action: 'Move to the first option.', wcag: ['2.1.1'], apg: 'combobox' },
    { key: 'End', when: 'list open', action: 'Move to the last option.', wcag: ['2.1.1'], apg: 'combobox' },
    /**
     * RESIDUAL-14 scoped this row to the `item` part. The sentence was already right
     * and nothing about the behaviour changed; what changed is that the gate can now
     * check it. Unscoped, `yarn validate:anatomy-keyboard` satisfied it with the first
     * activating node in document order, which is the popover **trigger** — whose
     * Enter *opens* the list. The node the row is about is the option
     * `<button type="button">` that calls `selectHour(h)` (and its minute, second and
     * meridiem siblings), and scoping to the part it carries is what points the
     * citation there. RESIDUAL-12 had already written the split down — *"the trigger
     * is a real `<button>` … so the list opens; nothing moves the highlight once it is
     * open"* — and RESIDUAL-13 built the movement half without re-reading where this
     * row had been attributed.
     */
    {
      key: 'Enter',
      when: 'item',
      action: 'Select the highlighted option and close the time list.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'Escape',
      action: 'Close the time list without changing the value.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'combobox',
    },
    {
      key: 'Tab',
      action: 'Move out of the control, closing the time list.',
      wcag: ['2.1.2'],
      apg: 'combobox',
    },
  ],

  /** Tier C — a portalled, locale-aware composite with two panel layouts. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzTimePickerPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTimePicker. */
export type DzTimePickerUi = UiOverrides<typeof anatomy>
