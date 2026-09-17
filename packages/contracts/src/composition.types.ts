/**
 * The composition contract (TASK-R5-O6, ADR-19 §5 · 08-11 doc 03
 * §Composition/DOM · finding R-021).
 *
 * ADR-19 §5 defines the `ui` prop and says both `class` and `ui` "merge through
 * the same `cn()`". What it never says is **in which order** — and `cn()` is
 * tailwind-merge, so the order is the whole answer to "which one wins when they
 * conflict". That silence is R-021: a rule that exists only as prose, gated by
 * nothing.
 *
 * Measured at `99b963a` + the R5-O2 dirty tree, the silence had the effect
 * silence always has. Of the **57** merge sites that pass both `attrs.class`
 * and a `ui` part into one `cn()` call, **5** put `ui` first and **52** put
 * `class` first — two opposite contracts shipping in one library, neither
 * written down. This module writes one of them down.
 *
 * @module @dzup-ui/contracts/composition
 */

/**
 * One layer of the class cascade, outermost-winning last.
 *
 * The names are the arguments a component passes to `cn()`, in the order it
 * must pass them.
 */
export type UiMergeLayer
  /** The `tv()` recipe's output for this part — what the component chose. */
  = | 'recipe'
  /** `props.ui?.<part>` — the typed, part-addressed override. */
    | 'ui'
  /** `$attrs.class` — the consumer's own class on the component tag. */
    | 'class'

/**
 * **The ratified class merge order** (TASK-R5-O6, decision D38).
 *
 * `cn()` is tailwind-merge: for two conflicting utilities the **last** one
 * wins. So this array read left to right is weakest to strongest, and a
 * component implements the contract by passing its class sources to `cn()` in
 * exactly this order.
 *
 * ```ts
 * cn(recipeVariants({ … }), props.ui?.root, attrs.class as string | undefined)
 * ```
 *
 * ## Why `class` last, and not `ui` last
 *
 * Both orders are defensible in isolation — `ui` is the typed, deliberate,
 * part-addressed override, so "the specific one wins" argues for `ui` last.
 * Three things decide it the other way:
 *
 * 1. **ADR-19 §5 promises it.** "`class` keeps its meaning: it applies to the
 *    root only, merged through `cn()`. **Nothing about existing usage
 *    changes.**" Under the other order, adding a `ui` prop to a component
 *    silently changes what every existing `class` on it does. `class` predates
 *    `ui` by the whole life of the library.
 * 2. **It is the rule that survives composition.** The case that matters is not
 *    a consumer passing both on one tag — that is a person arguing with
 *    themselves. It is a *wrapper*: an application builds `AppButton` over
 *    `DzButton` and sets `ui` to lock in its house style, then someone uses
 *    `<AppButton class="w-full" />`. `ui` last makes the wrapper's choice
 *    unoverridable and sends that consumer to `!important` — the single outcome
 *    ADR-19 exists to prevent ("A consumer override needs no `!important`").
 *    `class` last keeps the outermost author in control, which is how the CSS
 *    cascade already behaves and therefore what a consumer predicts.
 * 3. **The pilots implement it.** `DzButton`, `DzInput`, `DzSelect`,
 *    `DzTable` and `DzDialogContent` are exactly the components in
 *    `Overrides.stories.ts`, the P3-03 fixture behind the only *browser*
 *    evidence the override contract has (`e2e/components/styling-overrides.spec.ts`,
 *    three computed-style assertions plus two `!important` audits). They are
 *    also exactly the five that merge in this order. The other 52 sites
 *    acquired their `ui` prop during the TASK-R5-O2 bulk rollout, where the
 *    order was copied rather than chosen.
 *
 * The 52 deviating sites are recorded as a defect with a downward-only ceiling
 * in `packages/core/src/composition/ui-merge-order-ceilings.json`, not fixed
 * here: re-ordering a merge changes rendered output, and TASK-R5-O6 is the task
 * that writes the contract, not the one that migrates to it (D38).
 */
export const UI_MERGE_ORDER: readonly UiMergeLayer[] = ['recipe', 'ui', 'class'] as const

/**
 * Attributes a consumer may set on any component and expect to reach the
 * declared fallthrough target unchanged.
 *
 * "Safe" means two things at once: the component must not swallow them, and the
 * component must not *invent* them — a consumer's `id` has to be the element's
 * `id`, because that is what their `<label for>` and their `aria-describedby`
 * point at.
 *
 * `class` and `style` are deliberately **not** in this list. They are not
 * forwarded verbatim; they are *merged* — `class` through `cn()` in
 * {@link UI_MERGE_ORDER}, `style` by Vue's own attribute merge — and a list
 * that mixed "passed through untouched" with "combined with ours" would be
 * asserting the wrong thing about both.
 */
export const SAFE_FALLTHROUGH_ATTRS: readonly string[] = [
  'id',
  'title',
  'lang',
  'dir',
  'role',
  'tabindex',
  'data-*',
  'aria-*',
] as const

/**
 * Handler composition: what happens to a consumer's listener.
 *
 * A component that both declares an event in `defineEmits` **and** lets the
 * corresponding `on*` attribute fall through to the same element fires the
 * consumer's handler **twice** — once from the DOM listener, once from the
 * emit. Vue removes declared emits from `$attrs`, so the correct shape is
 * automatic as long as the component declares what it emits; the failure mode
 * is a component that handles `click` internally, does *not* declare it, and
 * also binds `$attrs`.
 *
 * The contract is therefore stated as an observable, not as an implementation:
 * **a consumer's listener for an event the component also handles runs exactly
 * once, and the component's own behaviour runs first**, so a handler that reads
 * the component's state sees the post-interaction value.
 */
export const HANDLER_COMPOSITION_RULE
  = 'component behaviour first, then the consumer\'s listener, exactly once' as const
