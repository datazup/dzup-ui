import type { AtMatrixIndex } from '../quality/at-matrix.ts'
import { describe, expect, it } from 'vitest'
import { AT_PAIRS, tasksFor } from '../quality/at-matrix.ts'
import { parseResults, renderHeader, RESULTS_MARKER } from '../quality/generate-at-matrix.ts'
import { checkAtMatrix } from './at-matrix.ts'

const PAIR = AT_PAIRS[0]!.id

function index(rows: Partial<AtMatrixIndex['entries'][number]['rows'][number]>[] = []): AtMatrixIndex {
  return {
    schemaVersion: '1.0.0',
    generatedFrom: [],
    pairs: AT_PAIRS,
    entries: [
      {
        component: 'DzThing',
        tier: 'B',
        pattern: 'button',
        file: 'e2e/at-matrix/DzThing.md',
        tasks: ['reach'],
        componentCommit: 'unknown',
        rows: rows.map(r => ({
          pair: PAIR,
          result: 'unrun',
          versions: '-',
          tester: '-',
          date: '-',
          sourceCommit: '-',
          notes: '',
          ...r,
        })),
      },
    ],
  }
}

const run = (i: AtMatrixIndex) => checkAtMatrix(i, ['DzThing'], ['DzThing'])

describe('coverage', () => {
  it('fails on a Tier B component with no file', () => {
    const v = checkAtMatrix(index([{}]), ['DzThing', 'DzOther'], ['DzThing'])
    expect(v.some(x => x.rule === 'coverage' && x.message.includes('DzOther'))).toBe(true)
  })

  it('refuses to let a retired component be deleted, and says where it goes', () => {
    // Recorded runs are history. A validator that told you to delete them would
    // be telling you to lose the only record that a component was ever driven
    // with a screen reader.
    const v = checkAtMatrix(index([{}]), ['DzThing'], ['DzThing', 'DzGone'])
    const message = v.find(x => x.message.includes('DzGone'))?.message
    expect(message).toContain('retired/')
    expect(message).toContain('do not delete it'.replace('d', 'D'))
  })
})

describe('shape', () => {
  it('fails on an unknown pair', () => {
    const v = run(index([{ pair: 'nvda-safari' }]))
    expect(v.some(x => x.rule === 'shape' && x.message.includes('nvda-safari'))).toBe(true)
  })

  it('fails on a result the vocabulary does not have', () => {
    const v = run(index([{ result: 'mostly' as never }]))
    expect(v.some(x => x.rule === 'shape' && x.message.includes('mostly'))).toBe(true)
  })

  it('fails on a file whose results table cannot be parsed', () => {
    const v = run(index([]))
    expect(v.some(x => x.rule === 'shape' && x.message.includes('no results table'))).toBe(true)
  })
})

describe('substance', () => {
  it('fails a `pass` with nothing behind it', () => {
    // The single easiest thing to type into a table nobody validates.
    const v = run(index([{ result: 'pass' }]))
    const message = v.find(x => x.rule === 'substance')?.message
    expect(message).toContain('versions')
    expect(message).toContain('worse than `unrun`')
  })

  it('accepts a fully evidenced row', () => {
    const v = run(index([{
      result: 'pass',
      versions: 'NVDA 2025.3 / Firefox 141',
      tester: 'e.isic',
      date: '2026-08-24',
      sourceCommit: 'abc1234',
    }]))
    expect(v.filter(x => x.level === 'error')).toEqual([])
  })

  it('does not demand evidence for an unrun row', () => {
    const v = run(index([{}]))
    expect(v.filter(x => x.level === 'error')).toEqual([])
    expect(v.some(x => x.rule === 'unrun')).toBe(true)
  })
})

describe('staleness', () => {
  it('reports, rather than fails, a result taken before a change', () => {
    const i = index([{
      result: 'pass',
      versions: 'NVDA 2025.3',
      tester: 'e.isic',
      date: '2026-08-24',
      sourceCommit: '0000000000000000000000000000000000000000',
    }])
    i.entries[0]!.componentCommit = '1111111111111111111111111111111111111111'

    const v = checkAtMatrix(i, ['DzThing'], ['DzThing'])
    const stale = v.find(x => x.rule === 'stale')
    expect(stale?.level).toBe('report')
    expect(v.filter(x => x.level === 'error')).toEqual([])
  })

  it('says nothing when the component commit is unknown', () => {
    // Outside a git checkout every hash is unknown, and crying stale on all of
    // them would train everyone to ignore the column.
    const v = run(index([{
      result: 'pass',
      versions: 'NVDA',
      tester: 'e.isic',
      date: '2026-08-24',
      sourceCommit: 'abc1234',
    }]))
    expect(v.some(x => x.rule === 'stale')).toBe(false)
  })
})

describe('the generated file, round-tripped', () => {
  const row = {
    component: 'DzThing',
    family: 'forms',
    tier: 'C' as const,
    pattern: 'combobox' as const,
    securityBoundary: 'none' as const,
    traits: ['dataset' as const],
    wcag: ['3.3.1'],
    evidence: [],
    evidenceOrigin: {},
    source: 'packages/core/src/components/forms/DzThing.vue',
    parts: [],
    hasAnatomy: false,
  }

  it('emits one unrun row per pair, and parses them back', () => {
    const parsed = parseResults(renderHeader(row))
    expect(parsed).toHaveLength(AT_PAIRS.length)
    expect(parsed.every(r => r.result === 'unrun')).toBe(true)
    expect(parsed.map(r => r.pair)).toEqual(AT_PAIRS.map(p => p.id))
  })

  it('does not read the tasks table as results', () => {
    // Both are markdown tables in the same file. The parser only looks below
    // the marker, which is what keeps a task row out of the results.
    const header = renderHeader(row)
    expect(header.indexOf('## Tasks')).toBeLessThan(header.indexOf(RESULTS_MARKER))
    expect(parseResults(header).some(r => r.pair === 'reach')).toBe(false)
  })

  it('derives the tasks from the pattern, and adds the ones the traits imply', () => {
    const tasks = tasksFor(row).map(t => t.id)
    expect(tasks).toContain('typeahead') // combobox
    expect(tasks).toContain('live') // trait: dataset
    expect(tasks).toContain('error') // wcag 3.3.1
  })
})
