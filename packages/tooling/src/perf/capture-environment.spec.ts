/**
 * TASK-S1-O4 — the perf capture authority, and the proof that none of its
 * refusals can pass silently.
 *
 * Two levels, because one alone is weak evidence. These are the pure-function
 * cases; the CLI end-to-end refusal is recorded in
 * `docs/program-2026-09-22-architecture/reports/TASK-S1-O4-handoff.md` §5 with
 * its exit code read directly.
 *
 * The last block asserts against the **committed** repository state rather than
 * a fixture, so the gates are exercised against what actually ships. A suite of
 * fixtures can be green while the real file is broken; that is how
 * `validate:docs-size` came to report on an artifact nothing built.
 */

import type { Baseline, BaselineFile } from './baselines.ts'
import { describe, expect, it } from 'vitest'
import {
  checkCaptureAuthority,
  checkPerfBaselines,
  familiesWithBaseline,
  hostMatchesProfile,
  METRIC_KINDS,
  nodeMajorOf,
  perfInputGate,
  perfInputNote,
  readCaptureEnvironment,
  readPerfCeilings,
  thresholdMovements,
} from './capture-environment.ts'
import { readBaselineFile } from './read-baselines.ts'

const PROFILE = {
  platform: 'linux',
  arch: 'x64',
  minCpus: 4,
  nodeMajor: 24,
  description: 'test profile',
}

const HOST = { platform: 'linux', arch: 'x64', cpus: 8, node: 'v24.14.1' }

function environment(overrides: Record<string, unknown> = {}): never {
  return {
    schemaVersion: '1.0.0',
    authoritative: { designated: true, profileId: 'p', decision: 'D-TEST' },
    profiles: { p: PROFILE },
    committed: { profileId: 'p' },
    quiescence: { required: true },
    ...overrides,
  } as never
}

function baseline(over: Partial<Baseline> = {}): Baseline {
  return {
    id: 'runtime:DzX:mount-1',
    kind: 'runtime',
    component: 'DzX',
    tier: 'C',
    scenario: 'mount-1',
    unit: 'ms',
    distribution: { samples: [1], runs: 7, median: 10, p95: 12, mean: 10, stddev: 1, cv: 0.1 },
    threshold: 100,
    thresholdFormula: 'median 10 + max(3σ 3, 5% 0.5) = 13',
    unmeasurable: null,
    sourceCommit: 'abc123',
    host: { platform: 'linux', arch: 'x64', cpus: 8, node: 'v24.14.1' },
    ...over,
  } as Baseline
}

function file(baselines: Baseline[]): BaselineFile {
  return {
    schemaVersion: '1.2.0',
    policy: { minimumRuns: 5, measurableCv: 0.25, threshold: 'f', ratchet: 'down' },
    baselines,
  }
}

describe('hostMatchesProfile', () => {
  it('accepts a host that satisfies the declared profile', () => {
    expect(hostMatchesProfile(PROFILE, HOST).match).toBe(true)
  })

  it('accepts MORE cpus than the minimum, because a profile is a class not a laptop', () => {
    expect(hostMatchesProfile(PROFILE, { ...HOST, cpus: 64 }).match).toBe(true)
  })

  it('names every mismatch rather than the first', () => {
    const verdict = hostMatchesProfile(PROFILE, {
      platform: 'win32',
      arch: 'arm64',
      cpus: 2,
      node: 'v22.0.0',
    })
    expect(verdict.match).toBe(false)
    expect(verdict.reasons).toHaveLength(4)
  })

  it('treats an unparseable node version as a mismatch, never as a pass', () => {
    expect(Number.isNaN(nodeMajorOf('not-a-version'))).toBe(true)
    expect(hostMatchesProfile(PROFILE, { ...HOST, node: 'not-a-version' }).match).toBe(false)
  })
})

describe('checkCaptureAuthority — the in-place write', () => {
  it('never refuses a proposal, whatever the host', () => {
    const verdict = checkCaptureAuthority(environment(), { ...HOST, platform: 'win32' }, {
      inPlace: false,
    })
    expect(verdict.allowed).toBe(true)
    expect(verdict.refusals).toHaveLength(0)
  })

  it('refuses when no capture environment is declared at all', () => {
    const verdict = checkCaptureAuthority(undefined, HOST, { inPlace: true })
    expect(verdict.allowed).toBe(false)
    expect(verdict.refusals[0]!.code).toBe('no-environment')
  })

  it('refuses while no authoritative host is designated — the state at 4e4e46f', () => {
    const verdict = checkCaptureAuthority(
      environment({ authoritative: { designated: false, profileId: null } }),
      HOST,
      { inPlace: true, attestedBy: 'someone' },
    )
    expect(verdict.allowed).toBe(false)
    expect(verdict.refusals.map(r => r.code)).toContain('undesignated')
  })

  it('refuses a profileId that resolves to nothing', () => {
    const verdict = checkCaptureAuthority(
      environment({ authoritative: { designated: true, profileId: 'ghost' } }),
      HOST,
      { inPlace: true, attestedBy: 'someone' },
    )
    expect(verdict.refusals.map(r => r.code)).toContain('unknown-profile')
  })

  it('refuses the wrong host and names both sides', () => {
    const verdict = checkCaptureAuthority(environment(), { ...HOST, platform: 'win32' }, {
      inPlace: true,
      attestedBy: 'someone',
    })
    expect(verdict.allowed).toBe(false)
    const refusal = verdict.refusals.find(r => r.code === 'wrong-host')!
    expect(refusal.message).toContain('win32')
    expect(refusal.message).toContain('perf:propose')
  })

  it('refuses an unattested capture on the RIGHT host', () => {
    const verdict = checkCaptureAuthority(environment(), HOST, { inPlace: true })
    expect(verdict.allowed).toBe(false)
    expect(verdict.refusals.map(r => r.code)).toEqual(['unattested'])
  })

  it('allows the fully qualified capture — the refusal is not a blanket one', () => {
    const verdict = checkCaptureAuthority(environment(), HOST, {
      inPlace: true,
      attestedBy: 'an owner',
      movements: { raised: [], lowered: [], added: [], removed: [], thresholdLost: [] },
    })
    expect(verdict.allowed).toBe(true)
  })

  it('refuses a capture that would raise a budget, and names the worst offenders', () => {
    const verdict = checkCaptureAuthority(environment(), HOST, {
      inPlace: true,
      attestedBy: 'an owner',
      movements: {
        raised: [
          { id: 'size:DzMention', from: 22421, to: 27263, percent: 21.6, ratchetReason: 'x' },
        ],
        lowered: [],
        added: [],
        removed: [],
        thresholdLost: [],
      },
    })
    expect(verdict.allowed).toBe(false)
    const refusal = verdict.refusals.find(r => r.code === 'raises-budget')!
    expect(refusal.message).toContain('size:DzMention')
    expect(refusal.message).toContain('recorded user benefit and owner')
  })

  it('lets an owner raise a budget only with --raise-budget AND --owner AND --reason', () => {
    const verdict = checkCaptureAuthority(environment(), HOST, {
      inPlace: true,
      attestedBy: 'an owner',
      budgetRaiseAuthorised: true,
      movements: {
        raised: [{ id: 'size:DzMention', from: 1, to: 2, percent: 100, ratchetReason: 'x' }],
        lowered: [],
        added: [],
        removed: [],
        thresholdLost: [],
      },
    })
    expect(verdict.allowed).toBe(true)
  })
})

describe('thresholdMovements — defect D132\'s missing call site', () => {
  const recorded = file([
    baseline({ id: 'a', threshold: 100 }),
    baseline({ id: 'b', threshold: 100 }),
    baseline({ id: 'c', threshold: 100 }),
    baseline({ id: 'gone', threshold: 100 }),
  ])

  it('reports an upward move as raised, with the percentage', () => {
    const moves = thresholdMovements(recorded, [baseline({ id: 'a', threshold: 121.6 })])
    expect(moves.raised).toHaveLength(1)
    expect(moves.raised[0]!.percent).toBeCloseTo(21.6, 5)
  })

  it('reports a downward move as lowered', () => {
    const moves = thresholdMovements(recorded, [baseline({ id: 'a', threshold: 90 })])
    expect(moves.lowered).toHaveLength(1)
    expect(moves.raised).toHaveLength(0)
  })

  it('separates a new metric from a raised one — adding a lane is not a budget raise', () => {
    const moves = thresholdMovements(recorded, [baseline({ id: 'leak:DzX:listeners-50' })])
    expect(moves.added).toEqual(['leak:DzX:listeners-50'])
    expect(moves.raised).toHaveLength(0)
  })

  it('reports a lost threshold, which is evidence removed rather than added', () => {
    const moves = thresholdMovements(recorded, [
      baseline({ id: 'a', threshold: null, unmeasurable: 'variance-exceeds-signal' }),
    ])
    expect(moves.thresholdLost).toEqual(['a'])
    expect(moves.raised).toHaveLength(0)
  })

  it('reports a metric the fresh capture no longer contains', () => {
    const moves = thresholdMovements(recorded, [baseline({ id: 'a' })])
    expect(moves.removed).toContain('gone')
  })

  it('treats an absent recorded file as all-new, never as all-raised', () => {
    const moves = thresholdMovements(undefined, [baseline({ id: 'a' })])
    expect(moves.raised).toHaveLength(0)
    expect(moves.added).toEqual(['a'])
  })
})

describe('checkPerfBaselines — the host-free gate', () => {
  it('fails when no capture environment is declared', () => {
    expect(checkPerfBaselines(file([baseline()]), undefined, undefined)
      .map(v => v.rule)).toEqual(['environment'])
  })

  it('fails a profileId that resolves to nothing', () => {
    const violations = checkPerfBaselines(
      file([baseline()]),
      environment({ authoritative: { designated: true, profileId: 'ghost' } }),
      undefined,
    )
    expect(violations.map(v => v.rule)).toContain('profile')
  })

  it('fails a baseline whose host contradicts the profile the file claims', () => {
    const violations = checkPerfBaselines(
      file([baseline({ host: { platform: 'win32', arch: 'x64', cpus: 16, node: 'v24.14.1' } })]),
      environment(),
      undefined,
    )
    expect(violations.map(v => v.rule)).toContain('host-drift')
  })

  it('fails a baseline with no sourceCommit — the 22-stale-cell defect at its root', () => {
    const violations = checkPerfBaselines(
      file([baseline({ sourceCommit: '' })]),
      environment(),
      undefined,
    )
    expect(violations.map(v => v.rule)).toContain('provenance')
  })

  it('fails a threshold derived from fewer than five samples', () => {
    const violations = checkPerfBaselines(
      file([baseline({
        distribution: { samples: [1], runs: 3, median: 10, p95: 12, mean: 10, stddev: 1, cv: 0.1 },
      })]),
      environment(),
      undefined,
    )
    expect(violations.map(v => v.rule)).toContain('sample-discipline')
  })

  it('fails a threshold derived from a distribution too noisy to have earned one', () => {
    const violations = checkPerfBaselines(
      file([baseline({
        distribution: { samples: [1], runs: 9, median: 10, p95: 99, mean: 10, stddev: 9, cv: 0.9 },
      })]),
      environment(),
      undefined,
    )
    expect(violations.map(v => v.rule)).toContain('threshold-consistency')
  })

  it('fails a designated gate host that none of the evidence is on', () => {
    const violations = checkPerfBaselines(
      file([baseline()]),
      environment({
        authoritative: { designated: true, profileId: 'q' },
        profiles: { p: PROFILE, q: { ...PROFILE, platform: 'darwin', description: 'other' } },
        committed: { profileId: 'p' },
      }),
      undefined,
    )
    expect(violations.map(v => v.rule)).toContain('gate-claim')
  })

  describe('the family ratchet', () => {
    const ceilings = {
      metricFamiliesWithoutBaseline: { ceiling: 4, families: ['hydration', 'leak', 'longtask', 'memory'], blockedOn: 'x' },
      unmeasurableMetrics: { ceiling: 0, blockedOn: 'x' },
    }

    it('passes at the ceiling', () => {
      const violations = checkPerfBaselines(
        file([baseline({ kind: 'runtime' }), baseline({ id: 's', kind: 'size' })]),
        environment(),
        ceilings,
      )
      expect(violations.filter(v => v.rule === 'family-ratchet')).toHaveLength(0)
    })

    it('fAILS on a rise', () => {
      const violations = checkPerfBaselines(file([baseline({ kind: 'runtime' })]), environment(), ceilings)
      const rule = violations.find(v => v.rule === 'family-ratchet')!
      expect(rule.message).toContain('above the ceiling of 4')
    })

    it('fAILS on a drop that does not lower the ceiling in the same change', () => {
      const violations = checkPerfBaselines(
        file([
          baseline({ kind: 'runtime' }),
          baseline({ id: 's', kind: 'size' }),
          baseline({ id: 'l', kind: 'leak' }),
        ]),
        environment(),
        ceilings,
      )
      const rule = violations.find(v => v.rule === 'family-ratchet')!
      expect(rule.message).toContain('Lower metricFamiliesWithoutBaseline.ceiling to 3')
    })

    it('fAILS on a swap that keeps the count identical — a bare count would not notice', () => {
      const violations = checkPerfBaselines(
        file([baseline({ kind: 'runtime' }), baseline({ id: 'l', kind: 'leak' })]),
        environment(),
        { ...ceilings, metricFamiliesWithoutBaseline: { ceiling: 4, families: ['hydration', 'leak', 'longtask', 'memory'], blockedOn: 'x' } },
      )
      // `size` lost its evidence and `leak` gained some: still 4 absent.
      const rule = violations.find(v => v.rule === 'family-ratchet')!
      expect(rule.message).toContain('one family gained evidence while another lost it')
    })
  })

  it('holds the unmeasurable count in both directions', () => {
    const ceilings = {
      metricFamiliesWithoutBaseline: { ceiling: 6, families: [...METRIC_KINDS], blockedOn: 'x' },
      unmeasurableMetrics: { ceiling: 1, blockedOn: 'x' },
    }
    const rise = checkPerfBaselines(
      file([
        baseline({ id: 'a', threshold: null, unmeasurable: 'variance-exceeds-signal' }),
        baseline({ id: 'b', threshold: null, unmeasurable: 'variance-exceeds-signal' }),
      ]),
      environment(),
      ceilings,
    )
    expect(rise.find(v => v.rule === 'unmeasurable-ratchet')!.message).toContain('above the ceiling')

    const drop = checkPerfBaselines(file([baseline()]), environment(), ceilings)
    expect(drop.find(v => v.rule === 'unmeasurable-ratchet')!.message).toContain('below the ceiling')
  })
})

describe('the perf input descriptor', () => {
  it('records ciGate false even when every baseline agrees on a platform', () => {
    const gate = perfInputGate(file([baseline()]), environment())!
    expect(gate.platform).toBe('linux/x64')
    expect(gate.ciGate).toBe(false)
    expect(gate.blockedOn).toContain('DZUP_PERF_GATE=1')
  })

  it('says `undesignated` rather than guessing when no host is declared', () => {
    const gate = perfInputGate(
      file([baseline()]),
      environment({ authoritative: { designated: false, profileId: null } }),
    )!
    expect(gate.authoritative).toBe('undesignated')
  })

  it('names mixed hosts instead of averaging them', () => {
    const gate = perfInputGate(
      file([
        baseline({ id: 'a' }),
        baseline({ id: 'b', host: { platform: 'win32', arch: 'x64', cpus: 16, node: 'v24.14.1' } }),
      ]),
      environment(),
    )!
    expect(gate.platform).toContain('mixed')
  })

  it('names the families that cannot gate in the note', () => {
    const note = perfInputNote(file([baseline({ kind: 'runtime' })]), environment())
    expect(note).toContain('leak')
    expect(note).toContain('cannot fail')
  })
})

describe('the committed repository state', () => {
  const committed = readBaselineFile()
  const declared = readCaptureEnvironment()
  const ceilings = readPerfCeilings()

  it('has a declared capture environment and a ceilings file', () => {
    expect(declared).toBeDefined()
    expect(ceilings).toBeDefined()
  })

  it('passes every hard gate — the fixtures above are not the only evidence', () => {
    expect(checkPerfBaselines(committed, declared, ceilings)).toEqual([])
  })

  it('refuses an in-place capture on THIS machine, whatever it is', () => {
    const verdict = checkCaptureAuthority(declared, {
      platform: 'linux',
      arch: 'x64',
      cpus: 64,
      node: 'v24.14.1',
    }, { inPlace: true, attestedBy: 'anyone' })
    expect(verdict.allowed).toBe(false)
    expect(verdict.refusals.map(r => r.code)).toContain('undesignated')
  })

  it('records four metric families with no baseline at all', () => {
    const present = familiesWithBaseline(committed)
    expect([...present].sort()).toEqual(['runtime', 'size'])
    expect(METRIC_KINDS.filter(k => !present.has(k)))
      .toEqual(['leak', 'longtask', 'memory', 'hydration'])
  })
})
