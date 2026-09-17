import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzInfiniteScroll — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * Four of the five parts are the component's three mutually exclusive status
 * regions plus the content it wraps. Naming them separately rather than as one
 * `status` node is deliberate: they are exclusive in the DOM but not in a
 * theme — "the error row is red and the end-of-list row is muted" is one rule
 * per name and an unreachable descendant selector otherwise.
 *
 * `hint` is the end-of-list message, and it is not `empty`: `empty` means the
 * component has nothing to show, whereas this row appears precisely when it has
 * shown everything. The distinction matters to a screen-reader author choosing
 * what to announce.
 *
 * The sentinel is deliberately unaddressable. It is a zero-height,
 * `aria-hidden` measurement node for the IntersectionObserver, and a part name
 * would invite a consumer to give it a size — which breaks the observer.
 * The live region is unaddressable for the reason recorded for `DzLightbox`.
 */
export const anatomy = {
  parts: ['root', 'content', 'loader', 'error', 'hint'],

  /**
   * The three status regions are mutually exclusive and each renders only in
   * its own condition; `root` and `content` are unconditional.
   */
  optionalParts: ['loader', 'error', 'hint'],

  /**
   * `disabled` only — the presence-only marker the root already carried.
   * Loading is expressed as `aria-busy`, which is the accessible fact; adding a
   * second source for it would let the two disagree.
   */
  states: ['disabled'],

  /** Measured from `DzInfiniteScroll.tokens.ts`. */
  componentTokens: [
    '--dz-infinite-scroll-sentinel-size',
    '--dz-infinite-scroll-status-gap',
    '--dz-infinite-scroll-status-padding-y',
  ],

  recipes: ['size'],

  /**
   * Mirrors with the document — the status rows read as text and every utility
   * in `DzInfiniteScroll.variants.ts` is already logical. `keyboard: 'none'`:
   * the component handles no keys of its own.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). The APG `feed` pattern names PageUp,
   * PageDown, Control+Home and Control+End. **This component implements
   * none of them** — it loads on intersection and adds no key handling —
   * so the contract states what is there rather than what the pattern
   * would like. Closing the gap is component work, and the honest
   * declaration is what makes it visible.
   */
  keyboard: [
    {
      key: 'Tab',
      action: 'Move to the next focusable element inside the loaded items; the feed adds no keys of its own.',
      wcag: ['2.1.2'],
      apg: 'feed',
    },
  ],

  /** Tier B — the retry control owns focus and the region owns `aria-busy`. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on the infinite-scroll region. */
export type DzInfiniteScrollPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzInfiniteScroll — every part; all are internal. */
export type DzInfiniteScrollUi = UiOverrides<typeof anatomy>
