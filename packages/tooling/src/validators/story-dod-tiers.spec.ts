import type { RiskTier } from '@dzup-ui/contracts'
import type { TriageItem, TriageSummary } from '../quality/story-dod-triage.ts'
import { describe, expect, it } from 'vitest'
import { componentOf, TIER_REQUIRED_CHECKS, triage } from '../quality/story-dod-triage.ts'
import { checkCeiling, countOpen, readCeiling } from './story-dod-tiers.ts'

/**
 * A triage summary built by hand (TASK-R1-O1).
 *
 * `countOpen`'s unit tests used to call `triage()` and pick the first required
 * item out of the live repository. That worked only while the repository had
 * one. TASK-N1-O1 closed the last story-DoD gap, the ratchet reached **0**, and
 * `summary.items.find(i => i.required)!` became `undefined!` — so the suite
 * failed with `Cannot read properties of undefined` as the *reward* for
 * finishing the work it was measuring. A unit test for a pure function must not
 * be able to be broken by an unrelated component gaining a story.
 *
 * The live repository still gets asserted, in `the committed ceiling` below,
 * where reading it is the point.
 */
function item(
  component: string,
  check: string,
  tier: RiskTier | null,
  required: boolean,
): TriageItem {
  return {
    file: `packages/core/stories/buttons/${component}.stories.ts`,
    check,
    level: 'report',
    message: `${component} owes ${check}`,
    component,
    tier,
    required,
  }
}

/** Four required items across three checks, plus two advisory ones. */
function fixtureSummary(): TriageSummary {
  const items: TriageItem[] = [
    item('DzButton', 'states', 'B', true),
    item('DzInput', 'states', 'C', true),
    item('DzSelect', 'accessibility', 'C', true),
    item('DzTable', 'real-world', 'D', true),
    item('DzBadge', 'gallery', 'A', false),
    item('DzDialogParts', 'states', null, false),
  ]
  const required = items.filter(i => i.required).length
  return {
    items,
    byCheck: {},
    requiredTotal: required,
    advisoryTotal: items.length - required,
    unmatched: ['DzDialogParts'],
  }
}

describe('componentOf', () => {
  it('reads the component out of a story path, on either separator', () => {
    expect(componentOf('packages/core/stories/buttons/DzButton.stories.ts')).toBe('DzButton')
    expect(componentOf('packages\\core\\stories\\forms\\DzSelect.stories.ts')).toBe('DzSelect')
  })
})

describe('tier rules', () => {
  it('requires nothing for the three cheapest categories', () => {
    // `gallery` is 155 of the 366 reported items and the easiest to inflate;
    // no tier requires it, and that is the finding rather than an oversight.
    expect(TIER_REQUIRED_CHECKS.gallery).toBeNull()
    expect(TIER_REQUIRED_CHECKS['controls-live']).toBeNull()
    expect(TIER_REQUIRED_CHECKS.play).toBeNull()
  })

  it('requires states from B, and narratives and compositions from C', () => {
    expect(TIER_REQUIRED_CHECKS.states).toBe('B')
    expect(TIER_REQUIRED_CHECKS.accessibility).toBe('C')
    expect(TIER_REQUIRED_CHECKS['real-world']).toBe('C')
  })
})

describe('the join', () => {
  const summary = triage()

  it('marks a required item only when the component is at or above the tier', () => {
    for (const item of summary.items) {
      // `?? null` rather than `=== null`: under `noUncheckedIndexedAccess` a
      // string index also yields `undefined`, which the null check alone left
      // in the type and made `rank[from]` an error.
      const from = TIER_REQUIRED_CHECKS[item.check] ?? null
      if (from === null || item.tier === null) {
        expect(item.required, `${item.component}/${item.check}`).toBe(false)
        continue
      }
      const rank = { A: 0, B: 1, C: 2, D: 3 }
      expect(item.required).toBe(rank[item.tier] >= rank[from])
    }
  })

  it('leaves `*Parts` pages untiered rather than folding them into the parent', () => {
    // A parts page documents compound sub-parts and owes different things from
    // the component page. Averaging them is how a real gap on the component
    // hides behind a satisfied parts page.
    expect(summary.unmatched).toContain('DzDialogParts')
    for (const item of summary.items.filter(i => i.component.endsWith('Parts')))
      expect(item.required).toBe(false)
  })

  it('cuts the reported total down to the items a tier actually asks for', () => {
    expect(summary.requiredTotal + summary.advisoryTotal).toBe(summary.items.length)
    expect(summary.requiredTotal).toBeLessThan(summary.items.length / 2)
  })
})

describe('the ceiling', () => {
  const ceiling = { ceilings: { 'states': 30, 'accessibility': 11, 'real-world': 10 }, waived: {} }

  it('passes when every count is at its ceiling', () => {
    expect(checkCeiling({ 'states': 30, 'accessibility': 11, 'real-world': 10 }, ceiling, new Set()))
      .toEqual([])
  })

  it('fails when a count rises', () => {
    const v = checkCeiling({ 'states': 31, 'accessibility': 11, 'real-world': 10 }, ceiling, new Set())
    expect(v.some(x => x.rule === 'exceeded' && x.message.includes('states'))).toBe(true)
  })

  it('asks for the ceiling to be lowered when a count falls', () => {
    // Otherwise the progress is undoable in silence: someone re-opens a gap and
    // the ceiling still permits it.
    const v = checkCeiling({ 'states': 28, 'accessibility': 11, 'real-world': 10 }, ceiling, new Set())
    expect(v.some(x => x.rule === 'stale' && x.message.includes('--write'))).toBe(true)
  })

  it('fails a tier-required check with no ceiling at all', () => {
    const v = checkCeiling({ states: 30 }, { ceilings: {}, waived: {} }, new Set())
    expect(v.some(x => x.rule === 'stale' && x.message.includes('no ceiling'))).toBe(true)
  })

  it('flags a waiver that no longer matches an open item', () => {
    const withWaiver = { ...ceiling, waived: { 'DzGone:states': 'retired' } }
    const v = checkCeiling(
      { 'states': 30, 'accessibility': 11, 'real-world': 10 },
      withWaiver,
      new Set(['DzThing:states']),
    )
    expect(v.some(x => x.rule === 'waiver' && x.message.includes('DzGone'))).toBe(true)
  })
})

describe('countOpen', () => {
  const summary = fixtureSummary()
  const total = (counts: Record<string, number>): number =>
    Object.values(counts).reduce((a, b) => a + b, 0)

  it('counts only required items', () => {
    expect(total(countOpen(summary, {}))).toBe(summary.requiredTotal)
    expect(total(countOpen(summary, {}))).toBe(4)
  })

  it('reports per check, not as one number', () => {
    expect(countOpen(summary, {})).toMatchObject({
      'states': 2,
      'accessibility': 1,
      'real-world': 1,
    })
  })

  it('seeds every tier-required check, so a check at zero is still reported', () => {
    // A check missing from the record and a check at 0 are different claims,
    // and the ceiling file has to be able to tell them apart.
    const counts = countOpen({ ...summary, items: [], requiredTotal: 0 }, {})
    expect(counts).toMatchObject({ 'states': 0, 'accessibility': 0, 'real-world': 0 })
    expect(counts.gallery).toBeUndefined()
  })

  it('subtracts a waiver', () => {
    expect(total(countOpen(summary, { 'DzButton:states': 'a reason' })))
      .toBe(summary.requiredTotal - 1)
  })

  it('subtracts only the waived component, not every item on that check', () => {
    const counts = countOpen(summary, { 'DzButton:states': 'a reason' })
    expect(counts.states).toBe(1)
  })

  it('ignores a waiver that matches nothing', () => {
    expect(total(countOpen(summary, { 'DzGone:states': 'retired' })))
      .toBe(summary.requiredTotal)
  })

  it('never counts an advisory item, waived or not', () => {
    expect(total(countOpen(summary, { 'DzBadge:gallery': 'irrelevant' })))
      .toBe(summary.requiredTotal)
  })

  it('returns zeroes rather than throwing when nothing is open', () => {
    // The state the repository is actually in. The old spec crashed here.
    const empty = countOpen({ ...summary, items: [], requiredTotal: 0 }, {})
    expect(total(empty)).toBe(0)
  })
})

describe('countOpen over the live repository', () => {
  it('agrees with the triage summary it was given', () => {
    // An invariant, not a fixture: whatever the repository holds today, the
    // per-check counts must add up to the required total. This is vacuously
    // true at 0 open items, which is why the behaviour above is driven by a
    // fixture instead.
    const summary = triage()
    const counts = countOpen(summary, {})
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(summary.requiredTotal)
  })
})

describe('the committed ceiling', () => {
  it('exists and holds today’s counts', () => {
    const ceiling = readCeiling()
    expect(ceiling, 'run `yarn validate:story-dod-tiers --write`').toBeDefined()
    const counts = countOpen(triage(), ceiling!.waived)
    expect(checkCeiling(counts, ceiling!, new Set(
      triage().items.filter(i => i.required).map(i => `${i.component}:${i.check}`),
    ))).toEqual([])
  })
})
