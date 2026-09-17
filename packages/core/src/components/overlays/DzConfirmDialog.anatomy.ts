import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzConfirmDialog — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * **The wrapper case of the parent-covers rule.** This component is not a
 * shell around compound parts of its own: it *renders another declared public
 * component*, `DzDialog` + `DzDialogContent`, and fills it. `DzDialogContent`
 * emits `overlay`, `content` and `viewport` — never `root` — so it is not an
 * anatomy boundary, and those three nodes are genuinely in a confirm dialog's
 * DOM where a consumer can address them.
 *
 * So the declaration is the **union**: the three nodes the wrapped dialog
 * contributes plus the four this template adds. The alternative — declaring
 * only the four and letting a conformance check report the dialog's own parts
 * as undeclared — would make the check report a defect that is not one, which
 * is precisely the failure mode S1-F3 recorded.
 *
 * The rule this packet writes down, for TASK-R5-O6 to gate:
 * a component that renders another DECLARING component inline declares the
 * union of what its DOM emits; a component that renders a `root`-emitting
 * component stops at that boundary.*
 */
export const anatomy = {
  parts: ['overlay', 'content', 'viewport', 'icon', 'title', 'description', 'action'],

  /**
   * Everything is behind `open`, and `overlay`, `content` and `viewport` come
   * from `DzDialogContent` rather than from this template.
   */
  optionalParts: ['overlay', 'content', 'viewport', 'icon', 'title', 'description', 'action'],

  /** reka-ui's `DialogContent` lifecycle, reaching this DOM through DzDialog. */
  states: ['open', 'closed'],

  /**
   * Empty and measured: the variants read the tone ramps and global spacing,
   * and own no `--dz-confirm-dialog-*` property.
   */
  componentTokens: [],

  recipes: ['variant'],

  /**
   * Mirrors with the document — the icon leads the title on the inline axis
   * and the action row is a logical flex. `keyboard: 'none'`: confirm and
   * cancel are reached by Tab, which follows the reading order for free.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `alertdialog`. Escape is the
   * cancel path and must not be the confirm path.
   */
  keyboard: [
    {
      key: 'Escape',
      action: 'Dismiss the dialog without taking the action.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'alertdialog',
    },
    {
      key: 'Tab',
      action: 'Move between the actions, wrapping inside the dialog.',
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
   * Tier B — a modal that traps focus, owns Escape, and whose confirm control
   * must not be reachable while `loading`.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzConfirmDialog. */
export type DzConfirmDialogPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzConfirmDialog — the four nodes this template renders.
 *
 * `overlay`, `content` and `viewport` belong to `DzDialogContent` and are
 * reachable through its own props; a second route to them would be two ways to
 * do one thing.
 */
export type DzConfirmDialogUi = Pick<UiOverrides<typeof anatomy>, 'icon' | 'title' | 'description' | 'action'>
