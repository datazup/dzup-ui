import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { COMPONENT_OWNERSHIP } from './generated/component-ownership.ts'
import { DzResolver } from './resolver.ts'

/**
 * The resolver's **second tier**, driven entirely by a synthetic fixture
 * (TASK-S3-O1).
 *
 * The whole point of this file is that it needs nothing installed. The seam had
 * been "blocked" for two programmes on an artifact no second-tier package could
 * produce, because this repository had never published the schema one would
 * conform to; with that schema published, the path is testable here, today,
 * against a manifest this repository wrote for itself.
 *
 * **Resolution is real, not mocked.** A package directory is written under a
 * temp root and `resolveFrom` points at it, because the thing most likely to
 * break is Node's resolution base, not this module's branching — and in
 * `@dzup-ui/nuxt` it *did* break, twice: once by resolving from a bare
 * directory (which searches the project's parent) and once by asking for a bare
 * package name against an ESM-only `exports` map. A mocked resolver would have
 * agreed with both bugs. The fixture package below is deliberately ESM-only for
 * that reason.
 *
 * Five cases, named by the task: resolve · prefix · collision · unknown ·
 * second-tier-absent. The rest are the fail-closed rules.
 */

const HERE = dirname(fileURLToPath(import.meta.url))
const FIXTURE_MANIFEST = resolve(HERE, '../test/fixtures/second-tier-ownership.manifest.json')

/** Stated here rather than imported from the resolver, per resolver.spec.ts. */
const PRO_PACKAGE = '@dzup-ui-pro/pro'
const CORE_PACKAGE = '@dzup-ui/core'

const roots: string[] = []

/**
 * A project directory whose `node_modules` holds a fake second-tier package.
 *
 * @param manifest - what to write at the manifest subpath; `undefined` writes
 * no manifest at all and leaves it out of the `exports` map, which is the
 * "installed but not conforming" shape.
 */
function projectWithSecondTier(manifest?: unknown): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-second-tier-'))
  roots.push(root)

  const pkgDir = join(root, 'node_modules/@dzup-ui-pro/pro')
  mkdirSync(join(pkgDir, 'manifests'), { recursive: true })

  // ESM-only `exports`, plus the two condition-free subpaths a conforming
  // package declares. `./package.json` is what makes "is it on disk here?"
  // answerable without asserting anything about how the entry point loads.
  const exports: Record<string, unknown> = {
    '.': { import: './index.js' },
    './package.json': './package.json',
  }
  if (manifest !== undefined) {
    exports['./manifests/component-ownership.manifest.json']
      = './manifests/component-ownership.manifest.json'
    writeFileSync(
      join(pkgDir, 'manifests/component-ownership.manifest.json'),
      typeof manifest === 'string' ? manifest : JSON.stringify(manifest, null, 2),
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

/** A project with no second tier installed at all. */
function projectWithoutSecondTier(): string {
  const root = mkdtempSync(join(tmpdir(), 'dzup-no-second-tier-'))
  roots.push(root)
  writeFileSync(join(root, 'package.json'), JSON.stringify({ name: 'bare-app', private: true }))
  return root
}

function fixtureManifest(): Record<string, unknown> {
  return JSON.parse(readFileSync(FIXTURE_MANIFEST, 'utf8')) as Record<string, unknown>
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => {
  for (const root of roots)
    rmSync(root, { recursive: true, force: true })
})

describe('the synthetic fixture itself', () => {
  it('is labelled synthetic and names nothing real', () => {
    // A fixture that could be mistaken for a generated artifact is a liability:
    // the next agent to grep for an ownership manifest must be able to tell in
    // one line that this one is fake.
    const manifest = fixtureManifest()
    expect(manifest.fixture).toBe(true)
    expect(FIXTURE_MANIFEST).toContain('test')
    expect(FIXTURE_MANIFEST).not.toContain('manifests')
  })

  it('claims the schema version the published contract states', () => {
    expect(fixtureManifest().schemaVersion).toBe('1.1.0')
  })
})

describe('case 1 — resolve a second-tier component', () => {
  it('resolves a fixture component to the second-tier package', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolver = DzResolver({ includePro: true, resolveFrom: projectWithSecondTier(fixtureManifest()) })

    expect(resolver.resolve('DzFixtureGizmo')).toEqual({
      name: 'DzFixtureGizmo',
      from: PRO_PACKAGE,
    })
  })

  it('imports a part from the narrowest subpath the manifest declares', () => {
    // The generated first-tier table only ever carries a package name. The
    // published schema carries `subpath`, so a second tier can say "import this
    // from ./gizmos" — and this asserts the specifier is JOINED, not guessed,
    // and never produces `pkg/./sub`.
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolver = DzResolver({ includePro: true, resolveFrom: projectWithSecondTier(fixtureManifest()) })

    expect(resolver.resolve('DzFixtureGizmoPanel')).toEqual({
      name: 'DzFixtureGizmoPanel',
      from: `${PRO_PACKAGE}/gizmos`,
    })
  })

  it('resolves nothing from the second tier when includePro is off', () => {
    const resolver = DzResolver({ resolveFrom: projectWithSecondTier(fixtureManifest()) })

    expect(resolver.resolve('DzFixtureGizmo')).toBeUndefined()
    expect(resolver.resolve('DzFixtureGizmoPanel')).toBeUndefined()
  })

  it('never resolves a non-mountable second-tier symbol', () => {
    // A resolver that answered a type would author an import for something that
    // is not a component, and the build error lands in the consumer's app with
    // this library's name on it.
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolver = DzResolver({ includePro: true, resolveFrom: projectWithSecondTier(fixtureManifest()) })

    expect(resolver.resolve('DzFixtureGizmoProps')).toBeUndefined()
    expect(resolver.resolve('useFixtureGizmo')).toBeUndefined()
  })

  it('says nothing when a conforming manifest is found', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = projectWithSecondTier({
      ...fixtureManifest(),
      // Drop the deliberate collision probe: a clean manifest must be silent.
      entries: (fixtureManifest().entries as { symbol: string }[])
        .filter(entry => entry.symbol !== 'DzButton'),
    })

    DzResolver({ includePro: true, resolveFrom: root })
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('case 2 — a custom prefix reaches the second tier', () => {
  it('renames the tag without changing ownership', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = projectWithSecondTier(fixtureManifest())

    expect(DzResolver({ includePro: true, prefix: 'X', resolveFrom: root }).resolve('XFixtureGizmo'))
      .toEqual({ name: 'DzFixtureGizmo', from: PRO_PACKAGE })
  })

  it('stops resolving the Dz tag the prefix replaced, in the second tier too', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = projectWithSecondTier(fixtureManifest())

    expect(DzResolver({ includePro: true, prefix: 'X', resolveFrom: root }).resolve('DzFixtureGizmo'))
      .toBeUndefined()
  })
})

describe('case 3 — a name both tiers claim', () => {
  it('keeps the first-tier answer and names both packages', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolver = DzResolver({ includePro: true, resolveFrom: projectWithSecondTier(fixtureManifest()) })

    // The fixture claims `DzButton`, which Core really owns.
    expect(COMPONENT_OWNERSHIP.DzButton?.from).toBe(CORE_PACKAGE)
    expect(resolver.resolve('DzButton')).toEqual({ name: 'DzButton', from: CORE_PACKAGE })

    const message = warn.mock.calls.map(call => String(call[0])).find(text => text.includes('DzButton'))
    expect(message, 'a collision must never be silent').toBeDefined()
    expect(message).toContain(CORE_PACKAGE)
    expect(message).toContain(PRO_PACKAGE)
    // It must not award a winner: choosing a precedence rule between two tiers
    // is an owner decision, not a resolver's.
    expect(message).toContain('never picks a winner')
  })
})

describe('case 4 — a name neither tier owns', () => {
  it.each([
    ['a name no tier owns', 'DzNotAComponentAnywhere'],
    ['a typo of a fixture component', 'DzFixtureGizmoo'],
    ['a truncation of a fixture component', 'DzFixture'],
    ['a name from another library', 'VButton'],
  ])('resolves nothing for %s', (_label, name) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolver = DzResolver({ includePro: true, resolveFrom: projectWithSecondTier(fixtureManifest()) })

    expect(resolver.resolve(name)).toBeUndefined()
  })
})

describe('case 5 — the second tier is absent', () => {
  it('resolves nothing for a second-tier name and still resolves Core', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const resolver = DzResolver({ includePro: true, resolveFrom: projectWithoutSecondTier() })

    expect(resolver.resolve('DzFixtureGizmo')).toBeUndefined()
    expect(resolver.resolve('DzButton')).toEqual({ name: 'DzButton', from: CORE_PACKAGE })
  })

  it('emits exactly one actionable diagnostic', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    DzResolver({ includePro: true, resolveFrom: projectWithoutSecondTier() })

    expect(warn).toHaveBeenCalledTimes(1)
    const message = String(warn.mock.calls[0]?.[0])
    // Actionable means all of: which option, which package, what to do, and the
    // off switch.
    expect(message).toContain('includePro')
    expect(message).toContain(PRO_PACKAGE)
    expect(message).toContain('yarn add')
    expect(message).toContain('includePro: false')
  })

  it('says nothing at all when the second tier was never asked for', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    DzResolver({ resolveFrom: projectWithoutSecondTier() })
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('fail-closed rules', () => {
  it('separates "not installed" from "installed without a manifest"', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    DzResolver({ includePro: true, resolveFrom: projectWithSecondTier(undefined) })

    const message = String(warn.mock.calls[0]?.[0])
    expect(message).toContain('no conforming ownership manifest was resolvable')
    expect(message).toContain('./manifests/component-ownership.manifest.json')
    // The two failures have different owners, and the message must say whose.
    expect(message).toContain('packaging gap in that package')
  })

  it('refuses a manifest whose schema major this build does not implement', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = projectWithSecondTier({ ...fixtureManifest(), schemaVersion: '2.0.0' })
    const resolver = DzResolver({ includePro: true, resolveFrom: root })

    expect(resolver.resolve('DzFixtureGizmo'), 'a refused manifest must resolve nothing').toBeUndefined()
    const message = String(warn.mock.calls[0]?.[0])
    expect(message).toContain('does not conform')
    // The version is named. "It didn't work" is not a diagnostic.
    expect(message).toContain('2.0.0')
  })

  it('accepts a higher MINOR of the same major, because minors are additive', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = projectWithSecondTier({
      ...fixtureManifest(),
      schemaVersion: '1.9.0',
      entries: (fixtureManifest().entries as { symbol: string }[])
        .filter(entry => entry.symbol !== 'DzButton'),
    })

    expect(DzResolver({ includePro: true, resolveFrom: root }).resolve('DzFixtureGizmo')?.from)
      .toBe(PRO_PACKAGE)
  })

  it('refuses a manifest whose entries break the field rules', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = projectWithSecondTier({
      ...fixtureManifest(),
      entries: [{ symbol: 'DzFixtureGizmo', package: PRO_PACKAGE, subpath: '.', kind: 'invented-kind' }],
    })
    const resolver = DzResolver({ includePro: true, resolveFrom: root })

    expect(resolver.resolve('DzFixtureGizmo')).toBeUndefined()
    expect(String(warn.mock.calls[0]?.[0])).toContain('does not conform')
  })

  it('refuses a manifest that is not JSON, without throwing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const root = projectWithSecondTier('{ not json at all')

    // A build tool that dies because an optional tier is malformed is worse
    // than one that continues on the first tier and says so.
    expect(() => DzResolver({ includePro: true, resolveFrom: root })).not.toThrow()
    expect(String(warn.mock.calls[0]?.[0])).toContain('could not be read as JSON')
  })

  it('does not reach into an ancestor directory for a second tier', () => {
    // Guards the fixtures themselves: if resolution leaked upward, every test
    // above would pass for the wrong reason.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    DzResolver({ includePro: true, resolveFrom: tmpdir() })

    expect(String(warn.mock.calls[0]?.[0])).toContain('cannot be resolved from this project')
  })
})
