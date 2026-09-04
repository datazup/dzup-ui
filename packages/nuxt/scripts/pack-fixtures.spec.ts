/**
 * Unit cover for the fixture staging decisions (TASK-N5-03).
 *
 * The rest of `pack-fixtures.mjs` packs tarballs and writes to a stage
 * directory, which is what the fixture suite itself exercises. These two
 * functions are different: they are the pure decisions the staging makes
 * before anything is written, and both of them fail silently when wrong.
 *
 * appDirLayout deciding wrong does not throw — it puts `app.vue` in the
 * directory Nuxt is not reading, Nuxt renders an app with no root component,
 * and six fixtures fail with `expected '' to contain data-testid=…`. That
 * failure is indistinguishable from a broken Nuxt module, which is exactly why
 * it is worth pinning here rather than rediscovering it from a red suite.
 */

import { afterEach, describe, expect, it } from 'vitest'
import { appDirLayout, applyNuxtOverride, nuxtOverride } from './pack-fixtures.mjs'

const ORIGINAL = process.env.DZUP_FIXTURE_NUXT

afterEach(() => {
  if (ORIGINAL === undefined)
    delete process.env.DZUP_FIXTURE_NUXT
  else
    process.env.DZUP_FIXTURE_NUXT = ORIGINAL
})

describe('appDirLayout', () => {
  it('puts the app under app/ for Nuxt 4 and above', () => {
    // Nuxt 4 changed the default srcDir from `.` to `app/`.
    for (const range of ['4.4.5', '^4.0.0', '~4.2.1', '4', '>=4.0.0', '5.0.0'])
      expect(appDirLayout(range), `${range} should use the app/ layout`).toBe(true)
  })

  it('keeps the root layout for Nuxt 3', () => {
    for (const range of ['^3.19.0', '3.14.0', '~3.19', '>=3.0.0', '3'])
      expect(appDirLayout(range), `${range} should use the root layout`).toBe(false)
  })

  it('falls back to the Nuxt 3 layout for anything it cannot read', () => {
    // Conservative on purpose. Every checked-in template declares Nuxt 3, so
    // an unreadable range guessed as "probably 4" would relocate a fixture's
    // only component and produce six assertion failures that name the module.
    for (const range of [undefined, null, '', 'latest', 'workspace:*', 42, {}])
      expect(appDirLayout(range as string)).toBe(false)
  })
})

describe('nuxtOverride', () => {
  it('is undefined when the variable is unset or empty', () => {
    delete process.env.DZUP_FIXTURE_NUXT
    expect(nuxtOverride()).toBeUndefined()

    process.env.DZUP_FIXTURE_NUXT = ''
    expect(nuxtOverride()).toBeUndefined()
  })

  it('returns the range when it is set', () => {
    process.env.DZUP_FIXTURE_NUXT = '4.4.5'
    expect(nuxtOverride()).toBe('4.4.5')
  })
})

describe('applyNuxtOverride', () => {
  const template = `${JSON.stringify({
    name: '@dzup-ui-fixture/core-only',
    dependencies: { 'nuxt': '^3.19.0', 'vue': '^3.5.13', '@dzup-ui/core': 'file:../core.tgz' },
    overrides: { '@dzup-ui/contracts': 'file:../contracts.tgz' },
  }, null, 2)}\n`

  it('is a no-op with no override, byte for byte', () => {
    // The default lane has to be exactly what it was before this option
    // existed. A reformat here would show up as a spurious diff in every
    // staged package.json and make the override look like it changed more
    // than the nuxt range.
    expect(applyNuxtOverride(template, undefined)).toBe(template)
  })

  it('replaces only the nuxt range', () => {
    const out = JSON.parse(applyNuxtOverride(template, '4.4.5'))

    expect(out.dependencies.nuxt).toBe('4.4.5')
    expect(out.dependencies.vue).toBe('^3.5.13')
    expect(out.dependencies['@dzup-ui/core']).toBe('file:../core.tgz')
    expect(out.overrides).toEqual({ '@dzup-ui/contracts': 'file:../contracts.tgz' })
  })

  it('leaves a template that declares no nuxt dependency alone', () => {
    // Not hypothetical protection: reporting such a fixture as "built against
    // 4.4.5" when nothing installed 4.4.5 is precisely the coverage claim the
    // per-fixture `nuxt` field exists to prevent.
    const noNuxt = `${JSON.stringify({ name: 'x', dependencies: { vue: '^3.5.13' } }, null, 2)}\n`

    expect(applyNuxtOverride(noNuxt, '4.4.5')).toBe(noNuxt)
  })
})
