/**
 * Unit cover for the Vue forward-compatibility lane (TASK-N5-03).
 *
 * The CLI half of `vue-next-lane.mjs` writes to `package.json` and `yarn.lock`
 * and shells out to `yarn install`; a unit test that drove it would either
 * mutate the repository it is running in or assert against a mock of yarn,
 * which proves nothing. What is testable — and what actually decides whether
 * the lane is honest — is the pure part: which packages get pinned, and whether
 * merging the pins into the manifest can damage anything already there.
 *
 * The restore path is covered by the runner itself (it verifies its own
 * restore and exits 3 if it failed) and, independently, by the workflow's
 * `git diff --exit-code -- package.json yarn.lock` step. Two mechanisms,
 * neither trusting the other's report.
 */

import { describe, expect, it } from 'vitest'
import { applyResolutions, readConfig, resolutionsFor } from './vue-next-lane.mjs'

const config = readConfig()

describe('vue-next lane config', () => {
  it('pins the whole @vue/* set, not just `vue`', () => {
    // Vue's packages release in lockstep. `@vue/runtime-core` at 3.6 against
    // `@vue/shared` at 3.5 is a state nobody ships, so a red run in it says
    // nothing about 3.6 and would send somebody chasing a defect that does not
    // exist outside this lane.
    const pinned = resolutionsFor(config, '3.6.0-rc.6')

    expect(pinned.vue).toBe('3.6.0-rc.6')
    for (const name of ['@vue/compiler-sfc', '@vue/runtime-core', '@vue/runtime-dom', '@vue/shared'])
      expect(pinned[name], `${name} is not pinned with vue`).toBe('3.6.0-rc.6')
  })

  it('never pins vue-component-meta or vue-tsc', () => {
    // TASK-N5-02's ranked note: component-meta.json, llms-full.txt, 144 docs
    // pages, the playground seeds and the docs nav are all projections of
    // vue-component-meta's output, and each is byte-compared by a gate. Moving
    // it rewrites five artifacts at once. This lane is about the runtime under
    // test, and dragging the extractor along would make every future run of it
    // look like a five-artifact regression.
    const pinned = resolutionsFor(config, '3.6.0')

    expect(pinned['vue-component-meta']).toBeUndefined()
    expect(pinned['vue-tsc']).toBeUndefined()
  })

  it('substitutes the requested version into every 3.x pin', () => {
    const pinned = resolutionsFor(config, '3.7.0-alpha.1')

    for (const version of Object.values(pinned))
      expect(version).toBe('3.7.0-alpha.1')
  })

  it('drops the `//` comment keys rather than resolving them as packages', () => {
    const pinned = resolutionsFor(config, '3.6.0')

    for (const name of Object.keys(pinned))
      expect(name.startsWith('//'), `${name} leaked into the resolutions`).toBe(false)
  })

  it('is documented as advisory in the file itself, not only in prose elsewhere', () => {
    // The one claim most likely to get quoted out of context is "the 3.6 lane
    // is red". Whoever reads the config next should find the word `ADVISORY`
    // without having to find the memo first.
    expect(JSON.stringify(config)).toContain('ADVISORY')
  })
})

describe('applyResolutions', () => {
  it('merges over an existing resolutions block without dropping entries', () => {
    // The root manifest already pins vitest and its two companions. A lane that
    // replaced the block instead of merging would silently unpin them, and the
    // run would be testing a different Vitest as well as a different Vue.
    const manifest = JSON.stringify({
      name: 'dzup-ui',
      resolutions: { 'vitest': '3.2.6', '@vitest/browser': '3.2.6' },
    }, null, 2)

    const merged = JSON.parse(applyResolutions(manifest, { vue: '3.6.0-rc.6' }))

    expect(merged.resolutions).toEqual({
      'vitest': '3.2.6',
      '@vitest/browser': '3.2.6',
      'vue': '3.6.0-rc.6',
    })
  })

  it('leaves every other field of the manifest alone', () => {
    const manifest = JSON.stringify({
      name: 'dzup-ui',
      packageManager: 'yarn@4.16.0',
      engines: { node: '^20.19.0 || >=22.13.0' },
      scripts: { test: 'vitest run' },
    }, null, 2)

    const merged = JSON.parse(applyResolutions(manifest, { vue: '3.6.0-rc.6' }))

    expect(merged.name).toBe('dzup-ui')
    expect(merged.packageManager).toBe('yarn@4.16.0')
    expect(merged.engines).toEqual({ node: '^20.19.0 || >=22.13.0' })
    expect(merged.scripts).toEqual({ test: 'vitest run' })
  })

  it('adds a resolutions block to a manifest that has none', () => {
    const merged = JSON.parse(applyResolutions('{\n  "name": "x"\n}\n', { vue: '3.6.0-rc.6' }))

    expect(merged.resolutions).toEqual({ vue: '3.6.0-rc.6' })
  })

  it('ends with a newline, the way yarn writes package.json', () => {
    // Not cosmetic. `yarn install` rewrites package.json with a trailing
    // newline; producing one without it means the restore diff is never empty
    // and the workflow's `git diff --exit-code` step fails on formatting.
    expect(applyResolutions('{"name":"x"}', { vue: '3.6.0' }).endsWith('\n')).toBe(true)
  })
})
