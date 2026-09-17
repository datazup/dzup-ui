import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzMention — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `control` is the field box, `input` the `<textarea>` or `<input>` inside it
 * (one or the other, never both — `multiline` decides), and `content` the
 * suggestion menu that opens under the caret. Inside the menu, `loader` is the
 * loading row, `list` / `item` / `item-label` the suggestions, and `empty` the
 * no-results row.
 *
 * **`class` reaches `input`, not `root`.** `$attrs` are bound on the text
 * control, because that is what a consumer passing `class` to a mention field
 * has always been styling. Documented rather than moved; `ui.root` is the route
 * to the wrapper.
 *
 * Deliberately unaddressable, and **not** a vocabulary request: the `sr-only`
 * live region that announces the open list and its count. A part name invites a
 * consumer to make an announcer visible, and a visible announcer is a defect —
 * the precedent `DzLightbox`, `DzTour` and five navigation components set.
 */
export const anatomy = {
  parts: [
    'root',
    'control',
    'input',
    'content',
    'loader',
    'list',
    'item',
    'item-label',
    'empty',
    'error',
  ],

  /**
   * The menu and everything in it render only while a trigger character is
   * active; `loader` and `empty` are the two rows that replace the list; the
   * items repeat.
   */
  optionalParts: ['content', 'loader', 'list', 'item', 'item-label', 'empty', 'error'],

  /**
   * All presence-only on the root, plus `active` — the suggestion under the
   * caret's cursor, which is the option `aria-activedescendant` points at. This
   * component emits no `data-state` value of its own.
   */
  states: ['disabled', 'invalid', 'required', 'readonly', 'loading', 'active'],

  /**
   * Empty and measured: `DzMention.tokens.ts` maps to global input and semantic
   * tokens and owns no `--dz-mention-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'variant'],

  /**
   * Mirrors with the document — the menu is positioned from the caret along the
   * inline axis. `keyboard: 'none'`: the list is navigated with ArrowUp and
   * ArrowDown, which do not swap in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). The trigger character opens the list;
   * the rest is APG `combobox`, handled in `DzMention.vue`.
   */
  keyboard: [
    {
      key: '<character>',
      action: 'Typing the trigger character opens the suggestion list.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'ArrowDown',
      when: 'list open',
      action: 'Move to the next suggestion.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'ArrowUp',
      when: 'list open',
      action: 'Move to the previous suggestion.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'Enter',
      when: 'list open',
      action: 'Insert the highlighted suggestion.',
      wcag: ['2.1.1'],
      apg: 'combobox',
    },
    {
      key: 'Tab',
      when: 'list open',
      action: 'Insert the highlighted suggestion.',
      wcag: ['2.1.2'],
      apg: 'combobox',
    },
    {
      key: 'Escape',
      action: 'Close the suggestion list and keep the typed text.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'combobox',
    },
  ],

  /**
   * `class` reaches `input`, not the outermost node (D24).
   *
   * The editable element is a `<textarea>` or an `<input>` depending on
   * `multiline`; both carry `data-part="input"`, so the declaration holds for
   * either rendering.
   */
  fallthrough: {
    target: 'input',
    reason:
      'D24: `$attrs` binds to the editable control (`input`) — a <textarea> or '
      + 'an <input> by `multiline` — not the wrapper that holds the suggestion list.',
  },

  /** Tier C — a caret-tracking combobox over an async source. */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzMentionPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzMention. */
export type DzMentionUi = UiOverrides<typeof anatomy>
