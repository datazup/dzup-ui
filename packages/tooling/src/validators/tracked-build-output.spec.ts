/**
 * Seeded-failure proof for the tracked-build-output gate (TASK-R1-O1).
 *
 * A gate nobody has watched fail is a gate nobody knows works. The twelve
 * files this validator was written for survived a 44-link chain precisely
 * because no link looked, so the tests below matter more than the usual
 * coverage argument: each one seeds the exact shape of the thing that escaped
 * and asserts the gate now catches it.
 */

import type { AllowlistEntry } from './tracked-build-output.ts'
import { describe, expect, it } from 'vitest'
import {
  buildOutputExtension,
  checkTrackedBuildOutput,
  GOVERNED,
  isInexcusable,
  readAllowlist,
  trackablePackageFiles,
  trackedPackageFiles,
} from './tracked-build-output.ts'

/** The twelve files that were committed under `packages/core/src/providers/`. */
const THE_TWELVE = [
  'packages/core/src/providers/DzThemeProvider.types.d.ts',
  'packages/core/src/providers/DzThemeProvider.types.js',
  'packages/core/src/providers/DzThemeProvider.types.js.map',
  'packages/core/src/providers/index.d.ts',
  'packages/core/src/providers/index.js',
  'packages/core/src/providers/index.js.map',
  'packages/core/src/providers/theme-script.d.ts',
  'packages/core/src/providers/theme-script.js',
  'packages/core/src/providers/theme-script.js.map',
  'packages/core/src/providers/useTheme.d.ts',
  'packages/core/src/providers/useTheme.js',
  'packages/core/src/providers/useTheme.js.map',
]

/** No `.ts` sibling is claimed unless a test says so. */
const noSiblings = (): boolean => false

describe('checkTrackedBuildOutput — seeded failures', () => {
  it('catches every one of the twelve files that escaped the chain', () => {
    const violations = checkTrackedBuildOutput(THE_TWELVE, [], noSiblings)
    expect(violations.map(v => v.path)).toEqual(THE_TWELVE)
  })

  it('names the `.ts` the output was compiled from, so the fix is obvious', () => {
    const violations = checkTrackedBuildOutput(
      ['packages/core/src/providers/useTheme.js'],
      [],
      path => path === 'packages/core/src/providers/useTheme.ts',
    )
    expect(violations[0]?.compiledFrom).toBe('packages/core/src/providers/useTheme.ts')
  })

  it('fires on a single seeded file in a package that had none', () => {
    const violations = checkTrackedBuildOutput(
      ['packages/contracts/src/props.types.js'],
      [],
      noSiblings,
    )
    expect(violations).toHaveLength(1)
    expect(violations[0]?.extension).toBe('.js')
  })

  it('fires on a seeded `.d.ts` and a seeded `.map` alike', () => {
    const seeded = ['packages/tokens/src/seeded.d.ts', 'packages/nuxt/src/seeded.js.map']
    expect(checkTrackedBuildOutput(seeded, [], noSiblings)).toHaveLength(2)
  })
})

describe('checkTrackedBuildOutput — what it must not flag', () => {
  it('ignores TypeScript and Vue sources', () => {
    const sources = [
      'packages/core/src/providers/useTheme.ts',
      'packages/core/src/components/buttons/DzButton.vue',
      'packages/core/src/components/buttons/DzButton.types.ts',
    ]
    expect(checkTrackedBuildOutput(sources, [], noSiblings)).toEqual([])
  })

  it('governs `packages/*/src` only — not dist, apps, e2e or a package root', () => {
    const outside = [
      'packages/core/dist/index.js',
      'packages/core/index.js',
      'packages/tooling/scripts/anything.js',
      'apps/landing/scripts/build-releases.js',
      'e2e/fixture/main.js',
    ]
    expect(outside.every(path => !GOVERNED.test(path))).toBe(true)
    expect(checkTrackedBuildOutput(outside, [], noSiblings)).toEqual([])
  })

  it('honours an allowlist entry for a hand-written file', () => {
    const allowlist: AllowlistEntry[] = [
      { path: 'packages/core/src/env.d.ts', reason: 'ambient declarations' },
    ]
    expect(checkTrackedBuildOutput(['packages/core/src/env.d.ts'], allowlist, noSiblings)).toEqual([])
  })
})

describe('the sourcemap exception cannot be allowlisted away', () => {
  it('refuses a `.map` even when it is on the allowlist', () => {
    const allowlist: AllowlistEntry[] = [
      { path: 'packages/core/src/providers/index.js.map', reason: 'someone tried' },
    ]
    const violations = checkTrackedBuildOutput(
      ['packages/core/src/providers/index.js.map'],
      allowlist,
      noSiblings,
    )
    expect(violations).toHaveLength(1)
    expect(violations[0]?.inexcusable).toBe(true)
  })

  it.each(['.js.map', '.d.ts.map', '.css.map', '.mjs.map'])('treats %s as inexcusable', (ext) => {
    expect(isInexcusable(ext)).toBe(true)
  })

  it.each(['.js', '.d.ts', '.mjs', '.cjs', '.jsx'])('treats %s as excusable with a reason', (ext) => {
    expect(isInexcusable(ext)).toBe(false)
  })
})

describe('buildOutputExtension', () => {
  it('prefers the longest match so `.d.ts` never reads as `.ts`', () => {
    expect(buildOutputExtension('a/b.d.ts')).toBe('.d.ts')
    expect(buildOutputExtension('a/b.js.map')).toBe('.js.map')
    expect(buildOutputExtension('a/b.d.ts.map')).toBe('.d.ts.map')
  })

  it('returns undefined for a source file', () => {
    expect(buildOutputExtension('a/b.ts')).toBeUndefined()
    expect(buildOutputExtension('a/b.vue')).toBeUndefined()
  })
})

describe('the allowlist itself', () => {
  it('gives every entry a non-empty reason', () => {
    for (const entry of readAllowlist()) {
      expect(entry.path, 'an allowlist entry needs a path').toBeTruthy()
      expect(entry.reason?.trim(), `${entry.path} needs a reason`).toBeTruthy()
    }
  })

  it('never lists a sourcemap — the gate would reject it anyway', () => {
    expect(readAllowlist().filter(entry => entry.path.endsWith('.map'))).toEqual([])
  })

  it('lists only paths git tracks or would add, so it cannot rot unnoticed', () => {
    // Tracked OR untracked-and-not-ignored. Rot is an entry naming a file that
    // exists nowhere; an entry naming a file that is on disk, not ignored, and
    // one `git add` away is not rot — and it is the only state an agent can
    // leave it in, since adding a hand-written `.mjs` under packages/*/src
    // REQUIRES an allowlist entry while committing is the owner's act alone
    // (TASK-R1-O2 hit exactly this with pack-freshness.mjs/.d.mts).
    const trackable = new Set(trackablePackageFiles())
    for (const entry of readAllowlist())
      expect(trackable.has(entry.path), `${entry.path} is allowlisted but neither tracked nor addable`).toBe(true)
  })

  it('still fails an entry that names a gitignored path — the real rot', () => {
    // packages/*/dist is gitignored, so it appears in neither list.
    expect(new Set(trackablePackageFiles()).has('packages/core/dist/index.js')).toBe(false)
  })
})

describe('the real repository', () => {
  it('tracks no build output under packages/*/src', () => {
    const violations = checkTrackedBuildOutput(trackedPackageFiles())
    expect(violations.map(v => v.path)).toEqual([])
  })
})
