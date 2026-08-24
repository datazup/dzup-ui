import { describe, expect, it } from 'vitest'
import {
  APG_PATTERNS,
  BASELINE_WCAG,
  baselineWcagFor,
  BOUNDARY_EVIDENCE,
  COMPONENT_TRAITS,
  EVIDENCE_KINDS,
  evidenceFor,
  evidenceOrigin,
  INTERACTIVE_WCAG,
  requiredEvidence,
  RISK_TIER_ORDER,
  SECURITY_BOUNDARIES,
  TIER_EVIDENCE_INCREMENT,
  TRAIT_EVIDENCE,
  TRAIT_WCAG,
  WCAG_22_CRITERIA,
  WCAG_CRITERION_IDS,
} from './quality-tiers'

describe('tier rules', () => {
  it('accumulates upward: every tier owes what the tier below it owes', () => {
    for (let i = 1; i < RISK_TIER_ORDER.length; i++) {
      const lower = requiredEvidence(RISK_TIER_ORDER[i - 1]!)
      const higher = requiredEvidence(RISK_TIER_ORDER[i]!)
      expect(higher).toEqual(expect.arrayContaining([...lower]))
      expect(higher.length).toBeGreaterThan(lower.length)
    }
  })

  it('names no evidence kind in two tiers — a row has one owner', () => {
    const seen = new Set<string>()
    for (const tier of RISK_TIER_ORDER) {
      for (const kind of TIER_EVIDENCE_INCREMENT[tier]) {
        expect(seen.has(kind), `${kind} appears in more than one tier`).toBe(false)
        seen.add(kind)
      }
    }
  })

  it('draws every kind it names from EVIDENCE_KINDS', () => {
    const all = [
      ...Object.values(TIER_EVIDENCE_INCREMENT).flat(),
      ...Object.values(TRAIT_EVIDENCE).flat(),
      ...Object.values(BOUNDARY_EVIDENCE).flat(),
    ]
    for (const kind of all)
      expect(EVIDENCE_KINDS).toContain(kind)
  })

  it('leaves no EVIDENCE_KINDS entry unreachable', () => {
    const reachable = new Set([
      ...Object.values(TIER_EVIDENCE_INCREMENT).flat(),
      ...Object.values(TRAIT_EVIDENCE).flat(),
      ...Object.values(BOUNDARY_EVIDENCE).flat(),
    ])
    for (const kind of EVIDENCE_KINDS)
      expect(reachable.has(kind), `${kind} is declared and no rule ever asks for it`).toBe(true)
  })
})

describe('evidenceFor', () => {
  it('emits in EVIDENCE_KINDS order regardless of how the set was assembled', () => {
    const withTraits = evidenceFor('C', 'url', ['dataset', 'teleports'])
    const positions = withTraits.map(k => EVIDENCE_KINDS.indexOf(k))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it('de-duplicates a row two rules both ask for', () => {
    // Tier D and the `url` boundary both require threat-model.
    const evidence = evidenceFor('D', 'url')
    expect(evidence.filter(k => k === 'threat-model')).toHaveLength(1)
  })

  it('gives a Tier B url-boundary component the security rows without the Tier C rows', () => {
    // The DzButton case: an href is a URL sink, and a button owes no dataset
    // scenarios or performance baseline for having one.
    const evidence = evidenceFor('B', 'url')
    expect(evidence).toContain('url-policy')
    expect(evidence).toContain('malicious-corpus')
    expect(evidence).not.toContain('perf-baseline')
    expect(evidence).not.toContain('real-world-story')
  })

  it('adds portal/hydration only for a component that teleports', () => {
    expect(evidenceFor('B', 'none', [])).not.toContain('portal-hydration')
    expect(evidenceFor('B', 'none', ['teleports'])).toContain('portal-hydration')
  })

  it('defaults to no boundary and no traits', () => {
    expect(evidenceFor('A')).toEqual(requiredEvidence('A'))
  })
})

describe('evidenceOrigin', () => {
  it('attributes a row to the tier that introduced it, not to the tier holding it', () => {
    expect(evidenceOrigin('unit-spec', 'D', 'none', [])).toBe('tier A')
    expect(evidenceOrigin('keyboard-spec', 'C', 'none', [])).toBe('tier B')
  })

  it('attributes trait and boundary rows to their own rule', () => {
    expect(evidenceOrigin('portal-hydration', 'B', 'none', ['teleports'])).toBe('trait teleports')
    expect(evidenceOrigin('url-policy', 'B', 'url', [])).toBe('boundary url')
  })

  it('reports an unattributed row rather than inventing an owner', () => {
    expect(evidenceOrigin('csp-fixture', 'A', 'none', [])).toBe('unattributed')
  })
})

describe('wCAG catalog', () => {
  it('has no duplicate ids', () => {
    const ids = WCAG_22_CRITERIA.map(c => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('agrees with WCAG_CRITERION_IDS', () => {
    expect(WCAG_CRITERION_IDS.size).toBe(WCAG_22_CRITERIA.length)
    for (const c of WCAG_22_CRITERIA)
      expect(WCAG_CRITERION_IDS.has(c.id)).toBe(true)
  })

  it('omits 4.1.1 Parsing, which WCAG 2.2 removed', () => {
    expect(WCAG_CRITERION_IDS.has('4.1.1')).toBe(false)
  })

  it('carries the seven criteria new in 2.2 that a component can fail', () => {
    const new22 = WCAG_22_CRITERIA.filter(c => c.since === '2.2').map(c => c.id)
    expect(new22).toEqual(['2.4.11', '2.5.7', '2.5.8', '3.2.6', '3.3.7', '3.3.8'])
  })

  it('draws its baselines from the catalog', () => {
    for (const id of [...BASELINE_WCAG, ...INTERACTIVE_WCAG, ...Object.values(TRAIT_WCAG).flat()])
      expect(WCAG_CRITERION_IDS.has(id), `${id} is not in the catalog`).toBe(true)
  })
})

describe('baselineWcagFor', () => {
  it('gives Tier A the baseline and no interactive criteria', () => {
    const wcag = baselineWcagFor('A')
    expect(wcag).toContain('1.4.3')
    expect(wcag).not.toContain('2.1.1')
  })

  it('adds the interactive criteria from Tier B upward', () => {
    for (const tier of ['B', 'C', 'D'] as const)
      expect(baselineWcagFor(tier)).toEqual(expect.arrayContaining([...INTERACTIVE_WCAG]))
  })

  it('adds 2.5.7 Dragging Movements only for a component that drags', () => {
    expect(baselineWcagFor('B')).not.toContain('2.5.7')
    expect(baselineWcagFor('B', ['drags'])).toContain('2.5.7')
  })

  it('emits in catalog order', () => {
    const wcag = baselineWcagFor('D', ['drags', 'dataset'])
    const positions = wcag.map(id => WCAG_22_CRITERIA.findIndex(c => c.id === id))
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })
})

describe('catalogs', () => {
  it('lists custom and none last, so a reader sees the real patterns first', () => {
    expect(APG_PATTERNS.slice(-2)).toEqual(['custom', 'none'])
  })

  it('gives every trait an evidence rule and a WCAG rule', () => {
    for (const trait of COMPONENT_TRAITS) {
      expect(TRAIT_EVIDENCE[trait].length).toBeGreaterThan(0)
      expect(TRAIT_WCAG[trait].length).toBeGreaterThan(0)
    }
  })

  it('gives every boundary an evidence rule, and `none` adds nothing', () => {
    for (const boundary of SECURITY_BOUNDARIES) {
      const rows = BOUNDARY_EVIDENCE[boundary]
      if (boundary === 'none')
        expect(rows).toHaveLength(0)
      else
        expect(rows).toContain('threat-model')
    }
  })
})
