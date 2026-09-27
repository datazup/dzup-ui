/**
 * Unit cover for the minimum declared peer lane (TASK-R1-O4).
 *
 * The CLI half writes to `package.json` and `yarn.lock` and shells out to
 * `yarn install`; a unit test that drove it would either mutate the repository
 * it runs in or assert against a mock of yarn, which proves nothing. What is
 * testable — and what decides whether the lane is honest — is the pure part:
 *
 *   1. the floor is DERIVED from the declared peer ranges, never written down,
 *   2. a range with no installable lowest version is REFUSED, not guessed,
 *   3. a resolved version that is not the floor is a MISMATCH, not a warning.
 *
 * (3) is the defect this task found in the Vue 3.6 lane, which warned that
 * `vue resolved to 3.5.43` and ran the suite anyway, three scheduled runs in a
 * row. It is pinned here so the same shape cannot come back.
 */

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  applyResolutions,
  commandsFor,
  compareVersions,
  declaredRanges,
  floorFor,
  floorOfRange,
  mismatches,
  readConfig,
  resolutionsFor,
} from './min-peer-lane.mjs'

const config = readConfig()
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

/** A workspace manifest, read from disk — the specs below assert against the real declarations. */
function manifestOf(dir: string) {
  return JSON.parse(readFileSync(join(REPO_ROOT, dir, 'package.json'), 'utf8'))
}

describe('floorOfRange', () => {
  it('reads the floor out of the range shapes this repository actually declares', () => {
    expect(floorOfRange('^3.5.0')).toBe('3.5.0')
    expect(floorOfRange('^2.0.0')).toBe('2.0.0')
    expect(floorOfRange('>=3.0.0')).toBe('3.0.0')
    expect(floorOfRange('~3.5.13')).toBe('3.5.13')
    expect(floorOfRange('3.5.0')).toBe('3.5.0')
    expect(floorOfRange('>=0.1.0-alpha.0')).toBe('0.1.0-alpha.0')
  })

  it('takes the LOWEST alternative of a `||` union', () => {
    // `^20.19.0 || >=22.13.0` is the engines shape. The floor of a union is the
    // floor of its lowest branch — taking the first branch would be right here
    // by luck and wrong the moment somebody writes the branches in the other
    // order.
    expect(floorOfRange('>=22.13.0 || ^20.19.0')).toBe('20.19.0')
    expect(floorOfRange('^20.19.0 || >=22.13.0')).toBe('20.19.0')
  })

  it('refuses a range with no installable lowest version rather than guessing one', () => {
    // `>3.5.0` admits "the next release after 3.5.0", which is not a version
    // anybody can install. A lane that guessed `3.5.1` would report a pass
    // about a version the range never promised.
    expect(floorOfRange('>3.5.0')).toBeNull()
    expect(floorOfRange('*')).toBeNull()
    expect(floorOfRange('')).toBeNull()
    expect(floorOfRange('<4.0.0')).toBeNull()
  })
})

describe('compareVersions', () => {
  it('orders release versions numerically, not lexically', () => {
    // The bug this pins: '3.5.9' > '3.5.43' under string comparison, which
    // would make the lane pick 3.5.43 as the floor and test the version it
    // exists to avoid.
    expect(compareVersions('3.5.9', '3.5.43')).toBe(-1)
    expect(compareVersions('3.5.43', '3.5.9')).toBe(1)
    expect(compareVersions('3.5.0', '3.5.0')).toBe(0)
    expect(compareVersions('2.0.0', '10.0.0')).toBe(-1)
  })

  it('sorts a prerelease below its release', () => {
    expect(compareVersions('0.1.0-alpha.0', '0.1.0')).toBe(-1)
    expect(compareVersions('0.1.0', '0.1.0-alpha.0')).toBe(1)
  })
})

describe('floorFor', () => {
  it('picks the lowest version that satisfies EVERY declaring workspace', () => {
    // Not the lowest declared floor: the highest of them. If core says ^3.5.0
    // and compat says ^3.5.13, installing 3.5.0 breaks compat's own promise and
    // the lane would be red for a reason it invented.
    const floor = floorFor([
      { name: '@dzup-ui/core', range: '^3.5.0' },
      { name: '@dzup-ui/compat', range: '^3.5.13' },
      { name: '@dzup-ui/contracts', range: '^3.5.0' },
    ])

    expect(floor).toBe('3.5.13')
  })

  it('throws, naming the package and the range, when a floor cannot be derived', () => {
    expect(() => floorFor([{ name: '@dzup-ui/core', range: '>3.5.0' }]))
      .toThrow(/@dzup-ui\/core declares `>3\.5\.0`/)
  })

  it('throws when nothing declares the peer at all', () => {
    expect(() => floorFor([])).toThrow(/no workspace declares this peer/)
  })
})

describe('declaredRanges', () => {
  it('collects the range from every workspace that declares it, and skips those that do not', () => {
    const ranges = declaredRanges({
      'packages/core': { name: '@dzup-ui/core', peerDependencies: { 'vue': '^3.5.0', 'reka-ui': '^2.0.0' } },
      'packages/tokens': { name: '@dzup-ui/tokens' },
      'packages/contracts': { name: '@dzup-ui/contracts', peerDependencies: { vue: '^3.5.0' } },
    }, 'vue')

    expect(ranges.map(r => r.name)).toEqual(['@dzup-ui/core', '@dzup-ui/contracts'])
    expect(ranges.every(r => r.range === '^3.5.0')).toBe(true)
  })
})

describe('the lane config, against the real workspaces', () => {
  it('names only peers the workspaces it points at actually declare', () => {
    // A config entry naming a workspace that dropped the peer would make the
    // lane silently stop covering it. Derivation is the point; a stale source
    // list defeats it.
    for (const [peer, entry] of Object.entries(config.peers)) {
      if (peer.startsWith('//'))
        continue

      const manifests = Object.fromEntries(
        (entry as { sources: string[] }).sources.map(dir => [dir, manifestOf(dir)]),
      )

      expect(declaredRanges(manifests, peer).length, `${peer}: no source workspace declares it`).toBeGreaterThan(0)
    }
  })

  it('derives a floor strictly below what the repository resolves today', () => {
    // The lane's whole reason to exist. If the derived floor equalled the
    // installed version there would be nothing new under test, and that is a
    // state worth failing on rather than shipping a lane that measures the
    // status quo twice.
    const coreManifest = { 'packages/core': manifestOf('packages/core') }
    const root = manifestOf('.')

    expect(floorFor(declaredRanges(coreManifest, 'vue'))).toBe('3.5.0')
    expect(floorFor(declaredRanges(coreManifest, 'reka-ui'))).toBe('2.0.0')
    // And the gap that makes the lane worth running: the repository's own
    // dependency sits eleven patch releases above the peer floor it publishes.
    expect(root.dependencies.vue).toBe('^3.5.13')
  })

  it('is documented as a defect claim against THIS repository, in the file itself', () => {
    // The Vue 3.6 lane is advisory and says so in its own config. This one is
    // the opposite and has to say so in the same place, or somebody will
    // eventually read a red min-peer run as "somebody else's problem".
    expect(JSON.stringify(config)).toContain('NOT advisory')
  })
})

describe('resolutionsFor', () => {
  it('pins the whole @vue/* set with `vue`, because Vue releases them in lockstep', () => {
    const pinned = resolutionsFor(config, { 'vue': '3.5.0', 'reka-ui': '2.0.0' })

    expect(pinned.vue).toBe('3.5.0')
    for (const name of ['@vue/compiler-sfc', '@vue/runtime-core', '@vue/runtime-dom', '@vue/shared'])
      expect(pinned[name], `${name} is not pinned with vue`).toBe('3.5.0')
  })

  it('does not invent a lockstep set for a peer that has none', () => {
    const pinned = resolutionsFor(config, { 'reka-ui': '2.0.0' })

    expect(Object.keys(pinned)).toEqual(['reka-ui'])
  })

  it('never pins vue-component-meta or vue-tsc', () => {
    const pinned = resolutionsFor(config, { vue: '3.5.0' })

    expect(pinned['vue-component-meta']).toBeUndefined()
    expect(pinned['vue-tsc']).toBeUndefined()
  })

  it('drops `//` comment keys rather than resolving them as packages', () => {
    const pinned = resolutionsFor(config, { vue: '3.5.0' })

    for (const name of Object.keys(pinned))
      expect(name.startsWith('//'), `${name} leaked into the resolutions`).toBe(false)
  })
})

describe('mismatches', () => {
  it('reports a version that is not the pinned one — the defect the Vue lane shipped', () => {
    const drift = mismatches({ vue: '3.5.0' }, { vue: '3.5.43' })

    expect(drift).toEqual([{ name: 'vue', expected: '3.5.0', actual: '3.5.43' }])
  })

  it('treats a missing package as a mismatch, not as nothing to say', () => {
    const drift = mismatches({ 'reka-ui': '2.0.0' }, { 'reka-ui': null })

    expect(drift).toEqual([{ name: 'reka-ui', expected: '2.0.0', actual: null }])
  })

  it('is empty when every pin landed', () => {
    expect(mismatches({ 'vue': '3.5.0', 'reka-ui': '2.0.0' }, { 'vue': '3.5.0', 'reka-ui': '2.0.0' })).toEqual([])
  })
})

describe('commandsFor', () => {
  it('runs the configured commands when nothing is passed through', () => {
    expect(commandsFor(config, []).map(c => c.name)).toEqual(['typecheck', 'suite'])
  })

  it('a `--` passthrough replaces them, so one command can be re-run in isolation', () => {
    expect(commandsFor(config, ['vitest', 'run', 'packages/core'])).toEqual([
      { name: 'passthrough', run: 'vitest run packages/core' },
    ])
  })

  it('covers the Nuxt unit suite as doc 08\'s package-matrix row asks', () => {
    expect(commandsFor(config, []).map(c => c.run).join(' ')).toContain('packages/nuxt')
  })
})

describe('applyResolutions', () => {
  it('merges over an existing resolutions block without dropping entries', () => {
    // The root manifest already pins vitest and its two companions. A lane that
    // replaced the block would silently unpin them, and the run would be
    // testing a different Vitest as well as a lower Vue.
    const manifest = JSON.stringify({
      name: 'dzup-ui',
      resolutions: { 'vitest': '3.2.6', '@vitest/browser': '3.2.6' },
    }, null, 2)

    const merged = JSON.parse(applyResolutions(manifest, { vue: '3.5.0' }))

    expect(merged.resolutions).toEqual({
      'vitest': '3.2.6',
      '@vitest/browser': '3.2.6',
      'vue': '3.5.0',
    })
  })

  it('ends with a newline, the way yarn writes package.json', () => {
    // Not cosmetic. `yarn install` rewrites package.json with a trailing
    // newline; producing one without it means the restore diff is never empty
    // and the workflow's `git diff --exit-code` step fails on formatting.
    expect(applyResolutions('{"name":"x"}', { vue: '3.5.0' }).endsWith('\n')).toBe(true)
  })
})
