/**
 * Story DoD triage by risk tier (TASK-OSS-P5-02).
 *
 * `validate:story-dod` is green on its three enforced checks and reports 366
 * items on six advisory ones. The temptation with 366 of anything is to work
 * the biggest number first — and the biggest number is `gallery` at 155, which
 * is a matrix page per component and the cheapest category in the report to
 * inflate. Closing it would move the headline percentage and reduce risk for
 * nobody.
 *
 * This module joins the report to `quality-matrix.json` so the question stops
 * being "how many are left" and becomes "which of these does a Tier C combobox
 * owe that a Tier A badge does not". The tier rules it applies:
 *
 *   - **states** — Tier B and above. A component with states nobody can see in
 *     a story has states nobody reviews.
 *   - **accessibility** — Tier C and above. The APG narrative and the expected
 *     announcements; the manual AT matrix (P5-04) is written against it.
 *   - **real-world** — Tier C and above. A composite that only appears alone
 *     has never been shown doing the thing it exists for.
 *
 * The other three advisory categories — `gallery`, `controls-live`, `play` —
 * are **not** tier-required and are reported as such rather than quietly
 * dropped. `play` in particular is already at 92% and its remaining items are
 * mostly components with nothing to play with.
 *
 * @module @dzup-ui/tooling/quality/story-dod-triage
 */

import type { RiskTier } from '@dzup-ui/contracts'
import type { DodViolation } from '../validators/story-dod.ts'
import { basename } from 'node:path'
import { checkStoryDod } from '../validators/story-dod.ts'
import { readCommittedMatrix } from './generate-quality-matrix.ts'

/** Advisory check → the lowest tier that owes it. `null` means no tier owes it. */
export const TIER_REQUIRED_CHECKS: Readonly<Record<string, RiskTier | null>> = {
  'states': 'B',
  'accessibility': 'C',
  'real-world': 'C',
  'gallery': null,
  'controls-live': null,
  'play': null,
}

const TIER_RANK: Record<RiskTier, number> = { A: 0, B: 1, C: 2, D: 3 }

export interface TriageItem extends DodViolation {
  /** The component the story file is named after. */
  component: string
  /** `null` when the story file names no public component (a `*Parts` page). */
  tier: RiskTier | null
  /** Whether this component's tier owes this check. */
  required: boolean
}

export interface TriageSummary {
  items: readonly TriageItem[]
  /** check → tier → { required, total } */
  byCheck: Readonly<Record<string, {
    total: number
    required: number
    requiredFrom: RiskTier | null
    byTier: Record<string, number>
  }>>
  requiredTotal: number
  advisoryTotal: number
  /** Story files whose name matches no public component. */
  unmatched: readonly string[]
}

/**
 * `packages/core/stories/overlays/DzDialogParts.stories.ts` → `DzDialogParts`.
 *
 * A `*Parts` page documents the compound sub-parts of a component and is not
 * itself a public component, so it carries no tier. Those are counted in
 * `unmatched` rather than folded into the parent's tier: a parts page and a
 * component page owe different things, and averaging them is how a real gap on
 * the component gets hidden behind a satisfied parts page.
 */
export function componentOf(file: string): string {
  return basename(file.replaceAll('\\', '/'), '.stories.ts')
}

/** Join the Story DoD report to the quality matrix. */
export function triage(
  results = checkStoryDod(),
  matrix = readCommittedMatrix(),
): TriageSummary {
  const tierOf = new Map<string, RiskTier>(
    (matrix?.components ?? []).map(row => [row.component, row.tier]),
  )

  const items: TriageItem[] = []
  const unmatched = new Set<string>()

  for (const result of results) {
    if (result.level !== 'report')
      continue
    const requiredFrom = TIER_REQUIRED_CHECKS[result.id] ?? null

    for (const violation of result.violations) {
      const component = componentOf(violation.file)
      const tier = tierOf.get(component) ?? null
      if (tier === null)
        unmatched.add(component)

      items.push({
        ...violation,
        component,
        tier,
        required: requiredFrom !== null
          && tier !== null
          && TIER_RANK[tier] >= TIER_RANK[requiredFrom],
      })
    }
  }

  const byCheck: TriageSummary['byCheck'] = {}
  for (const result of results) {
    if (result.level !== 'report')
      continue
    const mine = items.filter(i => i.check === result.id)
    const byTier: Record<string, number> = {}
    for (const item of mine) {
      const key = item.tier ?? 'untiered'
      byTier[key] = (byTier[key] ?? 0) + 1
    }
    byCheck[result.id] = {
      total: mine.length,
      required: mine.filter(i => i.required).length,
      requiredFrom: TIER_REQUIRED_CHECKS[result.id] ?? null,
      byTier,
    }
  }

  return {
    items,
    byCheck,
    requiredTotal: items.filter(i => i.required).length,
    advisoryTotal: items.filter(i => !i.required).length,
    unmatched: [...unmatched].sort(),
  }
}
