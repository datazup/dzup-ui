import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzCard — declared anatomy for the card family (TASK-R5-O2, ADR-19).
 *
 * **A family anatomy, declared on the parent**, the `DzTable` pattern: the
 * card's nodes are spread across `DzCardHeader`, `DzCardBody` and
 * `DzCardFooter`, which the ownership manifest records as `compound-part`s with
 * `parentComponent: 'DzCard'`. Declaring one anatomy per sub-part would answer
 * "what can I style on a card?" in four places and would make a conformance
 * check on a composed card report its own children as undeclared parts.
 *
 * `action` is the actions region *inside* `DzCardHeader` — the one node in the
 * family a consumer cannot reach with `class` at the call site, which is why it
 * is the only key on {@link DzCardHeaderUi}.
 *
 * `DzCard` itself renders exactly one element and fills it from slots, so
 * `root` is the only key on {@link DzCardUi}; `header`, `body` and `footer` are
 * components the consumer writes, and `class` at the call site already reaches
 * them.
 */
export const anatomy = {
  parts: ['root', 'header', 'body', 'footer', 'action'],

  /**
   * Only the surface itself is unconditional. Every other part comes from a
   * sub-component the consumer chooses to render — a card with no
   * `<DzCardHeader>` has no `header` node, and `DzCardHeader` renders its
   * `action` wrapper only when the `actions` slot is filled.
   */
  optionalParts: ['header', 'body', 'footer', 'action'],

  /**
   * `interactive` when `clickable` gives the surface button semantics,
   * `static` otherwise. Both were already emitted before this declaration;
   * neither is new. `hoverable` is a decoration, not a state, and is not
   * declared: it changes the shadow, not what the card is.
   */
  states: ['interactive', 'static'],

  /**
   * Measured from `DzCard.tokens.ts`: the five `--dz-card-*` properties the
   * family reads. The shadow, duration, easing and ring values it also uses are
   * global semantic tokens, not card overrides, so they are not promises this
   * component makes.
   */
  componentTokens: [
    '--dz-card-radius',
    '--dz-card-padding',
    '--dz-card',
    '--dz-card-foreground',
    '--dz-card-border-color',
  ],

  /**
   * `variant` only. `padding` is a real prop and is mirrored nowhere: it is not
   * one of the five `RecipeAxis` names, and inventing a sixth to fit one
   * component is the drift ADR-19 §3 warns about.
   */
  recipes: ['variant'],

  /**
   * Mirrors with the document — a card is a text surface and every utility in
   * `DzCard.variants.ts` is already logical. `keyboard: 'none'`: the only key
   * handling is Enter/Space activation, which has no inline axis.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). A card is presentational until
   * `clickable`, and then it must answer the button keys — a pointer-only
   * card is an SC 2.1.1 failure. Both rows are handled in `DzCard.vue`.
   */
  keyboard: [
    { key: 'Enter', when: 'clickable', action: 'Activate the card.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', when: 'clickable', action: 'Activate the card.', wcag: ['2.1.1'], apg: 'button' },
  ],

  /**
   * Tier B — a clickable card owns focus and keyboard activation, so a defect
   * is a functional failure for someone who cannot reach it with a mouse.
   */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names across the card family. */
export type DzCardPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzCard — the one node DzCard itself renders.
 *
 * `header`, `body` and `footer` are separate components at the call site and
 * already take `class`; a second way to do the same thing is not a contract.
 */
export type DzCardUi = Pick<UiOverrides<typeof anatomy>, 'root'>

/**
 * `ui` prop shape for DzCardHeader — the actions wrapper only.
 *
 * The header's own element takes `class` at the call site; its inner actions
 * region is the node nothing else can reach.
 */
export type DzCardHeaderUi = Pick<UiOverrides<typeof anatomy>, 'action'>
