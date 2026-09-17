import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzDialogContent — declared anatomy (TASK-OSS-P3-03, ADR-19).
 *
 * The dialog's real styling surface. `DzDialog` is a provider that renders
 * nothing (`parts: 'none'`); this component renders the backdrop and the panel,
 * so the parts are declared where the nodes are.
 *
 * **The Reka boundary, concretely.** Every part below is a node this template
 * writes and already passes classes to: `<DialogOverlay>`, `<DialogContent>`,
 * and the `header`/`body`/`footer` elements of the scrollable layout. What is
 * NOT declared, deliberately:
 *
 * - the portal container Reka mounts into — Reka's placement, Reka's to change;
 * - its focus-scope and dismissable-layer wrappers;
 * - the `<Transition>` nodes, which render no element at all.
 *
 * The stop condition in the packet is "stop if a part can only be exposed by
 * reaching into a Reka UI internal". None of these needed that, because this
 * component already owns the nodes worth addressing.
 *
 * `viewport` names the scrollable body rather than `body`, which reads as the
 * document element in CSS and in every reviewer's head.
 */
export const anatomy = {
  parts: ['overlay', 'content', 'header', 'viewport', 'footer'],

  /**
   * `header`, `viewport` and `footer` exist only in the `scrollable` layout, and
   * the two chrome slots only when filled. The overlay and content are the
   * dialog.
   */
  optionalParts: ['header', 'viewport', 'footer'],

  /** Reka sets `data-state` on both the overlay and the content. */
  states: ['open', 'closed'],

  /**
   * Read by `dialogVariants` through the `--dz-overlay-*` and surface tokens.
   * Like DzSelect, this component owns no `--dz-dialog-*` custom property: the
   * recipe maps to global semantic tokens, so per-instance restyling goes
   * through `ui` and theme-wide restyling through these.
   */
  componentTokens: ['--dz-overlay-bg'],

  recipes: ['size'],

  /**
   * Keyboard contract (TASK-R5-O5). The content pane of a `DzDialog`; the
   * keys are the dialog contract, implemented by the Reka dialog
   * primitives this part renders.
   */
  keyboard: [
    {
      key: 'Escape',
      action: 'Close the dialog and return focus to the element that opened it.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      action: 'Move to the next focusable element, wrapping inside the dialog.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      modifiers: ['Shift'],
      action: 'Move to the previous focusable element, wrapping inside the dialog.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
  ],

  /**
   * Tier B — interactive primitive. It is the focus trap, the scroll lock and
   * the escape handler. A defect here strands a keyboard user inside or
   * outside the dialog.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names, for typing per-instance overrides. */
export type DzDialogContentPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzDialogContent. */
export type DzDialogContentUi = UiOverrides<typeof anatomy>
