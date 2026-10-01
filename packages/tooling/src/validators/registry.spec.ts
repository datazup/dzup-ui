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
  installabilityViolations,
  loadAllRegistries,
  publishedPackages,
  readNpmResolution,
  resolutionLedger,
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
      for (const [file, item] of reg.payloads)
        expect(ALLOWED_ITEM_TYPES.has(item.type ?? ''), `${reg.indexPath} ${file}`).toBe(true)
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

describe('the resolution ledger (TASK-S2-O3)', () => {
  it('counts one row per (index, name), not per name — three names are shared across indexes', () => {
    const { registries } = loadAllRegistries()
    const listedTotal = registries.reduce((n, r) => n + (r.index.items?.length ?? 0), 0)
    const ledger = resolutionLedger(registries, checkAllRegistries(), undefined)

    // The first version keyed by name alone and returned 188 of 191, which reads as
    // "three items are unresolved" while measuring nothing of the kind.
    expect(ledger.filesResolved).toBe(listedTotal)
    expect(ledger.filesUnresolved).toBe(0)
  })

  it('reports tier 3 as ZERO when no npm-resolution probe exists — unknown is never resolved', () => {
    const { registries } = loadAllRegistries()
    const ledger = resolutionLedger(registries, checkAllRegistries(), undefined)

    expect(ledger.installable).toBe(0)
    expect(ledger.depsServed).toEqual([])
    expect(ledger.depsUnserved).toEqual(ledger.deps)
    expect(ledger.installableReason).toMatch(/CANNOT TELL/)
  })

  it('names the dependencies the whole surface rests on', () => {
    const { registries } = loadAllRegistries()
    const ledger = resolutionLedger(registries, checkAllRegistries(), undefined)

    expect(ledger.deps).toContain('@dzup-ui/core')
    expect(ledger.deps).toContain('@dzup-ui/tokens')
  })

  it('seeded defect: a probe recording a 404 keeps tier 3 at zero and says which dep', () => {
    const { registries } = loadAllRegistries()
    const ledger = resolutionLedger(registries, checkAllRegistries(), {
      path: 'docs/qa/release/seeded/npm-resolution.json',
      registry: 'https://registry.npmjs.org',
      packages: { '@dzup-ui/core': '0.2.0', '@dzup-ui/tokens': null },
    })

    expect(ledger.depsServed).toEqual(['@dzup-ui/core'])
    expect(ledger.depsUnserved).toEqual(['@dzup-ui/tokens'])
    expect(ledger.installable).toBe(0)
    expect(ledger.installableReason).toContain('@dzup-ui/tokens')
  })

  it('reaches tier 3 = tier 1 only when EVERY dep is served — no partial credit', () => {
    const { registries } = loadAllRegistries()
    const listedTotal = registries.reduce((n, r) => n + (r.index.items?.length ?? 0), 0)
    const ledger = resolutionLedger(registries, checkAllRegistries(), {
      path: 'docs/qa/release/seeded/npm-resolution.json',
      registry: 'https://registry.npmjs.org',
      packages: { '@dzup-ui/core': '0.2.0', '@dzup-ui/tokens': '0.2.0' },
    })

    expect(ledger.installable).toBe(listedTotal)
    expect(ledger.depsUnserved).toEqual([])
  })

  it('ignores a probe that names a version as an empty string — that is not a resolution', () => {
    const { registries } = loadAllRegistries()
    const ledger = resolutionLedger(registries, checkAllRegistries(), {
      packages: { '@dzup-ui/core': '', '@dzup-ui/tokens': '0.2.0' },
    })

    expect(ledger.depsUnserved).toContain('@dzup-ui/core')
    expect(ledger.installable).toBe(0)
  })
})

describe('installabilityViolations — the fail-closed clause', () => {
  const ledgerOf = (installable: number, listed: number) => ({
    listed,
    filesResolved: listed,
    filesUnresolved: 0,
    depsDeclared: listed,
    depsUndeclared: 0,
    deps: ['@dzup-ui/core'],
    depsServed: installable > 0 ? ['@dzup-ui/core'] : [],
    depsUnserved: installable > 0 ? [] : ['@dzup-ui/core'],
    installable,
    installableReason: 'seeded',
  })

  it('is REPORT-level by default, so validate:all link 40 keeps measuring correctness', () => {
    const v = installabilityViolations(ledgerOf(0, 191), false)
    expect(v).toHaveLength(1)
    expect(v[0]!.level).toBe('report')
    expect(v[0]!.rule).toBe('resolution')
  })

  it('is ERROR-level under --require-installable, which the deploy lane passes', () => {
    const v = installabilityViolations(ledgerOf(0, 191), true)
    expect(v).toHaveLength(1)
    expect(v[0]!.level).toBe('error')
    expect(v[0]!.message).toMatch(/deploy-runbook/)
  })

  it('is silent once every item is installable — the gate is not a permanent red', () => {
    expect(installabilityViolations(ledgerOf(191, 191), true)).toEqual([])
  })

  it('states the count before the excuse', () => {
    const v = installabilityViolations(ledgerOf(0, 191), true)
    expect(v[0]!.message.startsWith('0 of 191 listed items are installable')).toBe(true)
  })
})

describe('readNpmResolution', () => {
  it('returns undefined when nobody has probed — it never performs the probe itself', () => {
    // No npm-resolution.json is committed at 4e4e46f. This gate touches no network
    // by construction and an agent may not manufacture the record: it is evidence
    // of an owner action (A4-D1).
    expect(readNpmResolution()).toBeUndefined()
  })

  it('returns undefined for a directory that does not exist', () => {
    expect(readNpmResolution('docs/qa/release-does-not-exist')).toBeUndefined()
  })
})
