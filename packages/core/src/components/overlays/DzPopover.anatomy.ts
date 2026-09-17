import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzPopover — declared anatomy for the popover family (TASK-R5-O2, ADR-19).
 *
 * No `root`: `DzPopover` renders reka-ui's `PopoverRoot` around a bare slot.
 * No `trigger` either — `DzPopoverTrigger` renders `as-child`, so a part name
 * set there lands on the consumer's own element (N2-S1 S1-F3/S1-D2).
 *
 * `indicator` for the arrow: it is the non-textual mark that says which element
 * the panel belongs to, which is what the vocabulary's `indicator` means.
 */
export const anatomy = {
  parts: ['content', 'indicator'],

  /**
   * `content` renders only when the consumer writes `DzPopoverContent`, and
   * the arrow only when that content sets `arrow`.
   */
  optionalParts: ['content', 'indicator'],

  /** reka-ui's `PopoverContent` lifecycle. */
  states: ['open', 'closed'],

  /**
   * Empty and measured: the variants read `--dz-popover`,
   * `--dz-popover-foreground` and the global radius/shadow scales — semantic
   * tokens, not popover-owned overrides.
   */
  componentTokens: [],

  /**
   * Mirrors with the document — reka resolves `align="start"` against the
   * writing direction, so the panel lines up with the edge the text starts at.
   * `keyboard: 'none'`: the popover opens and closes; it has no inline-axis
   * key of its own.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Reka popover primitives over APG
   * `dialog` semantics.
   */
  keyboard: [
    {
      key: 'Escape',
      action: 'Close the popover and return focus to the element that opened it.',
      wcag: ['2.1.1', '2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      action: 'Move to the next focusable element, wrapping inside the popover.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
    {
      key: 'Tab',
      modifiers: ['Shift'],
      action: 'Move to the previous focusable element, wrapping inside the popover.',
      wcag: ['2.1.2'],
      apg: 'dialog',
    },
  ],

  /**
   * Tier B — it manages focus on open and close and owns Escape and
   * outside-pointer dismissal.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the popover family. */
export type DzPopoverPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for the popover family. */
export type DzPopoverUi = UiOverrides<typeof anatomy>
