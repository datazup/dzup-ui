/**
 * Unit tests for the ADR status gate (TASK-S0-O3, 2026-09-24).
 *
 * The grandfather list ships FULL — three entries, covering the three ADRs that
 * were already load-bearing while `Proposed` — so a run against the real tree
 * proves only that the list matches reality today. These tests are what prove the
 * gate would fire, and in particular they prove the one thing the numeric
 * `maxProposedCitedFromCode` ceiling cannot catch: a swap that keeps the
 * arithmetic intact while a NEW unsigned decision becomes load-bearing.
 *
 * Every id below is fixture data. Specs are `isSyntheticSource` to
 * `validate:adr-references`, so nothing here is read as a citation.
 */

import type { AdrDocument } from '../../scripts/validate-adr-references.ts'
import type { AdrStatusInput, GrandfatherEntry, ShippedCitation } from './adr-status.ts'
import { describe, expect, it } from 'vitest'
import {
  checkAdrStatus,
  collectShippedCitations,
  isShippedSource,
  readGrandfatherList,
  validateAdrStatus,
} from './adr-status.ts'

function doc(id: string, status: AdrDocument['status']): AdrDocument {
  return { id, file: `docs/adr/${id}-fixture-title.md`, heading: `${id} — fixture`, status }
}

function cite(id: string, file = 'packages/core/src/components/buttons/DzButton.vue'): ShippedCitation {
  return { id, file, line: 1 }
}

function allowance(id: string, overrides: Partial<GrandfatherEntry> = {}): GrandfatherEntry {
  return {
    id,
    recorded: '2026-09-24',
    reason: 'load-bearing before the gate landed',
    exit: 'an owner flips the Status line; delete this entry and lower maxGrandfathered',
    ...overrides,
  }
}

function check(input: Partial<AdrStatusInput>) {
  const entries = input.grandfather?.entries ?? []
  return checkAdrStatus({
    documents: input.documents ?? [],
    citations: input.citations ?? [],
    grandfather: input.grandfather ?? { entries, maxGrandfathered: entries.length },
  })
}

function rules(input: Partial<AdrStatusInput>): string[] {
  return check(input).violations.map(violation => violation.rule).sort()
}

describe('isShippedSource', () => {
  it('accepts a component a consumer renders', () => {
    expect(isShippedSource('packages/core/src/components/buttons/DzButton.vue')).toBe(true)
    expect(isShippedSource('packages/contracts/src/anatomy.types.ts')).toBe(true)
    expect(isShippedSource('packages/core/src/styles/base.css')).toBe(true)
  })

  it('normalises Windows separators, so the gate reads the same on both platforms', () => {
    expect(isShippedSource('packages\\core\\src\\components\\buttons\\DzButton.vue')).toBe(true)
  })

  it('rejects a spec, a story and a bench — they discuss a decision, they do not build on it', () => {
    expect(isShippedSource('packages/core/src/components/buttons/DzButton.spec.ts')).toBe(false)
    expect(isShippedSource('packages/core/src/components/buttons/DzButton.stories.ts')).toBe(false)
    expect(isShippedSource('packages/tooling/src/perf-bench.bench.ts')).toBe(false)
  })

  it('rejects fixtures and snapshots', () => {
    expect(isShippedSource('packages/tooling/src/ownership/__fixtures__/tree.ts')).toBe(false)
    expect(isShippedSource('packages/core/src/__snapshots__/a.ts')).toBe(false)
  })

  it('rejects everything outside a package `src/` tree', () => {
    // `isCodeCitation` in validate-adr-references.ts counts all four of these.
    // This gate deliberately does not: a config that mentions a decision is not
    // code built on it.
    expect(isShippedSource('packages/core/package.json')).toBe(false)
    expect(isShippedSource('packages/tooling/scripts/adr-registry.json')).toBe(false)
    expect(isShippedSource('apps/landing/src/generated/releases.ts')).toBe(false)
    expect(isShippedSource('docs/adr/ADR-19-public-styling-contract.md')).toBe(false)
  })

  it('rejects a non-code extension inside src/', () => {
    expect(isShippedSource('packages/core/src/i18n/locales/en.json')).toBe(false)
    expect(isShippedSource('packages/core/src/README.md')).toBe(false)
  })
})

describe('checkAdrStatus — the rule the gate exists for', () => {
  it('passes when a Proposed, load-bearing ADR carries a dated allowance', () => {
    const report = check({
      documents: [doc('ADR-19', 'Proposed')],
      citations: [cite('ADR-19')],
      grandfather: { entries: [allowance('ADR-19')], maxGrandfathered: 1 },
    })
    expect(report.violations).toEqual([])
    expect(report.inUse).toEqual([
      {
        id: 'ADR-19',
        citations: 1,
        files: 1,
        first: 'packages/core/src/components/buttons/DzButton.vue:1',
        grandfathered: true,
      },
    ])
  })

  it('fails when a Proposed ADR is cited from shipped source with no allowance', () => {
    const report = check({
      documents: [doc('ADR-21', 'Proposed')],
      citations: [cite('ADR-21')],
    })
    expect(report.violations.map(v => v.rule)).toEqual(['proposed-cited'])
    expect(report.violations[0]?.message).toContain('ADR-21')
    expect(report.violations[0]?.message).toContain('1 citation(s) across 1 file(s)')
  })

  it('does NOT fail a Proposed ADR that shipped source does not build on', () => {
    // A draft nobody has implemented is a draft, which is what `Proposed` is for.
    expect(rules({
      documents: [doc('ADR-21', 'Proposed')],
      citations: [cite('ADR-21', 'packages/core/src/components/buttons/DzButton.spec.ts')],
    })).toEqual([])
  })

  it('does NOT fail an Accepted, Rejected or Superseded ADR however widely cited', () => {
    expect(rules({
      documents: [doc('ADR-21', 'Accepted'), doc('ADR-22', 'Rejected'), doc('ADR-23', 'Superseded')],
      citations: [cite('ADR-21'), cite('ADR-22'), cite('ADR-23')],
    })).toEqual([])
  })

  it('a swap that keeps the arithmetic ceiling intact still fails', () => {
    // THE REASON THIS GATE EXISTS BESIDE `maxProposedCitedFromCode`.
    //
    // Before: ADR-18/19/20 Proposed and cited → count 3, ceiling 3, green.
    // After:  ADR-18 accepted, a brand-new ADR-21 Proposed and cited from
    //         shipped source → count is STILL 3, ceiling STILL 3. The numeric
    //         ratchet in adr-registry.json sees no movement and passes, and a
    //         fourth decision has become load-bearing unsigned, exactly the way
    //         the first three did.
    //
    // The named list refuses it: ADR-21 is not on it, so `proposed-cited` fires.
    const documents = [
      doc('ADR-18', 'Accepted'),
      doc('ADR-19', 'Proposed'),
      doc('ADR-20', 'Proposed'),
      doc('ADR-21', 'Proposed'),
    ]
    const citations = [cite('ADR-18'), cite('ADR-19'), cite('ADR-20'), cite('ADR-21')]
    const proposedCitedFromCode = documents
      .filter(d => d.status === 'Proposed' && citations.some(c => c.id === d.id))
    expect(proposedCitedFromCode).toHaveLength(3) // the arithmetic has not moved

    const report = check({
      documents,
      citations,
      grandfather: {
        entries: [allowance('ADR-18'), allowance('ADR-19'), allowance('ADR-20')],
        maxGrandfathered: 3,
      },
    })
    const fired = report.violations.map(v => v.rule).sort()
    expect(fired).toEqual(['grandfather-discharged', 'proposed-cited'])
    expect(report.violations.find(v => v.rule === 'proposed-cited')?.message).toContain('ADR-21')
  })
})

describe('checkAdrStatus — fails closed', () => {
  it('treats an empty scan as a lost input, never as a pass', () => {
    // The failure mode this programme keeps catching: a gate that greens because
    // it found nothing to check.
    expect(rules({ documents: [], citations: [] })).toEqual(['no-documents'])
  })

  it('fails a document with no readable Status line', () => {
    expect(rules({ documents: [doc('ADR-21', undefined)] })).toEqual(['unreadable-status'])
  })

  it('names the reason and the accepted vocabulary in the message', () => {
    const report = check({ documents: [doc('ADR-21', undefined)] })
    expect(report.violations[0]?.message).toContain('docs/adr/ADR-21-fixture-title.md')
    expect(report.violations[0]?.message).toContain('Proposed, Accepted, Rejected, Superseded, Deprecated')
  })

  it('fails an unreadable status even when the ADR is not cited at all', () => {
    // Otherwise a document could lose its status line and drop silently out of
    // the Proposed set.
    expect(rules({ documents: [doc('ADR-21', undefined)], citations: [] })).toEqual(['unreadable-status'])
  })
})

describe('checkAdrStatus — the list empties itself', () => {
  it('fails when a grandfathered ADR has been signed', () => {
    const report = check({
      documents: [doc('ADR-19', 'Accepted')],
      citations: [cite('ADR-19')],
      grandfather: { entries: [allowance('ADR-19')], maxGrandfathered: 1 },
    })
    expect(report.violations.map(v => v.rule)).toEqual(['grandfather-discharged'])
    expect(report.violations[0]?.message).toContain('lower maxGrandfathered to 0')
    expect(report.violations[0]?.message).toContain('maxProposedCitedFromCode')
  })

  it('fails when nothing cites a grandfathered ADR any more', () => {
    expect(rules({
      documents: [doc('ADR-19', 'Proposed')],
      citations: [],
      grandfather: { entries: [allowance('ADR-19')], maxGrandfathered: 1 },
    })).toEqual(['grandfather-uncited'])
  })

  it('fails an allowance for an ADR with no document', () => {
    expect(rules({
      documents: [doc('ADR-19', 'Proposed')],
      citations: [cite('ADR-19')],
      grandfather: { entries: [allowance('ADR-19'), allowance('ADR-21')], maxGrandfathered: 2 },
    })).toEqual(['grandfather-unknown'])
  })
})

describe('checkAdrStatus — an allowance must be arguable', () => {
  it('fails an undated allowance', () => {
    expect(rules({
      documents: [doc('ADR-19', 'Proposed')],
      citations: [cite('ADR-19')],
      grandfather: { entries: [allowance('ADR-19', { recorded: 'soon' })], maxGrandfathered: 1 },
    })).toEqual(['grandfather-date'])
  })

  it('fails an allowance with no reason or no exit condition', () => {
    expect(rules({
      documents: [doc('ADR-19', 'Proposed')],
      citations: [cite('ADR-19')],
      grandfather: { entries: [allowance('ADR-19', { exit: '  ' })], maxGrandfathered: 1 },
    })).toEqual(['grandfather-entry'])
  })

  it('fails when the ceiling disagrees with the list, in either direction', () => {
    expect(rules({
      documents: [doc('ADR-19', 'Proposed')],
      citations: [cite('ADR-19')],
      grandfather: { entries: [allowance('ADR-19')], maxGrandfathered: 2 },
    })).toEqual(['grandfather-ceiling'])
    expect(rules({
      documents: [doc('ADR-19', 'Proposed')],
      citations: [cite('ADR-19')],
      grandfather: { entries: [allowance('ADR-19')], maxGrandfathered: 0 },
    })).toEqual(['grandfather-ceiling'])
  })

  it('normalises a one-digit id, so ADR-9 and ADR-09 are the same allowance', () => {
    expect(rules({
      documents: [doc('ADR-09', 'Proposed')],
      citations: [cite('ADR-09')],
      grandfather: { entries: [allowance('ADR-9')], maxGrandfathered: 1 },
    })).toEqual([])
  })
})

describe('the shipped configuration', () => {
  it('the grandfather list on disk is self-consistent', () => {
    const grandfather = readGrandfatherList()
    expect(grandfather.maxGrandfathered).toBe(grandfather.entries.length)
    for (const entry of grandfather.entries) {
      expect(entry.recorded).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(entry.reason.trim()).not.toBe('')
      expect(entry.exit.trim()).not.toBe('')
    }
  })

  it('shipped source really does cite an ADR — so a green run is not an empty scan', () => {
    // Guards the collector itself. If a refactor moved the packages or broke the
    // walk, this gate would go green on nothing, and that is the whole defect
    // class `no-documents` exists for one level up.
    const citations = collectShippedCitations()
    expect(citations.length).toBeGreaterThan(100)
    expect(new Set(citations.map(c => c.file)).size).toBeGreaterThan(50)
  })

  it('the repository is green at HEAD', () => {
    const report = validateAdrStatus()
    expect(report.violations).toEqual([])
    expect(report.documents).toBeGreaterThan(0)
    expect(report.inUse.every(entry => entry.grandfathered)).toBe(true)
  })
})
