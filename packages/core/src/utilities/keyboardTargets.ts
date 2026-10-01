/**
 * Which node a key belongs to (RESIDUAL-13).
 *
 * Every component that navigates with the arrow keys has the same problem the
 * moment its content is a `<slot />`: the key may have arrived at a text field,
 * and a text field owns its own arrows. The APG says so for the `toolbar`
 * pattern in as many words, and it is true of every composite widget that can
 * contain a field — stealing ArrowLeft from a search box moves the caret
 * nowhere and looks like a broken input.
 *
 * Deliberately **not** exported from `utilities/index.ts` or from the package
 * entry: it is a shared internal, not public API. `packages/core/src/index.ts`
 * is what `generate:ownership` classifies, so a public export here would add a
 * symbol to the ownership manifest for a four-line DOM predicate.
 *
 * @module @dzup-ui/core/utilities/keyboardTargets
 */

/**
 * `<input>` types that have no caret, and so are ordinary controls rather than
 * text entry.
 *
 * Written as the exclusion list rather than the inclusion list on purpose:
 * `type` has grown several times (`date`, `time`, `week`, `month`, `email`,
 * `search`, `tel`, `url`, …) and every addition has been a text-ish field, so an
 * inclusion list is a list that is wrong about the next one.
 */
const NON_TEXT_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'file',
  'image',
  'radio',
  'range',
  'reset',
  'submit',
])

/**
 * Whether this event target is a node that owns its own arrow keys and
 * Home/End — a text `<input>`, a `<textarea>`, or a `contenteditable` region.
 *
 * @param node - Usually an event's `target`, which is why `EventTarget | null`
 * rather than `HTMLElement`: the caller should not have to narrow first.
 */
export function ownsItsOwnCaret(node: EventTarget | null): boolean {
  if (!(node instanceof HTMLElement))
    return false
  if (node.isContentEditable || node.tagName === 'TEXTAREA')
    return true
  if (node.tagName !== 'INPUT')
    return false
  return !NON_TEXT_INPUT_TYPES.has((node as HTMLInputElement).type)
}

/**
 * Which of `options` a key event is currently *on*, or `-1`.
 *
 * `event.target` first, then the document's focus, and **both are needed**. A key
 * pressed on an option arrives with that option as the target; a key that reaches
 * the surrounding container — which is what a browser delivers when the container
 * itself has focus, and what a test dispatched at the container looks like —
 * carries the container. Answering the second case with "on nothing" is a real
 * defect and not a testing artefact: it sent the next-option key back to the
 * first option from wherever focus actually was. It was found by a failing test
 * in RESIDUAL-13 and is why this is one function rather than a line in each
 * component.
 *
 * Deliberately **key-agnostic**. Each component keeps its own `switch` over the
 * keys it declares, because that switch is what
 * `packages/tooling/src/validators/anatomy-keyboard.ts` reads to decide who owns
 * a declared key. A shared helper that named the keys would hand every importer
 * credit for every key in it, whether or not it calls them — which is exactly the
 * "satisfied because something nearby probably does it" verdict that validator
 * exists to refuse.
 */
export function focusedIndexIn(options: readonly Element[], event: Event): number {
  const indexOf = (node: unknown): number =>
    node instanceof Node ? options.findIndex(el => el === node || el.contains(node)) : -1
  const fromTarget = indexOf(event.target)
  if (fromTarget !== -1)
    return fromTarget
  return indexOf(options[0]?.ownerDocument.activeElement ?? null)
}
