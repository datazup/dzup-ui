import type { AdrCheckInput, AdrDocument, AdrRegistry } from './validate-adr-references.ts'
import { describe, expect, it } from 'vitest'
import {
  checkAdrReferences,
  collectDocuments,
  extractCitations,
  normaliseAdrId,
  readRegistry,
  validateAdrReferences,
} from './validate-adr-references.ts'

/**
 * Specs for the ADR reference validator (TASK-OSS-P3-01).
 *
 * The rules are evaluated by a pure function, so most of these arrange the
 * three inputs directly rather than writing files. The last block runs the real
 * repository through it, because a gate that only ever sees fixtures proves
 * nothing about the tree it gates.
 */

function registry(entries: Partial<AdrRegistry> = {}): AdrRegistry {
  const undocumented = entries.undocumented ?? []
  return {
    undocumented,
    maxUndocumented: entries.maxUndocumented ?? undocumented.length,
  }
}

function document(id: string, file?: string, heading?: string): AdrDocument {
  return {
    id,
    file: file ?? `docs/adr/${id}-some-decision.md`,
    heading: heading ?? `${id} — Some decision`,
  }
}

function check(input: Partial<AdrCheckInput>): ReturnType<typeof checkAdrReferences> {
  return checkAdrReferences({
    citations: input.citations ?? [],
    documents: input.documents ?? [],
    registry: input.registry ?? registry(),
  })
}

function rules(violations: { rule: string }[]): string[] {
  return violations.map(violation => violation.rule)
}

describe('normaliseAdrId', () => {
  it('pads a one-digit number so ADR-4 and ADR-04 are one decision', () => {
    expect(normaliseAdrId('ADR-4')).toBe('ADR-04')
    expect(normaliseAdrId('ADR-04')).toBe('ADR-04')
  })

  it('reads the number out of a filename or a heading', () => {
    expect(normaliseAdrId('ADR-19-public-styling-contract.md')).toBe('ADR-19')
    expect(normaliseAdrId('# ADR-19 — Public styling contract')).toBe('ADR-19')
  })

  it('leaves a string with no ADR number alone', () => {
    expect(normaliseAdrId('README.md')).toBe('README.md')
  })
})

describe('extractCitations', () => {
  it('finds every citation with its line number', () => {
    const found = extractCitations('a.ts', 'one (ADR-04)\nnothing\ntwo (ADR-17) and (ADR-4)')

    expect(found).toEqual([
      { id: 'ADR-04', file: 'a.ts', line: 1 },
      { id: 'ADR-17', file: 'a.ts', line: 3 },
      { id: 'ADR-04', file: 'a.ts', line: 3 },
    ])
  })

  it('does not read the ADR-XX placeholder as a citation', () => {
    // The task prompts write ADR-XX for "pick the next free number". Treating
    // that as a citation would fail the build on the document being written.
    expect(extractCitations('a.md', 'create docs/adr/ADR-XX-thing.md')).toEqual([])
  })

  it('skips an id on a line marked as an example', () => {
    expect(extractCitations('a.ts', 'adr-example-ok: ADR-99 is a fixture id')).toEqual([])
  })

  it('skips an id on the line after the marker', () => {
    // A wrapped block comment cannot always put the marker beside the id.
    expect(extractCitations('a.ts', '// adr-example-ok: the id below\n// is ADR-99')).toEqual([])
  })

  it('still reads a citation two lines after the marker', () => {
    // The exemption is narrow on purpose: it must not silence a whole file.
    const found = extractCitations('a.ts', '// adr-example-ok\n// ADR-99\n// real (ADR-04)')
    expect(found).toEqual([{ id: 'ADR-04', file: 'a.ts', line: 3 }])
  })
})

describe('unresolved citations', () => {
  it('fails on a citation with neither a document nor a registry entry', () => {
    const violations = check({
      citations: [{ id: 'ADR-42', file: 'packages/core/src/x.ts', line: 7 }],
    })

    expect(rules(violations)).toEqual(['unresolved-citation'])
    expect(violations[0]?.message).toContain('packages/core/src/x.ts:7')
  })

  it('reports one violation per ADR, not per citation', () => {
    // ADR-04 is cited 547 times; a per-citation report would bury every other
    // finding under it.
    const violations = check({
      citations: [
        { id: 'ADR-42', file: 'a.ts', line: 1 },
        { id: 'ADR-42', file: 'b.ts', line: 2 },
        { id: 'ADR-42', file: 'c.ts', line: 3 },
      ],
    })

    expect(violations).toHaveLength(1)
  })

  it('accepts a citation that has a document', () => {
    expect(check({
      citations: [{ id: 'ADR-19', file: 'a.ts', line: 1 }],
      documents: [document('ADR-19')],
    })).toEqual([])
  })

  it('accepts a citation that has a registry entry', () => {
    expect(check({
      citations: [{ id: 'ADR-04', file: 'a.ts', line: 1 }],
      registry: registry({
        undocumented: [{ id: 'ADR-04', title: 'Token-only styling', recordedIn: 'CLAUDE.md' }],
      }),
    })).toEqual([])
  })
})

describe('document hygiene', () => {
  it('rejects two documents claiming one number', () => {
    const violations = check({
      documents: [
        document('ADR-19', 'docs/adr/ADR-19-public-styling-contract.md'),
        document('ADR-19', 'docs/adr/ADR-19-something-else.md'),
      ],
    })

    expect(rules(violations)).toContain('duplicate-document')
  })

  it('rejects a filename a reader cannot find by number', () => {
    const violations = check({
      documents: [{ id: 'ADR-19', file: 'docs/adr/styling.md', heading: 'ADR-19 — Styling' }],
    })

    expect(rules(violations)).toContain('document-name')
  })

  it('rejects a document filed under a number its heading disagrees with', () => {
    const violations = check({
      documents: [document('ADR-19', 'docs/adr/ADR-19-styling.md', 'ADR-20 — Styling')],
    })

    expect(rules(violations)).toContain('document-heading')
  })

  it('accepts a document with no heading rather than inventing a rule', () => {
    const violations = check({
      documents: [{ id: 'ADR-19', file: 'docs/adr/ADR-19-styling.md', heading: undefined }],
    })

    expect(violations).toEqual([])
  })
})

describe('the ratchet', () => {
  it('fails when an ADR has a document and is still listed as debt', () => {
    const violations = check({
      documents: [document('ADR-04')],
      registry: registry({
        undocumented: [{ id: 'ADR-04', title: 'Token-only styling', recordedIn: 'CLAUDE.md' }],
      }),
    })

    expect(rules(violations)).toContain('registry-stale')
  })

  it('fails when a listed ADR is no longer cited anywhere', () => {
    const violations = check({
      registry: registry({
        undocumented: [{ id: 'ADR-06', title: 'compat isolation', recordedIn: 'compat headers' }],
      }),
    })

    expect(rules(violations)).toContain('registry-uncited')
  })

  it('fails when the ceiling and the list disagree', () => {
    const violations = check({
      citations: [{ id: 'ADR-06', file: 'a.ts', line: 1 }],
      registry: {
        undocumented: [{ id: 'ADR-06', title: 'compat isolation', recordedIn: 'compat headers' }],
        maxUndocumented: 5,
      },
    })

    expect(rules(violations)).toContain('ratchet')
  })

  it('fails on an entry that names no title or location', () => {
    const violations = check({
      citations: [{ id: 'ADR-06', file: 'a.ts', line: 1 }],
      registry: registry({ undocumented: [{ id: 'ADR-06', title: '', recordedIn: '' }] }),
    })

    expect(rules(violations)).toContain('registry-entry')
  })

  it('treats ADR-6 in the registry as ADR-06 in a citation', () => {
    expect(check({
      citations: [{ id: 'ADR-06', file: 'a.ts', line: 1 }],
      registry: registry({ undocumented: [{ id: 'ADR-6', title: 'compat', recordedIn: 'headers' }] }),
    })).toEqual([])
  })
})

describe('the repository itself', () => {
  it('has no unresolved ADR citation', () => {
    const { violations } = validateAdrReferences()
    expect(violations.map(violation => `[${violation.rule}] ${violation.message}`)).toEqual([])
  })

  it('documents ADR-19, the decision this validator was added with', () => {
    expect(collectDocuments().map(entry => entry.id)).toContain('ADR-19')
  })

  it('carries a ceiling that matches its list', () => {
    const current = readRegistry()
    expect(current.maxUndocumented).toBe(current.undocumented.length)
  })

  it('records where each undocumented decision currently lives', () => {
    // Without this the ledger is a list of numbers, and the person who
    // eventually writes ADR-08 has nowhere to start.
    for (const entry of readRegistry().undocumented) {
      expect(entry.title.length, entry.id).toBeGreaterThan(10)
      expect(entry.recordedIn.length, entry.id).toBeGreaterThan(0)
    }
  })
})
