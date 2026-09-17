import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzListbox — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * A `DzOptionsState` host: `options-state`, `options-message` and
 * `options-retry` are declared here because owner decision **D15 / S1-D4 was
 * taken as option (d)** — the unexported internal's parts are governed only
 * when **every** component that imports it declares them, which is the rule
 * `validate:anatomy-parts` already implements.
 *
 * Unlike the combobox family this control has no popup: `control` is Reka's
 * `ListboxRoot` (the box `class` already targeted), `input` the optional filter
 * field, `viewport` the scrolling list, then `group` / `group-label` /
 * `item` / `icon` / `item-label` / `item-indicator` for the options and `empty`
 * for the nothing-to-show row.
 *
 * Left unaddressable, with the reason: the wrapper around the filter field is a
 * layout box with no independent styling job and `ui.input` reaches the control
 * inside it.
 */
export const anatomy = {
  parts: [
    'root',
    'control',
    'input',
    'viewport',
    'group',
    'group-label',
    'item',
    'icon',
    'item-label',
    'item-indicator',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * `input` renders only under `filter`, `group` / `group-label` only for
   * grouped options, the items repeat, `icon` only for options that carry one,
   * `item-indicator` only under `checkmark`, and the three `options-*` parts
   * only for an async source that is loading, empty or failed.
   */
  optionalParts: [
    'input',
    'group',
    'group-label',
    'item',
    'icon',
    'item-label',
    'item-indicator',
    'empty',
    'error',
    'options-state',
    'options-message',
    'options-retry',
  ],

  /**
   * All presence-only on the control, plus Reka's per-item `checked` /
   * `unchecked`. This component emits no `data-state` value of its own, which
   * is itself worth declaring — a theme author reading this knows to select on
   * the boolean attributes.
   */
  states: ['disabled', 'invalid', 'required', 'readonly', 'loading', 'checked', 'unchecked'],

  /** The `--dz-listbox-*` surface, measured from `DzListbox.tokens.ts`. */
  componentTokens: [
    '--dz-listbox-bg',
    '--dz-listbox-fg',
    '--dz-listbox-border',
    '--dz-listbox-radius',
    '--dz-listbox-active-ring',
    '--dz-listbox-item-active-bg',
    '--dz-listbox-item-selected-bg',
    '--dz-listbox-item-selected-fg',
  ],

  recipes: ['size'],

  /**
   * Mirrors with the document. `keyboard: 'none'`: a listbox navigates the
   * block axis with ArrowUp/ArrowDown, and those do not swap in RTL —
   * declaring `swap-horizontal` here would copy a rule from tabs to a component
   * whose arrows point the other way.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Reka listbox primitives over APG
   * `listbox`.
   */
  keyboard: [
    { key: 'ArrowDown', action: 'Move focus to the next option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'ArrowUp', action: 'Move focus to the previous option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'Home', action: 'Move focus to the first option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'End', action: 'Move focus to the last option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: 'Enter', action: 'Select the focused option.', wcag: ['2.1.1'], apg: 'listbox' },
    { key: ' ', action: 'Select the focused option.', wcag: ['2.1.1'], apg: 'listbox' },
    {
      key: '<character>',
      action: 'Move focus to the next option whose label starts with that character.',
      wcag: ['2.1.1'],
      apg: 'listbox',
    },
  ],

  /** Tier B — owns focus, a roving list contract and a form value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzListboxPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzListbox. */
export type DzListboxUi = UiOverrides<typeof anatomy>
