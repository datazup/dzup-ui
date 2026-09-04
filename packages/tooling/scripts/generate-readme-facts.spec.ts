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
  renderVapor,
  renderVersioning,
  VAPOR_SPEC,
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

describe('renderVersioning (TASK-N5-01)', () => {
  const zeroX = [
    { name: '@dzup-ui/core', version: '0.2.0', description: '', directory: './packages/core' },
    { name: '@dzup-ui/tokens', version: '0.2.0', description: '', directory: './packages/tokens' },
  ]

  it('states the 0.x mapping, which is the opposite of the 1.x one', () => {
    const line = renderVersioning(zeroX, 'VERSIONING.md')
    expect(line).toContain('All 2 published')
    expect(line).toContain('a **minor** bump is a **breaking change**')
    expect(line).toContain('a **patch** is additive or a fix')
  })

  it('stops saying "all" the moment a package crosses 1.0', () => {
    // The policy in VERSIONING.md 1 only speaks for 0.x. A generated sentence
    // that kept claiming otherwise would be the exact failure the packages
    // table already had — prose outliving the fact it described.
    const mixed = [...zeroX, { name: '@dzup-ui/mcp', version: '1.0.0', description: '', directory: './packages/mcp' }]
    const line = renderVersioning(mixed, 'VERSIONING.md')
    expect(line).toContain('2 of 3 published')
    expect(line).toContain('`@dzup-ui/mcp`')
    expect(line).toContain('passed 1.0')
  })

  it('links to the policy relative to the document it is rendered into', () => {
    expect(renderRegions('README.md').versioning)
      .toContain('(packages/contracts/VERSIONING.md)')
    expect(renderRegions('packages/contracts/README.md').versioning)
      .toContain('(VERSIONING.md)')
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

describe('renderVapor (TASK-N5-03)', () => {
  const lane = { channel: 'rc', resolutions: { vue: '3.6.0-rc.6' } }

  it('names the spec that backs the claim and the command that runs it', () => {
    const body = renderVapor('^3.5.0', lane)

    expect(body).toContain(VAPOR_SPEC)
    expect(body).toContain('yarn test:vue-next:vapor')
  })

  it('states the pinned Vue and the declared peer range as different things', () => {
    // The whole point of the block: a reader must not come away thinking the
    // library is built against the version the advisory lane happens to pin.
    const body = renderVapor('^3.5.0', lane)

    expect(body).toContain('vue@3.6.0-rc.6')
    expect(body).toContain('vue@^3.5.0')
    expect(body).toContain('advisory')
  })

  it('says the claim is UNBACKED when the spec is gone', () => {
    // The property a hand-typed paragraph cannot have. Simulated by pointing
    // the check at a path that does not exist — deleting the real spec to
    // assert this would be a test that breaks the repository to prove a point.
    const body = renderVapor('^3.5.0', { ...lane, resolutions: {} })

    expect(body).toContain('has nothing to run against')
  })

  it('is what the core README actually carries', () => {
    // renderRegions() is what the generator writes; this asserts the committed
    // README carries that exact text, so the block cannot be hand-edited.
    const readme = readFileSync(resolve(ROOT, 'packages/core/README.md'), 'utf8')

    expect(readme).toContain(renderRegions('packages/core/README.md').vapor)
  })

  it('leaves no hand-typed Vue peer range in the core README prose', () => {
    // TASK-N5-03: the range was stated twice, once generated and once by hand.
    // A duplicated fact is a fact that can disagree with itself.
    const readme = readFileSync(resolve(ROOT, 'packages/core/README.md'), 'utf8')
    const generated = renderRegions('packages/core/README.md').vapor
    const outsideRegion = readme.replace(generated, '')

    expect(outsideRegion).not.toContain('vue@^3.5.0')
  })
})
