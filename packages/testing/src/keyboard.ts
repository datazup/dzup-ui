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
  /**
   * Single-word `when` values that are legitimate conditions rather than typos
   * — in practice the component's own **prop** names.
   *
   * This settles RESIDUAL-12 §4 `F14`, which found the rule below flagging a
   * single-word `when` as *"almost always a typo"* while **12 values in live
   * use** (`clickable`, `interactive`, `open`, `closable`, `dropzone`, …) are
   * legitimate prop names — and nothing called the rule, so neither half was
   * ever true. The first spec to call it (`DzListItem`, whose two rows are both
   * `when: 'interactive'`) failed on arrival.
   *
   * The decision is **a `when` may name a prop**, and the direction taken is to
   * make that sayable rather than to delete the rule. Two alternatives were
   * rejected:
   *
   * - **Drop the rule.** It is the only thing standing between a published row
   *   and a context that does not exist, and a typo'd `when` scopes the row to
   *   nothing while still rendering on the documentation page.
   * - **Declare the prop as a `state`.** `states` is the `data-state` vocabulary
   *   and `validate:anatomy-parts` holds components to emitting what they
   *   declare, so this would trade a docs-only inaccuracy for a false attribute
   *   claim the parts gate would then have to be told to ignore.
   *
   * It is deliberately per-call rather than derived: the anatomy does not carry
   * the component's prop names, and a check that guessed them would be a check
   * that passes for the guess rather than for the component.
   */
  readonly conditions?: readonly string[]
  /**
   * Keys the caller asserts are owned by a **native element in the rendered
   * tree** — the platform's Enter and Space on a `<button>`, Enter on an
   * `<a href>`, Space on a checkbox or radio `<input>`, text entry in a field.
   * For each one the check fails unless the mounted tree contains an element
   * whose documented HTML behaviour is that key.
   *
   * This is the half of the contract that **only a runtime check can see**, and it
   * is why RESIDUAL-13 added it. Six rows across `DzCheckboxGroup`, `DzCollapse`,
   * `DzFieldArray` and `DzRadioGroup` declare a key whose receiving node is the
   * consumer's own: the component is a `<div>` and a `<slot />`, and
   * `validate:anatomy-keyboard` reported them `undetermined` — not satisfied, and
   * not a defect either, because the answer is behind an edge a source scan cannot
   * follow. A spec that mounts the component with real children can follow it.
   *
   * Distinct from {@link handled}, and the two are not interchangeable: `handled`
   * asserts the component **consumed** the key, which is right for a key it
   * overrides and **wrong** for a platform key — Reka's `CheckboxRoot` and
   * `RadioGroupItem` prevent `Enter` only (measured in their own `dist`), because
   * Space on a `<button>` is native activation and preventing it would break the
   * thing. `platform` asserts the opposite and correct thing: that a node exists
   * whose own behaviour is the declared key.
   */
  readonly platform?: readonly string[]
  /**
   * The shape of the **tab order** over a set of nodes — the assertion a `Tab`
   * row needs, and the one neither {@link handled} nor {@link platform} can make
   * (RESIDUAL-15).
   *
   * ## Why this exists rather than `platform: ['Tab']`
   *
   * RESIDUAL-14 §6 scheduled the five remaining `undetermined` `Tab` rows as
   * "one `expectKeyboardContract` call each asserting `Tab` in its `platform`
   * list… scheduled work, not an owner judgement". Measured, that call **throws**:
   * {@link PLATFORM_OWNERS} has no entry for `Tab` and says so in its own
   * docblock — *"activation and text entry only, **never navigation**"* — so the
   * check reports "the rendered tree contains no element whose documented HTML
   * behaviour is that key". That refusal is **correct and was kept**: `Tab` is not
   * a behaviour of an element, it is the document's focus order, and a `Tab` entry
   * in that table would credit any focusable node for any `Tab` row.
   *
   * A `Tab` row in this library makes one of two opposite claims, and the
   * difference is the whole content of the row:
   *
   * | Claim | `expect` | Mechanism |
   * |---|---|---|
   * | *"each box in the group is its own tab stop"* | `'each'` | every node in the tab order |
   * | *"the toolbar is one tab stop"* | `'one'` | a roving `tabindex`, which takes the siblings **out** of the order |
   *
   * RESIDUAL-14 §2.2.4 caught exactly that inversion being published:
   * `DzCheckboxGroup`'s "each box is its own tab stop" was cited to
   * `RovingFocusItem.js`, *"which is what makes a group **one** tab stop — the
   * citation asserts the opposite of the row"*. A single `platform: ['Tab']`
   * could not have told those two rows apart either.
   *
   * ## What it asserts
   *
   * 1. `Tab` is in the declared contract (a spec cannot assert a row that is not
   *    published).
   * 2. `of` matches **at least two** nodes in the rendered tree. A statement about
   *    focus order over fewer than two nodes is not a statement about order, and
   *    the component must be mounted with the children a consumer would supply —
   *    which is the point of asking this at runtime.
   * 3. Exactly `expect === 'each' ? all : 1` of them are in the tab order, where
   *    "in the tab order" is `tabindex` other than `-1` **and** either natively
   *    focusable or carrying a `tabindex`.
   * 4. **The key is driven**: a cancelable `Tab` keydown is dispatched at the
   *    first node in the order and the component must not have consumed it. Both
   *    of these rows' sentences begin "move to"/"move out of", and a component
   *    that calls `preventDefault()` on `Tab` has trapped focus. jsdom moves no
   *    focus on `Tab` — the same limit `DzCheckboxGroup`'s Space test already
   *    documents — so the assertion is these two halves rather than a focus read.
   *
   * What it does **not** prove is that the browser's order matches DOM order;
   * `tabindex` values above zero, `inert` and portals can all reorder it, and
   * `packages/core/src/**` has a browser lane for that.
   */
  readonly tabStops?: {
    /** CSS selector for the nodes the row is about, resolved inside the root. */
    readonly of: string
    /** `'each'` — every node is its own tab stop. `'one'` — the set is one. */
    readonly expect: 'each' | 'one'
  }
}

/**
 * Elements whose documented HTML behaviour is a given key.
 *
 * The runtime twin of `packages/tooling/src/validators/anatomy-keyboard.ts`'s
 * `PLATFORM_KEYS`, and written down for the same reason: it is the one thing that
 * cannot be derived from a file in this repository. Kept deliberately narrow:
 * activation and text entry only, **never navigation**. A declared arrow is a
 * claim about roving focus, and roving focus always takes code; crediting it to a
 * native element because one happens to be nearby is the verdict both of these
 * checks exist to refuse.
 */
const PLATFORM_OWNERS: { readonly selector: string, readonly what: string, readonly keys: readonly string[] }[] = [
  { selector: 'button:not([disabled])', what: '<button>', keys: ['Enter', ' '] },
  { selector: 'summary', what: '<summary>', keys: ['Enter', ' '] },
  { selector: 'select:not([disabled])', what: '<select>', keys: ['Enter', ' '] },
  { selector: 'a[href]', what: '<a href>', keys: ['Enter'] },
  {
    selector: 'input[type="checkbox"]:not([disabled]),input[type="radio"]:not([disabled])',
    what: '<input type="checkbox"> / <input type="radio">',
    keys: [' '],
  },
  {
    selector: 'input:not([type]),input[type="text"],input[type="search"],input[type="email"],input[type="url"],input[type="tel"],input[type="password"],input[type="number"],textarea,[contenteditable="true"]',
    what: 'a text field',
    keys: ['<character>', '<digit>'],
  },
  { selector: 'dialog', what: '<dialog>', keys: ['Escape'] },
  // ARIA's own activation roles: a node that says it is a button or a checkbox
  // answers the same keys, whatever element carries the role. Reka renders
  // `<button role="checkbox">`, which the first entry already covers, but a
  // consumer's own `role="button"` div with a `tabindex` is a legitimate answer
  // to a declared Enter and would otherwise read as "no owner".
  { selector: '[role="button"],[role="checkbox"],[role="radio"],[role="switch"],[role="menuitem"],[role="option"]', what: 'a node carrying an activation role', keys: ['Enter', ' '] },
]

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
    ...(options.conditions ?? []),
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
    // scopes a published row to a context that does not exist. A prop name is
    // the legitimate third case and is admitted through `conditions`; see that
    // option for the `F14` decision and the alternatives it was chosen over.
    if (binding.when !== undefined && /^[a-z][a-z0-9-]*$/.test(binding.when) && !vocabulary.has(binding.when)) {
      problems.push(
        `Binding \`${binding.key}\` is scoped to \`${binding.when}\`, which is neither a declared part `
        + `nor a declared state. Declared parts: ${anatomy.parts === 'none' ? 'none' : anatomy.parts.join(', ')}; `
        + `states: ${anatomy.states.join(', ') || 'none'}. If it names a prop of the component, pass it `
        + 'in `conditions` — a prop is a legitimate context and a typo is not.',
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

  for (const key of options.platform ?? []) {
    if (!contract.some(b => b.key === key)) {
      problems.push(`\`${key}\` was asserted as platform-owned but is not in the declared contract.`)
      continue
    }
    const owner = PLATFORM_OWNERS.find(entry =>
      entry.keys.includes(key)
      && (root.matches(entry.selector) || root.querySelector(entry.selector) !== null))
    if (owner === undefined) {
      problems.push(
        `\`${key}\` is declared and asserted as platform-owned, but the rendered tree contains no `
        + 'element whose documented HTML behaviour is that key. Candidates for it: '
        + `${PLATFORM_OWNERS.filter(e => e.keys.includes(key)).map(e => e.what).join(', ') || 'none — `platform` credits activation and text entry only, never navigation'}. `
        + 'Mount the component with the children a consumer would supply, or stop declaring the row.',
      )
    }
  }

  if (options.tabStops !== undefined) {
    const { of: selector, expect: shape } = options.tabStops
    if (!contract.some(b => b.key === 'Tab')) {
      problems.push(
        '`tabStops` was asserted but `Tab` is not in the declared contract. This option evidences '
        + 'a published `Tab` row; it is not a way to claim one.',
      )
    }
    else {
      // The ROOT counts when it matches, and that is not a courtesy:
      // `querySelectorAll` searches descendants only, and Reka builds "one tab
      // stop" by putting `tabindex="0"` on the GROUP and `-1` on every item
      // (`RovingFocusGroup.js` / `RovingFocusItem.js`). `DzRadioGroup` measured
      // `0 of 2` — a correct implementation reported broken — until the
      // `role="radiogroup"` root was in the set. `platform` above already reads
      // the root the same way.
      const nodes = [
        ...(root.matches(selector) ? [root] : []),
        ...root.querySelectorAll(selector),
      ]
      if (nodes.length < 2) {
        problems.push(
          `\`tabStops\` was asserted over \`${selector}\`, which matched ${nodes.length} node(s) in the `
          + 'rendered tree. A claim about focus ORDER needs at least two nodes to be a claim about '
          + 'anything — mount the component with the children a consumer would supply.',
        )
      }
      else {
        // "In the tab order" is `tabindex` other than -1, on a node that is either
        // natively focusable or carries a `tabindex` at all. A roving-focus group is
        // the case that matters: it leaves one node at 0 and sets every sibling to
        // -1, which is how "one tab stop" is built.
        const inOrder = nodes.filter(node =>
          node.getAttribute('tabindex') !== '-1'
          && (node.matches(FOCUSABLE) || node.hasAttribute('tabindex')))
        const wanted = shape === 'each' ? nodes.length : 1
        if (inOrder.length !== wanted) {
          problems.push(
            `\`Tab\` is declared as "${shape === 'each' ? 'every node is its own tab stop' : 'one tab stop'}" `
            + `over \`${selector}\`, but ${inOrder.length} of ${nodes.length} matched node(s) are in the tab `
            + `order and the row says ${wanted}. ${shape === 'each'
              ? 'A node with `tabindex="-1"` has been taken out of the order — a roving `tabindex` is what '
              + 'makes a set ONE tab stop, which is the opposite of this row.'
              : 'One tab stop means a roving `tabindex`: one node at 0 and every sibling at -1.'}`,
          )
        }
        // Drive the key. A `Tab` row that says focus MOVES is false if the
        // component consumed the key; jsdom moves no focus on Tab, so this half
        // and the count above are the two halves of the claim.
        const from = inOrder[0] ?? nodes[0]!
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
        from.dispatchEvent(event)
        if (event.defaultPrevented) {
          problems.push(
            '`Tab` is declared as moving focus, but the component called `preventDefault()` on it. A '
            + 'component that consumes `Tab` has trapped focus; if that is intended, the row is not '
            + '"move to"/"move out of" and a focus trap declares `Tab` differently.',
          )
        }
      }
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
