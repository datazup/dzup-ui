/**
 * Unit proof for the runtime-floor reachability gate (TASK-S2-O4).
 *
 * Every seeded input is built with {@link seedLine} rather than written as a
 * literal, because this file is inside the gate's own scan set: a spec that
 * writes `node:fs` and a glob name on one line makes itself a violation. The
 * validator's header records the same trap costing 15 false violations on its
 * first run.
 */
import { describe, expect, it } from 'vitest'
import {
  checkRuntimeFloor,
  compareVersions,
  deriveFloor,
  isAboveFloor,
  readApiTable,
  seedCall,
  seedLine,
  validateRuntimeFloor,
} from './runtime-floor.ts'

const APIS = readApiTable()

function base(overrides: Partial<Parameters<typeof checkRuntimeFloor>[0]> = {}) {
  return {
    apis: APIS,
    ceilings: { breaches: [], maxBreaches: 0 },
    engines: '^20.19.0 || >=22.13.0',
    files: new Map([['a.ts', 'const x = 1\n']]),
    nvmrc: '20.19.0\n',
    ...overrides,
  }
}

function rules(input: Parameters<typeof checkRuntimeFloor>[0]): string[] {
  return checkRuntimeFloor(input).violations.map(violation => violation.rule)
}

describe('deriveFloor', () => {
  it('takes the LOWEST version any branch admits, not the newest', () => {
    expect(deriveFloor('^20.19.0 || >=22.13.0')).toBe('20.19.0')
    expect(deriveFloor('>=22.13.0 || ^20.19.0')).toBe('20.19.0')
    expect(deriveFloor('^22.12.0 || ^24.11.0 || >=26.0.0')).toBe('22.12.0')
  })

  it('returns undefined rather than a permissive default when there is no version', () => {
    expect(deriveFloor(undefined)).toBeUndefined()
    expect(deriveFloor('')).toBeUndefined()
    expect(deriveFloor('*')).toBeUndefined()
  })
})

describe('version comparison', () => {
  it('orders numerically, not lexically', () => {
    expect(compareVersions('20.19.0', '20.9.0')).toBeGreaterThan(0)
    expect(compareVersions('22.0.0', '22.0.0')).toBe(0)
  })

  it('treats the floor itself as not above the floor', () => {
    expect(isAboveFloor('20.19.0', '20.19.0')).toBe(false)
    expect(isAboveFloor('22.0.0', '20.19.0')).toBe(true)
    expect(isAboveFloor('20.12.0', '20.19.0')).toBe(false)
  })
})

describe('the API table', () => {
  it('is not empty, and every row carries an api, a since and a kind', () => {
    expect(APIS.length).toBeGreaterThan(0)
    for (const row of APIS) {
      expect(row.api).toBeTruthy()
      expect(row.since).toMatch(/^\d+\.\d+\.\d+$/)
      expect(['named-import', 'member', 'module']).toContain(row.kind)
      if (row.kind === 'member')
        expect(row.match).toBeTruthy()
      else
        expect(row.module).toBeTruthy()
    }
  })

  it('omits the Set methods whose names collide with ordinary user code', () => {
    const matches = APIS.map(row => row.match ?? '')
    expect(matches).not.toContain('.union(')
    expect(matches).not.toContain('.intersection(')
    expect(matches).not.toContain('.difference(')
  })
})

describe('detection', () => {
  it('flags a named import of a too-new built-in', () => {
    expect(rules(base({ files: new Map([['a.ts', seedLine('globSync', 'node:fs')]]) })))
      .toContain('unlisted-breach')
  })

  it('flags a too-new module specifier', () => {
    expect(rules(base({ files: new Map([['a.ts', seedLine('DatabaseSync', 'node:sqlite')]]) })))
      .toContain('unlisted-breach')
  })

  it('flags a too-new static method call', () => {
    // seedCall, not a literal: this file is inside the gate's own scan set, and a
    // marker comment here was deleted once by `eslint --fix`.
    expect(rules(base({ files: new Map([['a.ts', seedCall('Object', 'groupBy')]]) })))
      .toContain('unlisted-breach')
  })

  it('does NOT flag a name that merely resembles the API', () => {
    expect(rules(base({ files: new Map([['a.ts', 'const globSyncish = 1\n']]) })))
      .not
      .toContain('unlisted-breach')
  })

  it('does NOT flag a built-in import that is at or below the floor', () => {
    expect(rules(base({ files: new Map([['a.ts', seedLine('readFileSync', 'node:fs')]]) })))
      .not
      .toContain('unlisted-breach')
  })

  it('skips a line carrying the self-reference marker', () => {
    const marked = `${seedLine('globSync', 'node:fs').trimEnd()} // runtime-floor-ok\n`
    expect(rules(base({ files: new Map([['a.ts', marked]]) }))).not.toContain('unlisted-breach')
  })

  it('accepts a breach that is listed with a complete entry', () => {
    const entry = {
      api: 'fs.globSync',
      exit: 'discharged when D160 is taken',
      file: 'a.ts',
      reachableFrom: 'yarn test',
      reason: 'the only globbing call in the check',
      recorded: '2026-09-24',
    }
    expect(rules(base({
      ceilings: { breaches: [entry], maxBreaches: 1 },
      files: new Map([['a.ts', seedLine('globSync', 'node:fs')]]),
    }))).toEqual([])
  })
})

describe('the ratchet', () => {
  const entry = {
    api: 'fs.globSync',
    exit: 'x',
    file: 'a.ts',
    reachableFrom: 'yarn test',
    reason: 'x',
    recorded: '2026-09-24',
  }

  it('fails when an allowance is discharged but still listed', () => {
    expect(rules(base({ ceilings: { breaches: [entry], maxBreaches: 1 } })))
      .toContain('entry-discharged')
  })

  it('fails when the ceiling does not equal the list, in either direction', () => {
    expect(rules(base({ ceilings: { breaches: [], maxBreaches: 1 } }))).toContain('ceiling-mismatch')
    expect(rules(base({
      ceilings: { breaches: [entry], maxBreaches: 2 },
      files: new Map([['a.ts', seedLine('globSync', 'node:fs')]]),
    }))).toContain('ceiling-mismatch')
  })

  it('cannot be satisfied by a swap that keeps the arithmetic intact', () => {
    // One listed site repaired, one new site introduced: count unchanged, gate red.
    const report = rules(base({
      ceilings: { breaches: [entry], maxBreaches: 1 },
      files: new Map([['b.ts', seedLine('globSync', 'node:fs')]]),
    }))
    expect(report).toContain('unlisted-breach')
    expect(report).toContain('entry-discharged')
  })

  it('requires a date, a reason, a reachability and an exit on every entry', () => {
    const files = new Map([['a.ts', seedLine('globSync', 'node:fs')]])
    expect(rules(base({
      ceilings: { breaches: [{ ...entry, recorded: 'yesterday' }], maxBreaches: 1 },
      files,
    }))).toContain('entry-date')
    expect(rules(base({
      ceilings: { breaches: [{ ...entry, reachableFrom: '' }], maxBreaches: 1 },
      files,
    }))).toContain('entry-incomplete')
    expect(rules(base({
      ceilings: { breaches: [{ ...entry, exit: '' }], maxBreaches: 1 },
      files,
    }))).toContain('entry-incomplete')
  })
})

describe('it fails closed', () => {
  it('fails when no source files were scanned', () => {
    expect(rules(base({ files: new Map() }))).toContain('no-input')
  })

  it('fails when the API table is empty', () => {
    expect(rules(base({ apis: [] }))).toContain('no-table')
  })

  it('fails when the floor cannot be derived, and reports nothing else', () => {
    const report = checkRuntimeFloor(base({ engines: undefined }))
    expect(report.violations.map(v => v.rule)).toEqual(['floor-underivable'])
    expect(report.floor).toBe('(underivable)')
  })

  it('fails when .nvmrc names a version other than the derived floor', () => {
    expect(rules(base({ nvmrc: '22.13.0\n' }))).toContain('nvmrc-disagrees')
    expect(rules(base({ nvmrc: undefined }))).toContain('nvmrc-disagrees')
  })

  it('accepts a v-prefixed .nvmrc and ignores comments', () => {
    expect(rules(base({ nvmrc: '# the declared floor\nv20.19.0\n' }))).not.toContain('nvmrc-disagrees')
  })
})

describe('the repository at HEAD', () => {
  it('is green, with exactly the breaches the ceilings file lists', () => {
    const report = validateRuntimeFloor()
    expect(report.violations).toEqual([])
    expect(report.floor).toBe('20.19.0')
    expect(report.filesScanned).toBeGreaterThan(1000)
    // One site since the merge of origin/main (2026-10-01): upstream replaced the
    // landing-token-fallbacks.spec.ts globSync call, and its ceilings entry went
    // with it.
    expect(report.breaches.map(breach => breach.file).sort()).toEqual([
      'packages/codemods/scripts/run-story-color-tokens.ts',
    ])
  })
})
