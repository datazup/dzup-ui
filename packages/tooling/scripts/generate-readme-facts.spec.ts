import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  applyRegions,
  collectCatalog,
  collectFamilies,
  collectPackages,
  generateFacts,
  renderRegions,
} from './generate-readme-facts.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../')

describe('collectPackages', () => {
  const packages = collectPackages()

  it('reads the version from each package.json rather than from prose', () => {
    const core = packages.find(p => p.name === '@dzup-ui/core')
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, 'packages/core/package.json'), 'utf8'),
    ) as { version: string }
    expect(core?.version).toBe(manifest.version)
  })

  it('includes every publishable package', () => {
    // The hand-typed table omitted @dzup-ui/mcp and @dzup-ui/testing, both of
    // which publish.
    const names = packages.map(p => p.name)
    expect(names).toContain('@dzup-ui/mcp')
    expect(names).toContain('@dzup-ui/testing')
  })

  it('excludes private packages, which nobody can install', () => {
    expect(packages.map(p => p.name)).not.toContain('@dzup-ui/tooling')
  })

  it('is sorted, so the table cannot reorder between runs', () => {
    expect(packages.map(p => p.name)).toEqual([...packages.map(p => p.name)].sort())
  })
})

describe('collectCatalog', () => {
  const catalog = collectCatalog()

  it('counts public components and compound parts separately', () => {
    // A glob over `.vue` would count `DzCardBody` as a component in its own
    // right; the ownership manifest already knows it is a part.
    expect(catalog.publicComponents).toBeGreaterThan(0)
    expect(catalog.compoundParts).toBeGreaterThan(0)
  })

  it('counts one family per component directory', () => {
    expect(catalog.families).toEqual(collectFamilies())
    expect(catalog.families).toContain('buttons')
  })

  it('counts story files', () => {
    expect(catalog.stories).toBeGreaterThan(0)
  })
})

describe('applyRegions', () => {
  const regions = { packages: 'GENERATED' }

  it('replaces the body between the markers and keeps them', () => {
    const source = [
      '<!-- facts:packages:start -->',
      'stale content',
      '<!-- facts:packages:end -->',
    ].join('\n')

    const next = applyRegions(source, regions)
    expect(next).toContain('GENERATED')
    expect(next).not.toContain('stale content')
    expect(next).toContain('<!-- facts:packages:start -->')
    expect(next).toContain('<!-- facts:packages:end -->')
  })

  it('accepts the JSX comment form MDX requires', () => {
    const source = '{/* facts:packages:start */}\nold\n{/* facts:packages:end */}'
    expect(applyRegions(source, regions)).toContain('GENERATED')
  })

  it('leaves a document with no markers alone', () => {
    const source = '# A page with no generated facts'
    expect(applyRegions(source, regions)).toBe(source)
  })

  it('does not touch a differently-named region', () => {
    // The landing's build-counts.ts owns `claims:generated` in the same file.
    const source = '<!-- claims:generated:start -->\nproduct claims\n<!-- claims:generated:end -->'
    expect(applyRegions(source, regions)).toBe(source)
  })

  it('is idempotent', () => {
    const source = '<!-- facts:packages:start -->\nx\n<!-- facts:packages:end -->'
    const once = applyRegions(source, regions)
    expect(applyRegions(once, regions)).toBe(once)
  })
})

describe('the committed README', () => {
  it('is current', () => {
    const stale = generateFacts(false).filter(result => result.changed)
    expect(stale.map(r => r.file), 'run `yarn generate:readme-facts`').toEqual([])
  })

  it('states every package version from its package.json', () => {
    const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8')
    for (const pkg of collectPackages())
      expect(readme, pkg.name).toContain(`[\`${pkg.name}\`](${pkg.directory}) | ${pkg.version}`)
  })

  it('carries no hand-typed catalog count outside a generated region', () => {
    const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8')
    const regions = renderRegions()
    // Both count-bearing sentences live inside markers — one owned here, one by
    // the landing's build-counts.ts.
    expect(readme).toContain(regions.catalog)
    expect(readme).toContain('<!-- claims:generated:start -->')
  })
})
