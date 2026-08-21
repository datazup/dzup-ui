import type { CollisionDecisions } from './build-ownership-map.ts'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildOwnershipMap,
  COLLISION_DECISIONS_PATH,
  lookupOwner,
  OWNERSHIP_MAP_SCHEMA_VERSION,
  readCollisionDecisions,
  readManifest,
  serializeMap,
} from './build-ownership-map.ts'

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), '__fixtures__')

const core = readManifest(resolve(FIXTURES, 'core.manifest.json'))
const pro = readManifest(resolve(FIXTURES, 'pro.manifest.json'))
const collidingPro = readManifest(resolve(FIXTURES, 'collision.pro.manifest.json'))
const unknownQuery = JSON.parse(
  readFileSync(resolve(FIXTURES, 'unknown-query.json'), 'utf8'),
) as { symbols: string[] }

const decision: CollisionDecisions = {
  decisions: { DzButton: { tier: 'core', adr: 'ADR-99-cross-tier-naming' } },
}

describe('merging core + pro', () => {
  const { map, problems } = buildOwnershipMap([core, pro])

  it('merges cleanly when no name is claimed twice', () => {
    expect(problems).toEqual([])
    expect(map.collisions).toEqual([])
  })

  it('carries each entry through with its exact package, subpath, kind and tier', () => {
    expect(map.symbols.DzButton).toEqual({
      package: '@dzup-ui/core',
      subpath: '.',
      kind: 'public-component',
      tier: 'core',
    })
    expect(map.symbols.DzGantt).toEqual({
      package: '@dzup-ui-pro/pro',
      subpath: './planning',
      kind: 'public-component',
      tier: 'pro',
    })
  })

  it('keeps a compound part pointed at its parent', () => {
    expect(map.symbols.DzGanttTaskRow).toMatchObject({ kind: 'compound-part', parentComponent: 'DzGantt' })
  })

  it('carries a compat alias and an unclassified entry through unchanged', () => {
    expect(map.symbols.DzLegacyToast).toMatchObject({ package: '@dzup-ui/compat', kind: 'compat-alias' })
    expect(map.symbols.proInternalHelper).toMatchObject({ kind: 'unclassified', tier: 'pro' })
  })

  it('records provenance for both inputs', () => {
    expect(map.inputs).toEqual([
      { tier: 'core', sourceCommit: core.sourceCommit },
      { tier: 'pro', sourceCommit: pro.sourceCommit },
    ])
    expect(map.schemaVersion).toBe(OWNERSHIP_MAP_SCHEMA_VERSION)
  })

  it('reports a Pro part whose parent lives in Core as a relationship, not an error', () => {
    expect(problems).toEqual([])
    expect(map.crossTierRelationships).toContainEqual({
      symbol: 'DzProCardBody',
      tier: 'pro',
      parentComponent: 'DzCard',
      parentTier: 'core',
    })
  })

  it('does not report a same-tier part as cross-tier', () => {
    expect(map.crossTierRelationships.map(r => r.symbol)).not.toContain('DzCardBody')
  })
})

describe('unknown symbols', () => {
  const { map } = buildOwnershipMap([core, pro])

  it('answers null for every name the map does not own', () => {
    for (const symbol of unknownQuery.symbols)
      expect(lookupOwner(map, symbol), symbol).toBeNull()
  })

  it('never infers a tier from a Dz prefix', () => {
    // The current resolver answers '@dzup-ui/core' for all of these.
    expect(lookupOwner(map, 'DzNotAComponent')).toBeNull()
    expect(lookupOwner(map, 'DzButtonn')).toBeNull()
  })

  it('is not fooled by a prefix of a name it does own', () => {
    expect(lookupOwner(map, 'DzButt')).toBeNull()
    expect(lookupOwner(map, 'DzButton')).not.toBeNull()
  })
})

describe('collisions', () => {
  it('records one unresolved collision and withholds the symbol', () => {
    const { map } = buildOwnershipMap([core, collidingPro])
    expect(map.collisions).toEqual([
      { symbol: 'DzButton', tiers: ['core', 'pro'], resolution: 'unresolved' },
    ])
    expect(lookupOwner(map, 'DzButton')).toBeNull()
  })

  it('leaves every non-colliding symbol resolvable', () => {
    const { map } = buildOwnershipMap([core, collidingPro])
    expect(lookupOwner(map, 'DzDataGridPro')?.tier).toBe('pro')
    expect(lookupOwner(map, 'DzCard')?.tier).toBe('core')
  })

  it('resolves only from a checked-in decision that names an ADR', () => {
    const { map } = buildOwnershipMap([core, collidingPro], decision)
    expect(map.collisions[0]?.resolution).toBe('ADR-99-cross-tier-naming: core')
    expect(lookupOwner(map, 'DzButton')?.package).toBe('@dzup-ui/core')
  })

  it('accepts a decision awarding the collision to either claiming tier', () => {
    const { map, problems } = buildOwnershipMap([core, collidingPro], {
      decisions: { DzButton: { tier: 'pro', adr: 'ADR-99' } },
    })
    expect(problems).toEqual([])
    expect(lookupOwner(map, 'DzButton')?.package).toBe('@dzup-ui-pro/pro')
  })

  it('reports a decision that resolves no collision, so the file cannot accrete dead entries', () => {
    const { problems } = buildOwnershipMap([core, pro], {
      decisions: { DzCard: { tier: 'pro', adr: 'ADR-99' } },
    })
    expect(problems.join(' ')).toContain('not a collision in these inputs')
  })

  it('rejects two manifests of the same tier instead of silently double-merging', () => {
    const { problems } = buildOwnershipMap([core, core])
    expect(problems.join(' ')).toContain('two manifests declare tier "core"')
  })

  it('refuses to merge across a manifest schema major', () => {
    const { problems } = buildOwnershipMap([core, { ...pro, schemaVersion: '2.0.0' }])
    expect(problems.join(' ')).toContain('schema major')
  })
})

describe('output shape', () => {
  it('is deterministic, sorted and timestamp-free', () => {
    const first = serializeMap(buildOwnershipMap([core, pro]).map)
    const second = serializeMap(buildOwnershipMap([core, pro]).map)
    expect(first).toBe(second)
    expect(first).not.toMatch(/\d{4}-\d{2}-\d{2}T/)

    const keys = Object.keys(buildOwnershipMap([core, pro]).map.symbols)
    expect(keys).toEqual([...keys].sort())
  })

  it('serializes as 2-space JSON with a trailing newline', () => {
    const serialized = serializeMap(buildOwnershipMap([core, pro]).map)
    expect(serialized.endsWith('}\n')).toBe(true)
  })
})

describe('collision-decisions.json', () => {
  it('is checked in and empty while no real Core/Pro name collides', () => {
    expect(readCollisionDecisions().decisions).toEqual({})
  })

  it('documents its own shape so the first decision has an example to copy', () => {
    const raw = readFileSync(COLLISION_DECISIONS_PATH, 'utf8')
    expect(raw).toContain('$example')
    expect(raw).toContain('adr')
  })
})

describe('core-only merge', () => {
  it('produces a usable map when no Pro manifest is available', () => {
    // Which is the state of this checkout: Pro TASK-GOV-01 has not run on any
    // branch reachable from here, so a Pro manifest cannot be obtained.
    const { map, problems } = buildOwnershipMap([core])
    expect(problems).toEqual([])
    expect(map.inputs).toHaveLength(1)
    expect(lookupOwner(map, 'DzButton')?.tier).toBe('core')
    expect(lookupOwner(map, 'DzGantt')).toBeNull()
  })
})
