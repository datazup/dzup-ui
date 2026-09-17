/**
 * The `asChild` allowlist and the composition contract it belongs to
 * (TASK-R5-O6, ADR-19 §5, 08-11 doc 03 §Composition/DOM).
 *
 * `asChild` is the one feature in the library that makes **the consumer's own
 * element** the rendered node. Everything dzup-ui otherwise promises — a
 * `data-part` on a node it wrote, a recipe class it merged, a focus ring it
 * owns — stops being true at that boundary, because there is no dzup element
 * left to carry it. That is why the feature needs an allowlist rather than a
 * convention: a component that adopts `asChild` is opting out of the styling
 * contract for its root, and that has to be a decision somebody wrote down, not
 * a prop that spread by copy-paste.
 *
 * ## Why a central list and not a per-component declaration
 *
 * Every other contract fact in this repo is declared beside the component
 * (`Dz{Name}.anatomy.ts`) because the component is the only thing that knows
 * it. An allowlist is the opposite case: its whole value is that a component
 * **cannot** add itself. A `composition.asChild` field on `ComponentAnatomy`
 * would be self-certification — the component that copied the prop would copy
 * the declaration with it, and the gate would go green on exactly the change it
 * exists to catch. So the list lives here, in the package neither the core
 * components nor the tooling can write to as a side effect of a component
 * edit, and `asChild.contract.spec.ts` fails the contract lane when source and
 * list disagree in either direction.
 *
 * ## What an entry promises
 *
 * The five guarantees in {@link AsChildGuarantee} are the ones 08-11 doc 03
 * requires and the ones a consumer's element can actually lose. They are
 * declared per entry rather than assumed, because they are genuinely not all
 * available in every shape: an always-on pass-through trigger keeps the
 * consumer's semantics by construction, while an opt-in `asChild` on a
 * component that would otherwise render a `<button>` has to be checked for
 * whether `disabled` still reaches anything.
 *
 * @module @dzup-ui/contracts/as-child-allowlist
 */

/**
 * How a component exposes `asChild`.
 *
 * The distinction is load-bearing for the gate: an `always` entry has no prop
 * to test, and an `opt-in` entry must behave like a normal dzup component when
 * the prop is absent. Conflating the two is how a matrix ends up asserting a
 * default that does not exist.
 */
export type AsChildMode
  /** A `asChild?: boolean` prop the consumer sets; `false` is the default. */
  = | 'opt-in'
  /**
   * The component always merges onto the consumer's element and has no prop.
   * Its slot content *is* its output; it renders no element of its own.
   */
    | 'always'

/**
 * A guarantee an `asChild` component makes about the consumer's element.
 *
 * Each maps to one assertion in the shared matrix
 * (`packages/core/src/composition/asChild.contract.spec.ts`), so a guarantee
 * that is listed is a guarantee something runs.
 */
export type AsChildGuarantee
  /** The consumer's tag, role and accessible name survive unchanged. */
  = | 'semantics'
  /** Attributes the component would have put on its own root land on theirs. */
    | 'attrs'
  /** A `ref` on the dzup component resolves to the consumer's element. */
    | 'ref'
  /** `disabled` reaches the consumer's element as an attribute or ARIA state. */
    | 'disabled'
  /** Keyboard activation still works on the consumer's element. */
    | 'keyboard'

/** One allowlisted component. */
export interface AsChildEntry {
  /** The public component name, exactly as exported. */
  readonly component: string

  /** Where its `.vue` lives, relative to `packages/core/src`. */
  readonly source: string

  /** How the feature is exposed. */
  readonly mode: AsChildMode

  /**
   * Element kinds the consumer may legitimately pass.
   *
   * `'*'` means the component places no constraint — true of the pass-through
   * triggers, which forward whatever they are given. A concrete list is a
   * promise the matrix checks: a component that only ever forwards button
   * semantics says so, so a consumer passing a `<div>` learns it from the
   * contract instead of from a screen reader.
   */
  readonly elements: readonly string[] | '*'

  /** What this component guarantees about the consumer's element. */
  readonly guarantees: readonly AsChildGuarantee[]

  /**
   * Why this component is allowed to do this. Rendered on its docs page; the
   * reason is the point of an allowlist, and an entry without one is an entry
   * nobody reviewed.
   */
  readonly reason: string

  /**
   * Set when the component declares the API but does not implement it.
   *
   * A published prop that does nothing is worse than an absent one — it is a
   * documented promise the type system confirms and the DOM ignores. Recording
   * it here rather than deleting the entry keeps the defect counted by the
   * contract lane instead of by a reader.
   */
  readonly unimplemented?: string
}

/**
 * The allowlist (TASK-R5-O6).
 *
 * **Eight components, not the five the brief assumed.** The count in the task
 * text came from a `grep -rln asChild packages/core/src`, which matches the
 * unrelated identifier `hasChildren` in `DzTreeItem`, `treeNavigation.ts`,
 * `DzCascader` and `DzTreeSelect` — four false positives — and misses the six
 * always-on triggers, which spell it `as-child` in a template. A word-boundary
 * scan plus a template scan gives the real surface: **2 opt-in props + 6
 * always-on pass-through triggers.**
 *
 * `DzPopconfirm` is deliberately **not** here. Its trigger is a real `<span>`
 * it renders itself, which is why it is the one overlay whose trigger carries a
 * `data-part` (TASK-R5-O2 §2, clause S1-D2).
 */
export const AS_CHILD_ALLOWLIST: readonly AsChildEntry[] = [
  {
    component: 'DzButton',
    source: 'components/buttons/DzButton.vue',
    mode: 'opt-in',
    elements: ['a', 'button'],
    guarantees: [],
    reason:
      'Declared so a consumer can wrap their own router link or a third-party '
      + 'button without losing the recipe. The prop is public API and typed.',
    unimplemented:
      'DzButton.types.ts declares `asChild?: boolean` and DzButton.vue defaults '
      + 'it to `false`, but the template never reads it: the root is '
      + '`<component :is="computedTag">`, chosen from `as` / `href` / `to`, and '
      + 'no branch renders the slot in place of an element. Setting `asChild` '
      + 'changes nothing at all. Polymorphism via `as` is the working feature; '
      + '`asChild` is a declared-but-dead prop. Removing it is breaking (a '
      + '`minor` under VERSIONING.md while 0.x) and implementing it is a new '
      + 'asChild implementer, which this task is scoped out of — see D38.',
  },
  {
    component: 'DzDialogClose',
    source: 'components/overlays/DzDialogClose.vue',
    mode: 'opt-in',
    elements: ['button'],
    guarantees: ['semantics', 'attrs', 'keyboard'],
    reason:
      'A close affordance is frequently the consumer\'s own button — a text '
      + '"Cancel", an icon from their set. With `asChild` the component '
      + 'contributes the dismiss behaviour and nothing else, which is the only '
      + 'part of it that is not presentational.',
  },
  {
    component: 'DzContextMenuTrigger',
    source: 'components/overlays/DzContextMenuTrigger.vue',
    mode: 'always',
    elements: '*',
    guarantees: ['semantics', 'attrs', 'keyboard'],
    reason:
      'A context-menu target is an arbitrary region of the consumer\'s UI — a '
      + 'row, a canvas, a card. Wrapping it in an element of our own would '
      + 'change their layout to add a right-click listener.',
  },
  {
    component: 'DzDialogTrigger',
    source: 'components/overlays/DzDialogTrigger.vue',
    mode: 'always',
    elements: '*',
    guarantees: ['semantics', 'attrs', 'keyboard'],
    reason:
      'The trigger is whatever opens the dialog in the consumer\'s design. The '
      + 'component contributes `aria-expanded`/`aria-controls` and the open '
      + 'handler to an element it did not write.',
  },
  {
    component: 'DzDropdownMenuTrigger',
    source: 'components/overlays/DzDropdownMenuTrigger.vue',
    mode: 'always',
    elements: '*',
    guarantees: ['semantics', 'attrs', 'keyboard'],
    reason: 'As DzDialogTrigger — the menu attaches to the consumer\'s own control.',
  },
  {
    component: 'DzPopoverTrigger',
    source: 'components/overlays/DzPopoverTrigger.vue',
    mode: 'always',
    elements: '*',
    guarantees: ['semantics', 'attrs', 'keyboard'],
    reason: 'As DzDialogTrigger — the popover anchors to the consumer\'s own control.',
  },
  {
    component: 'DzSheetTrigger',
    source: 'components/overlays/DzSheetTrigger.vue',
    mode: 'always',
    elements: '*',
    guarantees: ['semantics', 'attrs', 'keyboard'],
    reason: 'As DzDialogTrigger — a sheet is a dialog with a different position.',
  },
  {
    component: 'DzTooltipTrigger',
    source: 'components/overlays/DzTooltipTrigger.vue',
    mode: 'always',
    elements: '*',
    guarantees: ['semantics', 'attrs', 'keyboard'],
    reason:
      'A tooltip must describe an element the user can already reach. Rendering '
      + 'a wrapper would put the description on a node that is not the control.',
  },
] as const

/** Look up an allowlist entry by component name. */
export function asChildEntryFor(component: string): AsChildEntry | undefined {
  return AS_CHILD_ALLOWLIST.find(entry => entry.component === component)
}
