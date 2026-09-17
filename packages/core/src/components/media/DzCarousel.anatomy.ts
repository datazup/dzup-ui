import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCarousel — declared anatomy for the carousel family (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy, declared on the parent** — the `DzTable` pattern.
 * `DzCarouselSlide`, `DzCarouselDots`, `DzCarouselNext` and
 * `DzCarouselPrevious` are `compound-part`s with
 * `parentComponent: 'DzCarousel'`; they emit `item`, `list`,
 * `item-indicator` and `action` — never `root` — so a composed carousel
 * conforms to this one declaration (N2-S1 finding S1-F3, parent-covers).
 *
 * The two navigation buttons share the `action` name. They are the same job in
 * opposite directions and the vocabulary has one word for it; the direction is
 * already public on each button's `aria-label` and on which component the
 * consumer rendered. The `increment` / `decrement` pair on `DzNumberInput` is
 * the counter-example that earned two names, and it earned them because ONE
 * component renders both with no other way to tell them apart.
 */
export const anatomy = {
  parts: ['root', 'viewport', 'content', 'item', 'list', 'item-indicator', 'action'],

  /**
   * Everything but the root, its live-region viewport and the translating
   * track is composed by the consumer, and `item` and `item-indicator` repeat
   * once per slide.
   */
  optionalParts: ['item', 'list', 'item-indicator', 'action'],

  /**
   * `ready` once a slide is registered, `empty` before that — both already
   * emitted before this declaration. `disabled` is a presence-only flag.
   */
  states: ['ready', 'empty', 'disabled'],

  /**
   * Empty and measured: `DzCarousel.variants.ts` reads global semantic tokens
   * and owns no `--dz-carousel-*` property.
   */
  componentTokens: [],

  recipes: ['orientation'],

  /**
   * `mirrors: 'none'` — the track is moved by an explicit
   * `translateX(-n%)`, a physical transform this component computes rather
   * than a box the writing direction can flip. Declaring `layout` would be a
   * claim the transform does not honour, and `validate:rtl` would still pass
   * because a transform is not a Tailwind inset utility. This is exactly the
   * case ADR-19 says only the component can answer.
   *
   * `keyboard: 'swap-horizontal'`: a horizontal carousel's next/previous keys
   * move along the inline axis.
   */
  rtl: { mirrors: 'none', keyboard: 'swap-horizontal' },

  /**
   * Keyboard contract (TASK-R5-O5). APG `carousel`: the previous and next
   * controls are buttons, and the arrows follow the writing direction
   * because the slides read along the inline axis.
   */
  keyboard: [
    { key: 'ArrowRight', action: 'Show the next slide.', wcag: ['2.1.1'], apg: 'carousel', rtl: 'mirrored' },
    {
      key: 'ArrowLeft',
      action: 'Show the previous slide.',
      wcag: ['2.1.1'],
      apg: 'carousel',
      rtl: 'mirrored',
    },
    {
      key: 'Enter',
      when: 'control',
      action: 'Activate the focused previous or next control.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
    {
      key: ' ',
      when: 'control',
      action: 'Activate the focused previous or next control.',
      wcag: ['2.1.1'],
      apg: 'button',
    },
  ],

  /**
   * Tier B — a `role="region"` with a `role="tablist"` of dots, roving focus
   * and an autoplay timer that must pause on hover and focus.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the carousel family. */
export type DzCarouselPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzCarousel — the nodes DzCarousel itself renders.
 *
 * Slides, dots and the navigation buttons are written by the consumer at the
 * call site and already take `class`.
 */
export type DzCarouselUi = Pick<UiOverrides<typeof anatomy>, 'root' | 'viewport' | 'content'>
