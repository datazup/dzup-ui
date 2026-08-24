import { describe, expect, it } from 'vitest'
import { componentOf, TIER_REQUIRED_CHECKS, triage } from '../quality/story-dod-triage.ts'
import { checkCeiling, countOpen, readCeiling } from './story-dod-tiers.ts'

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
      const from = TIER_REQUIRED_CHECKS[item.check]
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
  const summary = triage()

  it('counts only required items', () => {
    const counts = countOpen(summary, {})
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    expect(total).toBe(summary.requiredTotal)
  })

  it('subtracts a waiver', () => {
    const first = summary.items.find(i => i.required)!
    const counts = countOpen(summary, { [`${first.component}:${first.check}`]: 'a reason' })
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(summary.requiredTotal - 1)
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
