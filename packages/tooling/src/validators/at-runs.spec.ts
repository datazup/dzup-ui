/**
 * TASK-S1-O1 — `validate:at-runs`.
 *
 * The gate has nothing to check at HEAD (0 archived records), so its behaviour
 * is proved here against synthetic archives rather than against the repository.
 * The case that matters is `archive/drift`: a row hand-edited after ingest.
 */

import type { AtRunRecord } from '../quality/at-ingest.ts'
import type { AtMatrixEntry } from '../quality/at-matrix.ts'
import { describe, expect, it } from 'vitest'
import { renderRunRows } from '../quality/at-ingest.ts'
import { checkAtRuns } from './at-runs.ts'

const ENTRY: AtMatrixEntry = {
  component: 'DzFileUpload',
  tier: 'D',
  pattern: 'button',
  file: 'e2e/at-matrix/DzFileUpload.md',
  tasks: ['reach', 'activate', 'non-drag', 'error'],
  requiredPairs: ['nvda-firefox'],
  rows: [],
  componentCommit: '4e4e46f',
}

const RECORD: AtRunRecord = {
  component: 'DzFileUpload',
  tier: 'D',
  pair: 'nvda-firefox',
  at: 'NVDA 2026.2',
  browser: 'Firefox 141.0',
  os: 'Windows 11 26200',
  tester: 'e.isic',
  date: '2026-09-23',
  sourceCommit: '4e4e46f67ff06ce5fb8aa2a32fe9f7f9dc42410a',
  steps: [{ id: 'reach', expected: 'name, role, state', result: 'fail', observed: 'says "blank"' }],
  verdict: 'fail',
}

function ctxFor() {
  return {
    entry: ENTRY,
    knownComponents: ['DzFileUpload'],
    now: new Date('2026-09-24T00:00:00Z'),
  }
}

function matrixWith(rows: readonly string[]) {
  return (): string =>
    `<!-- results -->\n| pair | task | result |\n${rows.join('\n')}\n`
}

describe('checkAtRuns', () => {
  it('passes when every archived row is present in the matrix', () => {
    const md = matrixWith(renderRunRows(RECORD))
    expect(checkAtRuns([{ name: 'r.json', json: RECORD }], md, ctxFor)).toEqual([])
  })

  it('reports nothing for an empty archive — the state at HEAD', () => {
    expect(checkAtRuns([], matrixWith([]), ctxFor)).toEqual([])
  })

  it('catches a row that was hand-edited after ingest', () => {
    const tampered = renderRunRows(RECORD)[0]!.replace('| fail |', '| pass |')
    const violations = checkAtRuns([{ name: 'r.json', json: RECORD }], matrixWith([tampered]), ctxFor)
    expect(violations.map(v => v.rule)).toContain('archive/drift')
  })

  it('catches an archive whose rows never reached the matrix', () => {
    const violations = checkAtRuns([{ name: 'r.json', json: RECORD }], matrixWith([]), ctxFor)
    expect(violations.map(v => v.rule)).toContain('archive/drift')
  })

  it('refuses a fixture sitting where evidence sits', () => {
    const violations = checkAtRuns(
      [{ name: 'fx.json', json: { ...RECORD, fixture: true } }],
      matrixWith(renderRunRows(RECORD)),
      ctxFor,
    )
    expect(violations.map(v => v.rule)).toEqual(['archive/fixture'])
  })

  it('reports a malformed archived record with the ingest rule that caught it', () => {
    const violations = checkAtRuns(
      [{ name: 'bad.json', json: { ...RECORD, tester: '-' } }],
      matrixWith([]),
      ctxFor,
    )
    expect(violations.map(v => v.rule)).toContain('archive/record/tester')
  })

  it('does not fire the duplicate rule on a correctly archived record', () => {
    const entry = { ...ENTRY, rows: [] }
    const violations = checkAtRuns(
      [{ name: 'r.json', json: RECORD }],
      matrixWith(renderRunRows(RECORD)),
      () => ({ ...ctxFor(), entry }),
    )
    expect(violations.map(v => v.rule)).not.toContain('archive/record/duplicate')
  })

  it('reports an archive for a component with no scaffold file', () => {
    const violations = checkAtRuns([{ name: 'r.json', json: RECORD }], () => undefined, ctxFor)
    expect(violations.map(v => v.rule)).toContain('archive/orphan')
  })
})
