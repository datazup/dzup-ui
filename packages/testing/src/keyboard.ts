/**
 * Asserting a component against its declared keyboard contract (TASK-R5-O5).
 *
 * The contract lives on the component's anatomy as
 * `keyboard: 'none' | KeyboardBinding[]` and is published as the keyboard table
 * on its documentation page. This module is the third thing that reads it — the
 * generator renders it, the parser refuses to half-read it, and
 * {@link expectKeyboardContract} holds the component to it.
 *
 * ## What this can and cannot check
 *
 * It **cannot** check that ArrowDown moves the selection to the next option:
 * only the component's own behaviour spec knows what "next" means, and a
 * generic assertion that tried would either be vacuous or wrong. Pretending
 * otherwise would put a green check beside an unverified claim, which is the
 * failure this contract exists to remove, not to relocate.
 *
 * What it **can** check, and does:
 *
 * 1. **Internal coherence** — every binding's `when` names a part or state the
 *    anatomy actually declares (a context column with its own private
 *    vocabulary cannot be cross-checked against anything), no duplicate
 *    key+modifier+context row, and no `rtl: 'mirrored'` on a component whose
 *    anatomy says its arrows do not swap.
 * 2. **Reachability** — a component that declares any binding must be able to
 *    receive a key at all: something in its tree is focusable, or its root
 *    carries a `tabindex`. A declared keyboard contract on a tree nothing can
 *    focus is unreachable by definition.
 * 3. **Consumption** — for the keys the caller asks about, that dispatching the
 *    event does not leave it unhandled. Opt-in per key via `handled`, because
 *    "the component called preventDefault" is only the right assertion for the
 *    keys whose default action it overrides.
 *
 * Everything else belongs in the component's own spec, and the capability
 * matrix's `keyboard-spec` cell measures whether that spec exercises each
 * declared key by name.
 *
 * @module @dzup-ui/testing/keyboard
 */

/** One row of a component's keyboard contract, structurally. */
export interface CheckableBinding {
  readonly key: string
  readonly modifiers?: readonly string[]
  readonly when?: string
  readonly action: string
  readonly wcag?: readonly string[]
  readonly apg?: string
  readonly rtl?: string
}

/** The anatomy fields this check reads. Satisfied by `ComponentAnatomy`. */
export interface CheckableKeyboardAnatomy {
  readonly parts: readonly string[] | 'none'
  readonly states: readonly string[]
  readonly keyboard?: 'none' | readonly CheckableBinding[]
  readonly rtl?: { readonly mirrors: string, readonly keyboard: string }
}

/** Anything with a root element — a `@vue/test-utils` wrapper, or an element. */
export type KeyboardTarget = Element | { element: Element }

function rootOf(target: KeyboardTarget): Element {
  return 'element' in target ? target.element : target
}

/** Selector for anything the platform will put in the tab order by default. */
const FOCUSABLE = [
  'a[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',')

export interface KeyboardCheckOptions {
  /**
   * Keys to assert the component actually consumes, spelled as
   * `KeyboardEvent.key` spells them. For each one the event is dispatched at
   * the first focusable node (or the root) and the check fails if nothing
   * called `preventDefault()`.
   *
   * Opt-in rather than automatic: a component legitimately handles `Tab`
   * without preventing it, and `Escape` without preventing it, so asserting
   * consumption for every declared key would be wrong for most of them.
   */
  readonly handled?: readonly string[]
  /** Skip the reachability check — for a contract whose keys are document-level. */
  readonly documentLevel?: boolean
}

/**
 * Every problem with a component's keyboard contract, as sentences. Empty when
 * the contract is coherent and reachable.
 */
export function checkKeyboardContract(
  target: KeyboardTarget,
  anatomy: CheckableKeyboardAnatomy,
  options: KeyboardCheckOptions = {},
): string[] {
  const problems: string[] = []
  const contract = anatomy.keyboard

  if (contract === undefined) {
    return [
      'No keyboard contract is declared. Declare `keyboard: \'none\'` when the component has no '
      + 'keyboard behaviour of its own — an absent field and an explicit none are different facts, '
      + 'and the documentation ratchet counts the first.',
    ]
  }
  if (contract === 'none')
    return problems

  const root = rootOf(target)
  const vocabulary = new Set<string>([
    ...(anatomy.parts === 'none' ? [] : anatomy.parts),
    ...anatomy.states,
  ])

  const seen = new Set<string>()
  for (const binding of contract) {
    const id = `${[...(binding.modifiers ?? [])].sort().join('+')}|${binding.key}|${binding.when ?? ''}`
    if (seen.has(id)) {
      problems.push(
        `Duplicate binding: \`${binding.key}\`${binding.when === undefined ? '' : ` (when \`${binding.when}\`)`} `
        + 'is declared twice with the same modifiers and context. Two rows for one key read as two '
        + 'behaviours.',
      )
    }
    seen.add(id)

    // A `when` is allowed to be free text for a condition the anatomy has no
    // word for ('list open'), but a SINGLE word that looks like a part or state
    // name and is not one is almost always a typo — and a typo here silently
    // scopes a published row to a context that does not exist.
    if (binding.when !== undefined && /^[a-z][a-z0-9-]*$/.test(binding.when) && !vocabulary.has(binding.when)) {
      problems.push(
        `Binding \`${binding.key}\` is scoped to \`${binding.when}\`, which is neither a declared part `
        + `nor a declared state. Declared parts: ${anatomy.parts === 'none' ? 'none' : anatomy.parts.join(', ')}; `
        + `states: ${anatomy.states.join(', ') || 'none'}.`,
      )
    }

    if (binding.rtl === 'mirrored' && anatomy.rtl?.keyboard === 'none') {
      problems.push(
        `Binding \`${binding.key}\` is marked \`rtl: 'mirrored'\` but the anatomy declares `
        + '`rtl.keyboard: \'none\'`. Either the arrow keys swap in a RTL document or they do not.',
      )
    }
  }

  if (options.documentLevel !== true) {
    const focusable = root.matches(FOCUSABLE) || root.querySelector(FOCUSABLE) !== null
    if (!focusable) {
      problems.push(
        `${contract.length} keyboard binding(s) are declared, but nothing in the rendered tree is `
        + 'focusable, so no key can ever reach the component. Give it a focusable node, or pass '
        + '`documentLevel: true` if the keys are bound on the document.',
      )
    }
  }

  for (const key of options.handled ?? []) {
    const declared = contract.some(b => b.key === key)
    if (!declared) {
      problems.push(`\`${key}\` was asserted as handled but is not in the declared contract.`)
      continue
    }
    const node = (root.matches(FOCUSABLE) ? root : root.querySelector(FOCUSABLE)) ?? root
    const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
    node.dispatchEvent(event)
    if (!event.defaultPrevented) {
      problems.push(
        `\`${key}\` is declared but the component did not call \`preventDefault()\` on it. The `
        + 'declared row promises the component acts on this key.',
      )
    }
  }

  return problems
}

/**
 * Assert a component conforms to its declared keyboard contract, throwing with
 * every problem at once.
 *
 * @example
 * ```ts
 * import { anatomy } from './DzButton.anatomy.ts'
 *
 * it('conforms to its declared keyboard contract', () => {
 *   expectKeyboardContract(mount(DzButton, { slots: { default: 'Save' } }), anatomy)
 * })
 * ```
 */
export function expectKeyboardContract(
  target: KeyboardTarget,
  anatomy: CheckableKeyboardAnatomy,
  options: KeyboardCheckOptions = {},
): void {
  const problems = checkKeyboardContract(target, anatomy, options)
  if (problems.length === 0)
    return

  throw new Error(
    `Keyboard contract conformance failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n${
      problems.map(problem => `  • ${problem}`).join('\n')}`,
  )
}
