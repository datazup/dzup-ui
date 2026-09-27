/**
 * The browser-evidence ledger and its degradation gate (TASK-R2-O1).
 *
 * The whole reason the gate is a pure function over two ledgers is so a seeded
 * regression can be driven here in milliseconds rather than by running a
 * 24-project browser sweep. `pass → unrun` is the case that matters most: it is
 * what a lane that quietly stopped running looks like, and it is
 * indistinguishable from one that was never wired up unless something refuses
 * it.
 */

import type {
  BrowserCellResult,
  BrowserEvidenceComponent,
  BrowserEvidenceLedger,
} from './browser-evidence.ts'
import { describe, expect, it } from 'vitest'
import {
  cellKey,
  checkBrowserDegradation,
  deriveEvidenceRows,
  readDeclaredMatrixProjects,
  splitCellKey,
} from './browser-evidence.ts'

function component(
  name: string,
  cells: Record<string, BrowserCellResult>,
): BrowserEvidenceComponent {
  return { component: name, tier: 'B', story: `core-x-${name.toLowerCase()}--default`, cells }
}

function ledger(components: BrowserEvidenceComponent[]): BrowserEvidenceLedger {
  const flat = components.flatMap(c => Object.values(c.cells))
  return {
    schemaVersion: '1.0.0',
    $comment: 'fixture',
    sourceCommit: 'abc1234',
    worktreeDirty: false,
    dirtyPathCount: 0,
    generatedAt: '2026-09-19',
    admissibility: 'fixture',
    rowShape: 'fixture',
    engines: ['chromium', 'firefox', 'webkit'],
    conditions: ['default', 'rtl'],
    totals: {
      projects: 6,
      projectsRun: 6,
      components: components.length,
      cells: flat.length,
      pass: flat.filter(r => r === 'pass').length,
      fail: flat.filter(r => r === 'fail').length,
      unrun: flat.filter(r => r === 'unrun').length,
    },
    runs: [
      {
        engine: 'chromium',
        condition: 'rtl',
        state: 'run',
        sourceCommit: 'abc1234',
        worktreeDirty: true,
        dirtyPathCount: 420,
        date: '2026-09-19',
      },
    ],
    components,
  }
}

describe('cell keys', () => {
  it('round-trips an engine and a condition whose name contains a dash', () => {
    expect(splitCellKey(cellKey('chromium', 'forced-colors')))
      .toEqual({ engine: 'chromium', condition: 'forced-colors' })
  })
})

describe('checkBrowserDegradation', () => {
  it('passes when nothing moved', () => {
    const before = ledger([component('DzButton', { 'chromium/rtl': 'pass' })])
    expect(checkBrowserDegradation(before, before)).toEqual([])
  })

  it('allows unrun → pass: the gate is one-directional on purpose', () => {
    const before = ledger([component('DzButton', { 'chromium/rtl': 'unrun' })])
    const after = ledger([component('DzButton', { 'chromium/rtl': 'pass' })])
    expect(checkBrowserDegradation(before, after)).toEqual([])
  })

  it('fails pass → unrun and names the component, engine and condition', () => {
    const before = ledger([component('DzButton', { 'chromium/rtl': 'pass' })])
    const after = ledger([component('DzButton', { 'chromium/rtl': 'unrun' })])
    const found = checkBrowserDegradation(before, after)
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({
      component: 'DzButton',
      engine: 'chromium',
      condition: 'rtl',
      from: 'pass',
      to: 'unrun',
    })
    expect(found[0]!.message).toContain('DzButton')
    expect(found[0]!.message).toContain('chromium')
    expect(found[0]!.message).toContain('rtl')
  })

  it('fails pass → fail', () => {
    const before = ledger([component('DzButton', { 'webkit/forced-colors': 'pass' })])
    const after = ledger([component('DzButton', { 'webkit/forced-colors': 'fail' })])
    const found = checkBrowserDegradation(before, after)
    expect(found).toHaveLength(1)
    expect(found[0]).toMatchObject({ engine: 'webkit', condition: 'forced-colors', to: 'fail' })
  })

  it('fails when the cell is deleted rather than degraded', () => {
    const before = ledger([component('DzButton', { 'firefox/touch': 'pass' })])
    const after = ledger([component('DzButton', {})])
    expect(checkBrowserDegradation(before, after)[0]).toMatchObject({ to: 'absent' })
  })

  it('fails when the whole component is deleted — the cheapest way to hide a red cell', () => {
    const before = ledger([component('DzButton', { 'firefox/touch': 'pass' })])
    const after = ledger([])
    const found = checkBrowserDegradation(before, after)
    expect(found).toHaveLength(1)
    expect(found[0]!.message).toContain('no longer in the ledger')
  })

  it('reports every degraded cell, not the first', () => {
    const before = ledger([
      component('DzButton', { 'chromium/rtl': 'pass', 'firefox/rtl': 'pass' }),
      component('DzSelect', { 'webkit/rtl': 'pass' }),
    ])
    const after = ledger([
      component('DzButton', { 'chromium/rtl': 'unrun', 'firefox/rtl': 'pass' }),
      component('DzSelect', { 'webkit/rtl': 'fail' }),
    ])
    expect(checkBrowserDegradation(before, after)).toHaveLength(2)
  })

  it('does not gate a cell that was never a pass', () => {
    const before = ledger([component('DzButton', { 'chromium/rtl': 'fail' })])
    const after = ledger([component('DzButton', { 'chromium/rtl': 'unrun' })])
    expect(checkBrowserDegradation(before, after)).toEqual([])
  })
})

describe('deriveEvidenceRows', () => {
  it('joins each cell to the run that produced it', () => {
    const rows = deriveEvidenceRows(ledger([
      component('DzButton', { 'chromium/rtl': 'pass', 'firefox/rtl': 'pass' }),
    ]))
    expect(rows).toHaveLength(2)
    const chromium = rows.find(r => r.engine === 'chromium')!
    expect(chromium).toMatchObject({
      component: 'DzButton',
      tier: 'B',
      condition: 'rtl',
      result: 'pass',
      sourceCommit: 'abc1234',
      date: '2026-09-19',
    })
    // firefox/rtl has no run record in the fixture, so its provenance is
    // undefined rather than borrowed from the chromium run next to it.
    expect(rows.find(r => r.engine === 'firefox')!.sourceCommit).toBeUndefined()
  })
})

describe('readDeclaredMatrixProjects', () => {
  it('reads the live lane shape out of playwright.config.ts', () => {
    const { engines, conditions } = readDeclaredMatrixProjects()
    expect(engines).toEqual(['chromium', 'firefox', 'webkit'])
    // Not asserted as a literal list: the point of reading the config is that
    // the lane may grow. What is asserted is that the two conditions TASK-R2-O5
    // added are seen, because a regex that silently matched the first six would
    // reproduce the defect this function exists to prevent.
    expect(conditions).toContain('default')
    expect(conditions).toContain('text-200')
    expect(conditions).toContain('spacing')
    expect(conditions.length).toBeGreaterThanOrEqual(8)
  })
})
