/**
 * Whether a component's sidecar specs **touch the surfaces their cell names** — the
 * outcome half of the `contract-spec` and `unit-spec` citations.
 *
 * ## What this replaces (RESIDUAL-19)
 *
 * Both kinds were credited on **file existence**: `Dz{Name}.contract.spec.ts` on
 * disk was `contract-spec: present`, `Dz{Name}.spec.ts` was `unit-spec: present`.
 * RESIDUAL-16 audited the 283 citations against "a live test with an `expect(` and
 * a mount" and passed all of them, and both it and RESIDUAL-17 said in as many
 * words that this measured existence plus one live assertion and not conformance.
 *
 * `@dzup-ui/contracts` says what the two cells claim (`quality-tiers.ts`):
 *
 *  - `contract-spec` — *"Contract Spec v1 props/events/slots/ARIA"*;
 *  - `unit-spec` — *"render and behaviour units"*.
 *
 * Measured against those two sentences at `4e4e46f`, by census over all 283: of
 * 142 contract specs, **41** never listen for or assert an event on a component
 * whose own `Emits` interface declares one, **42** never fill a slot the `Slots`
 * interface declares, and **38** never read an `aria-*`/`role` the template
 * writes. `DzCheckbox.contract.spec.ts` has nine tests and none of them mentions
 * `change`. Of 141 unit specs, **7** never drive anything on a component that
 * emits — `DzInput.spec.ts` has 23 tests and never types into the input.
 *
 * ## The rule
 *
 * A surface is **owed** only when the component itself declares it, read from the
 * component's own files and never from a list kept here:
 *
 * | Surface | Owed when | Touched when the spec's live code has |
 * |---|---|---|
 * | `props` | `Dz{Name}Props` declares a member | `props:` / `attrs:` / `.setProps(` / an attribute on the component's own tag in a template / `h(Dz{Name}, { … })` |
 * | `events` | `Dz{Name}Emits` declares a member | `.emitted(` / an `on{Event}:` listener / `@event=` in a template |
 * | `slots` | `Dz{Name}Slots` declares a member | `slots:` / `<template #…>` / children inside the component's own tag / `h(Dz{Name}, …, { default … })` |
 * | `aria` | the `<template>` writes `role` or an `aria-*` other than `aria-hidden` | `aria-*` / `role` / `getByRole` / `toHaveAccessible…` |
 * | `behaviour` (`unit-spec`) | the SFC calls `defineEmits` or `defineModel` | `.trigger(` / `.setValue(` / `.setProps(` / `.emitted(` / `dispatchEvent` / `userEvent` / `fireEvent` / `.click()` |
 *
 * "Live code" is the comment-stripped file with every `it.skip` / `it.todo` /
 * `it.fails` block blanked, and the file must hold at least one live block with
 * an `expect`. The term may sit in a file-level helper rather than in the block —
 * most contract specs mount through one — which is why the unit is the file and
 * not the block.
 *
 * ## What this does NOT prove, stated so nobody reads it as more
 *
 * This is a **surface-touched** predicate, not a conformance proof:
 *
 *  - it does not check that **every** declared member is covered — one asserted
 *    event satisfies `events` on a component that declares five;
 *  - it cannot tell an assertion from its negation (RESIDUAL-17 §7 item 1).
 *    `expect(w.emitted('change')).toBeUndefined()` touches `events`. For a
 *    contract that is usually right — "a disabled control emits nothing" is a
 *    contract clause — but it is a limit and not a feature;
 *  - **applicability is conservative**: members inherited through `extends`, an
 *    interface declared in another component's `.types.ts`, and ARIA bound from
 *    script rather than written in the template are all invisible here, so the
 *    surface is treated as **not owed**. The predicate can under-ask; it is built
 *    so that it cannot over-ask.
 *
 * Whether Contract Spec v1 *conformance* is decidable from text at all is an open
 * question this module does not pretend to settle. What it settles is that a cell
 * named for four surfaces is no longer credited by a file that touches one.
 *
 * @module @dzup-ui/tooling/quality/spec-contract-surfaces
 */

import { testBlocksIn } from './spec-capability-refs.ts'
import { stripComments } from './spec-component-refs.ts'

/** The four surfaces Contract Spec v1 names, in the order it names them. */
export type ContractSurface = 'props' | 'events' | 'slots' | 'aria'

export const CONTRACT_SURFACES: readonly ContractSurface[] = ['props', 'events', 'slots', 'aria']

/**
 * How many members `interface {name}` / `type {name} = {…}` declares itself.
 *
 * `undefined` when `source` does not declare it, which a caller must keep apart
 * from `0`: "declared empty" is a fact about the component, "not found here" is a
 * fact about where this looked. Inherited members are deliberately not followed.
 *
 * `source` must already be comment-stripped — a `{` in a JSDoc example would
 * otherwise unbalance the scan.
 */
export function declaredMembers(source: string, name: string): number | undefined {
  const head = new RegExp(`\\b(?:interface|type)\\s+${name}\\b(?![\\w$])`).exec(source)
  if (head === null)
    return undefined
  const open = source.indexOf('{', head.index)
  // A `type X = Y` alias with no literal body before the next declaration has no
  // members of its own to count.
  const nextDeclaration = source.slice(head.index + head[0].length).search(/\b(?:export|interface|type|const|function)\s/)
  if (open === -1 || (nextDeclaration !== -1 && open > head.index + head[0].length + nextDeclaration))
    return undefined

  let depth = 0
  let members = 0
  let atMemberStart = false
  for (let i = open; i < source.length; i++) {
    const c = source[i]!
    if (c === '{' || c === '(' || c === '[' || c === '<') {
      // A call signature — `(e: 'change', value: string): void` — is a member.
      if (depth === 1 && atMemberStart && c === '(') {
        members++
        atMemberStart = false
      }
      depth++
      if (depth === 1)
        atMemberStart = true
      continue
    }
    if (c === '}' || c === ')' || c === ']' || (c === '>' && source[i - 1] !== '=')) {
      depth--
      if (depth === 0)
        break
      continue
    }
    if (depth !== 1)
      continue
    if (c === '\n' || c === ';' || c === ',') {
      atMemberStart = true
      continue
    }
    if (atMemberStart && c.trim() !== '') {
      members++
      atMemberStart = false
    }
  }
  return members
}

/** The outermost `<template>` of an SFC, HTML comments removed. */
function templateOf(vue: string): string {
  const from = vue.indexOf('<template')
  const to = vue.lastIndexOf('</template>')
  if (from === -1 || to === -1)
    return ''
  return vue.slice(from, to).replaceAll(/<!--[\s\S]*?-->/g, '')
}

/** What one component declares, read from its own two files. */
export interface ComponentDeclaration {
  readonly component: string
  /** The component's `.types.ts`, or `''` when it has none. */
  readonly types: string
  /** The component's `.vue`. */
  readonly vue: string
}

/** The contract surfaces this component itself declares — the ones a spec owes. */
export function surfacesOwed(declaration: ComponentDeclaration): ContractSurface[] {
  const types = stripComments(declaration.types)
  const owed: ContractSurface[] = []
  if ((declaredMembers(types, `${declaration.component}Props`) ?? 0) > 0)
    owed.push('props')
  if ((declaredMembers(types, `${declaration.component}Emits`) ?? 0) > 0)
    owed.push('events')
  if ((declaredMembers(types, `${declaration.component}Slots`) ?? 0) > 0)
    owed.push('slots')
  // `aria-hidden` on a decorative icon is not a contract a consumer can observe,
  // and asking a spec to assert it would be this predicate over-asking.
  if (/\s:?aria-(?!hidden\b)[a-z]+=|\s:?role=/.test(templateOf(declaration.vue)))
    owed.push('aria')
  return owed
}

/** Does the SFC emit or own a model — i.e. is there behaviour for a unit to drive? */
export function hasBehaviour(declaration: ComponentDeclaration): boolean {
  return /\bdefine(?:Emits|Model)\s*[<(]/.test(stripComments(declaration.vue))
}

/** A spec, reduced to the code that runs. */
export interface LiveSpec {
  /** Live `it`/`test` blocks that contain an `expect`. */
  readonly asserting: number
  /** Comment-stripped source with every skipped block blanked. */
  readonly code: string
}

/**
 * The part of a spec that executes.
 *
 * A skipped block is blanked rather than merely not counted: the surface terms are
 * searched file-wide (helpers live outside the blocks), so a skipped test left in
 * place would lend its `emitted(` to a file in which no running test asserts one —
 * RESIDUAL-16's `DzAccordion` defect, one level up.
 */
export function liveSpec(source: string): LiveSpec {
  let code = stripComments(source, { preserveLines: true })
  const blocks = testBlocksIn(code)
  for (const block of blocks) {
    if (block.skipped)
      code = code.replace(block.text, block.text.replaceAll(/[^\n]/g, ' '))
  }
  return {
    asserting: blocks.filter(block => !block.skipped && /\bexpect\w*\s*\(/.test(block.text)).length,
    code,
  }
}

/** The per-surface terms. `component` scopes the two that read a template tag. */
function surfaceTerm(surface: ContractSurface, component: string): RegExp {
  switch (surface) {
    case 'props':
      return new RegExp(
        `\\bprops\\s*:|\\battrs\\s*:|\\.setProps\\s*\\(|<${component}\\b[^>]*\\s:?[\\w-]+=`
        // `h(DzRadio, { value: 'a' })` — a render-function mount passes props too.
        + `|\\bh\\(\\s*${component}\\s*,\\s*\\{\\s*[\\w'"]`,
      )
    case 'events':
      return /\.emitted\s*\(|['"]?\bon[A-Z][\w:]*['"]?\s*[:,}]|\s@[\w:.-]+=/
    case 'slots':
      return new RegExp(
        `\\bslots\\s*:|<template\\s+(?:#|v-slot)|<${component}(?:\\s[^>]*[^/>])?>(?!\\s*</${component}>)`
        + `|\\bh\\(\\s*${component}\\s*,[^;]{0,400}?(?:=>|\\bdefault\\s*:)`,
      )
    case 'aria':
      return /\baria-[a-z]+|\brole\b|\bgetByRole\b|\btoHaveAccessible/
  }
}

/** A user-visible drive of the component, or an observation of what it emitted. */
const BEHAVIOUR = /\.trigger\s*\(|\.setValue\s*\(|\.setProps\s*\(|\.emitted\s*\(|\bdispatchEvent\s*\(|\buserEvent\b|\bfireEvent\b|\.click\s*\(\s*\)/

/** The owed contract surfaces a contract spec does **not** touch. Empty is credit. */
export function missingContractSurfaces(
  declaration: ComponentDeclaration,
  specSource: string,
): ContractSurface[] {
  const spec = liveSpec(specSource)
  const owed = surfacesOwed(declaration)
  if (spec.asserting === 0)
    return owed.length === 0 ? [...CONTRACT_SURFACES] : owed
  return owed.filter(surface => !surfaceTerm(surface, declaration.component).test(spec.code))
}

/** Why a unit spec does not earn `unit-spec`, or `undefined` when it does. */
export function unitSpecGap(
  declaration: ComponentDeclaration,
  specSource: string,
): 'no-live-assertion' | 'no-behaviour' | undefined {
  const spec = liveSpec(specSource)
  if (spec.asserting === 0)
    return 'no-live-assertion'
  if (hasBehaviour(declaration) && !BEHAVIOUR.test(spec.code))
    return 'no-behaviour'
  return undefined
}
