/**
 * Cross-tier ownership map (TASK-OSS-P0-02).
 *
 * Merges one Core and one Pro `component-ownership.manifest.json` — both in the
 * schema P0-01 defines — into a single exact-name lookup. P1 replaces the
 * resolver's prefix heuristics with a read of this map.
 *
 * Three properties are the whole point:
 *
 *   1. **Unknown means null.** A symbol the map does not contain resolves to
 *      `null`. Never to a tier inferred from a `Dz` prefix, which is what the
 *      current resolver does and why `DzAppShell` (a Core component) resolves to
 *      Pro today.
 *   2. **Collisions fail closed.** A symbol both tiers export is recorded as an
 *      unresolved collision, is *absent* from `symbols`, and makes the CLI exit
 *      non-zero — until `collision-decisions.json` records a winning tier and
 *      the ADR that decided it.
 *   3. **Nothing here imports Pro.** The Pro input is a JSON file produced by a
 *      Pro checkout; this module reads names and package strings only.
 *
 * Usage:
 *   tsx packages/tooling/src/ownership/build-ownership-map.ts --core <path> --pro <path> [--out <path>]
 */

import type { OwnershipManifest, OwnershipTier } from './ownership-manifest.types.ts'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { compareSymbols } from './ownership-manifest.types.ts'

const HERE = dirname(fileURLToPath(import.meta.url))

export const COLLISION_DECISIONS_PATH = resolve(HERE, 'collision-decisions.json')

/** Tracks the manifest schema major it merges. */
export const OWNERSHIP_MAP_SCHEMA_VERSION = '1.0.0'

export interface MapSymbol {
  package: string
  subpath: string
  kind: string
  tier: OwnershipTier
  parentComponent?: string
}

export interface MapCollision {
  symbol: string
  tiers: OwnershipTier[]
  /** `unresolved`, or `<adr>: <tier>` once a decision exists. */
  resolution: string
}

export interface CrossTierRelationship {
  symbol: string
  tier: OwnershipTier
  parentComponent: string
  parentTier: OwnershipTier | 'unknown'
}

export interface OwnershipMap {
  schemaVersion: string
  inputs: { tier: OwnershipTier, sourceCommit: string }[]
  symbols: Record<string, MapSymbol>
  collisions: MapCollision[]
  crossTierRelationships: CrossTierRelationship[]
}

export interface CollisionDecision {
  tier: OwnershipTier
  adr: string
  rationale?: string
}

export interface CollisionDecisions {
  decisions: Record<string, CollisionDecision>
}

export function readCollisionDecisions(path: string = COLLISION_DECISIONS_PATH): CollisionDecisions {
  if (!existsSync(path))
    return { decisions: {} }
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<CollisionDecisions>
  return { decisions: parsed.decisions ?? {} }
}

export function readManifest(path: string): OwnershipManifest {
  return JSON.parse(readFileSync(path, 'utf8')) as OwnershipManifest
}

/**
 * Merge manifests into one map.
 *
 * Manifests are keyed by tier, so passing two Core manifests is a caller error
 * rather than a silent double-merge — it is reported through `problems`.
 */
export function buildOwnershipMap(
  manifests: readonly OwnershipManifest[],
  decisions: CollisionDecisions = { decisions: {} },
): { map: OwnershipMap, problems: string[] } {
  const problems: string[] = []
  const seenTiers = new Set<OwnershipTier>()
  for (const manifest of manifests) {
    if (seenTiers.has(manifest.tier))
      problems.push(`two manifests declare tier "${manifest.tier}"; the map merges one manifest per tier`)
    seenTiers.add(manifest.tier)
  }

  const majors = new Set(manifests.map(manifest => manifest.schemaVersion.split('.')[0] ?? ''))
  if (majors.size > 1) {
    problems.push(
      `inputs disagree on the manifest schema major (${[...majors].sort(compareSymbols).join(', ')}); `
      + 'Core and Pro must agree before their manifests can be merged',
    )
  }

  // Gather every claim on every symbol before deciding anything, so a collision
  // is detected rather than overwritten by whichever manifest was read last.
  const claims = new Map<string, { tier: OwnershipTier, entry: MapSymbol }[]>()
  for (const manifest of manifests) {
    for (const entry of manifest.entries) {
      const claim = {
        tier: manifest.tier,
        entry: {
          package: entry.package,
          subpath: entry.subpath,
          kind: entry.kind,
          tier: manifest.tier,
          ...(entry.parentComponent !== undefined ? { parentComponent: entry.parentComponent } : {}),
        },
      }
      claims.set(entry.symbol, [...(claims.get(entry.symbol) ?? []), claim])
    }
  }

  const symbols: Record<string, MapSymbol> = {}
  const collisions: MapCollision[] = []
  const decisionsApplied = new Set<string>()

  for (const symbol of [...claims.keys()].sort(compareSymbols)) {
    const symbolClaims = claims.get(symbol)!
    const tiers = [...new Set(symbolClaims.map(claim => claim.tier))]

    if (tiers.length === 1) {
      // A symbol can legitimately appear twice inside one tier only if two
      // packages of that tier export the same name; that is still a collision,
      // but an intra-tier one the owning manifest should have caught.
      if (symbolClaims.length > 1) {
        problems.push(
          `${symbol} is claimed ${symbolClaims.length} times inside tier "${tiers[0]}" `
          + `(${symbolClaims.map(claim => claim.entry.package).join(', ')})`,
        )
      }
      symbols[symbol] = symbolClaims[0]!.entry
      continue
    }

    const decision = decisions.decisions[symbol]
    const winner = decision === undefined
      ? undefined
      : symbolClaims.find(claim => claim.tier === decision.tier)

    if (decision !== undefined) {
      decisionsApplied.add(symbol)
      if (winner === undefined) {
        problems.push(
          `collision-decisions.json awards ${symbol} to tier "${decision.tier}", which does not claim it`,
        )
      }
    }

    collisions.push({
      symbol,
      tiers: tiers.sort(compareSymbols),
      resolution: winner === undefined ? 'unresolved' : `${decision!.adr}: ${decision!.tier}`,
    })

    // Unresolved collisions stay OUT of `symbols`, so a lookup answers null
    // instead of whichever tier happened to sort first.
    if (winner !== undefined)
      symbols[symbol] = winner.entry
  }

  // A decision that resolves nothing is dead weight that outlives the collision
  // it was written for, and a reviewer reading it would believe a conflict still
  // exists. Report it rather than letting the file accrete.
  for (const symbol of Object.keys(decisions.decisions).sort(compareSymbols)) {
    if (!decisionsApplied.has(symbol)) {
      problems.push(
        `collision-decisions.json records a decision for ${symbol}, which is not a collision in `
        + 'these inputs — remove the entry or name the manifests it applies to',
      )
    }
  }

  const crossTierRelationships: CrossTierRelationship[] = []
  for (const symbol of Object.keys(symbols).sort(compareSymbols)) {
    const entry = symbols[symbol]!
    if (entry.kind !== 'compound-part' || entry.parentComponent === undefined)
      continue
    const parent = symbols[entry.parentComponent]
    const parentTier = parent?.tier ?? 'unknown'
    if (parentTier !== entry.tier) {
      crossTierRelationships.push({
        symbol,
        tier: entry.tier,
        parentComponent: entry.parentComponent,
        parentTier,
      })
    }
  }

  return {
    map: {
      schemaVersion: OWNERSHIP_MAP_SCHEMA_VERSION,
      inputs: manifests.map(manifest => ({ tier: manifest.tier, sourceCommit: manifest.sourceCommit })),
      symbols,
      collisions,
      crossTierRelationships,
    },
    problems,
  }
}

/**
 * The one lookup every consumer should use.
 *
 * Returns `null` for an unknown symbol and for one held in an unresolved
 * collision. There is deliberately no fallback, no prefix rule, and no default
 * tier: "I do not own this name" is a correct and useful answer, and it is the
 * answer a bundler resolver needs in order to leave the name alone.
 */
export function lookupOwner(map: OwnershipMap, symbol: string): MapSymbol | null {
  return map.symbols[symbol] ?? null
}

/** 2-space JSON with a trailing newline, sorted and timestamp-free. */
export function serializeMap(map: OwnershipMap): string {
  return `${JSON.stringify(map, null, 2)}\n`
}

/* c8 ignore start -- CLI entry point, exercised via `tsx`, not the unit tests. */
function argValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  return index === -1 ? undefined : process.argv[index + 1]
}

const isMain = process.argv[1]
  && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))

if (isMain) {
  const corePath = argValue('--core')
  const proPath = argValue('--pro')

  if (corePath === undefined) {
    console.error('Usage: --core <manifest> [--pro <manifest>] [--out <path>]')
    console.error('  The Pro manifest is produced by a Pro checkout (Pro TASK-GOV-01) and passed in as a file.')
    console.error('  Core never reads Pro source.')
    process.exit(1)
  }

  const inputs = [readManifest(resolve(corePath))]
  if (proPath !== undefined)
    inputs.push(readManifest(resolve(proPath)))
  else
    console.warn('· no --pro manifest given: the map covers the Core tier only')

  const { map, problems } = buildOwnershipMap(inputs, readCollisionDecisions())
  const out = argValue('--out')
  if (out !== undefined)
    writeFileSync(resolve(out), serializeMap(map), 'utf8')

  const unresolved = map.collisions.filter(collision => collision.resolution === 'unresolved')
  console.warn(
    `✓ ownership-map: ${Object.keys(map.symbols).length} symbols from `
    + `${map.inputs.map(input => input.tier).join(' + ')}`,
  )

  for (const relationship of map.crossTierRelationships) {
    console.warn(
      `· cross-tier: ${relationship.tier} ${relationship.symbol} is a part of `
      + `${relationship.parentComponent} (${relationship.parentTier})`,
    )
  }

  for (const problem of problems)
    console.error(`✗ ${problem}`)

  for (const collision of unresolved) {
    console.error(
      `✗ collision: ${collision.symbol} is exported by ${collision.tiers.join(' and ')}. `
      + 'It resolves to null until collision-decisions.json records a tier and the ADR that decided it.',
    )
  }

  process.exit(unresolved.length + problems.length > 0 ? 1 : 0)
}
/* c8 ignore stop */
