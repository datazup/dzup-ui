/**
 * validate-exports — the manifest is an authority in BOTH directions
 * (UI-DZUP-UI-ARCH-M-06).
 *
 * Before: only manifest → source was checked, and a file containing any
 * `export *` passed every declared name unseen; an export added to a family
 * barrel without a manifest entry failed nothing.
 */

import type { ManifestExports } from './validate-exports.ts'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkBarrel } from '../src/manifest-generator.ts'
import { validateBarrelCoverage, validateCategory, validateCategorySubpaths } from './validate-exports.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

function manifestExports(partial: Partial<ManifestExports>): ManifestExports {
  return { components: {}, composables: {}, utilities: {}, ...partial }
}

describe('validate-exports against a fixture package', () => {
  let dir: string

  const write = (rel: string, content: string): void => {
    const file = join(dir, rel)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, content)
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'validate-exports-'))
    write('src/index.ts', `export * from './components/fam/index.ts'\n`)
    write('src/components/fam/index.ts', `export * from './impl.ts'\nexport { default as DzThing } from './DzThing.vue'\n`)
    write('src/components/fam/impl.ts', `export const listed = 1\nexport type ListedType = string\n`)
    write('src/components/fam/DzThing.vue', `<template><div /></template>\n`)
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  const listedEverything = manifestExports({
    components: { fam: { path: './src/components/fam/index.ts', exports: ['DzThing', 'listed'] } },
    types: ['ListedType'],
  })

  it('passes when every reachable export is listed', () => {
    expect(validateBarrelCoverage('@fixture/pkg', join(dir, 'src/index.ts'), listedEverything)).toEqual([])
  })

  it('fails on an export added to a family barrel without a manifest entry', () => {
    write('src/components/fam/impl.ts', `export const listed = 1\nexport type ListedType = string\nexport const sneaky = 2\n`)

    const errors = validateBarrelCoverage('@fixture/pkg', join(dir, 'src/index.ts'), listedEverything)

    expect(errors.map(e => e.entry)).toEqual(['sneaky'])
    expect(errors[0]?.category).toBe('barrel')
  })

  it('fails on a star re-export it cannot resolve', () => {
    write('src/index.ts', `export * from './components/fam/index.ts'\nexport * from './missing.ts'\n`)

    const errors = validateBarrelCoverage('@fixture/pkg', join(dir, 'src/index.ts'), listedEverything)

    expect(errors.some(e => e.message.includes('cannot be resolved'))).toBe(true)
  })

  it('follows `export *` when checking declared names instead of trusting it', () => {
    const errors = validateCategory('@fixture/pkg', dir, 'components', {
      fam: { path: './src/components/fam/index.ts', exports: ['DzThing', 'listed', 'neverExported'] },
    })

    expect(errors.map(e => e.message)).toEqual([
      expect.stringContaining('"neverExported" declared in manifest but not found'),
    ])
  })

  describe('category subpaths (UI-DZUP-UI-ARCH-M-03)', () => {
    const SUBPATHS = [{ subpath: './composables', barrel: 'src/composables/index.ts', category: 'composables', pathPrefix: './src/composables/' }] as const
    const me = manifestExports({
      composables: { useA: { path: './src/composables/useA/index.ts', exports: ['useA'] } },
      types: ['UseAReturn'],
    })

    beforeEach(() => {
      write('src/index.ts', `export * from './composables/index.ts'\n`)
      write('src/composables/index.ts', `export * from './useA/index.ts'\n`)
      write('src/composables/useA/index.ts', `export const useA = 1\nexport type UseAReturn = number\n`)
      write('package.json', JSON.stringify({ exports: { './composables': { types: './dist/composables/index.d.ts', import: './dist/composables/index.js' } } }))
    })

    it('passes when the barrel carries its entries and their listed types', () => {
      expect(validateCategorySubpaths('@fixture/pkg', dir, me, SUBPATHS)).toEqual([])
    })

    it('fails when a manifest entry is missing from the subpath', () => {
      write('src/composables/index.ts', `export {}\n`)
      const errors = validateCategorySubpaths('@fixture/pkg', dir, me, SUBPATHS)
      expect(errors.map(e => e.entry)).toEqual(['useA'])
    })

    it('fails when the subpath publishes something the manifest does not list', () => {
      write('src/composables/useA/index.ts', `export const useA = 1\nexport type UseAReturn = number\nexport const sneaky = 2\n`)
      const errors = validateCategorySubpaths('@fixture/pkg', dir, me, SUBPATHS)
      expect(errors.map(e => e.entry)).toEqual(['sneaky'])
    })

    it('fails when the exports map does not ship the subpath', () => {
      write('package.json', JSON.stringify({ exports: {} }))
      const errors = validateCategorySubpaths('@fixture/pkg', dir, me, SUBPATHS)
      expect(errors.map(e => e.entry)).toEqual(['./composables'])
    })
  })
})

describe('the real @dzup-ui/core package', () => {
  it('lists every symbol reachable from src/index.ts in public-api.manifest.json', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, 'packages/core/manifests/public-api.manifest.json'), 'utf8'),
    ) as { exports: ManifestExports }

    const errors = validateBarrelCoverage('@dzup-ui/core', resolve(ROOT, 'packages/core/src/index.ts'), manifest.exports)

    expect(errors.map(e => e.message)).toEqual([])
  })

  it('ships ./composables and ./utilities carrying their manifest entries (UI-DZUP-UI-ARCH-M-03)', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, 'packages/core/manifests/public-api.manifest.json'), 'utf8'),
    ) as { exports: ManifestExports }

    const errors = validateCategorySubpaths('@dzup-ui/core', resolve(ROOT, 'packages/core'), manifest.exports)

    expect(errors.map(e => e.message)).toEqual([])
  })

  it('generate:exports:core checks the hand-maintained barrel and writes nothing', () => {
    const indexPath = resolve(ROOT, 'packages/core/src/index.ts')
    const before = readFileSync(indexPath, 'utf8')

    const result = checkBarrel(resolve(ROOT, 'packages/core'))

    expect(result.onlyInBarrel).toEqual([])
    expect(result.onlyInManifest).toEqual([])
    expect(readFileSync(indexPath, 'utf8')).toBe(before)
    expect(before).toContain('MAINTAINED BY HAND')
  })
})
