import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzToast — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * The root is reka-ui's `ToastRoot`, so `data-state` on this component's root
 * is **reka's** lifecycle attribute rather than one this template writes. It is
 * declared here anyway: from a consumer's side there is one element with one
 * `data-state`, and a declaration that omitted it would report the component's
 * own root as emitting an undeclared state.
 *
 * The variants file also carries a `viewport` slot. It is not a part of this
 * component — the viewport belongs to the toaster that hosts the region — and
 * a part nothing here emits would be a promise with nothing behind it.
 */
export const anatomy = {
  parts: ['root', 'indicator', 'title', 'description', 'action', 'close'],

  /**
   * `description` needs `toast.description` and `action` needs
   * `toast.actionLabel`. The tone indicator, title and close control are
   * unconditional.
   */
  optionalParts: ['description', 'action'],

  /** reka-ui's `ToastRoot` lifecycle, surfaced on this component's root. */
  states: ['open', 'closed'],

  /**
   * Empty and measured: `DzToast.variants.ts` reads global semantic tokens and
   * owns no `--dz-toast-*` property.
   */
  componentTokens: [],

  recipes: ['tone'],

  /**
   * Mirrors with the document. The title column's inline padding was
   * `pl-[var(--dz-spacing-2)]`, which held the text off the tone indicator on
   * the wrong side in RTL; it is `ps-` as of this declaration and identical in
   * LTR. `keyboard: 'none'`: dismissal is Escape, which has no inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A toast is an `alertdialog` only when
   * it carries an action; Escape dismisses it either way, and F6 is how
   * APG moves focus to the toast region.
   */
  keyboard: [
    { key: 'Escape', action: 'Dismiss the toast.', wcag: ['2.1.1', '2.1.2'], apg: 'alertdialog' },
    {
      key: 'Tab',
      action: 'Move to the toast action and the close control.',
      wcag: ['2.1.2'],
      apg: 'alertdialog',
    },
  ],

  /**
   * Tier B — a live region with a focusable action and close control and an
   * auto-dismiss timer.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzToast. */
export type DzToastPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzToast — every node comes from this template. */
export type DzToastUi = UiOverrides<typeof anatomy>
