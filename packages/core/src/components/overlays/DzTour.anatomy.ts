import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTour — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * No `root`: the whole tour is teleported behind `v-if="open && activeStep"`,
 * so there is no element in the component's own position to name.
 *
 * `overlay` for the spotlight mask — it is a scrim over the page, which is what
 * `overlay` means, and calling it `mask` would add a word the vocabulary does
 * not need. The `aria-live` step announcer gets no part: it is an accessibility
 * affordance and naming it would invite a consumer to make it visible.
 */
export const anatomy = {
  parts: [
    'overlay',
    'panel',
    'header',
    'title',
    'description',
    'footer',
    'list',
    'item-indicator',
    'action',
  ],

  /**
   * The mask renders only when `mask` is set and a target has been measured;
   * title and description only when the active step supplies them; and
   * `item-indicator` repeats once per step.
   */
  optionalParts: [
    'overlay',
    'panel',
    'header',
    'title',
    'description',
    'footer',
    'list',
    'item-indicator',
    'action',
  ],

  /**
   * No `data-state`: a step is mounted and unmounted rather than kept in the
   * DOM in a closed state.
   */
  states: [],

  /** Measured — the two `--dz-tour-*` properties the variants read. */
  componentTokens: ['--dz-tour-mask', '--dz-tour-radius'],

  /**
   * Mirrors with the document — the panel's placement is computed against the
   * writing direction and the footer is a logical flex row.
   * `keyboard: 'none'`: Back / Next are buttons reached by Tab, not by an
   * inline-axis key.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `dialog` per step, plus the step-
   * to-step movement the tour owns. The horizontal rows carry no `rtl`
   * marker: this component declares `rtl.keyboard: 'none'`, and a row
   * marked mirrored would contradict it (owner decision D36).
   */
  keyboard: [
    {
      key: 'Escape',
      action: 'Close the tour and return focus to the element that opened it.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      action: 'Move to the next focusable element, wrapping inside the tour.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      modifiers: ['Shift'],
      action: 'Move to the previous focusable element, wrapping inside the tour.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    { key: 'ArrowRight', action: 'Advance to the next step.', wcag: ['2.1.1'] },
    { key: 'ArrowLeft', action: 'Return to the previous step.', wcag: ['2.1.1'] },
  ],

  /**
   * Tier C — a modal step sequence that moves focus, positions against a live
   * target rect and announces each change to a live region.
   */
  riskTier: 'C',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzTour. */
export type DzTourPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzTour — every node comes from this template. */
export type DzTourUi = UiOverrides<typeof anatomy>
