import type { CapabilityMatrix, CapabilityRow, EvidenceCell } from '../quality/capability-matrix.ts'
import { describe, expect, it } from 'vitest'
import { emptyTally } from '../quality/capability-matrix.ts'
import { readCapabilityMatrix } from '../quality/generate-capability-matrix.ts'
import { checkCapabilityMatrix } from './capability-matrix.ts'

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
    securityBoundary: 'file',
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
