import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzDialog — declared anatomy (TASK-OSS-P3-03, ADR-19).
 *
 * **`parts: 'none'`, and that is not a shortcut.** `DzDialog` wraps Reka's
 * `DialogRoot`, which is a provider: it renders no element at all. Every
 * addressable node in a dialog belongs to a different component —
 * `DzDialogContent` renders the overlay and the panel, `DzDialogTitle` the
 * heading, `DzDialogTrigger` the opener — and each declares its own.
 *
 * This is exactly the distinction the `'none'` case exists for. A component
 * that renders nothing has *answered* the question; one that renders something
 * undeclared has not. Collapsing the two would let every compound root claim
 * `'none'` and the ceiling could never reach zero honestly.
 *
 * The dialog's real styling surface is declared on
 * `DzDialogContent.anatomy.ts`.
 */
export const anatomy = {
  parts: 'none',

  /**
   * Open state lives on the nodes Reka renders — the trigger and the content —
   * not on this provider, which has no node to carry it.
   */
  states: [],

  /**
   * The `--dz-dialog-*` tokens are read by `DzDialogContent`'s recipe and
   * declared there, on the component that actually reads them.
   */
  componentTokens: [],

  /**
   * Mirrors with the document: the close control moves to the inline end and
   * the footer's action order follows the reading direction.
   *
   * `keyboard: 'none'` — a dialog's keyboard contract is Escape and the focus
   * trap, neither of which has a direction.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Tier A: it owns the open state, the modal flag and the focus trap that
   * Reka enforces. Nothing renders, and a defect still traps or releases focus
   * wrongly.
   */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** `never` — a renderless component has no part to override. */
export type DzDialogPart = AnatomyPart<typeof anatomy>

/** Present for symmetry; it has no keys, which is the correct answer. */
export type DzDialogUi = UiOverrides<typeof anatomy>
