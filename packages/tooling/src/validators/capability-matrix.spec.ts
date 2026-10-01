import type { CapabilityMatrix, CapabilityRow, EvidenceCell } from '../quality/capability-matrix.ts'
import { describe, expect, it } from 'vitest'
import { emptyTally } from '../quality/capability-matrix.ts'
import { readCapabilityMatrix } from '../quality/generate-capability-matrix.ts'
import {
  checkCapabilityMatrix,
  checkEvidenceRatchet,
  checkStaleRatchet,
  evidenceBlockFor,
  readCapabilityCeilings,
  tallyEvidenceCells,
} from './capability-matrix.ts'

function cell(over: Partial<EvidenceCell> = {}): EvidenceCell {
  return {
    kind: 'threat-model',
    state: 'unrun',
    origin: 'tier D',
    scope: 'component',
    artifacts: [],
    ...over,
  }
}

function row(over: Partial<CapabilityRow> = {}): CapabilityRow {
  return {
    component: 'DzThing',
    family: 'forms',
    tier: 'D',
    pattern: 'button',
    securityBoundary: ['file'],
    traits: [],
    anatomy: 'declared',
    source: 'packages/core/src/components/forms/DzThing.vue',
    componentCommit: 'abc1234',
    cells: [cell()],
    visual: { state: 'not-covered', baselines: 0, themes: [], artifacts: [] },
    ...over,
  }
}

function matrix(rows: CapabilityRow[], inputs: CapabilityMatrix['inputs'] = {}): CapabilityMatrix {
  return {
    schemaVersion: '1.1.0',
    sourceCommit: 'abc1234',
    generatedFrom: [],
    inputs,
    totals: { A: emptyTally(), B: emptyTally(), C: emptyTally(), D: emptyTally() },
    rows,
  }
}

describe('the tier D rule', () => {
  it('fails on an unrun cell with nothing behind it', () => {
    const v = checkCapabilityMatrix(matrix([row()]))
    expect(v.some(x => x.rule === 'tier-d' && x.level === 'error')).toBe(true)
  })

  it('accepts an unrun cell that has an artifact', () => {
    // "Unexplained" has to mean something checkable. An AT task file with six
    // pairs waiting for a human is a SCHEDULED gap; an evidence row with
    // nothing on disk is an absent one, and only the second is what this gate
    // is for.
    const v = checkCapabilityMatrix(matrix([
      row({ cells: [cell({ artifacts: ['e2e/at-matrix/DzThing.md'] })] }),
    ]))
    expect(v.filter(x => x.level === 'error')).toEqual([])
  })

  it('does not accept a note as an explanation', () => {
    // The generator writes a note on nearly every unrun cell so the page reads
    // well. Honouring notes would have made this gate unfailable.
    const v = checkCapabilityMatrix(matrix([
      row({ cells: [cell({ note: 'nobody has got to it' })] }),
    ]))
    expect(v.some(x => x.rule === 'tier-d')).toBe(true)
  })

  it('accepts an excepted cell', () => {
    const v = checkCapabilityMatrix(matrix([
      row({ cells: [cell({ state: 'excepted', note: 'no URL of any kind' })] }),
    ]))
    expect(v.filter(x => x.level === 'error')).toEqual([])
  })

  it('leaves tiers A to C alone — the page shows their gaps, it does not fail on them', () => {
    for (const tier of ['A', 'B', 'C'] as const) {
      const v = checkCapabilityMatrix(matrix([row({ tier })]))
      expect(v.filter(x => x.level === 'error'), tier).toEqual([])
    }
  })
})

describe('reporting', () => {
  it('reports a stale cell without failing', () => {
    const v = checkCapabilityMatrix(matrix([
      row({ tier: 'C', cells: [cell({ state: 'stale', kind: 'perf-baseline' })] }),
    ]))
    const stale = v.find(x => x.rule === 'stale')
    expect(stale?.level).toBe('report')
    expect(v.filter(x => x.level === 'error')).toEqual([])
  })

  it('names an absent input, so a column of unrun is not read as failure', () => {
    const v = checkCapabilityMatrix(matrix([], {
      'browser-matrix': { available: false, path: 'test-results/matrix-report.json' },
      'perf-baselines': { available: true, path: 'packages/core/perf/baselines.json' },
    }))
    const inputs = v.filter(x => x.rule === 'inputs')
    expect(inputs).toHaveLength(1)
    expect(inputs[0]!.message).toContain('browser-matrix')
    expect(inputs[0]!.message).toContain('not because the evidence failed')
  })
})

describe('the committed matrix', () => {
  it('exists, and gives every cell a state the vocabulary admits', () => {
    const committed = readCapabilityMatrix()
    expect(committed, 'run `yarn generate:capability-matrix`').toBeDefined()

    const states = new Set(['pass', 'present', 'stale', 'unrun', 'excepted'])
    for (const r of committed!.rows) {
      for (const c of r.cells)
        expect(states.has(c.state), `${r.component}/${c.kind} → ${c.state}`).toBe(true)
    }
  })

  it('attributes every cell to a rule', () => {
    // `unattributed` is what `evidenceOrigin` returns when a row got onto a
    // component that no tier, trait or boundary asked for — a generator bug,
    // and one that would otherwise look like a legitimate empty cell.
    const committed = readCapabilityMatrix()!
    const orphans = committed.rows.flatMap(r =>
      r.cells.filter(c => c.origin === 'unattributed').map(c => `${r.component}/${c.kind}`))
    expect(orphans).toEqual([])
  })

  it('reports totals per tier and per state, and no percentage anywhere', () => {
    const committed = readCapabilityMatrix()!
    const cells = committed.rows.reduce((n, r) => n + r.cells.length, 0)
    const tallied = Object.values(committed.totals)
      .reduce((n, t) => n + Object.values(t).reduce((m, v) => m + v, 0), 0)
    expect(tallied).toBe(cells)
    expect(JSON.stringify(committed.totals)).not.toContain('percent')
  })
})

describe('the staleness ratchet (gate 7, TASK-S1-O2)', () => {
  const ceilings = { staleCells: { ceiling: 1 }, staleCellKinds: { kinds: ['perf-baseline'] } }

  function staleRows(n: number, kind = 'perf-baseline') {
    return Array.from({ length: n }, (_, i) => row({
      component: `DzStale${i}`,
      tier: 'C' as const,
      cells: [cell({ state: 'stale', kind: kind as EvidenceCell['kind'] })],
    }))
  }

  it('passes at the ceiling', () => {
    const v = checkStaleRatchet(matrix(staleRows(1)), ceilings as never)
    expect(v).toEqual([])
  })

  it('fAILS on a seeded increase — one extra stale cell of the same kind', () => {
    // The proof the packet asks for. The ceiling is the measured value, so the
    // only way this stays green is by re-running the owning lane; there is no
    // reading of "22 became 23" that is not a regression.
    const v = checkStaleRatchet(matrix(staleRows(2)), ceilings as never)
    expect(v.filter(x => x.level === 'error')).toHaveLength(1)
    expect(v[0]!.rule).toBe('stale-ratchet')
    expect(v[0]!.message).toContain('above the ceiling of 1')
    expect(v[0]!.message).toContain('do not raise the ceiling')
  })

  it('fAILS on a kind swap that keeps the count identical', () => {
    // The half a count cannot give. Clear one `perf-baseline` cell, let one
    // `browser-matrix` cell go stale, and the total is unchanged while the
    // matrix has traded a gap blocked on an owner action for a lane that
    // quietly stopped running. The message has to name the cell.
    const v = checkStaleRatchet(matrix(staleRows(1, 'browser-matrix')), ceilings as never)
    const kindViolation = v.find(x => x.message.includes('browser-matrix'))
    expect(kindViolation?.level).toBe('error')
    expect(kindViolation?.message).toContain('DzStale0')
    expect(kindViolation?.message).toContain('never to make a red run green')
  })

  it('fAILS on a drop that does not lower the ceiling, so progress is recorded', () => {
    const v = checkStaleRatchet(matrix([]), ceilings as never)
    expect(v.filter(x => x.level === 'error')).toHaveLength(1)
    expect(v[0]!.message).toContain('fell to 0')
    expect(v[0]!.message).toContain('capability-matrix-ceilings.json')
  })

  it('holds the SHIPPED ceiling against the shipped matrix', () => {
    // Not a tautology: `readCapabilityCeilings()` reads the tracked file and
    // `readCapabilityMatrix()` reads the tracked artifact, so this fails the
    // day either moves without the other.
    const committed = readCapabilityMatrix()!
    expect(checkStaleRatchet(committed, readCapabilityCeilings())).toEqual([])
  })

  it('records perf-baseline as the only accepted stale kind, with a named owner', () => {
    const shipped = readCapabilityCeilings()
    expect(shipped.staleCellKinds.kinds).toEqual(['perf-baseline'])
    expect(shipped.staleCells.blockedOn).toContain('TASK-S1-O4')
  })
})

describe('the evidence ratchet (gate 8, RESIDUAL-17, D-RES16-3)', () => {
  /**
   * Two kinds, so the cross-kind swap case below is expressible at all. That
   * case is the whole reason this record is per kind rather than a total.
   */
  const record = {
    evidenceCells: {
      totals: { pass: 3, present: 2 },
      kinds: {
        'state-stories': { pass: 2, present: 0 },
        'story-light-dark': { pass: 1, present: 0 },
        'axe': { pass: 0, present: 2 },
      },
    },
  }

  /** `n` cells of `kind` in `state`, one row each. */
  function cells(kind: string, state: EvidenceCell['state'], n: number): CapabilityRow[] {
    return Array.from({ length: n }, (_, i) => row({
      component: `Dz${kind}${state}${i}`,
      tier: 'B' as const,
      cells: [cell({ state, kind: kind as EvidenceCell['kind'] })],
    }))
  }

  const atBaseline = [
    ...cells('state-stories', 'pass', 2),
    ...cells('story-light-dark', 'pass', 1),
    ...cells('axe', 'present', 2),
  ]

  it('passes at the recorded baseline', () => {
    expect(checkEvidenceRatchet(matrix(atBaseline), record as never)).toEqual([])
  })

  it('fAILS on a RISE, and names the kind, the state, the direction and the delta', () => {
    // The RESIDUAL-16 shape, reproduced: a predicate is loosened and a column
    // acquires credit for cells nothing exercised. Before this gate the totals
    // moved and 53 links stayed green.
    const v = checkEvidenceRatchet(matrix([
      ...cells('state-stories', 'pass', 4),
      ...cells('story-light-dark', 'pass', 1),
      ...cells('axe', 'present', 2),
    ]), record as never)
    expect(v.filter(x => x.level === 'error')).toHaveLength(1)
    expect(v[0]!.rule).toBe('evidence-ratchet')
    expect(v[0]!.message).toContain('`state-stories` / pass ROSE 2 → 4 (+2)')
    expect(v[0]!.message).toContain('27 cells were crediting a check that had never been asked')
  })

  it('fAILS on a FALL too, which a ceiling would have let through for free', () => {
    // The direction gate 7 leaves free. A stale count falling is good news and
    // only has to be recorded; `pass` falling may be an audit removing false
    // cells OR a spec that lost its `axe(` call, and the two are
    // indistinguishable from the number alone.
    const v = checkEvidenceRatchet(matrix([
      ...cells('state-stories', 'pass', 2),
      ...cells('story-light-dark', 'pass', 1),
      ...cells('axe', 'present', 1),
    ]), record as never)
    expect(v.filter(x => x.level === 'error')).toHaveLength(1)
    expect(v[0]!.message).toContain('`axe` / present FELL 2 → 1 (-1)')
    expect(v[0]!.message).toContain('must be DECLARED rather than absorbed')
  })

  it('fAILS on a cross-kind swap that leaves the TOTAL identical', () => {
    // 3 `pass` before and 3 after. A gate on the total sees nothing; this one
    // names both columns, because "558 is also satisfied by trading 27 real
    // passes for 27 invented ones" is the objection the per-kind record answers.
    // The `story-light-dark` cell is still THERE — it has gone `unrun`, which is
    // what losing evidence looks like, not what deleting a column looks like.
    const v = checkEvidenceRatchet(matrix([
      ...cells('state-stories', 'pass', 3),
      ...cells('story-light-dark', 'unrun', 1),
      ...cells('axe', 'present', 2),
    ]), record as never)
    const kinds = v.map(x => x.message)
    expect(v.filter(x => x.level === 'error')).toHaveLength(2)
    expect(kinds.some(m => m.includes('`state-stories` / pass ROSE 2 → 3'))).toBe(true)
    expect(kinds.some(m => m.includes('`story-light-dark` / pass FELL 1 → 0'))).toBe(true)
  })

  it('fAILS on a kind the matrix publishes that the record does not know', () => {
    // Clause 2, the half clause 1 cannot see: a whole new evidence column
    // arriving with credit already in it compares against nothing.
    const v = checkEvidenceRatchet(matrix([
      ...atBaseline,
      ...cells('portal-hydration', 'present', 5),
    ]), record as never)
    expect(v).toHaveLength(1)
    expect(v[0]!.message).toContain('`portal-hydration` is an evidence kind the matrix publishes')
    expect(v[0]!.message).toContain('5 `present` cell(s) that nothing has ever accepted')
  })

  it('fAILS on a recorded kind the matrix has stopped publishing entirely', () => {
    // And reports it ONCE, as a missing column rather than as `FELL 2 → 0` —
    // those have different remedies and a reader told the wrong one will edit
    // the count.
    const v = checkEvidenceRatchet(matrix([
      ...cells('state-stories', 'pass', 2),
      ...cells('story-light-dark', 'pass', 1),
    ]), record as never)
    expect(v).toHaveLength(1)
    expect(v[0]!.message).toContain('`axe` is recorded in `evidenceCells.kinds`')
    expect(v[0]!.message).toContain('takes its evidence with it')
  })

  it('does NOT confuse a kind with zero credit for a kind that is gone', () => {
    // `at-manual` publishes 89 cells and holds zero of both today. It is
    // recorded as `{0, 0}` precisely so the day it earns credit is a red gate;
    // an absent entry could not do that, and treating the zero as "gone" would
    // make the real disappearance unreportable.
    const withZeroKind = {
      evidenceCells: {
        totals: { pass: 3, present: 2 },
        kinds: { ...record.evidenceCells.kinds, 'at-manual': { pass: 0, present: 0 } },
      },
    }
    const v = checkEvidenceRatchet(
      matrix([...atBaseline, ...cells('at-manual', 'unrun', 4)]),
      withZeroKind as never,
    )
    expect(v).toEqual([])
  })

  it('fAILS when `totals` disagrees with the sum of `kinds`', () => {
    // The quoted headline and the table that holds it may not drift. Without
    // this, a hand-edit that corrects one kind and forgets the total ships a
    // record whose own two halves contradict each other.
    const drifted = {
      evidenceCells: { totals: { pass: 99, present: 2 }, kinds: record.evidenceCells.kinds },
    }
    const v = checkEvidenceRatchet(matrix(atBaseline), drifted as never)
    expect(v).toHaveLength(1)
    expect(v[0]!.message).toContain('records 99 and the per-kind entries sum to 3')
  })

  it('ignores `//` comment keys, so the record can carry its own reasons', () => {
    const commented = {
      evidenceCells: {
        totals: { pass: 3, present: 2 },
        kinds: { ...record.evidenceCells.kinds, '//': 'a note, not a kind' },
      },
    }
    expect(checkEvidenceRatchet(matrix(atBaseline), commented as never)).toEqual([])
  })

  it('prints a block that is ACTUALLY the fix — parsed, it equals the measurement', () => {
    // The only real objection to ratcheting `pass` is that it makes an honest
    // correction expensive. It is not expensive if the remedy is one paste, and
    // that claim is worth nothing unless the printed block is correct. So: parse
    // what the gate prints and re-run the gate against it.
    const moved = matrix([
      ...cells('state-stories', 'pass', 2),
      ...cells('story-light-dark', 'pass', 1),
      ...cells('axe', 'present', 7),
    ])
    const tally = tallyEvidenceCells(moved, Object.keys(record.evidenceCells.kinds))
    const parsed = JSON.parse(`{${evidenceBlockFor(tally)}}`) as {
      totals: { pass: number, present: number }
      kinds: Record<string, { pass: number, present: number }>
    }
    expect(parsed.totals).toEqual({ pass: 3, present: 7 })
    expect(checkEvidenceRatchet(moved, { evidenceCells: parsed } as never)).toEqual([])
  })

  it('holds the SHIPPED record against the shipped matrix', () => {
    // Not a tautology, exactly as gate 7's equivalent is not: this reads the
    // tracked ceilings file and the tracked artifact, so it fails the day either
    // moves without the other — which is the point of the whole gate.
    const committed = readCapabilityMatrix()!
    expect(checkEvidenceRatchet(committed, readCapabilityCeilings())).toEqual([])
  })

  it('records all 23 published kinds, zeros included, so none can arrive unnoticed', () => {
    const shipped = readCapabilityCeilings()
    const kinds = Object.keys(shipped.evidenceCells.kinds).filter(k => !k.startsWith('//'))
    expect(kinds).toHaveLength(23)
    // `at-manual` and `perf-baseline` hold zero credit today and are recorded
    // anyway: an entry that only appears once a column earns credit is an entry
    // that cannot notice the column earning it.
    expect(shipped.evidenceCells.kinds['at-manual']).toEqual({ pass: 0, present: 0 })
    expect(shipped.evidenceCells.kinds['perf-baseline']).toEqual({ pass: 0, present: 0 })
    // The baseline was seeded at the post-RESIDUAL-16 measurement — `pass` 558,
    // `present` 608 — NOT at the pre-audit 585/623, because seeding a ratchet at
    // numbers an audit has just shown to be false would write the inflation into
    // the record permanently. `present` then rose to 611 in the same packet, and
    // that move is DECLARED in `//moves`: RESIDUAL-17's hydration harness gave
    // `portal-hydration` a fourth cell and `ssr-sample` two more.
    expect(shipped.evidenceCells.totals.pass).toBe(558)
    expect(shipped.evidenceCells.totals.present).toBe(611)
  })
})
