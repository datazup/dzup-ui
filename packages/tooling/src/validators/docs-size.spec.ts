/**
 * Unit tests for the docs-site size budget (TASK-R1-O5).
 *
 * The interesting cases are the two failure modes and the one that is NOT a
 * failure: over the ceiling, so far under it that the ceiling is stale, and an
 * artifact that has not been built. The last is the one that decides whether
 * `yarn validate:all` is runnable on a fresh clone, so it is asserted rather
 * than assumed.
 */

import type { Measurement, SizeBudget } from './docs-size.ts'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  checkBudget,
  checkDocsSize,
  checkStorybookParity,
  DOCS_SIZE_CEILINGS_PATH,
  formatBytes,
  readBudgets,
  shouldRequireDist,
  STORYBOOK_PACKAGE_JSON,
} from './docs-size.ts'

const BUDGET: SizeBudget = {
  path: 'apps/docs/.vitepress/dist',
  ceilingBytes: 1_000_000,
  seededFromBytes: 950_000,
  seededAt: '2026-09-21',
  relaxToleranceBytes: 100_000,
}

function measurement(bytes: number, files: Array<[string, number]> = []): Measurement {
  return { bytes, files: files.map(([rel, n]) => ({ rel, bytes: n })) }
}

describe('formatBytes', () => {
  it('prints the exact byte count beside the human figure', () => {
    // The whole point: `25.00 MB EXCEEDS budget 25 MB` was a true statement
    // that read as a rounding bug, because two decimals cannot show an 18 kB
    // overage on 25 MB. The number that decides the exit code is printed.
    expect(formatBytes(26_232_563)).toBe('25.02 MB (26,232,563 B)')
    expect(formatBytes(1024)).toBe('0.00 MB (1,024 B)')
  })
})

describe('checkBudget', () => {
  it('passes a build inside the ceiling and inside the tolerance', () => {
    expect(checkBudget('docsDist', BUDGET, measurement(950_000))).toEqual([])
  })

  it('fails a build over the ceiling and names the biggest three files', () => {
    const v = checkBudget('docsDist', BUDGET, measurement(1_200_000, [
      ['assets/search-index.js', 600_000],
      ['assets/repl.js', 300_000],
      ['assets/theme.js', 200_000],
      ['index.html', 100_000],
    ]))
    expect(v).toHaveLength(1)
    expect(v[0]!.rule).toBe('over')
    expect(v[0]!.message).toContain('over the')
    expect(v[0]!.message).toContain('assets/search-index.js')
    expect(v[0]!.message).toContain('assets/repl.js')
    expect(v[0]!.message).toContain('assets/theme.js')
    // The fourth file is noise once you know the first three.
    expect(v[0]!.message).not.toContain('index.html')
  })

  it('states the overage, not just the two sizes', () => {
    const v = checkBudget('docsDist', BUDGET, measurement(1_000_001))
    expect(v[0]!.message).toContain('by 0.00 MB (1 B)')
  })

  it('fails a ceiling the build has fallen far below — a ratchet is lowered, not forgotten', () => {
    const v = checkBudget('docsDist', BUDGET, measurement(800_000))
    expect(v).toHaveLength(1)
    expect(v[0]!.rule).toBe('stale')
    expect(v[0]!.message).toContain('Lower `docsDist.ceilingBytes`')
  })

  it('absorbs build-to-build noise inside the tolerance', () => {
    // A byte ratchet with no tolerance fails on a re-run of the same commit and
    // is switched off the week it lands.
    expect(checkBudget('docsDist', BUDGET, measurement(920_000))).toEqual([])
    expect(checkBudget('docsDist', BUDGET, measurement(1_000_000))).toEqual([])
  })
})

describe('an unbuilt artifact', () => {
  const missing: Record<string, SizeBudget> = {
    nothing: { ...BUDGET, path: 'apps/docs/.vitepress/dist-that-does-not-exist' },
  }

  it('skips by default, so validate:all runs on a fresh clone', () => {
    const [result] = checkDocsSize(missing, false)
    expect(result!.violations[0]!.rule).toBe('missing')
    expect(result!.violations[0]!.level).toBe('report')
  })

  it('is an error under --require-dist, which is how the docs build calls it', () => {
    const [result] = checkDocsSize(missing, true)
    expect(result!.violations[0]!.level).toBe('error')
  })

  it('says out loud that a skipped budget enforced nothing', () => {
    // The skip message is what a reader sees instead of a measurement, so it has
    // to carry that it measured nothing — "SKIPPED" alone reads as "fine".
    const [result] = checkDocsSize(missing, false)
    expect(result!.violations[0]!.message).toContain('enforced NOTHING')
  })
})

describe('shouldRequireDist — the fail-closed decision (finding S6, 2026-09-22)', () => {
  /**
   * Both budgeted artifacts are gitignored and nothing in `validate:all` builds
   * them, so on a clean checkout this validator used to measure nothing and exit
   * 0 — green on a tree it had never looked at. The default now depends on where
   * it is running: a skip is honest on a developer's freshly-edited tree and is
   * not honest on the machine deciding a merge.
   */
  it('requires the dist under CI, where an unmeasured budget is a finding', () => {
    expect(shouldRequireDist([], { CI: 'true' })).toBe(true)
    expect(shouldRequireDist([], { CI: '1' })).toBe(true)
  })

  it('skips by default off CI, so validate:all stays runnable without a 40 s build', () => {
    expect(shouldRequireDist([], {})).toBe(false)
    expect(shouldRequireDist([], { CI: undefined })).toBe(false)
  })

  it('treats the shapes that mean "not CI" as not CI', () => {
    // A runner that exports CI="" or CI=false must not turn the gate on by
    // accident; an env var that exists is not the same as an env var that is set.
    expect(shouldRequireDist([], { CI: '' })).toBe(false)
    expect(shouldRequireDist([], { CI: 'false' })).toBe(false)
    expect(shouldRequireDist([], { CI: '0' })).toBe(false)
  })

  it('honours --require-dist anywhere, which is how apps/docs build calls it', () => {
    expect(shouldRequireDist(['--require-dist'], {})).toBe(true)
  })

  it('lets --allow-missing-dist opt a pre-build CI job back out, and it wins', () => {
    expect(shouldRequireDist(['--allow-missing-dist'], { CI: 'true' })).toBe(false)
    expect(shouldRequireDist(['--require-dist', '--allow-missing-dist'], {})).toBe(false)
  })

  it('lets DOCS_SIZE_ALLOW_MISSING_DIST=1 opt out where no flag reaches it (validate:all under CI)', () => {
    expect(shouldRequireDist([], { CI: 'true', DOCS_SIZE_ALLOW_MISSING_DIST: '1' })).toBe(false)
    expect(shouldRequireDist(['--require-dist'], { DOCS_SIZE_ALLOW_MISSING_DIST: '1' })).toBe(false)
  })

  it('accepts only the exact value 1, so a stray or empty variable cannot switch the gate off', () => {
    expect(shouldRequireDist([], { CI: 'true', DOCS_SIZE_ALLOW_MISSING_DIST: '' })).toBe(true)
    expect(shouldRequireDist([], { CI: 'true', DOCS_SIZE_ALLOW_MISSING_DIST: 'true' })).toBe(true)
    expect(shouldRequireDist([], { CI: 'true', DOCS_SIZE_ALLOW_MISSING_DIST: '0' })).toBe(true)
  })
})

describe('the committed ceilings', () => {
  const budgets = readBudgets()

  it('declares a seed, a date and a tolerance for every budget', () => {
    expect(Object.keys(budgets).length).toBeGreaterThan(0)
    for (const [key, b] of Object.entries(budgets)) {
      expect(b.path, key).toMatch(/^apps\//)
      expect(b.seededFromBytes, key).toBeGreaterThan(0)
      expect(b.seededAt, key).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(b.relaxToleranceBytes, key).toBeGreaterThan(0)
    }
  })

  it('seeds every ceiling no more than 5 % above the measurement it came from', () => {
    for (const [key, b] of Object.entries(budgets))
      expect(b.ceilingBytes / b.seededFromBytes, key).toBeLessThanOrEqual(1.05)
  })

  it('gives every ceiling a tolerance wide enough for its own seed', () => {
    // Otherwise the budget seeded today fails tomorrow as "stale", which is the
    // ratchet eating itself.
    for (const [key, b] of Object.entries(budgets))
      expect(b.ceilingBytes - b.seededFromBytes, key).toBeLessThanOrEqual(b.relaxToleranceBytes)
  })

  it('carries a `//` reason for the file and for every budget', () => {
    const raw = JSON.parse(readFileSync(DOCS_SIZE_CEILINGS_PATH, 'utf8')) as Record<string, unknown>
    expect(typeof raw['//']).toBe('string')
    for (const [key, value] of Object.entries(raw)) {
      if (key === '//')
        continue
      expect(typeof (value as { '//'?: string })['//'], key).toBe('string')
    }
  })
})

describe('checkStorybookParity', () => {
  it('agrees with the --max-mb the Storybook build actually enforces', () => {
    expect(existsSync(STORYBOOK_PACKAGE_JSON)).toBe(true)
    expect(checkStorybookParity(readBudgets().storybookStatic)).toEqual([])
  })

  it('fails when the two statements of one number drift apart', () => {
    const drifted = { ...readBudgets().storybookStatic!, ceilingBytes: 1 }
    const v = checkStorybookParity(drifted)
    expect(v).toHaveLength(1)
    expect(v[0]!.rule).toBe('parity')
    expect(v[0]!.message).toContain('stated twice')
  })
})
