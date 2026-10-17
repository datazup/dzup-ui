/**
 * One SFC toolchain for every workspace that compiles `@dzup-ui/core` source
 * (UI-DZUP-UI-ARCH-L-06).
 *
 * `apps/landing` and `apps/storybook` alias `@dzup-ui/core` to its `.vue` source
 * through `createDzupResolution`, so the visual, e2e and Chromatic evidence they
 * produce is compiled by THEIR `vite` and `@vitejs/plugin-vue`, not by the ones
 * the published build uses. When those majors differ, the evidence is about a
 * different compiler than the one consumers install.
 *
 * Aligning them is a dependency bump, and a dependency bump regenerates
 * `yarn.lock`, which needs an install. Until that lands the difference is a
 * RECORDED exception rather than an accident, and this spec is the ratchet:
 *
 * - the published build packages agree on one major each (the target);
 * - every source-compiling app is on the target, or is listed below with the
 *   exact majors it is on, so a third major cannot arrive unnoticed;
 * - an app that has been aligned must be deleted from the list, so the exception
 *   can only shrink.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')

/** The packages whose build is what `@dzup-ui/core` consumers install. */
const PUBLISHED_BUILD = ['package.json', 'packages/core/package.json', 'packages/tooling/package.json']

/** The workspaces that compile core `.vue` source through `createDzupResolution`. */
const SOURCE_COMPILERS = ['apps/landing/package.json', 'apps/storybook/package.json']

/**
 * The recorded exception list. Empty since AUDIT-FOLLOWUPS-20261017-R1 (RF-16)
 * moved apps/landing and apps/storybook to vite ^7 / @vitejs/plugin-vue ^6.
 * The shrink-only check below still applies: an entry may be added only with a
 * blocker, and an aligned app may not stay listed.
 */
const RECORDED_EXCEPTIONS: Record<string, { vite: number, pluginVue: number, blocker: string }> = {}

interface Majors { vite: number | undefined, pluginVue: number | undefined }

/** The major a semver range starts from: `^6.4.3` → 6, `^7` → 7. */
function majorOf(range: string | undefined): number | undefined {
  const match = range?.match(/(\d+)/)
  return match === null || match === undefined ? undefined : Number(match[1])
}

function majorsOf(path: string): Majors {
  const manifest = JSON.parse(readFileSync(resolve(ROOT, path), 'utf8')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  const all = { ...manifest.dependencies, ...manifest.devDependencies }
  return { vite: majorOf(all.vite), pluginVue: majorOf(all['@vitejs/plugin-vue']) }
}

describe('one vite and one @vitejs/plugin-vue major for core SFC source (UI-DZUP-UI-ARCH-L-06)', () => {
  const target = majorsOf('packages/core/package.json')

  it('the published build packages agree on one major each', () => {
    expect(target.vite).toBeDefined()
    expect(target.pluginVue).toBeDefined()
    for (const path of PUBLISHED_BUILD)
      expect(majorsOf(path), path).toEqual(target)
  })

  it('every source-compiling app is on the target, or on the exact majors its recorded exception names', () => {
    for (const path of SOURCE_COMPILERS) {
      const exception = RECORDED_EXCEPTIONS[path]
      const expected = exception === undefined ? target : { vite: exception.vite, pluginVue: exception.pluginVue }
      expect(majorsOf(path), path).toEqual(expected)
    }
  })

  it('the exception only shrinks: an aligned app is not left on the list', () => {
    for (const [path, exception] of Object.entries(RECORDED_EXCEPTIONS)) {
      expect(SOURCE_COMPILERS, path).toContain(path)
      expect(exception.blocker.length, path).toBeGreaterThan(0)
      expect({ vite: exception.vite, pluginVue: exception.pluginVue }, `${path} is aligned — delete its exception`).not.toEqual(target)
    }
  })
})
