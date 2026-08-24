import type { OwnershipManifest } from '../ownership/ownership-manifest.types.ts'
import type { TierAssignment } from '../quality/component-tiers.ts'
import { describe, expect, it } from 'vitest'
import { COMPONENT_TIERS } from '../quality/component-tiers.ts'
import { buildQualityMatrix } from '../quality/generate-quality-matrix.ts'
import { checkQualityTiers } from './quality-tiers.ts'

/**
 * A two-component manifest. Small on purpose: every gate below is asserted by
 * breaking exactly one thing, and a fixture with 144 entries would make the
 * broken one hard to see.
 */
function manifest(overrides: Partial<OwnershipManifest> = {}): OwnershipManifest {
  return {
    schemaVersion: '1.1.0',
    tier: 'core',
    sourceCommit: 'abc123',
    generatedFrom: ['packages/core/src/index.ts'],
    entries: [
      {
        symbol: 'DzThing',
        package: '@dzup-ui/core',
        subpath: '.',
        kind: 'public-component',
        evidence: ['packages/core/src/components/layout/DzThing.vue'],
      },
      {
        symbol: 'DzThingPanel',
        package: '@dzup-ui/core',
        subpath: '.',
        kind: 'compound-part',
        parentComponent: 'DzThing',
        evidence: ['packages/core/src/components/layout/DzThingPanel.vue'],
      },
    ],
    ...overrides,
  }
}

/** Run the gates with the freshness gate satisfied, so only rules 1–5 speak. */
function check(
  assignments: Record<string, TierAssignment>,
  options: { manifest?: OwnershipManifest, teleporting?: Set<string> } = {},
): string[] {
  const m = options.manifest ?? manifest()
  const { matrix } = buildQualityMatrix(m, assignments)
  return checkQualityTiers(m, {
    assignments,
    teleporting: options.teleporting ?? new Set(),
    committed: matrix,
  }).map(v => `${v.rule}: ${v.message}`)
}

const OK: Record<string, TierAssignment> = {
  DzThing: { tier: 'A', pattern: 'none' },
}

describe('coverage', () => {
  it('passes when every public component is assigned', () => {
    expect(check(OK)).toEqual([])
  })

  it('fails on a public component with no tier', () => {
    const violations = check({})
    expect(violations.some(v => v.startsWith('coverage:') && v.includes('DzThing'))).toBe(true)
  })

  it('fails on a tier assigned to a symbol that is no longer public', () => {
    const violations = check({ ...OK, DzGone: { tier: 'A', pattern: 'none' } })
    expect(violations.some(v => v.startsWith('coverage:') && v.includes('DzGone'))).toBe(true)
  })

  it('does not demand a tier for a compound part — it ships with its parent', () => {
    expect(check(OK).some(v => v.includes('DzThingPanel'))).toBe(false)
  })
})

describe('justification', () => {
  it('fails on `custom` with no reason', () => {
    const violations = check({ DzThing: { tier: 'A', pattern: 'custom' } })
    expect(violations.some(v => v.startsWith('justification:') && v.includes('custom'))).toBe(true)
  })

  it('accepts `custom` with a reason', () => {
    expect(check({ DzThing: { tier: 'A', pattern: 'custom', why: 'APG has no such pattern.' } }))
      .toEqual([])
  })

  it.each(['C', 'D'] as const)('fails on Tier %s with no reason', (tier) => {
    const violations = check({ DzThing: { tier, pattern: 'grid' } })
    expect(violations.some(v => v.startsWith('justification:') && v.includes(`Tier ${tier}`)))
      .toBe(true)
  })

  it('fails on a declared boundary with no reason', () => {
    const violations = check({ DzThing: { tier: 'A', pattern: 'none', boundary: 'url' } })
    expect(violations.some(v => v.startsWith('justification:') && v.includes('boundaryWhy')))
      .toBe(true)
  })

  it('does not demand a reason for `boundary: none`', () => {
    expect(check({ DzThing: { tier: 'A', pattern: 'none', boundary: 'none' } })).toEqual([])
  })
})

describe('catalog', () => {
  it('fails on a WCAG id that is not in the catalog', () => {
    const violations = check({ DzThing: { tier: 'A', pattern: 'none', wcag: ['9.9.9'] } })
    expect(violations.some(v => v.startsWith('catalog:') && v.includes('9.9.9'))).toBe(true)
  })

  it('fails on a page-level criterion, which belongs to the consumer', () => {
    const violations = check({ DzThing: { tier: 'A', pattern: 'none', wcag: ['2.4.2'] } })
    expect(violations.some(v => v.startsWith('catalog:'))).toBe(true)
  })

  it('fails on an exception naming something that is not an EvidenceKind', () => {
    const violations = check({
      DzThing: { tier: 'A', pattern: 'none', exceptions: { 'looks-nice': 'because' } },
    })
    expect(violations.some(v => v.startsWith('catalog:') && v.includes('looks-nice'))).toBe(true)
  })

  it('fails on an exception for a row the component never owed', () => {
    // perf-baseline is a Tier C row; a Tier A component excepting it is a typo
    // that reads as diligence.
    const violations = check({
      DzThing: { tier: 'A', pattern: 'none', exceptions: { 'perf-baseline': 'no data' } },
    })
    expect(violations.some(v => v.includes('does not owe'))).toBe(true)
  })

  it('accepts an exception for a row the component does owe', () => {
    expect(check({
      DzThing: { tier: 'A', pattern: 'none', exceptions: { 'token-contrast': 'renderless' } },
    })).toEqual([])
  })
})

describe('traits against source', () => {
  it('fails when a component teleports and does not declare it', () => {
    const violations = check(OK, { teleporting: new Set(['DzThing']) })
    expect(violations.some(v => v.startsWith('traits:') && v.includes('does not declare')))
      .toBe(true)
  })

  it('fails when a component declares the trait and nothing teleports', () => {
    const violations = check({ DzThing: { tier: 'A', pattern: 'none', traits: ['teleports'] } })
    expect(violations.some(v => v.startsWith('traits:') && v.includes('no <Teleport>'))).toBe(true)
  })

  it('counts a compound part that teleports as the parent teleporting', () => {
    const violations = check(
      { DzThing: { tier: 'A', pattern: 'none', traits: ['teleports'] } },
      { teleporting: new Set(['DzThingPanel']) },
    )
    expect(violations).toEqual([])
  })
})

describe('anatomy agreement', () => {
  const anatomy = (riskTier: 'A' | 'B' | 'C' | 'D') => ({
    parts: ['root'],
    states: [],
    componentTokens: [],
    riskTier,
  })

  it('fails when a component declares a different tier from the assignment', () => {
    const m = manifest()
    m.entries[0]!.anatomy = anatomy('C')
    const violations = check(OK, { manifest: m })
    expect(violations.some(v => v.startsWith('anatomy:') && v.includes('DzThing'))).toBe(true)
  })

  it('passes when the two agree', () => {
    const m = manifest()
    m.entries[0]!.anatomy = anatomy('A')
    expect(check(OK, { manifest: m })).toEqual([])
  })

  it('fails when a compound part claims a lower tier than its parent', () => {
    const m = manifest()
    m.entries[1]!.anatomy = anatomy('A')
    const violations = check({ DzThing: { tier: 'B', pattern: 'button' } }, { manifest: m })
    expect(violations.some(v => v.includes('DzThingPanel') && v.includes('parent DzThing')))
      .toBe(true)
  })
})

describe('freshness', () => {
  it('fails when the committed matrix is stale', () => {
    const m = manifest()
    const { matrix } = buildQualityMatrix(m, { DzThing: { tier: 'C', pattern: 'grid', why: 'x' } })
    const violations = checkQualityTiers(m, {
      assignments: OK,
      teleporting: new Set(),
      committed: matrix,
    })
    expect(violations.some(v => v.rule === 'freshness')).toBe(true)
  })

  it('fails when the matrix has never been generated', () => {
    const violations = checkQualityTiers(manifest(), {
      assignments: OK,
      teleporting: new Set(),
      committed: undefined,
    })
    expect(violations.some(v => v.rule === 'freshness')).toBe(true)
  })

  it('ignores sourceCommit, which records provenance rather than content', () => {
    const m = manifest()
    const { matrix } = buildQualityMatrix({ ...m, sourceCommit: 'somewhere-else' }, OK)
    const violations = checkQualityTiers(m, {
      assignments: OK,
      teleporting: new Set(),
      committed: matrix,
    })
    expect(violations.some(v => v.rule === 'freshness')).toBe(false)
  })
})

describe('the real assignment', () => {
  it('gives every row a tier the catalog admits', () => {
    for (const [component, assignment] of Object.entries(COMPONENT_TIERS))
      expect(['A', 'B', 'C', 'D'], component).toContain(assignment.tier)
  })

  it('justifies every Tier C and D row', () => {
    for (const [component, assignment] of Object.entries(COMPONENT_TIERS)) {
      if (assignment.tier === 'C' || assignment.tier === 'D')
        expect(assignment.why, `${component} is Tier ${assignment.tier} with no why`).toBeTruthy()
    }
  })

  it('justifies every declared security boundary', () => {
    for (const [component, assignment] of Object.entries(COMPONENT_TIERS)) {
      if (assignment.boundary !== undefined && assignment.boundary !== 'none')
        expect(assignment.boundaryWhy, `${component} has no boundaryWhy`).toBeTruthy()
    }
  })
})
