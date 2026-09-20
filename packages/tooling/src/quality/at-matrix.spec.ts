/**
 * Cell resolution and task derivation for the manual AT matrix (TASK-R2-O2).
 *
 * The first block is a **seeded regression**: every row of TASK-N1-O4 §6.2's
 * proof table, which measured the capability-matrix generator resolving an
 * all-`fail` component to `state: 'pass'` because the resolver counted rows
 * whose `result !== 'unrun'` and never read the value. Those cases are asserted
 * here against the behaviour they *should* have had. Run this file against the
 * pre-TASK-R2-O2 logic and the four marked cases fail; that is the point of
 * writing them out rather than asserting only the fix.
 *
 * The defect survived a year because it was a branch inside an 886-line
 * generator, reachable only by building a whole capability matrix around a
 * synthetic index. `resolveAtManual` is a pure function so that this file drives
 * exactly the code path the generator does.
 */

import type { AtMatrixEntry, AtResult, AtResultRow } from './at-matrix.ts'
import { describe, expect, it } from 'vitest'
import { requiredAtPairs } from '../../../contracts/src/quality-tiers.ts'
import {
  ALL_TASKS,
  AT_PAIRS,
  AT_TASK_OPT_OUTS,
  optedOutTasksFor,
  resolveAtManual,
  tasksFor,
} from './at-matrix.ts'

const COMPONENT_COMMIT = 'aaaaaaa1'
const CURRENT = 'aaaaaaa1'
const OLDER = 'bbbbbbb2'

/** Staleness predicate: a row is current when it observed the component's commit. */
function isCurrent(rowCommit: string, componentCommit: string): boolean {
  return rowCommit === componentCommit
}

function row(pair: string, result: AtResult, over: Partial<AtResultRow> = {}): AtResultRow {
  const executed = result !== 'unrun'
  return {
    pair,
    task: ALL_TASKS,
    result,
    versions: executed ? 'NVDA 2026.1 / Firefox 143' : '-',
    tester: executed ? 'A. Tester' : '-',
    date: executed ? '2026-09-18' : '-',
    sourceCommit: executed ? CURRENT : '-',
    notes: '',
    ...over,
  }
}

function entry(rows: AtResultRow[], over: Partial<AtMatrixEntry> = {}): AtMatrixEntry {
  return {
    component: 'DzThing',
    tier: 'B',
    pattern: 'button',
    file: 'e2e/at-matrix/DzThing.md',
    tasks: ['reach'],
    requiredPairs: requiredAtPairs('B'),
    componentCommit: COMPONENT_COMMIT,
    rows,
    ...over,
  }
}

const allSix = (result: AtResult): AtResultRow[] => AT_PAIRS.map(p => row(p.id, result))

describe('resolveAtManual — the N1-O4 §6.2 regression', () => {
  it('resolves an all-unrun component to unrun (this case was already correct)', () => {
    const got = resolveAtManual(entry(allSix('unrun')), requiredAtPairs('B'), isCurrent)
    expect(got.state).toBe('unrun')
    expect(got.note).toContain('none executed')
  })

  it('resolves an ALL-FAIL run to `fail`, never `pass` — the defect itself', () => {
    const got = resolveAtManual(entry(allSix('fail')), requiredAtPairs('B'), isCurrent)
    // The measured pre-fix behaviour was `pass` with the note "6/6 pairs executed".
    expect(got.state).toBe('fail')
    expect(got.state).not.toBe('pass')
    expect(got.note).toContain('did not pass')
  })

  it('resolves a single failed pairing among passes to `fail`', () => {
    const rows = [row(AT_PAIRS[0]!.id, 'fail'), ...AT_PAIRS.slice(1).map(p => row(p.id, 'pass'))]
    const got = resolveAtManual(entry(rows), requiredAtPairs('B'), isCurrent)
    expect(got.state).toBe('fail')
  })

  it('resolves an all-blocked run to `present`, not `pass`', () => {
    const got = resolveAtManual(entry(allSix('blocked')), requiredAtPairs('B'), isCurrent)
    // Pre-fix: `pass`. A run that could not finish proves nothing green.
    expect(got.state).toBe('present')
    expect(got.note).toContain('blocked')
  })

  it('treats `partial` as a failure, because pass requires every step passed', () => {
    const got = resolveAtManual(entry(allSix('partial')), requiredAtPairs('B'), isCurrent)
    expect(got.state).toBe('fail')
  })

  it('does not launder a failure into `stale` when the evidence is old', () => {
    const rows = allSix('fail').map(r => ({ ...r, sourceCommit: OLDER }))
    const got = resolveAtManual(entry(rows), requiredAtPairs('B'), isCurrent)
    expect(got.state).toBe('fail')
    expect(got.note).toContain('predate')
  })
})

describe('resolveAtManual — coverage, the half of the defect that survives `fail`', () => {
  it('does not resolve to `pass` when a required pairing was never run', () => {
    // Tier C requires three pairings; only the first was driven.
    const got = resolveAtManual(
      entry([row(AT_PAIRS[0]!.id, 'pass')], { tier: 'C', requiredPairs: requiredAtPairs('C') }),
      requiredAtPairs('C'),
      isCurrent,
    )
    // Pre-fix this was `pass` with "1/6 pairs executed" surviving only in a note.
    expect(got.state).toBe('present')
    expect(got.note).toContain('jaws-chrome')
  })

  it('resolves to `pass` when every required pairing passed for every task', () => {
    const rows = requiredAtPairs('B').map(p => row(p, 'pass'))
    const got = resolveAtManual(entry(rows), requiredAtPairs('B'), isCurrent)
    expect(got.state).toBe('pass')
  })

  it('does not require an optional pairing to reach `pass`', () => {
    // Tier B requires nvda-firefox only; the other five stay unrun.
    const rows = [
      row('nvda-firefox', 'pass'),
      ...AT_PAIRS.filter(p => p.id !== 'nvda-firefox').map(p => row(p.id, 'unrun')),
    ]
    const got = resolveAtManual(entry(rows), requiredAtPairs('B'), isCurrent)
    expect(got.state).toBe('pass')
  })

  it('requires every declared task, not merely every pairing', () => {
    const rows = [row('nvda-firefox', 'pass', { task: 'reach' })]
    const got = resolveAtManual(
      entry(rows, { tasks: ['reach', 'activate'] }),
      requiredAtPairs('B'),
      isCurrent,
    )
    expect(got.state).toBe('present')
    expect(got.note).toContain('activate')
  })

  it('marks a complete but outdated pass `stale`', () => {
    const rows = requiredAtPairs('B').map(p => row(p, 'pass', { sourceCommit: OLDER }))
    const got = resolveAtManual(entry(rows), requiredAtPairs('B'), isCurrent)
    expect(got.state).toBe('stale')
  })
})

describe('tier-differentiated pairings', () => {
  it('is monotonic: D contains C contains B', () => {
    const b = requiredAtPairs('B')
    const c = requiredAtPairs('C')
    const d = requiredAtPairs('D')
    expect(c).toEqual(expect.arrayContaining([...b]))
    expect(d).toEqual(expect.arrayContaining([...c]))
    expect(b.length).toBeLessThan(c.length)
    expect(c.length).toBeLessThan(d.length)
  })

  it('names only pairings the scaffold actually declares', () => {
    const known = new Set(AT_PAIRS.map(p => p.id))
    for (const tier of ['B', 'C', 'D'] as const) {
      for (const pair of requiredAtPairs(tier))
        expect(known, `${tier} requires unknown pairing ${pair}`).toContain(pair)
    }
  })

  it('requires every declared pairing at Tier D', () => {
    expect([...requiredAtPairs('D')].sort()).toEqual(AT_PAIRS.map(p => p.id).sort())
  })

  it('requires none at Tier A, which is excluded from the scaffold', () => {
    expect(requiredAtPairs('A')).toEqual([])
  })
})

describe('tasksFor opt-outs', () => {
  it('drops a pattern task a named component has no surface for', () => {
    const withOptOut = tasksFor({
      pattern: 'combobox',
      traits: ['dataset', 'teleports'],
      wcag: [],
      component: 'DzCommandPalette',
    }).map(t => t.id)
    expect(withOptOut).not.toContain('error')
    expect(withOptOut).toContain('select')
  })

  it('leaves the pattern intact for every other component', () => {
    const other = tasksFor({
      pattern: 'combobox',
      traits: ['dataset'],
      wcag: [],
      component: 'DzCombobox',
    }).map(t => t.id)
    expect(other).toContain('error')
  })

  it('ignores a waiver when the component actually owes WCAG 3.3.1', () => {
    const forced = tasksFor({
      pattern: 'combobox',
      traits: [],
      wcag: ['3.3.1'],
      component: 'DzCommandPalette',
    }).map(t => t.id)
    expect(forced).toContain('error')
  })

  it('carries a reason on every waiver, so nothing is dropped silently', () => {
    for (const [component, optOuts] of Object.entries(AT_TASK_OPT_OUTS)) {
      for (const optOut of optOuts) {
        expect(optOut.why.length, `${component}/${optOut.task} has no reason`)
          .toBeGreaterThan(40)
      }
    }
  })

  it('reports no waivers for an unknown component', () => {
    expect(optedOutTasksFor('DzNotAThing')).toEqual([])
    expect(optedOutTasksFor(undefined)).toEqual([])
  })
})

describe('landmarks pattern', () => {
  it('implies reach as well as navigate', () => {
    const ids = tasksFor({ pattern: 'landmarks', traits: [], wcag: [] }).map(t => t.id)
    expect(ids).toContain('reach')
    expect(ids).toContain('navigate')
  })

  it('does not imply the treeview obligations DzSidebar never implemented', () => {
    const ids = tasksFor({
      pattern: 'landmarks',
      traits: ['dataset', 'teleports'],
      wcag: [],
      component: 'DzSidebar',
    }).map(t => t.id)
    expect(ids).not.toContain('typeahead')
    expect(ids).not.toContain('select')
    // The dataset trait still adds the live-region task.
    expect(ids).toContain('live')
  })
})
