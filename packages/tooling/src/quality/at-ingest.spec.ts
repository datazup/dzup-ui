/**
 * TASK-S1-O1 — the ingest lane's refusals.
 *
 * Every test here asserts a **refusal**, because the only interesting property
 * of this lane is what it will not accept. An ingest that writes a well-formed
 * record is easy; an ingest that quietly accepts an empty one, a future-dated
 * one, or the same session twice is how a matrix comes to read as evidenced
 * when it is not — and that outcome is strictly worse than the 534 honest
 * `unrun` cells it would replace.
 *
 * The happy path is proved once, at the bottom, and end to end by the CLI
 * against a scratch copy of the matrix (see TASK-S1-O1's handoff §4).
 */

import type { AtRunRecord, IngestContext } from './at-ingest.ts'
import type { AtMatrixEntry } from './at-matrix.ts'
import { describe, expect, it } from 'vitest'
import { appendRunRows, checkRunRecord, renderRunRows, RULES } from './at-ingest.ts'
import { RESULTS_MARKER } from './generate-at-matrix.ts'

const ENTRY: AtMatrixEntry = {
  component: 'DzFileUpload',
  tier: 'D',
  pattern: 'button',
  file: 'e2e/at-matrix/DzFileUpload.md',
  tasks: ['reach', 'activate', 'non-drag', 'error'],
  requiredPairs: [
    'nvda-firefox',
    'nvda-chrome',
    'jaws-chrome',
    'voiceover-safari',
    'voiceover-ios',
    'talkback-android',
  ],
  rows: [
    {
      pair: 'nvda-firefox',
      task: '*',
      result: 'unrun',
      versions: '-',
      tester: '-',
      date: '-',
      sourceCommit: '-',
      notes: 'not executed',
    },
  ],
  componentCommit: '4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a',
}

const NOW = new Date('2026-09-24T12:00:00Z')

function ctx(over: Partial<IngestContext> = {}): IngestContext {
  return { entry: ENTRY, knownComponents: ['DzFileUpload'], now: NOW, ...over }
}

/** A record that passes every rule. Each test spoils exactly one thing. */
function valid(over: Partial<AtRunRecord> = {}): AtRunRecord {
  return {
    component: 'DzFileUpload',
    tier: 'D',
    pair: 'nvda-firefox',
    at: 'NVDA 2026.2',
    browser: 'Firefox 141.0',
    os: 'Windows 11 26200',
    tester: 'e.isic',
    date: '2026-09-23',
    sourceCommit: '4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a',
    steps: [
      { id: 'reach', expected: 'name, role, state', result: 'pass', observed: 'as scripted' },
      {
        id: 'error',
        expected: 'error text announced',
        result: 'fail',
        observed: 'announces nothing on blur',
      },
    ],
    verdict: 'fail',
    defects: ['D-AT-001'],
    ...over,
  }
}

function rules(r: AtRunRecord | unknown, c = ctx()): string[] {
  return checkRunRecord(r, c).map(v => v.rule)
}

describe('checkRunRecord — the baseline', () => {
  it('accepts a complete, honest record', () => {
    expect(checkRunRecord(valid(), ctx())).toEqual([])
  })

  it('refuses anything that is not an object', () => {
    expect(rules('{}')).toContain(RULES.shape)
    expect(rules([])).toContain(RULES.shape)
    expect(rules(null)).toContain(RULES.shape)
  })

  it('reports every problem at once, not the first', () => {
    const broken = { component: 'DzFileUpload', steps: [] }
    expect(checkRunRecord(broken, ctx()).length).toBeGreaterThan(4)
  })
})

describe('checkRunRecord — missing tester identity', () => {
  it.each(['', '-', 'n/a', 'tbd', 'anonymous', 'TESTER'])('refuses tester %p', (tester) => {
    expect(rules(valid({ tester }))).toContain(RULES.tester)
  })

  it('refuses a record with no tester field at all', () => {
    const { tester: _, ...rest } = valid()
    expect(rules(rest)).toContain(RULES.tester)
  })
})

describe('checkRunRecord — missing AT, browser or OS', () => {
  it('refuses a missing AT', () => {
    expect(rules(valid({ at: '' }))).toContain(RULES.at)
  })

  it('refuses an AT with no version — a bare product name', () => {
    expect(rules(valid({ at: 'NVDA' }))).toContain(RULES.at)
  })

  it('refuses "latest", which is a different program every month', () => {
    expect(rules(valid({ browser: 'Firefox latest' }))).toContain(RULES.browser)
  })

  it('refuses a missing browser', () => {
    expect(rules(valid({ browser: '' }))).toContain(RULES.browser)
  })

  it('refuses a missing OS', () => {
    expect(rules(valid({ os: '' }))).toContain(RULES.os)
  })
})

describe('checkRunRecord — the date', () => {
  it('refuses a date in the future', () => {
    expect(rules(valid({ date: '2026-12-01' }))).toContain(RULES.date)
  })

  it('accepts today', () => {
    expect(rules(valid({ date: '2026-09-24' }))).toEqual([])
  })

  it('refuses a non-ISO date', () => {
    expect(rules(valid({ date: '23/09/2026' }))).toContain(RULES.date)
  })

  it('refuses a date that is not a real day', () => {
    expect(rules(valid({ date: '2026-02-30' }))).toContain(RULES.date)
  })

  it('refuses a missing date', () => {
    expect(rules(valid({ date: '-' }))).toContain(RULES.date)
  })
})

describe('checkRunRecord — the commit the run observed', () => {
  it('refuses a missing sourceCommit — a row that can never go stale', () => {
    expect(rules(valid({ sourceCommit: '-' }))).toContain(RULES.sourceCommit)
  })

  it('refuses something that is not a sha', () => {
    expect(rules(valid({ sourceCommit: 'HEAD' }))).toContain(RULES.sourceCommit)
  })
})

describe('checkRunRecord — a cell that does not exist', () => {
  it('refuses a component with no cell in the matrix', () => {
    expect(rules(valid({ component: 'DzNotAThing' }), ctx({ entry: undefined })))
      .toContain(RULES.component)
  })

  it('refuses a pairing outside the six', () => {
    expect(rules(valid({ pair: 'narrator-edge' }))).toContain(RULES.pair)
  })

  it('refuses a task the component does not owe', () => {
    expect(rules(valid({
      steps: [{ id: 'typeahead', expected: 'x', result: 'pass', observed: 'y' }],
      verdict: 'pass',
    }))).toContain(RULES.stepTask)
  })

  it('refuses `*` as a real result, because it is the generated unrun id', () => {
    expect(rules(valid({
      steps: [{ id: '*', expected: 'x', result: 'pass', observed: 'y' }],
      verdict: 'pass',
    }))).toContain(RULES.stepTask)
  })

  it('refuses the same task twice inside one record', () => {
    expect(rules(valid({
      steps: [
        { id: 'reach', expected: 'x', result: 'pass', observed: 'y' },
        { id: 'reach', expected: 'x', result: 'fail', observed: 'z' },
      ],
      verdict: 'fail',
    }))).toContain(RULES.stepTask)
  })
})

describe('checkRunRecord — the empty record, in each of its disguises', () => {
  it('refuses a record with no steps array', () => {
    const { steps: _, ...rest } = valid()
    expect(rules(rest)).toContain(RULES.steps)
  })

  it('refuses an empty steps array', () => {
    expect(rules(valid({ steps: [], verdict: 'blocked' }))).toContain(RULES.steps)
  })

  it('refuses an all-unrun record — an empty record wearing a result', () => {
    expect(rules(valid({
      steps: [
        { id: 'reach', expected: 'x', result: 'unrun', observed: '' },
        { id: 'error', expected: 'x', result: 'unrun', observed: '' },
      ],
      verdict: 'unrun',
    }))).toContain(RULES.steps)
  })

  it('refuses `unrun` as a step result, pointing at `blocked` instead', () => {
    expect(rules(valid({
      steps: [
        { id: 'reach', expected: 'x', result: 'pass', observed: 'ok' },
        { id: 'error', expected: 'x', result: 'unrun', observed: '' },
      ],
      verdict: 'partial',
    }))).toContain(RULES.stepResult)
  })

  it('refuses a result value that is not in the vocabulary', () => {
    expect(rules(valid({
      steps: [{ id: 'reach', expected: 'x', result: 'ok' as never, observed: 'y' }],
      verdict: 'pass',
    }))).toContain(RULES.stepResult)
  })

  it('refuses a failure with nothing observed', () => {
    expect(rules(valid({
      steps: [{ id: 'reach', expected: 'x', result: 'fail', observed: '' }],
      verdict: 'fail',
    }))).toContain(RULES.observed)
  })
})

describe('checkRunRecord — a verdict may not outrank its steps', () => {
  it('refuses `pass` over a failing step', () => {
    expect(rules(valid({ verdict: 'pass' }))).toContain(RULES.verdict)
  })

  it('refuses `pass` over a blocked step', () => {
    expect(rules(valid({
      steps: [{ id: 'reach', expected: 'x', result: 'blocked', observed: 'AT crashed' }],
      verdict: 'pass',
    }))).toContain(RULES.verdict)
  })

  it('refuses a verdict outside the vocabulary', () => {
    expect(rules(valid({ verdict: 'green' as never }))).toContain(RULES.verdict)
  })

  it('allows `fail` over passing steps — a tester may be stricter than the steps', () => {
    expect(rules(valid({
      steps: [{ id: 'reach', expected: 'x', result: 'pass', observed: 'ok' }],
      verdict: 'fail',
    }))).toEqual([])
  })
})

describe('checkRunRecord — duplicates', () => {
  const withRun: AtMatrixEntry = {
    ...ENTRY,
    rows: [
      ...ENTRY.rows,
      {
        pair: 'nvda-firefox',
        task: 'reach',
        result: 'pass',
        versions: 'NVDA 2026.2 / Firefox 141.0',
        tester: 'e.isic',
        date: '2026-09-23',
        sourceCommit: '4e4e46f',
        notes: 'as scripted',
      },
    ],
  }

  it('refuses re-ingesting the same {pair, task, tester, date}', () => {
    expect(rules(valid(), ctx({ entry: withRun }))).toContain(RULES.duplicate)
  })

  it('allows the same task from the same tester on a later date — a re-test', () => {
    expect(rules(valid({ date: '2026-09-24' }), ctx({ entry: withRun }))).toEqual([])
  })

  it('allows the same task from a different tester on the same date', () => {
    expect(rules(valid({ tester: 'a.other' }), ctx({ entry: withRun }))).toEqual([])
  })

  it('does not treat the generated `unrun` rows as runs to collide with', () => {
    expect(rules(valid())).toEqual([])
  })
})

describe('checkRunRecord — table-breaking text', () => {
  it('refuses a pipe in an observation, which would shift every later column', () => {
    expect(rules(valid({
      steps: [{ id: 'reach', expected: 'x', result: 'fail', observed: 'said "a | b"' }],
      verdict: 'fail',
    }))).toContain(RULES.delimiter)
  })

  it('refuses a newline in a top-level field', () => {
    expect(rules(valid({ tester: 'e.isic\nfake' }))).toContain(RULES.delimiter)
  })
})

describe('checkRunRecord — fixture containment', () => {
  it('refuses a record marked as a fixture', () => {
    expect(rules(valid({ fixture: true }))).toContain(RULES.fixture)
  })

  it('accepts it only when a scratch target has explicitly allowed it', () => {
    expect(rules(valid({ fixture: true }), ctx({ allowFixture: true }))).toEqual([])
  })
})

describe('renderRunRows', () => {
  it('writes one eight-column row per step', () => {
    const rows = renderRunRows(valid())
    expect(rows).toHaveLength(2)
    for (const row of rows)
      expect(row.split('|')).toHaveLength(10) // 8 cells + the two outer edges
  })

  it('carries the versions in the runbook §3 shape', () => {
    expect(renderRunRows(valid())[0]).toContain('| NVDA 2026.2 / Firefox 141.0 |')
  })

  it('carries defect ids into the notes so the matrix points at the task', () => {
    expect(renderRunRows(valid())[1]).toContain('[D-AT-001]')
  })

  it('never writes `*` as the task of a real result', () => {
    for (const row of renderRunRows(valid()))
      expect(row).not.toMatch(/\|\s\*\s\|/)
  })
})

describe('appendRunRows — append-only, proved rather than promised', () => {
  const file = [
    '# DzFileUpload',
    '',
    RESULTS_MARKER,
    '',
    '## Results',
    '',
    '| pair | task | result | versions | tester | date | sourceCommit | notes |',
    '|---|---|---|---|---|---|---|---|',
    '| nvda-firefox | * | unrun | - | - | - | - | not executed |',
    '',
  ].join('\n')

  it('leaves every existing row byte-identical and in order', () => {
    const next = appendRunRows(file, renderRunRows(valid()))
    expect(next.startsWith(file.replace(/\s+$/, ''))).toBe(true)
    expect(next).toContain('| nvda-firefox | * | unrun | - | - | - | - | not executed |')
  })

  it('adds exactly the rows it was given', () => {
    const rows = renderRunRows(valid())
    const next = appendRunRows(file, rows)
    for (const row of rows)
      expect(next).toContain(row)
  })

  it('refuses a file with no append-only marker', () => {
    expect(() => appendRunRows('# no marker here\n', ['| x |']))
      .toThrow(/no results marker/i)
  })

  it('is idempotent in shape: appending twice keeps the first batch intact', () => {
    const once = appendRunRows(file, renderRunRows(valid()))
    const twice = appendRunRows(once, renderRunRows(valid({ date: '2026-09-24' })))
    expect(twice.startsWith(once.replace(/\s+$/, ''))).toBe(true)
  })
})
