/**
 * The module's peer floor admits only core versions that ship what it imports
 * (UI-DZUP-UI-ARCH-M-07).
 *
 * `module.ts` imports `@dzup-ui/core/ownership` and `@dzup-ui/core/theme-script`
 * at load. Published core 0.2.0 has neither, yet the old peer range
 * `>=0.1.0-alpha.0` accepted it, so a Nuxt config on core 0.2.0 failed with
 * "package path not exported". The floor is held against the `since` record in
 * the published subpath contract, so adding an import of a newer subpath
 * without raising the floor fails here.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '../../..')

interface SubpathContract {
  packages: Record<string, { subpaths: string[], since?: Record<string, string> }>
}

const contract = JSON.parse(
  readFileSync(resolve(ROOT, 'packages/tooling/scripts/required-export-subpaths.json'), 'utf8'),
) as SubpathContract
const nuxtPkg = JSON.parse(readFileSync(resolve(ROOT, 'packages/nuxt/package.json'), 'utf8')) as {
  peerDependencies: Record<string, string>
}
const moduleSource = readFileSync(resolve(ROOT, 'packages/nuxt/src/module.ts'), 'utf8')

/** `x.y.z` (prerelease dropped) as a comparable tuple. */
function parse(version: string): [number, number, number] {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(version)
  if (m === null)
    throw new Error(`not a version: ${version}`)
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

function compare(a: string, b: string): number {
  const [x, y] = [parse(a), parse(b)]
  for (let i = 0; i < 3; i++) {
    if (x[i] !== y[i])
      return (x[i] as number) - (y[i] as number)
  }
  return 0
}

/** Every `@dzup-ui/core/<subpath>` module.ts imports, as `./<subpath>`. */
function importedCoreSubpaths(src: string): string[] {
  const found = new Set<string>()
  for (const m of src.matchAll(/from '@dzup-ui\/core\/([^']+)'/g))
    found.add(`./${m[1]}`)
  return [...found].sort()
}

describe('@dzup-ui/nuxt peer floor on @dzup-ui/core', () => {
  const core = contract.packages['@dzup-ui/core']
  const since = core?.since ?? {}
  const range = nuxtPkg.peerDependencies['@dzup-ui/core'] ?? ''

  it('is a plain >= floor this spec can read', () => {
    expect(range).toMatch(/^>=\d+\.\d+\.\d+(?:-[\w.]+)?$/)
  })

  it('module.ts imports at least the two subpaths the finding names', () => {
    expect(importedCoreSubpaths(moduleSource)).toEqual(expect.arrayContaining(['./ownership', './theme-script']))
  })

  for (const subpath of importedCoreSubpaths(moduleSource)) {
    it(`${subpath} is a contracted core subpath with a recorded \`since\``, () => {
      expect(core?.subpaths).toContain(subpath)
      expect(since[subpath], `add "${subpath}" to @dzup-ui/core "since" in required-export-subpaths.json`).toMatch(/^\d+\.\d+\.\d+$/)
    })

    it(`the floor is at or above the release that first ships ${subpath}`, () => {
      const floor = range.replace(/^>=/, '')
      expect(compare(floor, since[subpath] ?? '999.0.0')).toBeGreaterThanOrEqual(0)
    })
  }

  it('excludes published core 0.2.0, which ships neither subpath', () => {
    expect(compare(range.replace(/^>=/, ''), '0.2.0')).toBeGreaterThan(0)
  })
})
