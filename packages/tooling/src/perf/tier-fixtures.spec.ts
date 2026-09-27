/**
 * The Tier C/D fixture-completeness gate (TASK-R2-O7).
 *
 * Doc 06's tier rule says a Tier C component carries a performance obligation.
 * The capability matrix already enforces that for `perf-baseline`; this
 * enforces it for the three lanes that obligation now also means — leak, long
 * task and memory — by failing the moment a Tier C or Tier D row in
 * `quality-matrix.json` has no mountable fixture.
 *
 * Deliberately cheap and in `yarn test` rather than in the lanes: the answer is
 * a set comparison, and putting it behind `yarn test:perf` would mean a
 * component promoted to Tier C could sit outside the lanes for as long as
 * nobody ran the heavy suite.
 */

import { describe, expect, it } from 'vitest'
import { readCommittedMatrix } from '../quality/generate-quality-matrix.ts'
import { TIER_FIXTURES } from './tier-fixtures.ts'

const matrix = readCommittedMatrix()

describe('tier C/D perf-lane fixtures', () => {
  it('covers every Tier C and Tier D component in the quality matrix', () => {
    expect(matrix, 'quality-matrix.json is missing — run `yarn generate:quality-matrix`')
      .toBeDefined()

    const owed = matrix!.components
      .filter(row => row.tier === 'C' || row.tier === 'D')
      .map(row => row.component)
      .sort()
    const covered = TIER_FIXTURES.map(fixture => fixture.component).sort()

    const missing = owed.filter(component => !covered.includes(component))
    expect(
      missing,
      `Tier C/D components with no perf-lane fixture: ${missing.join(', ')}. `
      + 'Add one to packages/tooling/src/perf/tier-fixtures.ts — a tier promotion '
      + 'is a performance obligation, not only a documentation change.',
    ).toEqual([])
  })

  it('declares no fixture for a component that is not Tier C or D', () => {
    const tierOf = new Map(matrix!.components.map(row => [row.component, row.tier]))
    const wrong = TIER_FIXTURES
      .filter(fixture => !['C', 'D'].includes(tierOf.get(fixture.component) ?? ''))
      .map(fixture => fixture.component)
    expect(wrong, `fixtures for non-Tier-C/D components: ${wrong.join(', ')}`).toEqual([])
  })

  it('records the tier the matrix records', () => {
    const tierOf = new Map(matrix!.components.map(row => [row.component, row.tier]))
    for (const fixture of TIER_FIXTURES)
      expect(fixture.tier, fixture.component).toBe(tierOf.get(fixture.component))
  })

  it('names a family barrel each component is actually published from', () => {
    for (const fixture of TIER_FIXTURES)
      expect(['data', 'forms', 'navigation', 'overlays'], fixture.component).toContain(fixture.family)
  })
})
