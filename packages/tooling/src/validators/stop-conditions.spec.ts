/**
 * Unit cover for the release stop-condition gate (TASK-S2-O2).
 *
 * The rule this file is written to is the prompt's: *"Each machine check ships
 * with a spec that seeds the violation and proves the exit code."* So every
 * assertion below **seeds** the condition into a throwaway candidate bundle (or
 * a throwaway package tree) and then reads the verdict back. Nothing asserts
 * the live repository's colour — that would go red the moment the owner
 * committed, which is the state the gate exists to reward.
 *
 * The two assertions that ARE made against the live tree are the two that must
 * be: the config parses and enumerates eleven conditions, and an evaluator that
 * throws comes back `unevaluable` rather than `clear`. The second one is not
 * decoration — SC-7 really did throw during this task's development, and the
 * wrapper is the only reason it surfaced as a red instead of a silent pass.
 */

import type { SourceBinding } from '../release/binding.ts'
import type { StopConditionConfig } from './stop-conditions.ts'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  collectAllowlistSizes,
  collectCeilings,
  CONDITIONS,
  previousCandidate,
  readStopConfig,
  runStopConditions,
} from './stop-conditions.ts'

// --- Fixture plumbing -------------------------------------------------------

const made: string[] = []

afterEach(() => {
  for (const dir of made.splice(0))
    rmSync(dir, { recursive: true, force: true })
})

function tree(files: Record<string, unknown>): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-stop-'))
  made.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const full = join(root, rel)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, typeof body === 'string' ? body : `${JSON.stringify(body, null, 2)}\n`, 'utf8')
  }
  return root
}

const HEAD = 'a'.repeat(40)

function binding(over: Partial<SourceBinding> = {}): SourceBinding {
  return {
    sourceCommit: HEAD,
    shortCommit: HEAD.slice(0, 7),
    branch: 'main',
    dirty: false,
    dirtyCount: 0,
    dirtyFiles: [],
    admissible: true,
    inadmissibleReason: null,
    upstream: null,
    ...over,
  } as SourceBinding
}

const config: StopConditionConfig = readStopConfig()

/** Run one condition against a seeded candidate directory. */
function verdictOf(n: number, candidateDir: string, over: Partial<SourceBinding> = {}, root?: string): { verdict: string, detail: string } {
  const report = runStopConditions({
    root,
    candidate: candidateDir,
    only: [n],
    binding: binding(over),
    config,
  })
  const first = report.results[0]
  if (first === undefined)
    throw new Error('the gate returned no result for the selected condition')
  return { verdict: first.verdict, detail: first.detail }
}

// --- The enumeration --------------------------------------------------------

describe('the enumeration', () => {
  it('is eleven conditions — doc 08 prints nine bullets and the first is compound', () => {
    expect(CONDITIONS).toHaveLength(11)
    expect(CONDITIONS.map(c => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
  })

  it('declares exactly one attested condition, and it is the authority one', () => {
    const attested = CONDITIONS.filter(c => c.mode === 'attested')
    expect(attested.map(c => c.n)).toEqual([11])
    expect(config.attested.map(a => a.condition)).toEqual([11])
  })

  it('carries doc 08\'s own wording on every condition', () => {
    for (const c of CONDITIONS)
      expect(c.wording.length).toBeGreaterThan(10)
  })
})

// --- SC-1 dirty source ------------------------------------------------------

describe('sC-1 — dirty/unidentified source', () => {
  it('fires on a dirty worktree', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    const r = verdictOf(1, join(dir, 'qa/2026-01-01-abcdef1'), {
      dirty: true,
      dirtyCount: 3,
      dirtyFiles: [{ status: ' M', path: 'packages/core/src/x.ts' }] as never,
    })
    expect(r.verdict).toBe('fired')
    expect(r.detail).toContain('3 uncommitted')
  })

  it('fires when HEAD does not resolve', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    const r = verdictOf(1, join(dir, 'qa/2026-01-01-abcdef1'), { sourceCommit: '' })
    expect(r.verdict).toBe('fired')
    expect(r.detail).toContain('unidentified')
  })

  it('is clear on a clean tree', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    expect(verdictOf(1, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('clear')
  })
})

// --- SC-3 evidence misbound -------------------------------------------------

describe('sC-3 — evidence bound to a different commit/configuration', () => {
  it('fires on an artifact stamped at another commit', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/thing.json': { sourceCommit: 'b'.repeat(40) } })
    const r = verdictOf(3, join(dir, 'qa/2026-01-01-abcdef1'))
    expect(r.verdict).toBe('fired')
  })

  it('fires on provenance stamped inadmissible', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/hashes.json': { provenance: { sourceCommit: HEAD, admissible: false } } })
    expect(verdictOf(3, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('fired')
  })

  it('is UNEVALUABLE, not clear, when the bundle does not exist at all', () => {
    const dir = tree({ 'qa/.keep': '' })
    expect(verdictOf(3, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('unevaluable')
  })

  it('is clear when every stamp names HEAD', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/thing.json': { sourceCommit: HEAD, provenance: { admissible: true } } })
    expect(verdictOf(3, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('clear')
  })
})

// --- SC-5 API diff ----------------------------------------------------------

describe('sC-5 — unexplained public API diff or manifest omissions', () => {
  const dirOf = (apiDiff: unknown): string =>
    join(tree({ 'qa/2026-01-01-abcdef1/api-diff.json': apiDiff as object }), 'qa/2026-01-01-abcdef1')

  it('is UNEVALUABLE when the candidate has no api-diff', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    expect(verdictOf(5, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('unevaluable')
  })

  it('fires when a package has no baseline — unbaselined is not "no change"', () => {
    const d = dirOf({ summary: { '@x/a': { added: 0, removed: 0, changed: 0, fidelity: 'none', requiredLevel: 'none', declaredLevel: 'none' } } })
    expect(verdictOf(5, d).verdict).toBe('fired')
  })

  it('fires when the declared changeset level is below the required one', () => {
    const d = dirOf({ summary: { '@x/a': { added: 0, removed: 2, changed: 0, fidelity: 'snapshot', requiredLevel: 'minor', declaredLevel: 'patch' } } })
    expect(verdictOf(5, d).verdict).toBe('fired')
  })

  it('fires on a manifest omission the packed build does not deliver', () => {
    const d = dirOf({
      summary: { '@x/a': { added: 0, removed: 0, changed: 0, fidelity: 'snapshot', requiredLevel: 'none', declaredLevel: 'none' } },
      reconciliations: [{ package: '@x/a', undocumented: [], undelivered: ['Gone'] }],
    })
    expect(verdictOf(5, d).verdict).toBe('fired')
  })

  it('is clear when every change is baselined and correctly declared', () => {
    const d = dirOf({ summary: { '@x/a': { added: 1, removed: 0, changed: 0, fidelity: 'snapshot', requiredLevel: 'patch', declaredLevel: 'patch' } } })
    expect(verdictOf(5, d).verdict).toBe('clear')
  })
})

// --- SC-7 thresholds --------------------------------------------------------

describe('sC-7 — threshold raised without a reviewed justification', () => {
  function history(previousValue: number, currentValue: number, justifications: unknown[] = []): string {
    const root = tree({
      'ceilings.json': { maxThing: currentValue },
      'qa/2026-01-01-aaaaaaa/ratchets.json': {
        candidate: '2026-01-01-aaaaaaa',
        sourceCommit: HEAD,
        recordedAt: '2026-01-01T00:00:00.000Z',
        ceilings: [{ key: 'ceilings.json.maxThing', value: previousValue, direction: 'max' }],
        justifications: [],
      },
      'qa/2026-01-02-bbbbbbb/ratchets.json': {
        candidate: '2026-01-02-bbbbbbb',
        sourceCommit: HEAD,
        recordedAt: '2026-01-02T00:00:00.000Z',
        ceilings: [],
        justifications,
      },
    })
    return root
  }

  const scopedConfig: StopConditionConfig = { ...config, ceilingFiles: ['ceilings.json'], allowlistFiles: [] }

  function run(root: string): { verdict: string, detail: string } {
    const report = runStopConditions({
      root,
      candidate: join(root, 'qa/2026-01-02-bbbbbbb'),
      only: [7],
      binding: binding(),
      config: scopedConfig,
    })
    const first = report.results[0]
    if (first === undefined)
      throw new Error('the gate returned no result for the selected condition')
    return { verdict: first.verdict, detail: first.detail }
  }

  it('fires when a ceiling goes UP with no justification', () => {
    const r = run(history(5, 9))
    expect(r.verdict).toBe('fired')
    expect(r.detail).toContain('1 threshold(s) raised')
  })

  it('is clear when the same raise carries an owned justification', () => {
    const r = run(history(5, 9, [{ key: 'ceilings.json.maxThing', from: 5, to: 9, owner: 'esmir', reason: 'agreed with product' }]))
    expect(r.verdict).toBe('clear')
  })

  it('is clear when the ceiling went DOWN — ratchets move one way', () => {
    expect(run(history(9, 5)).verdict).toBe('clear')
  })

  it('is UNEVALUABLE, not clear, when the previous candidate recorded nothing', () => {
    const root = tree({ 'ceilings.json': { maxThing: 5 }, 'qa/2026-01-01-aaaaaaa/.keep': '', 'qa/2026-01-02-bbbbbbb/.keep': '' })
    expect(run(root).verdict).toBe('unevaluable')
  })

  it('is UNEVALUABLE when there is no previous candidate at all', () => {
    const root = tree({ 'ceilings.json': { maxThing: 5 }, 'qa/2026-01-02-bbbbbbb/.keep': '' })
    expect(run(root).verdict).toBe('unevaluable')
  })
})

describe('collectCeilings', () => {
  it('collects threshold-shaped keys and ignores schema prose and archived history', () => {
    const root = tree({
      'c.json': {
        $comment: 'ignored',
        maxThing: 3,
        minFloor: 2,
        unrelated: 99,
        history: [{ ceiling: 54 }],
        nested: { ceilingHere: 7 },
      },
    })
    const found = collectCeilings(root, ['c.json'])
    const keys = found.map(c => c.key)
    expect(keys).toContain('c.json.maxThing')
    expect(keys).toContain('c.json.minFloor')
    expect(keys).toContain('c.json.nested.ceilingHere')
    expect(keys).not.toContain('c.json.unrelated')
    expect(keys.some(k => k.includes('history'))).toBe(false)
    expect(found.find(c => c.key === 'c.json.minFloor')?.direction).toBe('min')
  })
})

describe('collectAllowlistSizes', () => {
  it('measures an allowlist that grew, even though no number changed', () => {
    const root = tree({ 'a.json': { exceptions: [1, 2, 3] }, 'b.json': ['x', 'y'] })
    const sizes = collectAllowlistSizes(root, [
      { path: 'a.json', pointer: 'exceptions' },
      { path: 'b.json', pointer: null },
    ])
    expect(sizes.find(s => s.key.startsWith('a.json'))?.value).toBe(3)
    expect(sizes.find(s => s.key.startsWith('b.json'))?.value).toBe(2)
  })
})

describe('previousCandidate', () => {
  it('picks the newest bundle strictly older than the current one', () => {
    const root = tree({
      'qa/2026-01-01-aaaaaaa/.keep': '',
      'qa/2026-01-05-ccccccc/.keep': '',
      'qa/2026-02-01-ddddddd/.keep': '',
      'qa/not-a-bundle/.keep': '',
    })
    expect(previousCandidate('2026-02-01-ddddddd', join(root, 'qa'))).toBe('2026-01-05-ccccccc')
    expect(previousCandidate('2026-01-01-aaaaaaa', join(root, 'qa'))).toBeNull()
  })
})

// --- SC-8 / SC-10 — the two rows TASK-S2-O1 made detectable -----------------

describe('sC-8 — a fail-open path', () => {
  const bundle = (rows: unknown[]): string =>
    join(tree({ 'qa/2026-01-01-abcdef1/package-qualification.json': { rows } }), 'qa/2026-01-01-abcdef1')

  it('is UNEVALUABLE with no qualification report', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    expect(verdictOf(8, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('unevaluable')
  })

  it('fires when a governed row is not green', () => {
    const d = bundle([
      { n: 8, title: 'optional peer', verdict: 'green', reason: '' },
      { n: 9, title: 'CSP and Trusted Types', verdict: 'red', reason: 'no policy' },
    ])
    const r = verdictOf(8, d)
    expect(r.verdict).toBe('fired')
  })

  it('is UNEVALUABLE when a watched row is simply absent — not clear', () => {
    const d = bundle([{ n: 8, title: 'optional peer', verdict: 'green', reason: '' }])
    expect(verdictOf(8, d).verdict).toBe('unevaluable')
  })

  it('is clear when every governed row is green', () => {
    const d = bundle([
      { n: 8, title: 'optional peer', verdict: 'green', reason: '' },
      { n: 9, title: 'CSP', verdict: 'green', reason: '' },
    ])
    expect(verdictOf(8, d).verdict).toBe('clear')
  })
})

describe('sC-10 — the tarball differs or has undeclared files', () => {
  function bundle(rows: unknown[], packages: Record<string, unknown>): string {
    return join(tree({
      'qa/2026-01-01-abcdef1/package-qualification.json': { rows },
      'qa/2026-01-01-abcdef1/hashes.json': { packages },
      'packages/tooling/scripts/release-policy.json': { published: ['@x/a'] },
    }), 'qa/2026-01-01-abcdef1')
  }

  it('is UNEVALUABLE with no recorded digest — "differs" needs a referent', () => {
    const root = tree({
      'qa/2026-01-01-abcdef1/package-qualification.json': { rows: [{ n: 11, title: 't', verdict: 'green', reason: '' }] },
      'packages/tooling/scripts/release-policy.json': { published: ['@x/a'] },
    })
    const r = runStopConditions({ root, candidate: join(root, 'qa/2026-01-01-abcdef1'), only: [10], binding: binding(), config })
    expect(r.results[0]?.verdict).toBe('unevaluable')
  })

  it('fires when a published package has no tarball digest', () => {
    const d = bundle([{ n: 11, title: 't', verdict: 'green', reason: '' }], {})
    const r = runStopConditions({ root: dirname(dirname(d)), candidate: d, only: [10], binding: binding(), config })
    expect(r.results[0]?.verdict).toBe('fired')
    expect(r.results[0]?.detail).toContain('1 tarball finding')
  })

  it('fires when the tarball-diff row is red', () => {
    const d = bundle([{ n: 11, title: 't', verdict: 'red', reason: 'undeclared file' }], { '@x/a': {} })
    const r = runStopConditions({ root: dirname(dirname(d)), candidate: d, only: [10], binding: binding(), config })
    expect(r.results[0]?.verdict).toBe('fired')
  })

  it('is clear when the row is green and every published package is digested', () => {
    const d = bundle([{ n: 11, title: 't', verdict: 'green', reason: '' }], { '@x/a': {} })
    const r = runStopConditions({ root: dirname(dirname(d)), candidate: d, only: [10], binding: binding(), config })
    expect(r.results[0]?.verdict).toBe('clear')
  })
})

// --- SC-11 — attested -------------------------------------------------------

describe('sC-11 — authority, the attested condition', () => {
  it('is `unattested` with no attestation file', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    expect(verdictOf(11, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('unattested')
  })

  it('stays `unattested` when the row exists but is unsigned — a template is not a signature', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/attestations.json': { rows: [{ condition: 11, attestedBy: '', date: '', decision: '' }] } })
    expect(verdictOf(11, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('unattested')
  })

  it('stays `unattested` when the owner signed but decided `fired`', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/attestations.json': { rows: [{ condition: 11, attestedBy: 'owner', date: '2026-01-01', decision: 'fired' }] } })
    expect(verdictOf(11, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('unattested')
  })

  it('clears only on a complete owner signature', () => {
    const dir = tree({ 'qa/2026-01-01-abcdef1/attestations.json': { rows: [{ condition: 11, attestedBy: 'owner', date: '2026-01-01', decision: 'clear' }] } })
    expect(verdictOf(11, join(dir, 'qa/2026-01-01-abcdef1')).verdict).toBe('clear')
  })
})

// --- Fail-closed ------------------------------------------------------------

describe('fail-closed', () => {
  it('turns a throwing evaluator into `unevaluable`, never into `clear`', () => {
    const broken: StopConditionConfig = {
      ...config,
      // `attested` is read by SC-11; making it a non-array makes `.find` throw.
      attested: null as never,
    }
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    const report = runStopConditions({ candidate: join(dir, 'qa/2026-01-01-abcdef1'), only: [11], binding: binding(), config: broken })
    expect(report.results[0]?.verdict).toBe('unevaluable')
    expect(report.results[0]?.detail).toContain('threw')
  })

  it('counts only `clear` as green in the totals', () => {
    // SC-5 has no api-diff to read (unevaluable) and SC-11 has no signature
    // (unattested). Neither is `fired`, and neither may be counted as green.
    //
    // SC-3 was the first choice here and was WRONG: a bundle directory that
    // exists and holds no stamped artifact is legitimately `clear` for SC-3,
    // because every stamp it does carry names HEAD — vacuously, but truly. The
    // test asserted the bug it expected rather than the behaviour that is
    // right, and the code was correct. Recorded rather than quietly swapped.
    const dir = tree({ 'qa/2026-01-01-abcdef1/.keep': '' })
    const report = runStopConditions({ candidate: join(dir, 'qa/2026-01-01-abcdef1'), only: [5, 11], binding: binding(), config })
    expect(report.totals.clear).toBe(0)
    expect(report.totals.unevaluable + report.totals.unattested).toBe(2)
  })
})
