/**
 * Unit tests for the shadcn-registry gate (TASK-R1-O5).
 *
 * The centre of this file is `runSeeds()`, the same seeded-failure run the CLI
 * exposes as `--self-test`: one deliberate defect per hard clause, applied to a
 * deep copy of the **real** registry, asserting that the clause — and that
 * clause — turns red. A gate nobody has watched fail is a gate nobody knows
 * works, and this repository has the receipts: `validate:capability-matrix`
 * reported green over a stale artifact for three packets (S1-F10).
 */

import { describe, expect, it } from 'vitest'
import {
  ALLOWED_ITEM_TYPES,
  checkAllRegistries,
  checkThemeItem,
  cssKeys,
  DZUP_DARK_SELECTOR,
  DZUP_TOKEN_LAYER,
  EXPECTED_REGISTRIES,
  findRegistryIndexes,
  loadAllRegistries,
  NON_ITEM_PAYLOADS,
  publishedPackages,
  runSeeds,
  SEEDS,
} from './registry.ts'

describe('the committed registries', () => {
  const { registries, violations } = loadAllRegistries()

  it('finds every registry the repository declares', () => {
    expect(registries).toHaveLength(EXPECTED_REGISTRIES.size)
    expect(violations.filter(v => v.level === 'error')).toEqual([])
  })

  it('is green at HEAD', () => {
    const errors = checkAllRegistries().filter(v => v.level === 'error')
    expect(errors.map(e => `[${e.rule}] ${e.message}`)).toEqual([])
  })

  it('publishes only known item types', () => {
    for (const reg of registries) {
      for (const [file, item] of reg.payloads) {
        // Declared non-item payloads (component-meta.json, copied by every
        // build:registry) are exempt here exactly as the validator exempts them.
        if (NON_ITEM_PAYLOADS.has(file))
          continue
        expect(ALLOWED_ITEM_TYPES.has(item.type ?? ''), `${reg.indexPath} ${file}`).toBe(true)
      }
    }
  })

  it('depends only on packages the release policy publishes', () => {
    const published = publishedPackages()
    expect(published.size).toBeGreaterThan(0)
    for (const reg of registries) {
      for (const item of reg.payloads.values()) {
        for (const dep of item.dependencies ?? []) {
          if (dep.startsWith('@dzup-ui/'))
            expect(published.has(dep), dep).toBe(true)
        }
      }
    }
  })

  it('names @dzup-ui-pro nowhere — A4-F5, a source copy is irrevocable', () => {
    for (const reg of registries) {
      for (const [file, item] of reg.payloads)
        expect(JSON.stringify(item).includes('@dzup-ui-pro'), `${reg.indexPath} ${file}`).toBe(false)
    }
  })
})

describe('the seeded failures', () => {
  const results = runSeeds()

  it('covers every hard clause the gate has', () => {
    expect(results).toHaveLength(SEEDS.length)
    expect(new Set(results.map(r => r.rule))).toEqual(new Set(SEEDS.map(s => s.rule)))
  })

  it.each(SEEDS.map(s => s.name))('catches: %s', (name) => {
    const result = results.find(r => r.seed === name)!
    expect(result.caught, `fired instead: ${result.firedRules.join(', ')}`).toBe(true)
  })
})

describe('the theme clause (A4-F4)', () => {
  const healthy = {
    name: 'tokens',
    type: 'registry:theme',
    cssVars: { light: { 'dz-background': '#fff' }, dark: { 'dz-background': '#000' } },
    css: { [`@layer ${DZUP_TOKEN_LAYER}`]: { [DZUP_DARK_SELECTOR]: { '--dz-background': '#000' } } },
  }

  it('passes a theme with both schemes, the alias and the layer', () => {
    expect(checkThemeItem('tokens.json', healthy)).toEqual([])
  })

  it('fails a theme with one colour scheme', () => {
    const v = checkThemeItem('tokens.json', { ...healthy, cssVars: { light: { a: 'b' }, dark: {} } })
    expect(v.map(x => x.rule)).toEqual(['theme'])
    expect(v[0]!.message).toContain('cssVars.dark')
  })

  it('fails a theme whose dark scheme only shadcn can activate', () => {
    // 673 + 123 cssVars installed and not one selector dzup-ui's runtime
    // toggles — the measured state of A4-F4.
    const v = checkThemeItem('tokens.json', { ...healthy, css: { '.dark': { '--dz-background': '#000' } } })
    expect(v.map(x => x.rule)).toEqual(['theme', 'theme'])
  })

  it('reads selector KEYS, not a stringified blob', () => {
    // The first version of this clause tested
    // `JSON.stringify(css).includes('[data-theme="dark"]')` and stayed red
    // against a correct item, because serialisation had already turned the
    // selector's quotes into `\"`.
    expect(cssKeys(healthy.css)).toContain(DZUP_DARK_SELECTOR)
    expect(JSON.stringify(healthy.css)).not.toContain(DZUP_DARK_SELECTOR)
  })
})

describe('registry discovery', () => {
  it('declares the registries rather than only walking for them', () => {
    // Discovery cannot see an absence: `build:registry` wipes public/r/ before
    // it writes and the animations registry is written by a second script, so
    // running one alone deletes 60 files and a walking gate reports two healthy
    // registries (TASK-R1-O5 F-2).
    const found = findRegistryIndexes().map(p => p.replace(/\\/g, '/'))
    for (const expected of EXPECTED_REGISTRIES.keys())
      expect(found.some(f => f.endsWith(`public/r/${expected}`)), expected).toBe(true)
  })

  it('fails when a declared registry is gone', () => {
    const { violations } = loadAllRegistries('apps/landing/public/r-does-not-exist')
    expect(violations.filter(v => v.rule === 'index').length)
      .toBeGreaterThanOrEqual(EXPECTED_REGISTRIES.size)
  })
})
