/**
 * Anatomy conformance for rendered DOM (TASK-OSS-P3-02, ADR-19).
 *
 * A declared anatomy that nothing checks is a comment. This turns it into an
 * assertion: mount the component, hand the root element and the declaration to
 * {@link expectAnatomy}, and the declared parts must actually be in the DOM —
 * and nothing undeclared may be.
 *
 * Runner-independent on purpose, like the DOM installer beside it: the rules
 * live in {@link checkAnatomy}, which returns problems, and `expectAnatomy`
 * throws. No `expect`, no vitest import, nothing that would make a test runner
 * a runtime dependency of a published package.
 *
 * Dependency-free in the same spirit: the declaration is accepted
 * **structurally** rather than as an imported `ComponentAnatomy`, so this
 * package needs no dependency on `@dzup-ui/contracts` — and a package that
 * emits declarations cannot import another package's source anyway without
 * breaking its own `rootDir`. A real `ComponentAnatomy` satisfies
 * {@link CheckableAnatomy} by shape, which is all the check needs.
 */

/**
 * The part of a `ComponentAnatomy` this helper reads.
 *
 * Structurally satisfied by `ComponentAnatomy` from `@dzup-ui/contracts`; the
 * fields it omits (`componentTokens`, `recipes`, `riskTier`) are checked by the
 * ownership generator and the token linter, not by rendered DOM.
 */
export interface CheckableAnatomy {
  readonly parts: readonly string[] | 'none'
  readonly states: readonly string[]
  readonly optionalParts?: readonly string[]
}

/** Anything with a root element — a `@vue/test-utils` wrapper, or an element. */
export type AnatomyTarget = Element | { element: Element }

/**
 * The presence-only boolean state attributes ADR-19 §4 defines.
 *
 * A **closed list**, and that is the point. An earlier draft read *any*
 * `data-*=""` as a state, which is unworkable in a tree that contains anything
 * but this component's own markup: mounting one Reka-backed select reported
 * `data-reka-popper-content-wrapper`, `data-dismissable-layer`,
 * `data-reka-collection-item`, `data-placeholder` and `data-aria-hidden` as
 * undeclared states. None of them is a state — they are a primitive's internal
 * markers — and no library can enumerate what a host or a primitive might add.
 *
 * So the rule is inverted: states are checked against the vocabulary the ADR
 * defines, plus whatever the anatomy itself declares. An attribute outside both
 * is not this check's business.
 */
const BOOLEAN_STATE_ATTRIBUTES = [
  'disabled',
  'loading',
  'invalid',
  'readonly',
  'required',
  'selected',
  'checked',
  'expanded',
  'active',
  'dragging',
  'pending',
] as const

function rootOf(target: AnatomyTarget): Element {
  return 'element' in target ? target.element : target
}

/**
 * Every element inside **this component's own anatomy boundary**: the target
 * plus its descendants, stopping at any descendant that carries
 * `data-part="root"`.
 *
 * A nested `data-part="root"` is another component's root — ADR-19 §3 makes the
 * root part universal, so it is a real, mechanical boundary marker rather than
 * a convention this helper invented.
 *
 * **Why this exists (TASK-N2-S1).** Without it, the conformance check descends
 * into composed components and reports their declarations as the parent's
 * violations. `DzSpeedDial` is the catalogue's first composition of two
 * anatomy-declaring components — it renders a `DzFab` trigger and a `DzIconButton`
 * per action — and the moment those two declared their anatomies, `DzSpeedDial`
 * reported *"part 'root' appears 5 times"*, an undeclared `icon` part it does
 * not own, and two `data-state` values emitted by its children.
 *
 * That failure mode makes the rollout self-limiting: every component that
 * composes a declared one would either break or have to re-declare the child's
 * entire surface as its own, which is the opposite of what parts are for. The
 * boundary is the fix, and it is the same rule a consumer reads intuitively —
 * `[data-part="item"] [data-part="root"]` is *the nested component*, not a
 * second copy of this one.
 *
 * Compound parts are deliberately **not** boundaries: `DzTableRow` emits
 * `data-part="row"`, not `root`, precisely because `DzTable` owns that name.
 */
function withinBoundary(root: Element): Element[] {
  const nodes: Element[] = [root]
  const walk = (element: Element): void => {
    for (const child of Array.from(element.children)) {
      if (child.getAttribute('data-part') === 'root')
        continue
      nodes.push(child)
      walk(child)
    }
  }
  walk(root)
  return nodes
}

function partsIn(root: Element): Map<string, number> {
  const counts = new Map<string, number>()

  for (const node of withinBoundary(root)) {
    const part = node.getAttribute('data-part')
    if (part === null)
      continue
    counts.set(part, (counts.get(part) ?? 0) + 1)
  }
  return counts
}

/**
 * Boolean states present in the subtree, from the known vocabulary.
 *
 * A state is present-or-absent: `data-disabled=""` or `data-disabled="true"`.
 * `data-disabled="false"` is a bug the caller should see, so it is not counted
 * as present and not silently accepted either — it simply is not a state, which
 * is what the attribute's own value claims.
 */
function booleanStatesIn(root: Element, anatomy: CheckableAnatomy): Set<string> {
  const found = new Set<string>()
  const names = [...BOOLEAN_STATE_ATTRIBUTES, ...anatomy.states]

  for (const node of withinBoundary(root)) {
    for (const name of names) {
      const value = node.getAttribute(`data-${name}`)
      if (value === '' || value === 'true')
        found.add(name)
    }
  }
  return found
}

/** Every `data-state` value in the subtree. */
function stateValuesIn(root: Element): Set<string> {
  const found = new Set<string>()

  for (const node of withinBoundary(root)) {
    const value = node.getAttribute('data-state')
    if (value !== null && value !== '')
      found.add(value)
  }
  return found
}

export interface AnatomyCheckOptions {
  /**
   * Parts allowed to be absent in THIS render on top of the ones the anatomy
   * already declares optional — for a fixture that deliberately omits one, or
   * for a subtree that holds only half the component.
   *
   * Listing `'root'` also tells the check that the element it was handed is NOT
   * the component's root, which is the normal case for a **portaled** subtree:
   * a select's listbox is a real part of the component that lives outside its
   * wrapper entirely, and checking it is the only way an undeclared part in
   * there is ever seen.
   */
  readonly absentParts?: readonly string[]
}

/**
 * The rules, as a list of problems. Empty means conformant.
 *
 * Kept pure and exported so the rules themselves are unit-testable against
 * hand-built DOM, without mounting a component to exercise a rule.
 */
export function checkAnatomy(
  target: AnatomyTarget,
  anatomy: CheckableAnatomy,
  options: AnatomyCheckOptions = {},
): string[] {
  const root = rootOf(target)
  const problems: string[] = []
  const found = partsIn(root)

  if (anatomy.parts === 'none') {
    if (found.size > 0) {
      problems.push(
        `anatomy declares parts: 'none' but the DOM emits ${[...found.keys()].map(p => `"${p}"`).join(', ')}. `
        + '\'none\' means the component renders no element of its own; declare the parts instead.',
      )
    }
    return [...problems, ...checkStates(root, anatomy)]
  }

  const declared = new Set(anatomy.parts)
  const optional = new Set([...(anatomy.optionalParts ?? []), ...(options.absentParts ?? [])])

  const isComponentRoot = !(options.absentParts ?? []).includes('root')
  if (isComponentRoot && declared.has('root') && root.getAttribute('data-part') !== 'root') {
    problems.push(
      `anatomy declares a "root" part but the root element carries `
      + `data-part="${root.getAttribute('data-part') ?? '(absent)'}". A consumer targeting the root `
      + 'must be able to select it without knowing the element type.',
    )
  }

  for (const part of declared) {
    const count = found.get(part) ?? 0
    if (count === 0 && !optional.has(part)) {
      problems.push(
        `anatomy declares part "${part}" but no element emits data-part="${part}". `
        + 'Either emit it, or list it in optionalParts if it is conditional.',
      )
    }
    if (count > 1 && !optional.has(part)) {
      problems.push(
        `part "${part}" appears ${count} times. A part names one node; a repeating node belongs `
        + 'in optionalParts, which is what makes "sometimes many" a declared fact.',
      )
    }
  }

  for (const part of found.keys()) {
    if (!declared.has(part)) {
      problems.push(
        `the DOM emits data-part="${part}", which the anatomy does not declare. An undeclared part `
        + 'is a promise nobody reviewed and nothing stops from disappearing.',
      )
    }
  }

  return [...problems, ...checkStates(root, anatomy)]
}

function checkStates(root: Element, anatomy: CheckableAnatomy): string[] {
  const problems: string[] = []
  const declared = new Set(anatomy.states)

  for (const value of stateValuesIn(root)) {
    if (!declared.has(value)) {
      problems.push(
        `the DOM emits data-state="${value}", which the anatomy does not declare. States are `
        + 'per-component (ADR-19 §4), so the declaration is the only place this value is written down.',
      )
    }
  }

  for (const state of booleanStatesIn(root, anatomy)) {
    if (!declared.has(state)) {
      problems.push(
        `the DOM emits data-${state}, which the anatomy does not declare as a state. Boolean states `
        + 'are presence-only attributes and belong in `states` beside the data-state values.',
      )
    }
  }

  return problems
}

/**
 * Assert that rendered DOM matches a declared anatomy.
 *
 * @throws when the DOM and the declaration disagree, with every problem in one
 * message — a component that lost three parts should report three, not the
 * first one and then a rerun.
 *
 * @example
 * ```ts
 * import { anatomy } from './DzButton.anatomy.ts'
 *
 * it('conforms to its declared anatomy', () => {
 *   expectAnatomy(mount(DzButton, { slots: { default: 'Save' } }), anatomy)
 * })
 * ```
 */
export function expectAnatomy(
  target: AnatomyTarget,
  anatomy: CheckableAnatomy,
  options: AnatomyCheckOptions = {},
): void {
  const problems = checkAnatomy(target, anatomy, options)
  if (problems.length === 0)
    return

  throw new Error(
    `Anatomy conformance failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n${
      problems.map(problem => `  • ${problem}`).join('\n')}`,
  )
}
