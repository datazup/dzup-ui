import type { AnatomyPart, ComponentAnatomy, UiOverrides } from '@dzup-ui/contracts'

/**
 * DzStepperItem — declared anatomy for one step (TASK-R5-O2, ADR-19).
 *
 * A separate declaration rather than four more names on `DzStepper`, because
 * the ownership manifest records `DzStepperItem` as a `public-component`: it is
 * exported, documented and usable on its own, which is the property that makes
 * a component an anatomy boundary. See `DzStepper.anatomy.ts` for the contrast
 * with `DzCard` and `DzBreadcrumb`.
 *
 * `indicator` is the numbered circle — the node that carries the completed
 * check, the active ring and the upcoming outline — and it is the node the
 * `indicator` slot replaces. Naming it means a consumer can restyle the circle
 * without taking over the slot and re-implementing the three states.
 */
export const anatomy = {
  parts: ['root', 'indicator', 'title', 'description'],

  /**
   * The circle disappears when the consumer fills the `indicator` slot with
   * markup of their own; `title` and `description` render only when their props
   * are set.
   */
  optionalParts: ['indicator', 'title', 'description'],

  /**
   * The three `status` values the step already emitted through
   * `:data-state="status"` — an expression `validate:anatomy-parts` reports as
   * unresolvable, which is why the declaration is the only place they are
   * written down.
   *
   * `data-clickable` is NOT declared as a state: it says whether the author
   * wired step navigation, which is a capability of the instance rather than a
   * condition it is in, and it is outside the ADR-19 section 4 boolean
   * vocabulary.
   */
  states: ['upcoming', 'active', 'completed'],

  /** Empty and measured — the family's tokens are all global semantic ones. */
  componentTokens: [],

  /**
   * Mirrors with the document. `keyboard: 'none'`: the step handles Enter and
   * Space activation only; the arrow keys belong to the containing stepper.
   */
  rtl: { mirrors: 'layout', keyboard: 'none' },

  /**
   * Keyboard contract (TASK-R5-O5). One step of a `DzStepper`; both rows
   * are handled in `DzStepperItem.vue` and apply only while the step is
   * navigable.
   */
  keyboard: [
    { key: 'Enter', when: 'clickable', action: 'Go to this step.', wcag: ['2.1.1'], apg: 'button' },
    { key: ' ', when: 'clickable', action: 'Go to this step.', wcag: ['2.1.1'], apg: 'button' },
  ],

  /** Tier B — a clickable step owns focus and keyboard activation. */
  riskTier: 'B',
} as const satisfies ComponentAnatomy

/** Addressable node names on one step. */
export type DzStepperItemPart = AnatomyPart<typeof anatomy>

/**
 * `ui` prop shape for DzStepperItem — the three inner nodes.
 *
 * `class` at the call site already lands on the step itself; the circle, the
 * title and the description are rendered from props and have no other route.
 */
export type DzStepperItemUi = Pick<
  UiOverrides<typeof anatomy>,
  'indicator' | 'title' | 'description'
>
