import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzPopconfirm — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * **No `root`, but a real `trigger`.** The component renders a two-node
 * fragment: a `<span>` wrapper it owns, and a teleported `role="alertdialog"`
 * panel. There is no single element to call `root`, so the wrapper is named for
 * what it is.
 *
 * That wrapper is this family's exception to the rule the menus and tooltips
 * follow: it is a real element **this** component renders, not an `as-child`
 * merge onto the consumer's markup, so naming it costs nothing and stamps
 * nobody else's node.
 */
export const anatomy = {
  parts: ['trigger', 'panel', 'header', 'icon', 'body', 'title', 'description', 'action'],

  /**
   * Only the trigger wrapper is unconditional. The panel and everything under
   * it render behind `v-if="open"`, the icon needs an `icon` prop or slot, and
   * the description needs a `description`.
   */
  optionalParts: ['panel', 'header', 'icon', 'body', 'title', 'description', 'action'],

  /**
   * No `data-state`: the panel is mounted and unmounted rather than kept in the
   * DOM in a closed state, so there is no closed element to carry a value.
   */
  states: [],

  /** Measured — every `--dz-popconfirm-*` the variants read. */
  componentTokens: [
    '--dz-popconfirm-bg',
    '--dz-popconfirm-fg',
    '--dz-popconfirm-border',
    '--dz-popconfirm-shadow',
    '--dz-popconfirm-radius',
    '--dz-popconfirm-width',
    '--dz-popconfirm-padding',
  ],

  recipes: ['tone'],

  /**
   * Mirrors with the document — the icon leads the body on the inline axis and
   * the panel's placement is computed by floating-ui against the writing
   * direction. `keyboard: 'none'`: confirm and cancel are reached by Tab.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `alertdialog` in a popover shell.
   */
  keyboard: [
    {
      key: 'Escape',
      action: 'Dismiss the confirmation without taking the action.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'alertdialog',
    },
    {
      key: 'Tab',
      action: 'Move between the actions, wrapping inside the confirmation.',
      wcag: ['2.1.2'],
      apg: 'alertdialog',
    },
    {
      key: 'Tab',
      modifiers: ['Shift'],
      action: 'Move backwards between the actions.',
      wcag: ['2.1.2'],
      apg: 'alertdialog',
    },
  ],

  /**
   * Multi-root: the trigger `<span>` this component renders and the teleported
   * panel. `$attrs` binds to the **panel**.
   *
   * Worth stating because the trigger is the node in the document flow and
   * therefore the intuitive guess. The panel is the target because it is the
   * thing a consumer styles, and because the panel is teleported — an `id` on
   * the trigger would not describe it.
   */
  fallthrough: {
    target: 'panel',
    reason:
      'Multi-root (trigger span + teleported panel). `$attrs` binds to the '
      + 'panel, which is the node a consumer restyles.',
  },

  /**
   * Tier B — `role="alertdialog"` with focus moved to the confirm control and
   * Escape dismissal.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzPopconfirm. */
export type DzPopconfirmPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzPopconfirm — every node comes from this template. */
export type DzPopconfirmUi = UiOverrides<typeof anatomy>
