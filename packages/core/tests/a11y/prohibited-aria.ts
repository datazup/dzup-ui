/**
 * Reading axe's `incomplete` bucket, which `toHaveNoViolations()` cannot see
 * (RESIDUAL-12, closing `D-RES11-1`).
 *
 * ## Why this file exists
 *
 * `axe-core` sorts its output into four buckets: `passes`, `violations`,
 * `inapplicable` and **`incomplete`** — the last being checks that could not be
 * decided automatically and need a human look. `vitest-axe`'s
 * `toHaveNoViolations()` reads **only** `violations`. So a finding axe places in
 * `incomplete` is invisible to every a11y spec in this repository, and has been
 * for as long as they have existed.
 *
 * That is not a theoretical hole. `aria-prohibited-attr` — ARIA 1.2's rule that
 * some roles may not carry `aria-label` or `aria-labelledby` at all — lands in
 * `incomplete`, because axe cannot know whether the element's own content already
 * names it. `DzTag` shipped a prohibited `aria-label` on its root from the day it
 * was written; `DzChip` acquired the same one in RESIDUAL-11 when it gave up a
 * live-region role that had been suppressing the warning by being wrong. Six axe
 * assertions across the two components were green throughout. RESIDUAL-11 raised
 * it as `D-RES11-1` and said explicitly that **no gate could see it**.
 *
 * ## What this asserts, and what it deliberately does not
 *
 * {@link expectNoProhibitedAria} fails on `aria-prohibited-attr` in **either**
 * bucket, and names the element and the offending attributes. It is deliberately
 * narrow: it does **not** fail on every `incomplete` rule. `incomplete` also
 * carries `color-contrast` (undecidable under jsdom, which has no layout) and
 * `aria-valid-attr-value` (fired by any `aria-describedby` pointing at an id the
 * test fixture does not render), and a blanket assertion would be red on arrival
 * for reasons that are properties of the test environment rather than of the
 * component. A rule at a time, each with a reason, is the form that stays true.
 *
 * Whether the rest of the `incomplete` bucket should be swept catalogue-wide is
 * raised as a finding in RESIDUAL-12 §4 rather than guessed at here.
 *
 * @module
 */

/** The subset of an axe result this helper reads. Structural, so no axe types. */
export interface AxeLikeResult {
  violations?: readonly AxeLikeRule[]
  incomplete?: readonly AxeLikeRule[]
}

interface AxeLikeRule {
  id: string
  nodes?: readonly { html?: string, target?: readonly unknown[] }[]
}

/** The rule id ARIA 1.2's naming prohibition is reported under. */
export const PROHIBITED_ATTR_RULE = 'aria-prohibited-attr'

/**
 * Every `aria-prohibited-attr` finding in an axe result, from **both** the
 * `violations` and the `incomplete` bucket, as sentences. Empty when there is
 * none.
 */
export function prohibitedAriaFindings(results: AxeLikeResult): string[] {
  const out: string[] = []
  for (const [bucket, rules] of [['violations', results.violations], ['incomplete', results.incomplete]] as const) {
    for (const rule of rules ?? []) {
      if (rule.id !== PROHIBITED_ATTR_RULE)
        continue
      const where = (rule.nodes ?? []).map(node => node.html ?? JSON.stringify(node.target)).join(' | ')
      out.push(
        `axe reports \`${PROHIBITED_ATTR_RULE}\` in \`${bucket}\`${where === '' ? '' : ` on ${where}`}. `
        + 'ARIA 1.2 prohibits `aria-label` and `aria-labelledby` on some roles — `generic` among '
        + 'them, which is what a `<span>` or `<div>` with no role is. Give the element a '
        + 'naming-capable role, or stop putting a name on it; a prohibited name is not read '
        + 'reliably by anything.',
      )
    }
  }
  return out
}

/**
 * Assert an axe result carries no ARIA naming prohibition, in either bucket.
 *
 * Use it **beside** `toHaveNoViolations()`, never instead of it: the two read
 * different buckets and neither is a superset of the other.
 *
 * @example
 * ```ts
 * const results = await axe(container)
 * expect(results).toHaveNoViolations()
 * expectNoProhibitedAria(results)
 * ```
 */
export function expectNoProhibitedAria(results: AxeLikeResult): void {
  const findings = prohibitedAriaFindings(results)
  if (findings.length === 0)
    return
  throw new Error(
    `${findings.length} ARIA naming prohibition(s) that \`toHaveNoViolations()\` cannot see:\n${
      findings.map(finding => `  • ${finding}`).join('\n')}`,
  )
}
