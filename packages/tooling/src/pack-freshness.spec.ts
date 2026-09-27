/**
 * Cover for the mtime check that `test:nuxt-fixtures:pack` and
 * `validate:published-imports` both refuse on.
 *
 * The defect it replaces (N5-04 `F10`) was not a wrong answer — it was no
 * question at all: `yarn pack` archived whatever `dist/` existed and the
 * command exited 0. So these tests are mostly about the two directions being
 * distinguishable, and about the refusal carrying the two timestamps that make
 * it arguable.
 */

import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkAllDistFreshness, checkDistFreshness, formatFreshnessRefusal, newestFileUnder } from './pack-freshness.mjs'

let root: string

/** Write a file and pin its mtime, so the test does not race the filesystem clock. */
function writeAt(path: string, secondsFromEpoch: number): void {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, 'x', 'utf8')
  utimesSync(path, secondsFromEpoch, secondsFromEpoch)
}

function makePackage(name: string, srcAt: number | null, distAt: number | null): string {
  const dir = join(root, name)
  mkdirSync(dir, { recursive: true })
  writeAt(join(dir, 'package.json'), srcAt ?? 1_700_000_000)
  if (srcAt !== null)
    writeAt(join(dir, 'src', 'index.ts'), srcAt)
  if (distAt !== null)
    writeAt(join(dir, 'dist', 'index.js'), distAt)
  return dir
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'dzup-pack-freshness-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('newestFileUnder', () => {
  it('walks recursively, ignores node_modules, and names the file', () => {
    const dir = join(root, 'walk')
    writeAt(join(dir, 'a.js'), 1_000)
    writeAt(join(dir, 'nested', 'b.js'), 2_000)
    writeAt(join(dir, 'node_modules', 'evil.js'), 9_000)

    const newest = newestFileUnder(dir)
    expect(newest?.file).toBe(join(dir, 'nested', 'b.js'))
    expect(newest?.mtimeMs).toBe(2_000_000)
  })

  it('returns null for a directory that does not exist', () => {
    expect(newestFileUnder(join(root, 'nope'))).toBeNull()
  })
})

describe('checkDistFreshness', () => {
  it('calls a dist built AFTER its sources fresh', () => {
    const dir = makePackage('fresh', 1_000, 2_000)
    expect(checkDistFreshness(dir, '@x/fresh').status).toBe('fresh')
  })

  it('calls a dist built BEFORE its sources stale — the F10 case', () => {
    const dir = makePackage('stale', 2_000, 1_000)
    const result = checkDistFreshness(dir, '@x/stale')
    expect(result.status).toBe('stale')
    expect(result.newestSource?.mtimeMs).toBe(2_000_000)
    expect(result.newestDist?.mtimeMs).toBe(1_000_000)
  })

  it('counts package.json as a source input — a changed `exports` map is a stale tarball too', () => {
    const dir = join(root, 'manifest-only')
    mkdirSync(dir, { recursive: true })
    writeAt(join(dir, 'src', 'index.ts'), 1_000)
    writeAt(join(dir, 'dist', 'index.js'), 2_000)
    expect(checkDistFreshness(dir, '@x/m').status).toBe('fresh')

    writeAt(join(dir, 'package.json'), 3_000)
    expect(checkDistFreshness(dir, '@x/m').status).toBe('stale')
  })

  it('reports an unbuilt package as unbuilt, not as fresh', () => {
    const dir = makePackage('unbuilt', 1_000, null)
    expect(checkDistFreshness(dir, '@x/unbuilt').status).toBe('unbuilt')
  })
})

describe('formatFreshnessRefusal', () => {
  it('names both timestamps, both files and the lag', () => {
    const dir = makePackage('stale', 2_000, 1_000)
    const message = formatFreshnessRefusal(checkAllDistFreshness([{ name: '@x/stale', packageDir: dir }]), { repoRoot: root })

    expect(message).toContain('refusing to pack a build older than its sources')
    expect(message).toContain('@x/stale  STALE')
    expect(message).toContain(new Date(2_000_000).toISOString())
    expect(message).toContain(new Date(1_000_000).toISOString())
    expect(message).toContain('16 m 40 s behind')
    expect(message).toContain('evidence about a build nobody has')
  })
})
