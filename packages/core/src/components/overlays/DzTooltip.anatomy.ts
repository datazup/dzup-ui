import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzTooltip — declared anatomy for the tooltip family (TASK-R5-O2, ADR-19).
 *
 * No `root` and no `trigger`, the same shape as `DzPopover.anatomy.ts`.
 * `DzTooltipTrigger` is the component N2-S1 found the residual composition case
 * on (S1-F3): because it merges `as-child`, its `data-state` lands on the
 * child's own element — `DzRelativeTime`'s `<time data-part="root">` carries
 * `data-state="closed"` that belongs to the tooltip. Declaring a `trigger` part
 * here would add a second attribute to that same collision rather than resolve
 * it, which is why the trigger stays unnamed and the case stays filed as
 * **S1-D2** (`data-scope`).
 */
export const anatomy = {
  parts: ['content', 'indicator'],

  /** Both come from `DzTooltipContent`, and the arrow only when it sets `arrow`. */
  optionalParts: ['content', 'indicator'],

  /**
   * reka-ui's tooltip lifecycle has three values, not two: it distinguishes a
   * tooltip that opened immediately from one that waited out the delay, and
   * both are `open` to a reader. All three are declared because all three
   * reach the DOM.
   */
  states: ['instant-open', 'delayed-open', 'closed'],

  /** Empty and measured: global semantic tokens only. */
  componentTokens: [],

  /**
   * Mirrors with the document — reka resolves side and align against the
   * writing direction. `keyboard: 'none'`: a tooltip has no keys of its own;
   * it opens on focus and closes on Escape.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `tooltip`: the tooltip is shown
   * by focus rather than by a key, and Escape dismisses it without moving
   * focus — which is SC 1.4.13.
   */
  keyboard: [
    { key: 'Escape', action: 'Dismiss the tooltip without moving focus.', wcag: ['1.4.13'], apg: 'tooltip' },
    {
      key: 'Tab',
      action: 'Move focus to the trigger, which shows the tooltip.',
      wcag: ['2.1.2'],
      apg: 'tooltip',
    },
  ],

  /**
   * Tier B — it owns the `aria-describedby` relationship and Escape
   * dismissal, and a defect makes the description unreachable by keyboard.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the tooltip family. */
export type DzTooltipPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for the tooltip family. */
export type DzTooltipUi = UiOverrides<typeof anatomy>
