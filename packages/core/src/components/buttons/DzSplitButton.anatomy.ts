import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSplitButton — declared anatomy (TASK-N2-S1, ADR-19).
 *
 * A compound component: the group shell is this file's `root`, and `action` and
 * `trigger` are emitted by `DzSplitButtonAction` and `DzSplitButtonMenu`, the
 * two compound parts a consumer composes into the default slot.
 *
 * Declaring them **here** rather than giving each part its own anatomy is the
 * pattern `DzTable` already established: the composing component owns the
 * contract, so a consumer reads one document and writes one `ui` map, and the
 * parts stay parts rather than becoming components with contracts of their own.
 * `validate:anatomy-parts` resolves an emission through the ownership
 * manifest's `parentComponent`, so the two files are covered by this
 * declaration and by nothing else.
 *
 * Both are optional because both arrive through a slot: a split button rendered
 * without its menu is unusual, but it is legal and it renders.
 */
export const anatomy = {
  parts: ['root', 'action', 'trigger'],
  optionalParts: ['action', 'trigger'],
  states: ['idle', 'loading', 'disabled'],

  /** Empty and measured: no `--dz-split-button-*` property is referenced. */
  componentTokens: [],
  recipes: ['variant', 'size', 'tone'],

  /** The action and the disclosure sit on the inline axis and flip with the document. */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `menu-button`: the primary half
   * is a button, the secondary half opens the menu.
   */
  keyboard: [
    { key: 'Enter', when: 'root', action: 'Activate the primary action.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', when: 'root', action: 'Activate the primary action.', wcag: ['2.1.1'], apg: 'button' },
    {
      key: 'ArrowDown',
      when: 'trigger',
      action: 'Open the menu and focus its first item.',
      wcag: ['2.1.1'],
      apg: 'menu-button',
    },
    {
      key: 'Enter',
      when: 'trigger',
      action: 'Open the menu and focus its first item.',
      wcag: ['2.1.1'],
      apg: 'menu-button',
    },
    {
      key: 'Escape',
      when: 'menu open',
      action: 'Close the menu and return focus to the trigger.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'menu-button',
    },
  ],

  /** Tier B — two focusable controls sharing one disabled/loading model. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzSplitButtonPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzSplitButton — **`root` only**.
 *
 * `action` and `trigger` are real, declared, selectable parts, and a consumer
 * reaches them from a stylesheet exactly like any other part. They are absent
 * from the `ui` map because the nodes are rendered by *sibling components a
 * consumer composed into the slot*, not by this template: routing classes to
 * them would mean plumbing the map through `DZ_SPLIT_BUTTON_KEY` and having two
 * more components read it, which is a template refactor rather than a styling
 * change — this task's stated stop condition.
 *
 * Narrowing the type is how that limit becomes visible: `:ui="{ action: … }"`
 * is a **type error** rather than a class that silently lands nowhere. Same
 * mechanism `DzTable` uses for the same reason (its `body`/`row`/`cell` are
 * emitted by `DzTableRow` and friends).
 */
export type DzSplitButtonUi = Pick<UiOverrides<typeof anatomy>, 'root'>
