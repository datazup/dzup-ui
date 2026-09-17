import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTabs — declared anatomy for the tabs family (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy declared on the parent.** `DzTabList`, `DzTabTrigger` and
 * `DzTabContent` are `compound-part`s of `DzTabs` in the ownership manifest;
 * they emit `list`, `trigger` / `close` and `content` and never `root`, so a
 * composed tab set conforms to one declaration.
 *
 * `close` is the per-tab dismiss button behind `closable`. It is the one node
 * in the family with no call site at all — the consumer writes a closable
 * trigger and the button appears — so a part name is the only way to reach it,
 * and `DzTabTriggerUi` makes it typed.
 */
export const anatomy = {
  parts: ['root', 'list', 'trigger', 'content', 'close'],

  /**
   * Everything but the root comes from consumer markup and repeats: a tab set
   * with no tab list is legitimate (the triggers can live anywhere), a trigger
   * renders once per tab, and only the active `content` is mounted unless
   * `forceMount` is set.
   */
  optionalParts: ['list', 'trigger', 'content', 'close'],

  /**
   * `ready` on the root, plus the `active` / `inactive` pair Reka's
   * `TabsTrigger` and `TabsContent` put on themselves and the presence-only
   * `disabled` marker a trigger carries. The last three are a primitive's
   * vocabulary; declaring them is what makes a selector on
   * `data-part="trigger"` plus `data-state="active"` a supported contract
   * rather than an observation about the current dependency.
   *
   * `data-closable` is not a state: it says the author allowed the tab to be
   * dismissed, which is a capability, not a condition.
   */
  states: ['ready', 'active', 'inactive', 'disabled'],

  /**
   * Empty and measured. Every property `DzTabs.tokens.ts` reads is either a
   * global semantic token or one of `DzButton`'s height tokens, borrowed so a
   * trigger matches control heights — borrowing is not a promise this component
   * may make about another's token.
   */
  componentTokens: [],

  recipes: ['size', 'variant', 'tone', 'orientation'],

  /**
   * Mirrors with the document, and `keyboard: 'swap-horizontal'` because a
   * horizontal tab list is a roving-focus row: ArrowRight advances in LTR and
   * has to retreat in RTL or focus leaves the reading order.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). Reka `TabsRoot` over the APG `tabs`
   * pattern. Which of the two activation modes applies is the
   * `activationMode` prop, and both are declared rather than collapsed.
   */
  keyboard: [
    {
      key: 'ArrowRight',
      when: 'horizontal',
      action: 'Move to the next tab.',
      wcag: ['2.1.1'],
      apg: 'tabs',
      rtl: 'mirrored',
    },
    {
      key: 'ArrowLeft',
      when: 'horizontal',
      action: 'Move to the previous tab.',
      wcag: ['2.1.1'],
      apg: 'tabs',
      rtl: 'mirrored',
    },
    { key: 'ArrowDown', when: 'vertical', action: 'Move to the next tab.', wcag: ['2.1.1'], apg: 'tabs' },
    { key: 'ArrowUp', when: 'vertical', action: 'Move to the previous tab.', wcag: ['2.1.1'], apg: 'tabs' },
    { key: 'Home', action: 'Move to the first tab.', wcag: ['2.1.1'], apg: 'tabs' },
    { key: 'End', action: 'Move to the last tab.', wcag: ['2.1.1'], apg: 'tabs' },
    {
      key: 'Enter',
      when: 'activationMode manual',
      action: 'Activate the focused tab.',
      wcag: ['2.1.1'],
      apg: 'tabs',
    },
    {
      key: ' ',
      when: 'activationMode manual',
      action: 'Activate the focused tab.',
      wcag: ['2.1.1'],
      apg: 'tabs',
    },
    {
      key: 'Tab',
      action: 'Move out of the tab list to the active panel; the list is one tab stop.',
      wcag: ['2.1.2'],
      apg: 'tabs',
    },
  ],

  /** Tier B — focus management, keyboard activation and a controlled value. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the tabs family. */
export type DzTabsPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTabs — the one node it renders itself. */
export type DzTabsUi = Pick<UiOverrides<typeof anatomy>, 'root'>

/**
 * `ui` prop shape for DzTabTrigger — the close button.
 *
 * The trigger's own element takes `class` at the call site; the dismiss button
 * it renders under `closable` has no call site of its own.
 */
export type DzTabTriggerUi = Pick<UiOverrides<typeof anatomy>, 'close'>
