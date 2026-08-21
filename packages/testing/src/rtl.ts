/**
 * Right-to-left conformance (TASK-OSS-P4-05, ADR-19, ADR-20).
 *
 * `expectAnatomy` checks that a component renders the nodes it declared.
 * `expectRtl` checks that it behaves the way it declared in a right-to-left
 * document — which is a different kind of claim, and one that was previously
 * made only by whoever last wrote the CSS.
 *
 * **What can and cannot be checked where.** jsdom implements the CSS *object
 * model* but not layout: it will tell you an element has `margin-inline-start`
 * if the inline style says so, and it will not resolve a Tailwind class into
 * one. So the rules split:
 *
 *   - **Source-level** (runs anywhere, including `yarn test`): a component that
 *     declares `mirrors: 'layout'` must not use physical `left`/`right`
 *     utilities. This is the check that catches a regression the day it is
 *     written.
 *   - **Computed-style** (browser lane only): the resolved
 *     `margin-inline-start` actually lands on the correct physical side under
 *     `dir="rtl"`. `expectRtlComputed` is the one that needs a real engine, and
 *     it says so rather than passing vacuously in jsdom.
 *
 * The split is the point. A helper that silently proved nothing under jsdom
 * would be worse than no helper, because the suite would be green.
 *
 * @module @dzup-ui/testing/rtl
 */

import type { ComponentRtl } from '@dzup-ui/contracts'

/** Anything with an `element`, i.e. a Vue Test Utils wrapper, or an element. */
export interface RtlTarget {
  element?: Element
}

function rootOf(target: RtlTarget | Element): Element {
  return 'element' in target && target.element !== undefined
    ? target.element
    : target as Element
}

/**
 * Physical utilities that have a logical equivalent.
 *
 * Deliberately not "every class containing left or right": `left-align-icon`,
 * `arrow-right` and `rounded-lg` are not layout, and a rule that flagged them
 * would be turned off within a week.
 */
const PHYSICAL_UTILITY
  = /(?:^|\s)-?(?:m[lr]|p[lr]|border-[lr]|rounded-[lr]|inset-[lr])(?:-|\b)|(?:^|\s)text-(?:left|right)\b/

/** The logical replacement for a physical utility, for the failure message. */
const SUGGESTION: Record<string, string> = {
  'ml': 'ms',
  'mr': 'me',
  'pl': 'ps',
  'pr': 'pe',
  'border-l': 'border-s',
  'border-r': 'border-e',
  'rounded-l': 'rounded-s',
  'rounded-r': 'rounded-e',
  'text-left': 'text-start',
  'text-right': 'text-end',
}

/** Every class on the element and its descendants, flattened. */
function classesIn(root: Element): string[] {
  const out = [...root.classList]
  for (const node of root.querySelectorAll('[class]'))
    out.push(...node.classList)
  return out
}

/**
 * Assert a rendered component matches its declared RTL contract.
 *
 * Source-level only — see the module note. Pair with `expectRtlComputed` in the
 * browser lane for the half jsdom cannot answer.
 *
 * @throws when the DOM contradicts the declaration, listing every problem.
 *
 * @example
 * ```ts
 * import { anatomy } from './DzButton.anatomy.ts'
 *
 * it('honours its RTL contract', () => {
 *   expectRtl(mount(DzButton, { slots: { default: 'Save' } }), anatomy.rtl)
 * })
 * ```
 */
export function expectRtl(target: RtlTarget | Element, rtl: ComponentRtl | undefined): void {
  if (rtl === undefined) {
    throw new Error(
      'expectRtl was given no RTL declaration. Add an `rtl` field to the component\'s '
      + 'anatomy — `mirrors` and `keyboard` are both required — or do not call this helper.',
    )
  }

  const problems = checkRtl(rootOf(target), rtl)
  if (problems.length === 0)
    return

  throw new Error(
    `RTL conformance failed (${problems.length} problem${problems.length === 1 ? '' : 's'}):\n${
      problems.map(p => `  • ${p}`).join('\n')}`,
  )
}

/** The rules, as a list of problems. Empty means conformant. */
export function checkRtl(root: Element, rtl: ComponentRtl): string[] {
  const problems: string[] = []

  if (rtl.mirrors === 'layout') {
    const physical = classesIn(root).filter(c => PHYSICAL_UTILITY.test(` ${c}`))
    for (const cls of [...new Set(physical)]) {
      const key = Object.keys(SUGGESTION).find(k => cls.replace(/^-/, '').startsWith(k))
      const fix = key === undefined ? 'its logical equivalent' : `\`${SUGGESTION[key]}\``
      problems.push(
        `declares mirrors: 'layout' but renders the physical utility \`${cls}\`. `
        + `Use ${fix}, or declare mirrors: 'none' and say why.`,
      )
    }
  }

  return problems
}

/**
 * Assert the resolved inline-axis geometry lands on the correct physical side.
 *
 * **Needs a real engine.** jsdom does not do layout, so `getComputedStyle`
 * returns nothing useful for a class-driven `margin-inline-start`. Rather than
 * pass vacuously, this throws when it detects it is running without layout —
 * a test that cannot check its claim should say so, not go green.
 *
 * @param root - the element to measure, already rendered under `dir="rtl"`
 * @param property - a logical property, e.g. `margin-inline-start`
 */
export function expectRtlComputed(root: Element, property: string): string {
  const view = root.ownerDocument.defaultView
  if (view === null)
    throw new Error('expectRtlComputed needs a window; the element is detached.')

  const resolved = view.getComputedStyle(root).getPropertyValue(property)
  if (resolved === '') {
    throw new Error(
      `expectRtlComputed could not resolve \`${property}\`. This helper needs an engine `
      + 'that does layout — run it in the Playwright lane, not in jsdom.',
    )
  }
  return resolved
}

/**
 * The horizontal arrow key that means "forward" in a given direction.
 *
 * The one line of RTL keyboard logic worth sharing, because every component
 * that swaps gets it wrong in the same way: `ArrowRight` advances in LTR and
 * retreats in RTL.
 */
export function forwardArrow(direction: 'ltr' | 'rtl'): 'ArrowLeft' | 'ArrowRight' {
  return direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
}
