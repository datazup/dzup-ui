import type { OwnershipManifestDocument, OwnershipManifestEntry } from './ownership-manifest.js'
import { describe, expect, it } from 'vitest'
import {
  consumeOwnershipManifest,
  indexOwnershipManifest,
  isSupportedOwnershipSchema,
  MOUNTABLE_OWNERSHIP_KINDS,
  OWNERSHIP_MANIFEST_KINDS,
  OWNERSHIP_MANIFEST_SCHEMA_MAJOR,
  OWNERSHIP_MANIFEST_SCHEMA_VERSION,
  OWNERSHIP_MANIFEST_SUBPATH,
  ownershipCollisionDiagnostic,
  ownershipManifestDiagnostic,
  ownershipSpecifier,
  readOwnershipManifest,
} from './ownership-manifest.js'

/**
 * The published second-tier ownership-manifest schema (TASK-S3-O1).
 *
 * These assertions are the contract's own conformance suite: a downstream
 * package reads this file to see what "conforming" means in practice, and this
 * repository reads it to be sure the rule it publishes is the rule it enforces.
 *
 * The bias throughout is **fail closed**. Every test that proves a good
 * manifest is accepted has a sibling proving a nearly-good one is refused with
 * the reason named — because the failure this schema exists to prevent is a
 * resolver that answers confidently from a document it only half understood.
 */

function entry(overrides: Partial<OwnershipManifestEntry> = {}): OwnershipManifestEntry {
  return {
    symbol: 'DzExample',
    package: '@example/tier',
    subpath: '.',
    kind: 'public-component',
    ...overrides,
  }
}

function manifest(overrides: Partial<OwnershipManifestDocument> = {}): Record<string, unknown> {
  return {
    schemaVersion: OWNERSHIP_MANIFEST_SCHEMA_VERSION,
    tier: 'pro',
    sourceCommit: 'unknown',
    generatedFrom: ['src/index.ts'],
    entries: [entry()],
    ...overrides,
  }
}

describe('version policy', () => {
  it('states one schema version and one readable major', () => {
    expect(OWNERSHIP_MANIFEST_SCHEMA_VERSION).toBe('1.1.0')
    expect(OWNERSHIP_MANIFEST_SCHEMA_MAJOR).toBe(1)
    expect(OWNERSHIP_MANIFEST_SCHEMA_VERSION.startsWith(`${OWNERSHIP_MANIFEST_SCHEMA_MAJOR}.`)).toBe(true)
  })

  it('publishes the manifest location as a declared exports subpath', () => {
    // Not a deep path into the package directory: a consumer that reaches past
    // a package's `exports` map works only until the package publishes one.
    expect(OWNERSHIP_MANIFEST_SUBPATH.startsWith('./')).toBe(true)
    expect(OWNERSHIP_MANIFEST_SUBPATH).toBe('./manifests/component-ownership.manifest.json')
  })

  it('accepts any minor of the readable major, because minors are additive', () => {
    expect(isSupportedOwnershipSchema('1.0.0')).toBe(true)
    expect(isSupportedOwnershipSchema('1.1.0')).toBe(true)
    expect(isSupportedOwnershipSchema('1.99.3')).toBe(true)
  })

  it('refuses another major, and anything that is not a version', () => {
    expect(isSupportedOwnershipSchema('2.0.0')).toBe(false)
    expect(isSupportedOwnershipSchema('0.9.0')).toBe(false)
    expect(isSupportedOwnershipSchema('1.1')).toBe(false)
    expect(isSupportedOwnershipSchema('')).toBe(false)
    expect(isSupportedOwnershipSchema(undefined)).toBe(false)
    expect(isSupportedOwnershipSchema(11)).toBe(false)
  })

  it('tolerates a pre-release or build suffix on a readable major', () => {
    expect(isSupportedOwnershipSchema('1.2.0-rc.1')).toBe(true)
    expect(isSupportedOwnershipSchema('1.2.0+build.7')).toBe(true)
  })
})

describe('kinds', () => {
  it('lists exactly the kinds this repository\'s own generator emits', () => {
    expect([...OWNERSHIP_MANIFEST_KINDS]).toEqual([
      'public-component',
      'compound-part',
      'composable',
      'type',
      'recipe',
      'token-module',
      'internal',
      'compat-alias',
      'unclassified',
    ])
  })

  it('admits only two mountable kinds', () => {
    expect([...MOUNTABLE_OWNERSHIP_KINDS]).toEqual(['public-component', 'compound-part'])
    for (const kind of MOUNTABLE_OWNERSHIP_KINDS)
      expect(OWNERSHIP_MANIFEST_KINDS).toContain(kind)
  })
})

describe('readOwnershipManifest — accepting', () => {
  it('accepts a minimal conforming manifest', () => {
    const result = readOwnershipManifest(manifest())
    expect(result.problems).toEqual([])
    expect(result.ok).toBe(true)
    expect(result.manifest?.entries).toHaveLength(1)
  })

  it('accepts every optional field the schema names', () => {
    const result = readOwnershipManifest(manifest({
      entries: [
        entry({ subpaths: ['.', './gizmos'], family: 'gizmos', since: '1.2.0', status: 'stable' }),
        entry({ symbol: 'DzExamplePart', kind: 'compound-part', parentComponent: 'DzExample' }),
        entry({ symbol: 'DzLegacy', aliasOf: 'DzExample', kind: 'compat-alias' }),
        entry({ symbol: 'DzGone', deprecated: { since: '2.0.0', replacement: 'DzExample' } }),
        entry({ symbol: 'DzStyled', anatomy: { parts: ['root'], states: [], componentTokens: [] } }),
        entry({ symbol: 'DzProven', evidence: ['src/index.ts'] }),
      ] as OwnershipManifestEntry[],
    }))

    expect(result.problems).toEqual([])
    expect(result.ok).toBe(true)
  })

  it('ignores fields it does not know, which is what "additive" means', () => {
    // A 1.x reader must survive a 1.(x+1) manifest. If unknown keys were
    // refused, every additive schema change would be a breaking one.
    const result = readOwnershipManifest({
      ...manifest({ entries: [{ ...entry(), inventedLater: 'ignored' } as OwnershipManifestEntry] }),
      fixture: true,
      inventedLaterAtTopLevel: 42,
    })
    expect(result.ok).toBe(true)
  })

  it('does not require evidence, which this repository requires of itself', () => {
    // The one deliberate divergence: `evidence` names authority paths inside the
    // PRODUCING repository, so it is provable there and meaningless to a
    // consumer. Requiring it downstream would be requiring a field for no
    // consumer benefit.
    expect(readOwnershipManifest(manifest()).ok).toBe(true)
    expect(entry().evidence).toBeUndefined()
  })
})

describe('readOwnershipManifest — failing closed', () => {
  it('refuses something that is not an object', () => {
    for (const value of [undefined, null, 7, 'a string', [manifest()]]) {
      const result = readOwnershipManifest(value)
      expect(result.ok).toBe(false)
      expect(result.rejection).toBe('malformed')
    }
  })

  it('refuses an unreadable version before anything else', () => {
    const result = readOwnershipManifest(manifest({ schemaVersion: 'one point one' }))
    expect(result.rejection).toBe('unreadable-version')
    // Named, so the diagnostic can quote it rather than saying "invalid".
    expect(result.problems[0]?.message).toContain('one point one')
  })

  it('refuses an unknown major and names the version', () => {
    const result = readOwnershipManifest(manifest({ schemaVersion: '2.0.0' }))
    expect(result.rejection).toBe('unsupported-major')
    expect(result.schemaVersion).toBe('2.0.0')
    expect(result.problems[0]?.message).toContain('2.0.0')
    expect(result.problems[0]?.message).toContain('best-effort')
    // Nothing is returned to work from: a half-read manifest is worse than none.
    expect(result.manifest).toBeUndefined()
  })

  it.each([
    ['a missing tier', { tier: undefined }],
    ['an invented tier', { tier: 'enterprise' }],
    ['a missing sourceCommit', { sourceCommit: undefined }],
    ['a non-array generatedFrom', { generatedFrom: 'src/index.ts' }],
    ['a non-array entries', { entries: { DzExample: {} } }],
  ])('refuses %s as malformed', (_label, patch) => {
    const result = readOwnershipManifest({ ...manifest(), ...patch })
    expect(result.ok).toBe(false)
    expect(result.rejection).toBe('malformed')
  })

  it.each([
    ['a nameless symbol', { symbol: '' }],
    ['an unscoped garbage package', { package: 'Not A Package' }],
    ['a bare path instead of a subpath', { subpath: 'gizmos' }],
    ['an invented kind', { kind: 'widget' }],
    ['an unknown status', { status: 'wip' }],
    ['a compound-part with no parent', { kind: 'compound-part' }],
    ['a compat-alias with no target', { kind: 'compat-alias' }],
    ['a non-array subpaths', { subpaths: './gizmos' }],
    ['a non-object deprecated', { deprecated: true }],
    ['a non-object anatomy', { anatomy: 'root' }],
    ['a non-array evidence', { evidence: 'src/index.ts' }],
    ['a non-string family', { family: 3 }],
    ['a non-string since', { since: 1 }],
  ])('refuses an entry with %s', (_label, patch) => {
    const result = readOwnershipManifest(manifest({
      entries: [{ ...entry(), ...patch } as OwnershipManifestEntry],
    }))
    expect(result.ok).toBe(false)
    expect(result.rejection).toBe('invalid-entries')
    // Addressed: a consumer must be able to find the offending entry.
    expect(result.problems[0]?.at).toContain('entries[0]')
  })

  it('refuses an entry that is not an object at all', () => {
    const result = readOwnershipManifest(manifest({ entries: ['DzExample'] as unknown as OwnershipManifestEntry[] }))
    expect(result.ok).toBe(false)
    expect(result.problems[0]?.message).toContain('not an object')
  })

  it('refuses the same symbol twice — one manifest, one answer per name', () => {
    const result = readOwnershipManifest(manifest({ entries: [entry(), entry()] }))
    expect(result.ok).toBe(false)
    expect(result.problems.some(problem => problem.rule === 'duplicate-symbol')).toBe(true)
  })

  it('truncates a long problem list but still says how many there were', () => {
    const entries = Array.from({ length: 30 }, (_, index) => entry({ symbol: `DzBad${index}`, kind: 'widget' as never }))
    const result = readOwnershipManifest(manifest({ entries }), { maxProblems: 3 })

    expect(result.problems).toHaveLength(4)
    expect(result.problems.at(-1)?.message).toContain('27 further problem')
  })
})

describe('ownershipSpecifier', () => {
  it('produces the bare package name for the root barrel', () => {
    expect(ownershipSpecifier('@example/tier', '.')).toBe('@example/tier')
  })

  it('joins a subpath without doubling the dot', () => {
    // Built by hand, this is where `@example/tier/./gizmos` comes from.
    expect(ownershipSpecifier('@example/tier', './gizmos')).toBe('@example/tier/gizmos')
    expect(ownershipSpecifier('@example/tier', './gizmos/panel')).toBe('@example/tier/gizmos/panel')
  })
})

describe('indexOwnershipManifest', () => {
  const indexed = indexOwnershipManifest({
    schemaVersion: OWNERSHIP_MANIFEST_SCHEMA_VERSION,
    tier: 'pro',
    sourceCommit: 'unknown',
    generatedFrom: [],
    entries: [
      entry({ symbol: 'DzExample' }),
      entry({ symbol: 'DzExamplePart', kind: 'compound-part', parentComponent: 'DzExample', subpath: './gizmos' }),
      entry({ symbol: 'DzExampleProps', kind: 'type' }),
      entry({ symbol: 'useExample', kind: 'composable' }),
      entry({ symbol: 'exampleVariants', kind: 'recipe' }),
      entry({ symbol: 'DzHidden', kind: 'internal' }),
      entry({ symbol: 'DzUnsure', kind: 'unclassified' }),
      entry({ symbol: 'DzOld', deprecated: { since: '2.0.0' }, since: '1.0.0' }),
    ],
  })

  it('indexes only what a consumer can mount', () => {
    expect(Object.keys(indexed).sort()).toEqual(['DzExample', 'DzExamplePart', 'DzOld'])
  })

  it('joins each entry\'s specifier once, at index time', () => {
    expect(indexed.DzExample?.from).toBe('@example/tier')
    expect(indexed.DzExamplePart?.from).toBe('@example/tier/gizmos')
  })

  it('carries deprecation and since through, so a consumer can warn', () => {
    expect(indexed.DzOld?.deprecated).toEqual({ since: '2.0.0' })
    expect(indexed.DzOld?.since).toBe('1.0.0')
    expect(indexed.DzExample?.deprecated).toBeUndefined()
    expect(indexed.DzExample?.since).toBeUndefined()
  })

  it('returns a prototype-free map, so no name resolves by inheritance', () => {
    // Without this, `resolve('toString')` and `resolve('constructor')` answer a
    // function from Object.prototype and the resolver imports it.
    expect(Object.getPrototypeOf(indexed)).toBeNull()
    expect((indexed as Record<string, unknown>).toString).toBeUndefined()
  })
})

describe('consumeOwnershipManifest', () => {
  const PKG = '@example/tier'
  const MANIFEST_SPECIFIER = `${PKG}/manifests/component-ownership.manifest.json`

  /** An io whose resolve table is a plain object — nothing touches a disk. */
  function io(files: Record<string, string>, resolvable = Object.keys(files)) {
    return {
      resolve: (specifier: string) => (resolvable.includes(specifier) ? `/fake/${specifier}` : undefined),
      readText: (path: string) => {
        const key = path.replace('/fake/', '')
        const text = files[key]
        if (text === undefined)
          throw new Error(`ENOENT: ${path}`)
        return text
      },
    }
  }

  it('loads and indexes a conforming manifest', () => {
    const result = consumeOwnershipManifest(PKG, io({
      [MANIFEST_SPECIFIER]: JSON.stringify(manifest()),
    }))

    expect(result.availability).toBe('loaded')
    expect(result.schemaVersion).toBe(OWNERSHIP_MANIFEST_SCHEMA_VERSION)
    expect(Object.keys(result.symbols)).toEqual(['DzExample'])
    expect(result.path).toContain('component-ownership.manifest.json')
  })

  it('reports "not installed" when neither the subpath nor the package resolves', () => {
    const result = consumeOwnershipManifest(PKG, io({}, []))

    expect(result.availability).toBe('not-installed')
    expect(result.symbols).toEqual({})
  })

  it.each([
    ['the condition-free ./package.json export', `${PKG}/package.json`],
    ['the bare package name, for a package published before that export', PKG],
  ])('separates "installed without a manifest" using %s', (_label, probe) => {
    const result = consumeOwnershipManifest(PKG, io({}, [probe]))

    expect(result.availability).toBe('no-manifest')
    // Whose problem it is, said out loud.
    expect(result.detail).toContain('packaging gap in that package')
  })

  it('reports unreadable JSON without throwing', () => {
    const result = consumeOwnershipManifest(PKG, io({ [MANIFEST_SPECIFIER]: '{ not json' }))

    expect(result.availability).toBe('unreadable')
    expect(result.detail).toContain('component-ownership.manifest.json')
  })

  it('reports an unreadable FILE without throwing', () => {
    // `resolve` succeeded and `readText` then threw: a package whose manifest
    // was deleted after install, or an unreadable permission.
    const result = consumeOwnershipManifest(PKG, io({}, [MANIFEST_SPECIFIER]))

    expect(result.availability).toBe('unreadable')
    expect(result.detail).toContain('ENOENT')
  })

  it('refuses a non-conforming manifest and names the version it saw', () => {
    const result = consumeOwnershipManifest(PKG, io({
      [MANIFEST_SPECIFIER]: JSON.stringify(manifest({ schemaVersion: '2.0.0' })),
    }))

    expect(result.availability).toBe('non-conforming')
    expect(result.schemaVersion).toBe('2.0.0')
    expect(result.detail).toContain('2.0.0')
    expect(result.symbols).toEqual({})
  })

  it('never executes anything from the package it consumes', () => {
    // The whole point of consuming a manifest as DATA. If this ever became an
    // `import()`, a second tier could run code in a consumer's build through a
    // path the first tier advertises.
    const source = consumeOwnershipManifest.toString()
    expect(source).not.toContain('import(')
    expect(source).not.toContain('require(')
  })
})

describe('diagnostics', () => {
  const context = {
    consumer: '@dzup-ui/nuxt',
    packageName: '@dzup-ui-pro/pro',
    option: 'dzupUi.includePro to false',
  }

  it.each(['not-installed', 'no-manifest', 'unreadable', 'non-conforming'] as const)(
    'names the package, the option and a fix for %s',
    (availability) => {
      const message = ownershipManifestDiagnostic(availability, context)
      expect(message.startsWith('[@dzup-ui/nuxt] includePro is enabled but ')).toBe(true)
      expect(message).toContain('@dzup-ui-pro/pro')
      expect(message).toContain('dzupUi.includePro to false')
    },
  )

  it('tells a consumer with no manifest exactly what to install', () => {
    const message = ownershipManifestDiagnostic('no-manifest', context)
    expect(message).toContain('no conforming ownership manifest was resolvable')
    expect(message).toContain(OWNERSHIP_MANIFEST_SUBPATH)
    expect(message).toContain(`major ${OWNERSHIP_MANIFEST_SCHEMA_MAJOR}`)
    expect(message).toContain(OWNERSHIP_MANIFEST_SCHEMA_VERSION)
  })

  it('appends caller detail verbatim, so a version or path can be quoted', () => {
    const message = ownershipManifestDiagnostic('non-conforming', { ...context, detail: '(declared 2.0.0)' })
    expect(message.endsWith('(declared 2.0.0)')).toBe(true)
  })

  it('names both packages in a collision and awards no winner', () => {
    const message = ownershipCollisionDiagnostic('DzButton', {
      consumer: 'dzup-ui',
      firstTier: '@dzup-ui/core',
      secondTier: '@dzup-ui-pro/pro',
    })

    expect(message).toContain('DzButton')
    expect(message).toContain('@dzup-ui/core')
    expect(message).toContain('@dzup-ui-pro/pro')
    expect(message).toContain('never picks a winner')
  })
})
