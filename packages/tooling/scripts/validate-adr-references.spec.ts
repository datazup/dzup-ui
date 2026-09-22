import type { AdrCheckInput, AdrDocument, AdrRegistry } from './validate-adr-references.ts'
import { describe, expect, it } from 'vitest'
import {
  checkAdrReferences,
  collectDocuments,
  extractCitations,
  isCodeCitation,
  normaliseAdrId,
  readRegistry,
  readStatus,
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
  const documented = entries.documented ?? []
  return {
    undocumented,
    maxUndocumented: entries.maxUndocumented ?? undocumented.length,
    documented,
    maxProposedCitedFromCode: entries.maxProposedCitedFromCode ?? 0,
  }
}

function document(id: string, file?: string, heading?: string, status: AdrDocument['status'] = 'Accepted'): AdrDocument {
  return {
    id,
    file: file ?? `docs/adr/${id}-some-decision.md`,
    heading: heading ?? `${id} — Some decision`,
    status,
  }
}

/** A registry whose `documented` half agrees with the given documents. */
function indexing(documents: AdrDocument[], extra: Partial<AdrRegistry> = {}): AdrRegistry {
  return registry({
    ...extra,
    documented: documents.map(d => ({ id: d.id, title: `${d.id} decision`, file: d.file })),
  })
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
    const documents = [document('ADR-19')]
    expect(check({
      citations: [{ id: 'ADR-19', file: 'a.ts', line: 1 }],
      documents,
      // Indexed, because TASK-R0-O2 made the registry the whole ADR index: a
      // document on disk that the registry does not list is its own violation.
      registry: indexing(documents),
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
    const documents: AdrDocument[] = [{
      id: 'ADR-19',
      file: 'docs/adr/ADR-19-styling.md',
      heading: undefined,
      status: 'Accepted',
    }]
    const violations = check({ documents, registry: indexing(documents) })

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

/**
 * Status awareness — TASK-R0-O2 (2026-09-22).
 *
 * Before this block the validator contained no reading of `Proposed`,
 * `Accepted` or `Rejected` anywhere, which is why both N5-05 acceptance packets
 * concluded that accepting an ADR "moves the ceiling by exactly 0 — not only
 * when recorded in the ADR file, but not at all, under any condition". The
 * ratchet below is the number that acceptance moves.
 */
describe('readStatus', () => {
  it('reads the shipped line shape', () => {
    expect(readStatus('# ADR-18\n\n- **Status:** Proposed (TASK-OSS-P2-01, 2026-08-20)\n')).toBe('Proposed')
  })

  it('ignores a trailing amendment clause', () => {
    expect(readStatus('- **Status:** Proposed (P4-01, 2026-08-21; amended by P4-02 — see *Amendments*)'))
      .toBe('Proposed')
  })

  it('reads an acceptance', () => {
    expect(readStatus('- **Status:** Accepted (2026-09-30, A. Owner)')).toBe('Accepted')
  })

  it('returns undefined when the document declares no status', () => {
    expect(readStatus('# ADR-42\n\nSome prose with no status line.\n')).toBeUndefined()
  })

  it('does not mistake the word "proposed" in a sentence for a status line', () => {
    expect(readStatus('# ADR-42\n\nThis proposed change was rejected.\n')).toBeUndefined()
  })
})

describe('isCodeCitation', () => {
  it('counts a source file, a config and a generated artifact', () => {
    expect(isCodeCitation('packages/contracts/src/anatomy.types.ts')).toBe(true)
    expect(isCodeCitation('packages/core/docs/component-meta.json')).toBe(true)
    expect(isCodeCitation('apps/docs/.vitepress/config.ts')).toBe(true)
  })

  it('does not count prose, wherever it lives', () => {
    // A handoff discussing ADR-19 costs nothing; anatomy.types.ts being built
    // on an unsigned ADR-19 is the debt the ratchet measures.
    expect(isCodeCitation('docs/program-2026-09-04/reports/TASK-R0-O2-handoff.md')).toBe(false)
    expect(isCodeCitation('CLAUDE.md')).toBe(false)
    expect(isCodeCitation('packages/tokens/TOKENS.md')).toBe(false)
  })
})

describe('the documented half of the registry', () => {
  it('fails when a document on disk is missing from the index', () => {
    const documents = [document('ADR-18')]
    expect(rules(check({ documents, registry: registry() }))).toContain('registry-documented-missing')
  })

  it('fails when the index points at a file that is not there', () => {
    expect(rules(check({
      documents: [],
      registry: registry({ documented: [{ id: 'ADR-18', title: 'Runtime floor', file: 'docs/adr/ADR-18-x.md' }] }),
    }))).toContain('registry-documented-stale')
  })

  it('fails when the index and the disk disagree about the path', () => {
    const documents = [document('ADR-18', 'docs/adr/ADR-18-runtime-floor.md')]
    expect(rules(check({
      documents,
      registry: registry({ documented: [{ id: 'ADR-18', title: 'Runtime floor', file: 'docs/adr/ADR-18-elsewhere.md' }] }),
    }))).toContain('registry-documented-path')
  })

  it('passes when the index agrees with the disk', () => {
    const documents = [document('ADR-18')]
    expect(rules(check({ documents, registry: indexing(documents) }))).toEqual([])
  })
})

describe('a document must declare a readable status', () => {
  it('fails on a document with no status line', () => {
    // Otherwise the document drops silently out of the ratchet's count, which
    // is the one way this gate could be defeated by accident rather than edit.
    const documents: AdrDocument[] = [{
      id: 'ADR-18',
      file: 'docs/adr/ADR-18-runtime-floor.md',
      heading: 'ADR-18 — Runtime floor',
      status: undefined,
    }]
    expect(rules(check({ documents, registry: indexing(documents) }))).toContain('document-status')
  })
})

describe('the Proposed-cited-from-code ratchet', () => {
  const proposed = (id: string) => document(id, undefined, undefined, 'Proposed')

  it('fires when code cites more unsigned decisions than the ceiling', () => {
    // THE SEEDED FAILURE. Two Proposed ADRs are cited from source; the ceiling
    // says one. Before TASK-R0-O2 this produced no violation of any kind.
    const documents = [proposed('ADR-18'), proposed('ADR-19')]
    const violations = check({
      citations: [
        { id: 'ADR-18', file: 'packages/core/src/index.ts', line: 3 },
        { id: 'ADR-19', file: 'packages/contracts/src/anatomy.types.ts', line: 3 },
      ],
      documents,
      registry: indexing(documents, { maxProposedCitedFromCode: 1 }),
    })
    expect(rules(violations)).toContain('proposed-ceiling')
    expect(violations.find(v => v.rule === 'proposed-ceiling')?.message).toContain('ADR-18, ADR-19')
  })

  it('fires the other way when an ADR is accepted and the ceiling is not lowered', () => {
    // This is what makes acceptance measurable: flipping ADR-19 to Accepted
    // turns the gate red until maxProposedCitedFromCode falls in the same change.
    const documents = [proposed('ADR-18'), document('ADR-19')]
    expect(rules(check({
      citations: [
        { id: 'ADR-18', file: 'packages/core/src/index.ts', line: 3 },
        { id: 'ADR-19', file: 'packages/contracts/src/anatomy.types.ts', line: 3 },
      ],
      documents,
      registry: indexing(documents, { maxProposedCitedFromCode: 2 }),
    }))).toContain('proposed-ratchet')
  })

  it('excludes an Accepted ADR however often code cites it', () => {
    const documents = [document('ADR-19')]
    expect(rules(check({
      citations: Array.from({ length: 500 }, (_, i) => ({
        id: 'ADR-19',
        file: 'packages/contracts/src/anatomy.types.ts',
        line: i + 1,
      })),
      documents,
      registry: indexing(documents, { maxProposedCitedFromCode: 0 }),
    }))).toEqual([])
  })

  it('does not count a Proposed ADR that only prose cites', () => {
    // An acceptance packet arguing about ADR-19 is not code building on it.
    const documents = [proposed('ADR-19')]
    expect(rules(check({
      citations: [{ id: 'ADR-19', file: 'docs/program-2026-09/reports/N5-05-adr-19-acceptance-packet.md', line: 1 }],
      documents,
      registry: indexing(documents, { maxProposedCitedFromCode: 0 }),
    }))).toEqual([])
  })

  it('does not count a Proposed ADR that has no document, since it has no status to read', () => {
    // Those are `maxUndocumented`'s business. Two ratchets, two populations.
    expect(rules(check({
      citations: [{ id: 'ADR-04', file: 'packages/core/src/index.ts', line: 3 }],
      registry: registry({
        undocumented: [{ id: 'ADR-04', title: 'Token-only styling', recordedIn: 'CLAUDE.md' }],
        maxProposedCitedFromCode: 0,
      }),
    }))).toEqual([])
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

  it('indexes every ADR document it has, and every document declares a status', () => {
    const documents = collectDocuments()
    const indexed = new Set(readRegistry().documented.map(entry => normaliseAdrId(entry.id)))
    for (const doc of documents) {
      expect(indexed, `${doc.id} should be in the documented half of the registry`).toContain(doc.id)
      expect(doc.status, `${doc.file} should declare a status`).toBeDefined()
    }
  })

  it('declares a Proposed-from-code ceiling equal to what it measures', () => {
    // The C1 figure, measured rather than asserted. At 2026-09-22 this is 3 —
    // ADR-18, ADR-19 and ADR-20, none of them signed. It goes down only when an
    // owner accepts one and the ceiling is lowered in the same change.
    const { proposedCitedFromCode } = validateAdrReferences()
    expect(proposedCitedFromCode.length).toBe(readRegistry().maxProposedCitedFromCode)
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
