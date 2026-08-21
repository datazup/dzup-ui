import { describe, expect, it } from 'vitest'
import {
  buildOwnershipManifest,
  declaredEntryPoints,
  ROOT,
  serializeManifest,
} from './generate-ownership-manifest.ts'
import { compareSymbols, OWNERSHIP_KINDS, OWNERSHIP_SCHEMA_VERSION } from './ownership-manifest.types.ts'

const { manifest, warnings } = buildOwnershipManifest()

describe('compareSymbols', () => {
  it('orders by code unit, not by locale — two machines must agree byte for byte', () => {
    expect(compareSymbols('DzA', 'DzB')).toBe(-1)
    expect(compareSymbols('DzB', 'DzA')).toBe(1)
    expect(compareSymbols('DzA', 'DzA')).toBe(0)
    // `localeCompare` sorts 'a' before 'B' under most ICU collations; this must not.
    expect(compareSymbols('B', 'a')).toBe(-1)
  })
})

describe('declaredEntryPoints', () => {
  const entries = declaredEntryPoints(`${ROOT}/packages/core`)

  it('maps each declared subpath back to its source barrel', () => {
    expect(entries.find(e => e.subpath === '.')?.entry.replaceAll('\\', '/'))
      .toContain('packages/core/src/index.ts')
    expect(entries.find(e => e.subpath === './resolver')?.entry.replaceAll('\\', '/'))
      .toContain('packages/core/src/resolver.ts')
  })

  it('skips asset targets such as ./styles', () => {
    expect(entries.some(e => e.subpath === './styles')).toBe(false)
  })

  it('is sorted, so the manifest cannot reorder between runs', () => {
    expect(entries.map(e => e.subpath)).toEqual([...entries.map(e => e.subpath)].sort(compareSymbols))
  })
})

describe('buildOwnershipManifest', () => {
  it('is deterministic: two builds serialize identically', () => {
    expect(serializeManifest(buildOwnershipManifest().manifest))
      .toBe(serializeManifest(buildOwnershipManifest().manifest))
  })

  it('declares the current schema version and the core tier', () => {
    expect(manifest.schemaVersion).toBe(OWNERSHIP_SCHEMA_VERSION)
    expect(manifest.tier).toBe('core')
  })

  it('sorts entries by symbol with the stable comparator', () => {
    const symbols = manifest.entries.map(entry => entry.symbol)
    expect(symbols).toEqual([...symbols].sort(compareSymbols))
  })

  it('lists every symbol exactly once', () => {
    const seen = manifest.entries.map(entry => `${entry.package}#${entry.symbol}`)
    expect(new Set(seen).size).toBe(seen.length)
  })

  it('gives every entry a known kind and at least one piece of evidence', () => {
    for (const entry of manifest.entries) {
      expect(OWNERSHIP_KINDS).toContain(entry.kind)
      expect(entry.evidence.length).toBeGreaterThan(0)
    }
  })

  it('classifies DzButton from its story, not from its prefix', () => {
    const entry = manifest.entries.find(e => e.symbol === 'DzButton')
    expect(entry).toMatchObject({ package: '@dzup-ui/core', subpath: '.', kind: 'public-component' })
    expect(entry?.evidence.join(' ')).toContain('stories/buttons/DzButton.stories.ts')
  })

  it('keeps DzButtonGroup public even though DzButton is a prefix of it', () => {
    expect(manifest.entries.find(e => e.symbol === 'DzButtonGroup')?.kind).toBe('public-component')
  })

  it('records compound parts against a parent that is itself public', () => {
    const byName = new Map(manifest.entries.map(entry => [entry.symbol, entry]))
    for (const entry of manifest.entries.filter(e => e.kind === 'compound-part')) {
      expect(entry.parentComponent, `${entry.symbol} names no parent`).toBeDefined()
      expect(byName.get(entry.parentComponent!)?.kind, `${entry.symbol} → ${entry.parentComponent}`)
        .toBe('public-component')
    }
  })

  it('resolves DzTabList through the wiring, which its name cannot express', () => {
    expect(manifest.entries.find(e => e.symbol === 'DzTabList'))
      .toMatchObject({ kind: 'compound-part', parentComponent: 'DzTabs' })
  })

  it('reads a compat alias target from the adapter import rather than the name', () => {
    const entry = manifest.entries.find(e => e.symbol === 'DzButtonCompat')
    expect(entry).toMatchObject({ package: '@dzup-ui/compat', kind: 'compat-alias', aliasOf: 'DzButton' })
    expect(entry?.evidence.join(' ')).toContain('imports DzButton from @dzup-ui/core')
  })

  it('records a non-root export under its own subpath', () => {
    expect(manifest.entries.find(e => e.symbol === 'DzResolver')?.subpath).toBe('./resolver')
  })

  it('copies the story status badge onto the component', () => {
    expect(manifest.entries.find(e => e.symbol === 'DzButton')?.status).toBe('stable')
  })

  it('emits unclassified with a reason rather than guessing', () => {
    for (const entry of manifest.entries.filter(e => e.kind === 'unclassified'))
      expect(entry.evidence.at(-1)).toMatch(/maintainer decision|could not be read|no story|disagree|ambiguous/i)
  })

  it('reports public-api manifest drift instead of resolving it', () => {
    // The public-api manifest's per-family `exports` arrays are stale; the
    // generator must say so and change nothing.
    expect(warnings.some(w => w.includes('public-api manifest lists it in no section'))).toBe(true)
  })

  it('serializes as 2-space JSON with a trailing newline', () => {
    const serialized = serializeManifest(manifest)
    expect(serialized.endsWith('}\n')).toBe(true)
    expect(serialized).toContain('\n  "schemaVersion"')
  })
})
