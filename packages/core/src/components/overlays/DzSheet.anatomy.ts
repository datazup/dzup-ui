import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzSheet — declared anatomy for the sheet family (TASK-R5-O2, ADR-19).
 *
 * No `root`: `DzSheet` renders reka-ui's `DialogRoot` around a bare slot, and
 * the whole surface is portalled by `DzSheetContent`. No `trigger` — it renders
 * `as-child` onto the consumer's element (N2-S1 S1-F3/S1-D2).
 *
 * The same shape as `DzDialogContent`'s declaration, which is deliberate: a
 * sheet is a dialog anchored to an edge, and answering "what can I style?" with
 * a different vocabulary for the same nodes would be the drift ADR-19 exists to
 * stop.
 */
export const anatomy = {
  parts: ['overlay', 'content', 'title', 'description', 'close'],

  /**
   * Everything is composed by the consumer: a `DzSheet` with no
   * `DzSheetContent` renders nothing.
   */
  optionalParts: ['overlay', 'content', 'title', 'description', 'close'],

  /** reka-ui's `DialogContent` lifecycle. */
  states: ['open', 'closed'],

  /**
   * Empty and measured: `DzSheet.variants.ts` reads `--dz-overlay-bg`,
   * `--dz-background` and the global shadow scale, and owns no
   * `--dz-sheet-*` property.
   */
  componentTokens: [],

  recipes: ['size'],

  /**
   * `mirrors: 'none'`, deliberately. The `side` prop names a **physical**
   * edge — `side="left"` is a promise about the screen, and the `border-l` /
   * `border-r` in `DzSheet.variants.ts` are the seam of that edge. An app that
   * wants the panel to follow the reading direction picks the opposite `side`
   * per locale, exactly as `DzFab`'s `position` works. Declaring `layout` here
   * would make the prop name a lie and would put the border on the seam the
   * panel does not have.
   *
   * `keyboard: 'none'`: a sheet has no inline-axis key; it closes on Escape.
   */
  rtl: { mirrors: 'none', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Reka dialog primitives, APG `dialog`.
   * The `side` prop names a physical edge and no key moves it.
   */
  keyboard: [
    {
      key: 'Escape',
      action: 'Close the sheet and return focus to the element that opened it.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      action: 'Move to the next focusable element, wrapping inside the sheet.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      modifiers: ['Shift'],
      action: 'Move to the previous focusable element, wrapping inside the sheet.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
  ],

  /**
   * Tier B — a modal surface that traps focus, owns Escape and outside-pointer
   * dismissal, and must restore focus to its trigger.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the sheet family. */
export type DzSheetPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for the sheet family. */
export type DzSheetUi = UiOverrides<typeof anatomy>
