import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzRating — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * `root` is the wrapper, `control` is the `role="slider"` box that owns focus
 * and the keyboard contract, `item` is one star, `item-indicator` is the
 * clipped overlay that fills it, and `error` is the `role="alert"` line.
 *
 * `item` and `item-indicator` repeat once per star and are therefore
 * `optional` — "sometimes many" has to be declared, not inferred.
 *
 * **`class` reaches `control`, not `root`**, the same existing target
 * `DzSlider` has; documented rather than moved.
 *
 * Left unaddressable, with the reason: the empty-icon layer and the inner
 * filled layer are painting details of one star and `ui.item` reaches both by
 * descendant; the `type="hidden"` input has no box.
 */
export const anatomy = {
  parts: ['root', 'control', 'item', 'item-indicator', 'error'],

  /** The stars repeat; the error line is conditional. */
  optionalParts: ['item', 'item-indicator', 'error'],

  /** Presence-only attributes on the control; no `data-state` value of its own. */
  states: ['disabled', 'required', 'readonly', 'loading', 'invalid'],

  /**
   * Empty and measured: `DzRating.tokens.ts` maps to global tone tokens
   * (`--dz-primary`, `--dz-warning`, `--dz-danger`) and owns no
   * `--dz-rating-*` property.
   */
  componentTokens: [],

  recipes: ['size', 'tone'],

  /**
   * Mirrors with the document — the stars fill from the edge the reader starts
   * at, and the overlay clip follows the same inline axis.
   * `swap-horizontal`: ArrowLeft lowers the rating in LTR and raises it in RTL.
   */
  rtl: { mirrors: 'layout', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `slider` semantics over the
   * stars, handled in `DzRating.vue`. The arrows are declared as mirrored
   * because the stars read along the inline axis.
   */
  keyboard: [
    { key: 'ArrowUp', action: 'Increase the rating by one step.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'ArrowDown', action: 'Decrease the rating by one step.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'Home', action: 'Set the rating to its minimum.', wcag: ['2.1.1'], apg: 'slider' },
    { key: 'End', action: 'Set the rating to its maximum.', wcag: ['2.1.1'], apg: 'slider' },
  ],

  /**
   * `class` reaches `control`, not the outermost node (D24).
   *
   * The star row is the component as far as a consumer is concerned; the
   * wrapper exists to carry the optional count and label.
   */
  fallthrough: {
    target: 'control',
    reason: 'D24: `$attrs` binds to the star row (`control`), not the wrapper.',
  },

  /** Tier B — owns focus, a keyboard value contract and form participation. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names. */
export type DzRatingPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzRating. */
export type DzRatingUi = UiOverrides<typeof anatomy>
