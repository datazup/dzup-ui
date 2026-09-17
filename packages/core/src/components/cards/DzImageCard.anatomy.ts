import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzImageCard — declared anatomy (TASK-R5-O2, ADR-19).
 *
 * A separate declaration from `DzCard` rather than a member of that family:
 * the ownership manifest records it as its own `public-component`, its nodes
 * come from one template, and it composes nothing.
 *
 * **Two nodes are deliberately left unaddressable.** The image wrapper and the
 * `<img>` itself have no word in the ADR-19 shared vocabulary — `viewport`
 * means a scroll window and `content` is already the generic body — and
 * ADR-19 §3 says a missing word is a decision to take, not a name to invent.
 * They are recorded in the TASK-R5-O2 handoff as the vocabulary request
 * `media` / `image`, and this declaration promises only what it emits.
 */
export const anatomy = {
  parts: ['root', 'overlay', 'header', 'body', 'footer'],

  /**
   * Everything but the surface is behind a slot check in the template
   * (`v-if="$slots.header"` and the rest), so "sometimes absent" is the normal
   * case rather than the exception.
   */
  optionalParts: ['overlay', 'header', 'body', 'footer'],

  /**
   * `ready` — the single value the template emits today. The image's own
   * loading lifecycle is the browser's (`loading="lazy"`), not this
   * component's, and declaring a `loading` state it never sets would be a
   * promise with nothing behind it.
   */
  states: ['ready'],

  /** Measured: the five `--dz-card-*` properties the variants read. */
  componentTokens: [
    '--dz-card-radius',
    '--dz-card-padding',
    '--dz-card',
    '--dz-card-foreground',
    '--dz-card-border-color',
  ],

  recipes: ['variant'],

  /**
   * Mirrors with the document. Every utility in `DzImageCard.variants.ts` is
   * logical or symmetric (`inset-0`, `px-`, `pt-`, `pb-`). `keyboard: 'none'`:
   * it handles no keys.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). Presentational; a clickable card is
   * `DzCard`.
   */
  keyboard: 'none',

  /** Tier A — presentational; it takes no focus of its own. */
  riskTier: 'A',
} as const satisfies ComponentAnatomy

/** Addressable node names for DzImageCard. */
export type DzImageCardPart = AnatomyPart<typeof anatomy>

/** `ui` prop shape for DzImageCard — every node comes from this template. */
export type DzImageCardUi = UiOverrides<typeof anatomy>
