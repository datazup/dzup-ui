import type { DzupUiModuleOptions } from './module.ts'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * `includePro` against a second tier that publishes a conforming ownership
 * manifest (TASK-S3-O1).
 *
 * Until this packet, `includePro` could only ever reach a failure branch: the
 * tier could arrive one way — baked into `@dzup-ui/core`'s generated table at
 * the time THIS library was built — and nothing could produce the manifest that
 * required, because the schema it would conform to had never been published.
 * With the schema in `@dzup-ui/contracts`, the tier also arrives the way that
 * actually matters: from the package the consumer installed, read at their
 * build.
 *
 * So this file proves the success path with **nothing installed**, from the
 * synthetic fixture manifest in `packages/core/test/fixtures/`. One fixture
 * serves both consumers on purpose — if the resolver and this module were
 * tested against two different fake manifests, the two could drift apart and
 * both suites would stay green, which is the original defect one level up.
 *
 * The ownership table is mocked; **resolution is not**. A real package
 * directory is written under a temp root, for the reason `module.pro.spec.ts`
 * records: the thing most likely to break is Node's resolution base, and a
 * mocked `createRequire` agrees with that bug.
 */

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURE_MANIFEST = resolve(HERE, '../../core/test/fixtures/second-tier-ownership.manifest.json')

const PRO_PACKAGE = '@dzup-ui-pro/pro'
const CORE_PACKAGE = '@dzup-ui/core'

const mocks = vi.hoisted(() => ({
  addComponent: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}))

vi.mock('@nuxt/kit', () => ({
  defineNuxtModule: (definition: unknown) => definition,
  addComponent: mocks.addComponent,
  useLogger: () => ({ error: mocks.error, warn: mocks.warn, info: vi.fn(), debug: vi.fn() }),
}))

// A first tier of two names, one of which the fixture deliberately collides
// with. Core-only on purpose: this file tests the route that does NOT depend on
// a build-time merge.
vi.mock('@dzup-ui/core/ownership', () => ({
  OWNERSHIP_TIERS: ['core'] as const,
  COMPONENT_OWNERSHIP: {
    DzButton: { from: '@dzup-ui/core', kind: 'public-component' },
    DzCardBody: { from: '@dzup-ui/core', kind: 'compound-part' },
  },
}))

const { componentsToRegister, loadSecondTierOwnership, secondTierMissingMessage } = await import('./module.ts')
const moduleDefinition = (await import('./module.ts')).default as unknown as {
  setup: (options: DzupUiModuleOptions, nuxt: FakeNuxt) => void
}

interface FakeNuxt {
  options: {
    rootDir: string
    css: string[]
    build: { transpile: string[] }
    app: { head: { script?: { innerHTML: string, type: string }[] } }
  }
}

const roots: string[] = []

function fixtureManifest(): Record<string, unknown> {
  return JSON.parse(readFileSync(FIXTURE_MANIFEST, 'utf8')) as Record<string, unknown>
}

/** A project whose `node_modules` holds a fake, ESM-only second-tier package. */
function projectWithSecondTier(manifest?: unknown): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-nuxt-second-tier-'))
  roots.push(root)

  const pkgDir = join(root, 'node_modules/@dzup-ui-pro/pro')
  mkdirSync(join(pkgDir, 'manifests'), { recursive: true })

  const exports: Record<string, unknown> = {
    '.': { import: './index.js' },
    './package.json': './package.json',
  }
  if (manifest !== undefined) {
    exports['./manifests/component-ownership.manifest.json']
      = './manifests/component-ownership.manifest.json'
    writeFileSync(
      join(pkgDir, 'manifests/component-ownership.manifest.json'),
      JSON.stringify(manifest, null, 2),
    )
  }

  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify({
    name: PRO_PACKAGE,
    version: '0.0.0-fixture',
    type: 'module',
    exports,
  }))
  writeFileSync(join(pkgDir, 'index.js'), 'export {}\n')
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'fixture-app', private: true }))

  return root
}

function projectWithoutSecondTier(): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-nuxt-no-second-tier-'))
  roots.push(root)
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'bare-app', private: true }))
  return root
}

function fakeNuxt(rootDir: string): FakeNuxt {
  return {
    options: {
      rootDir,
      css: [],
      build: { transpile: [] },
      app: { head: {} },
    },
  }
}

function runSetup(options: DzupUiModuleOptions, rootDir: string): FakeNuxt {
  const nuxt = fakeNuxt(rootDir)
  moduleDefinition.setup(options, nuxt)
  return nuxt
}

function registrations(): { name: string, export: string, filePath: string }[] {
  return mocks.addComponent.mock.calls.map(call => call[0] as { name: string, export: string, filePath: string })
}

beforeEach(() => {
  mocks.addComponent.mockClear()
  mocks.error.mockClear()
  mocks.warn.mockClear()
})

afterAll(() => {
  for (const root of roots)
    rmSync(root, { recursive: true, force: true })
})

describe('case 1 — a conforming manifest is consumed', () => {
  it('registers the second tier\'s mountable components', () => {
    runSetup({ includePro: true }, projectWithSecondTier(fixtureManifest()))

    const exports = registrations().map(entry => entry.export)
    expect(exports).toContain('DzFixtureGizmo')
    expect(exports).toContain('DzFixtureGizmoPanel')
    expect(exports).toContain('DzFixtureRetiredWidget')
  })

  it('registers nothing that is not mountable', () => {
    runSetup({ includePro: true }, projectWithSecondTier(fixtureManifest()))

    const exports = registrations().map(entry => entry.export)
    expect(exports).not.toContain('DzFixtureGizmoProps')
    expect(exports).not.toContain('useFixtureGizmo')
  })

  it('imports each name from the subpath the manifest declares', () => {
    // The generated first-tier table can only ever say "the package". The
    // published schema carries `subpath`, so a second tier can route a part to
    // a narrower entry point — and a consumer's bundle need not pull the whole
    // barrel to get one component.
    runSetup({ includePro: true }, projectWithSecondTier(fixtureManifest()))

    const byExport = new Map(registrations().map(entry => [entry.export, entry.filePath]))
    expect(byExport.get('DzFixtureGizmo')).toBe(PRO_PACKAGE)
    expect(byExport.get('DzFixtureGizmoPanel')).toBe(`${PRO_PACKAGE}/gizmos`)
    expect(byExport.get('DzButton')).toBe(CORE_PACKAGE)
  })

  it('transpiles the second-tier package alongside Core and tokens', () => {
    const nuxt = runSetup({ includePro: true }, projectWithSecondTier(fixtureManifest()))
    expect(nuxt.options.build.transpile).toEqual([CORE_PACKAGE, '@dzup-ui/tokens', PRO_PACKAGE])
  })

  it('reports no error when the manifest loads', () => {
    runSetup({ includePro: true }, projectWithSecondTier(fixtureManifest()))
    expect(mocks.error).not.toHaveBeenCalled()
  })

  it('registers nothing from the second tier when the option is off', () => {
    const nuxt = runSetup({}, projectWithSecondTier(fixtureManifest()))

    expect(registrations().map(entry => entry.export).sort()).toEqual(['DzButton', 'DzCardBody'])
    expect(nuxt.options.build.transpile).not.toContain(PRO_PACKAGE)
  })
})

describe('case 2 — a custom prefix reaches the second tier', () => {
  it('renames second-tier tags on the same rule as first-tier ones', () => {
    runSetup({ includePro: true, prefix: 'Acme' }, projectWithSecondTier(fixtureManifest()))

    const names = registrations().map(entry => entry.name)
    expect(names).toContain('AcmeFixtureGizmo')
    expect(names).toContain('AcmeButton')
  })
})

describe('case 3 — a name both tiers claim', () => {
  it('keeps the first-tier answer and names both packages', () => {
    runSetup({ includePro: true }, projectWithSecondTier(fixtureManifest()))

    const button = registrations().filter(entry => entry.export === 'DzButton')
    expect(button, 'one registration, not two').toHaveLength(1)
    expect(button[0]?.filePath).toBe(CORE_PACKAGE)

    const message = mocks.warn.mock.calls.map(call => String(call[0])).find(text => text.includes('DzButton'))
    expect(message, 'a collision must never be silent').toBeDefined()
    expect(message).toContain(CORE_PACKAGE)
    expect(message).toContain(PRO_PACKAGE)
    expect(message).toContain('never picks a winner')
  })
})

describe('case 4 — a name neither tier owns', () => {
  it('registers nothing for it', () => {
    runSetup({ includePro: true }, projectWithSecondTier(fixtureManifest()))

    const exports = registrations().map(entry => entry.export)
    expect(exports).not.toContain('DzNotAComponentAnywhere')
    expect(exports).not.toContain('DzFixtureGizmoo')
  })
})

describe('case 5 — the second tier is absent', () => {
  it('reports the missing package once and registers Core anyway', () => {
    const nuxt = runSetup({ includePro: true }, projectWithoutSecondTier())

    expect(mocks.error).toHaveBeenCalledTimes(1)
    expect(String(mocks.error.mock.calls[0]?.[0])).toContain('cannot be resolved')
    expect(registrations().map(entry => entry.export).sort()).toEqual(['DzButton', 'DzCardBody'])
    expect(nuxt.options.build.transpile).not.toContain(PRO_PACKAGE)
  })

  it('reports the manifest gap, not the install, when the package is there', () => {
    // Two failures with two different owners. Telling a consumer who HAS
    // installed the package to install it is the R4a defect wearing a new hat.
    const nuxt = runSetup({ includePro: true }, projectWithSecondTier(undefined))

    expect(mocks.error).toHaveBeenCalledTimes(1)
    const message = String(mocks.error.mock.calls[0]?.[0])
    expect(message).toContain('no conforming ownership manifest was resolvable')
    expect(message).toContain('./manifests/component-ownership.manifest.json')
    expect(message).toContain('packaging gap in that package')
    expect(message).toContain('dzupUi.includePro to false')
    expect(nuxt.options.build.transpile).not.toContain(PRO_PACKAGE)
  })
})

describe('fail-closed rules', () => {
  it('refuses a manifest whose schema major this build does not implement', () => {
    runSetup({ includePro: true }, projectWithSecondTier({ ...fixtureManifest(), schemaVersion: '2.0.0' }))

    expect(registrations().map(entry => entry.export)).not.toContain('DzFixtureGizmo')
    const message = String(mocks.error.mock.calls[0]?.[0])
    expect(message).toContain('does not conform')
    expect(message).toContain('2.0.0')
  })

  it('does not fail the build when the manifest is not JSON', () => {
    const root = projectWithSecondTier(fixtureManifest())
    writeFileSync(
      join(root, 'node_modules/@dzup-ui-pro/pro/manifests/component-ownership.manifest.json'),
      '{ not json at all',
    )

    expect(() => runSetup({ includePro: true }, root)).not.toThrow()
    expect(String(mocks.error.mock.calls[0]?.[0])).toContain('could not be read as JSON')
    expect(registrations().map(entry => entry.export)).toContain('DzButton')
  })
})

describe('loadSecondTierOwnership', () => {
  it('resolves from this module when no project root is given', () => {
    // No argument resolves from this module, so the answer must agree with
    // the explicit form anchored on this directory. Which answer that is
    // depends on the host — the workspace this repository lives in links
    // `@dzup-ui-pro/pro` into an ancestor `node_modules`, CI has none — so the
    // value itself is not asserted; `not-installed` is pinned below against an
    // arranged root instead.
    expect(loadSecondTierOwnership().availability).toBe(loadSecondTierOwnership(HERE).availability)
  })

  it('answers not-installed from a root with no second tier reachable', () => {
    const root = mkdtempSync(join(tmpdir(), 'dzup-nuxt-no-second-tier-'))
    try {
      expect(loadSecondTierOwnership(root).availability).toBe('not-installed')
    }
    finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('answers loaded against the fixture package', () => {
    const load = loadSecondTierOwnership(projectWithSecondTier(fixtureManifest()))
    expect(load.availability).toBe('loaded')
    expect(load.schemaVersion).toBe('1.1.0')
  })

  it('refuses to build a "missing" message for a manifest that loaded', () => {
    // A guard against the worst possible regression here: a diagnostic that
    // says a tier is missing while its components are being registered.
    const load = loadSecondTierOwnership(projectWithSecondTier(fixtureManifest()))
    expect(() => secondTierMissingMessage(load)).toThrow(/loaded/)
  })
})

describe('componentsToRegister with a second tier', () => {
  it('stays sorted across both tiers', () => {
    const load = loadSecondTierOwnership(projectWithSecondTier(fixtureManifest()))
    const names = componentsToRegister(true, load.symbols).map(entry => entry.name)
    expect(names).toEqual([...names].sort())
  })

  it('ignores the second tier entirely when Pro is off', () => {
    const load = loadSecondTierOwnership(projectWithSecondTier(fixtureManifest()))
    expect(componentsToRegister(false, load.symbols).map(entry => entry.name))
      .toEqual(['DzButton', 'DzCardBody'])
  })

  it('defaults to no second tier, so an old call site is unchanged', () => {
    expect(componentsToRegister(true).map(entry => entry.name)).toEqual(['DzButton', 'DzCardBody'])
  })
})
