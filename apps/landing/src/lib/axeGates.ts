/**
 * Shared axe gate configuration for the landing's two a11y suites
 * (`pages.a11y.spec.ts` and `blocks/a11y.spec.ts`) — TASK-FREE3-11.
 *
 * ## Why a rule allowlist exists at all
 *
 * Both suites gate on IMPACT: a violation fails the run when axe grades it
 * `critical` or `serious`. `/ai` shipped two `<main>` landmarks straight past a
 * green suite because `landmark-no-duplicate-main` is graded `moderate`.
 *
 * The obvious repair — "also fail on moderate" — is wrong twice over:
 *
 *  1. It would re-arm every moderate rule at once, including ones with a real
 *     backlog, so the gate would land red and get reverted.
 *  2. **It would not have caught the `/ai` bug anyway.** Both suites run axe with
 *     `runOnly: { type: 'tag', values: [wcag2a, wcag2aa, wcag21a, wcag21aa] }`.
 *     Every landmark rule — `landmark-no-duplicate-main` included — is tagged
 *     `cat.semantics, best-practice` and carries NO wcag tag, so the tag filter
 *     excluded it from the run entirely. The rule never executed; its impact
 *     grade was never consulted. Widening the impact filter would have changed
 *     nothing.
 *
 * So gating these rules takes a SECOND axe pass, selected by rule id
 * (`runOnly: { type: 'rule', … }`), whose findings fail regardless of impact.
 * The original tag pass is untouched — this only ever adds coverage.
 *
 * ## What is NOT reachable from these suites
 *
 * `landmark-one-main`, `page-has-heading-one` and `bypass` are anchored to
 * `html:not(html *)`. Neither suite passes `<html>` as the axe context (the page
 * suite scans `document.body`, the block suite a detached container), so those
 * rules cannot run here at any impact. Widening the context to
 * `document.documentElement` would also newly arm html-anchored WCAG rules
 * (`html-has-lang`, `document-title`, `bypass`) against the existing
 * serious/critical gate — a separate, larger change. Both invariants are instead
 * asserted structurally in `pages.a11y.spec.ts` (exactly one `<main>`, exactly
 * one `<h1>` per route), which is why that bespoke assertion stays.
 *
 * ## Ratchet policy
 *
 * A rule is added to a gate list only when it is measured at ZERO violations
 * across that surface. Everything else is recorded in `MODERATE_DEBT` below —
 * visible, counted and dated, rather than silent. That mirrors the Storybook
 * a11y ratchet, which rolled out family-by-family rather than all at once.
 */

import type { Result } from 'axe-core'

/**
 * The WCAG 2.0/2.1 Level A + AA rule tags — the conformance target both suites
 * advertise. Best-practice/experimental rules are excluded so the impact-based
 * gate tracks the standard, not axe's house opinions; the best-practice rules we
 * DO want are opted into individually below.
 */
export const AXE_WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const

/** Impacts that fail a run regardless of rule id. */
export const BLOCKING_IMPACTS: ReadonlySet<string> = new Set(['critical', 'serious'])

/**
 * Rules gated by ID on the PAGE suite — all measured at zero across all 12
 * chromed routes on 2026-07-21. A violation of any of these fails the run even
 * though axe grades them `moderate`.
 *
 * Getting here required three real fixes, each a defect this suite could not
 * previously see:
 *   • `Footer.vue` column titles were `<h3>`. The footer sits outside `<main>`,
 *     so on every route whose main content stops at `<h1>` the document read
 *     h1 → h3. The existing heading-skip assertion scans `#main` only, so it was
 *     structurally blind to it. Now `<h2>`. (6 of 12 routes)
 *   • `ComparePage.vue`'s scroll region reused `aria-labelledby="compare-title"`,
 *     giving it the same role+name as the `<section>` wrapping the page.
 *   • `BlockPreview.vue`'s `<section>` was labelled by the block title, which on
 *     `/blocks/:id` is also the page `<h1>` — two identically named regions.
 */
export const PAGE_GATED_RULES: readonly string[] = [
  // The landmark family — the class of bug that let a duplicate <main> ship.
  'landmark-no-duplicate-main',
  'landmark-no-duplicate-banner',
  'landmark-no-duplicate-contentinfo',
  'landmark-unique',
  'landmark-main-is-top-level',
  'landmark-banner-is-top-level',
  'landmark-contentinfo-is-top-level',
  'landmark-complementary-is-top-level',
  // Document-wide heading order. Complements — does not replace — the in-#main
  // skip assertion: this one also sees the header/footer chrome.
  'heading-order',
  'empty-heading',
]

/**
 * Rules gated by ID on the BLOCK suite — measured at zero across all 87 blocks
 * on 2026-07-21.
 *
 * Deliberately NARROWER than the page list. Blocks render in isolation, with no
 * page around them, so the "is this landmark top level?" rules fire on nesting
 * that is correct in situ, and several genuinely fail today (see MODERATE_DEBT).
 * `landmark-unique` reached zero after `CarouselShowcase.vue` stopped naming both
 * its `<section>` and its `DzCarousel` region "Product highlights".
 */
export const BLOCK_GATED_RULES: readonly string[] = [
  'landmark-no-duplicate-main',
  'landmark-no-duplicate-banner',
  'landmark-no-duplicate-contentinfo',
  'landmark-banner-is-top-level',
  'landmark-contentinfo-is-top-level',
  'landmark-unique',
  'empty-heading',
]

/**
 * The remaining moderate/minor backlog — measured 2026-07-21, the ratchet's next
 * targets. These are REPORTED, not gated; each needs a real fix, not a filter.
 *
 * Pages (12 chromed routes): none. The page suite gates every moderate rule that
 * can run against a `document.body` context.
 *
 * Blocks (87 blocks, light + dark):
 *
 * | rule                                | count | blocks                              | why it is not gated yet |
 * |-------------------------------------|-------|-------------------------------------|-------------------------|
 * | landmark-complementary-is-top-level | 3     | sticky-aside, page-scaffold, file-tree | each nests `<aside>` inside the block's own `<section>` landmark; fixing needs the blocks restructured, not relabelled |
 * | landmark-main-is-top-level          | 1     | app-shell                           | `DzAppShell` renders `<main>` inside its own shell landmark |
 * | heading-order                       | 1     | faq-2col                            | `DzAccordionTrigger` renders Reka's `AccordionHeader`, which hardcodes `<h3>` and exposes no level prop — an accordion under an `<h5>` emits `<h3>`, so the next `<h5>` reads as a skip. Core-library fix (add a `level` prop). |
 * | aria-allowed-role (minor)           | 1     | access-transfer                     | `DzMention` puts `role="combobox"` on a `<textarea>`; core-library fix |
 *
 * Method: both suites re-run with `runOnly: { type: 'tag', values:
 * ['best-practice'] }` and every violation tabulated by rule id — so this table
 * is the COMPLETE best-practice backlog for these surfaces, not a sample.
 */
export const MODERATE_DEBT = {
  measuredOn: '2026-07-21',
  blocks: {
    'landmark-complementary-is-top-level': ['sticky-aside', 'page-scaffold', 'file-tree'],
    'landmark-main-is-top-level': ['app-shell'],
    'heading-order': ['faq-2col'],
    'aria-allowed-role': ['access-transfer'],
  },
  pages: {},
} as const

/**
 * The violations that fail a run: anything at a blocking impact, plus anything
 * whose rule id is explicitly gated (whatever axe grades it).
 *
 * `tagResults` come from the WCAG tag pass, `ruleResults` from the gated-rule
 * pass. A rule can legitimately appear in both (a gated rule that also carries a
 * WCAG tag), so results are de-duplicated by rule id.
 */
export function blockingViolations(
  tagResults: readonly Result[],
  ruleResults: readonly Result[],
  gatedRules: readonly string[],
): Result[] {
  const gated = new Set(gatedRules)
  const seen = new Set<string>()
  const out: Result[] = []

  for (const violation of [...tagResults, ...ruleResults]) {
    const blocks = (violation.impact != null && BLOCKING_IMPACTS.has(violation.impact))
      || gated.has(violation.id)
    if (blocks && !seen.has(violation.id)) {
      seen.add(violation.id)
      out.push(violation)
    }
  }
  return out
}

/** Render one violation as a loud, copy-pasteable line: rule + help + nodes + url. */
export function reportViolation(violation: Result): string {
  const targets = violation.nodes
    .map(node => (Array.isArray(node.target) ? node.target.join(' ') : String(node.target)))
    .join(', ')
  return `[${violation.impact}] ${violation.id} — ${violation.help}\n      nodes: ${targets}\n      ${violation.helpUrl}`
}
