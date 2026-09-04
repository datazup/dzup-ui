/**
 * Unit cover for the provenance strip (TASK-N5-03, Item 0).
 *
 * The strip is the whole of the Item 0 fix, and the failure mode it must never
 * acquire is over-reach: an exclusion that quietly swallowed a *content* field
 * would turn two freshness gates into decoration while still printing a tick.
 * These cases hold both halves — provenance out, everything else in.
 *
 * `lastCommitFor` and `evidenceIsCurrent` are deliberately not covered here:
 * both shell out to `git` against the real checkout, so a unit assertion on
 * them would assert the repository's own history rather than the function.
 */

import { describe, expect, it } from 'vitest'
import { stripComponentCommits } from './git.ts'

describe('stripComponentCommits', () => {
  it('blanks every componentCommit stamp, not just the first', () => {
    const json = JSON.stringify({
      entries: [
        { component: 'DzButton', componentCommit: 'a'.repeat(40) },
        { component: 'DzInput', componentCommit: 'b'.repeat(40) },
        { component: 'DzTabs', componentCommit: 'c'.repeat(40) },
      ],
    }, null, 2)

    const stripped = stripComponentCommits(json)

    expect(stripped).not.toContain('a'.repeat(40))
    expect(stripped).not.toContain('b'.repeat(40))
    expect(stripped).not.toContain('c'.repeat(40))
    expect(stripped.match(/"componentCommit": "-"/g)).toHaveLength(3)
  })

  it('makes two artifacts that differ ONLY in provenance compare equal', () => {
    const before = JSON.stringify({ component: 'DzButton', componentCommit: 'a'.repeat(40), state: 'covered' }, null, 2)
    const after = JSON.stringify({ component: 'DzButton', componentCommit: 'z'.repeat(40), state: 'covered' }, null, 2)

    expect(before).not.toBe(after)
    expect(stripComponentCommits(before)).toBe(stripComponentCommits(after))
  })

  it('still fails a real content difference — the guardrail on the exclusion', () => {
    // Same provenance, one cell state moved. This is the case the gate exists
    // for, and the strip must not be able to hide it.
    const honest = JSON.stringify({ componentCommit: 'a'.repeat(40), state: 'stale' }, null, 2)
    const overstating = JSON.stringify({ componentCommit: 'a'.repeat(40), state: 'pass' }, null, 2)

    expect(stripComponentCommits(honest)).not.toBe(stripComponentCommits(overstating))
  })

  it('leaves a differently-named commit field alone', () => {
    // `sourceCommit` has its own, older exclusion in the validators that need
    // it; widening this one to `/\w*[Cc]ommit/` would silently take fields the
    // gates were never asked to stop comparing — a tester-recorded evidence
    // commit among them, which IS content.
    const json = JSON.stringify({ sourceCommit: 'a'.repeat(40), observedCommit: 'b'.repeat(40) }, null, 2)

    expect(stripComponentCommits(json)).toBe(json)
  })

  it('is a no-op on an artifact that carries no stamps', () => {
    const json = JSON.stringify({ rows: [] }, null, 2)

    expect(stripComponentCommits(json)).toBe(json)
  })
})
