/**
 * The Core+Pro merge that writes `packages/core/src/generated/component-ownership.ts`
 * (TASK-OSS-P1-02, pinned by TASK-R3-O1).
 *
 * `buildRuntimeLookup` and `renderRuntimeLookup` had **no coverage at all**
 * until this file: every ownership spec beside it exercises the Core-only
 * manifest builder or the map merge one level down, and nothing anywhere
 * asserted that a Pro manifest reaches the emitted table. That is the exact
 * regression TASK-R3-O1's success criteria name — `OWNERSHIP_TIERS` gaining
 * `'pro'` — and it was unpinned.
 *
 * It runs against the committed `__fixtures__` manifests rather than a live Pro
 * checkout, which is the point: Core never reads Pro source, only a JSON file a
 * Pro checkout produced, so a fixture of that file is a faithful input.
 */

import type { CollisionDecisions } from './build-ownership-map.ts'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { readManifest, unresolvedCollisions } from './build-ownership-map.ts'
import { buildRuntimeLookup } from './generate-ownership-manifest.ts'

const FIXTURES = resolve(dirname(fileURLToPath(import.meta.url)), '__fixtures__')
const PRO_MANIFEST = resolve(FIXTURES, 'pro.manifest.json')
const COLLIDING_PRO_MANIFEST = resolve(FIXTURES, 'collision.pro.manifest.json')

const core = readManifest(resolve(FIXTURES, 'core.manifest.json'))

/** A row of the emitted table, matched whole so a substring cannot pass for one. */
function row(symbol: string, from: string, kind: string): string {
  return `  ${symbol}: { from: '${from}', kind: '${kind}' },`
}

/** Does the table contain a row for this name at all, whatever its owner? */
function hasRow(source: string, symbol: string): boolean {
  return new RegExp(`^ {2}${symbol}: \\{`, 'm').test(source)
}

describe('buildRuntimeLookup — Core only', () => {
  const { source, tiers, problems, collisions } = buildRuntimeLookup(core)

  it('records the one tier it merged and nothing else', () => {
    expect(tiers).toEqual(['core'])
    expect(source).toContain('export const OWNERSHIP_TIERS = [\'core\'] as const')
    expect(problems).toEqual([])
    expect(collisions).toEqual([])
  })

  it('says outright that Pro names resolve to undefined, rather than implying it', () => {
    expect(source).toContain('The Pro tier is ABSENT from this table')
  })

  it('answers nothing for a Pro name', () => {
    expect(hasRow(source, 'DzGantt')).toBe(false)
  })
})

describe('buildRuntimeLookup — Core merged with a Pro manifest', () => {
  const { source, tiers, problems, collisions } = buildRuntimeLookup(core, PRO_MANIFEST)

  it('gains the pro tier — the TASK-R3-O1 success criterion', () => {
    expect(tiers).toEqual(['core', 'pro'])
    expect(source).toContain('export const OWNERSHIP_TIERS = [\'core\', \'pro\'] as const')
  })

  it('drops the Pro-absent disclaimer once Pro is actually present', () => {
    expect(source).not.toContain('The Pro tier is ABSENT from this table')
  })

  it('renders each Pro row against the Pro package, not the Core one', () => {
    expect(source).toContain(row('DzDataGridPro', '@dzup-ui-pro/pro', 'public-component'))
    expect(source).toContain(row('DzGantt', '@dzup-ui-pro/pro', 'public-component'))
    expect(source).toContain(row('DzGanttTaskRow', '@dzup-ui-pro/pro', 'compound-part'))
  })

  it('keeps every Core row unchanged beside them', () => {
    expect(source).toContain(row('DzButton', '@dzup-ui/core', 'public-component'))
    expect(source).toContain(row('DzCardBody', '@dzup-ui/core', 'compound-part'))
  })

  it('emits a Pro part whose parent is a Core component, rather than dropping it', () => {
    // The cross-tier relationship the map reports is not an error, and the part
    // is mountable: a table that omitted it would send `DzProCardBody` back to
    // the prefix guess this file replaced.
    expect(source).toContain(row('DzProCardBody', '@dzup-ui-pro/pro', 'compound-part'))
  })

  it('excludes every kind a consumer cannot mount, from either tier', () => {
    // A resolver that answered `DzGanttProps` would generate an import for a type.
    for (const symbol of ['DzButtonProps', 'DzGanttProps', 'useTheme', 'proInternalHelper', 'DzLegacyToast'])
      expect(hasRow(source, symbol), symbol).toBe(false)
  })

  it('merges two disjoint tiers with nothing to report', () => {
    expect(problems).toEqual([])
    expect(collisions).toEqual([])
  })

  it('is deterministic: two renders are byte-identical', () => {
    expect(buildRuntimeLookup(core, PRO_MANIFEST).source)
      .toBe(buildRuntimeLookup(core, PRO_MANIFEST).source)
  })

  it('sorts rows by the stable comparator, so two machines agree byte for byte', () => {
    const symbols = [...source.matchAll(/^ {2}(\w+): \{/gm)].map(match => match[1]!)
    expect(symbols).toEqual([...symbols].sort())
  })

  it('ignores a Pro manifest path that does not exist instead of throwing', () => {
    expect(buildRuntimeLookup(core, resolve(FIXTURES, 'absent.manifest.json')).tiers).toEqual(['core'])
  })
})

describe('an unresolved cross-tier collision (TASK-R3-O1 F3)', () => {
  // Seeded failure: a Pro manifest that re-exports `DzButton`, a name Core owns.
  // Proven to fail before it is asserted on — `DzButton` really does vanish from
  // the table below, which is what made this worth reporting: until F3 the
  // generator returned `{ source, tiers, problems }` and `map.collisions` was
  // discarded, so the row disappeared with no message, no violation and exit 0.
  const merged = buildRuntimeLookup(core, COLLIDING_PRO_MANIFEST)

  it('withholds the colliding name from the table — the silent half of the defect', () => {
    expect(hasRow(merged.source, 'DzButton')).toBe(false)
  })

  it('leaves every other row of both tiers intact', () => {
    expect(merged.source).toContain(row('DzCard', '@dzup-ui/core', 'public-component'))
    expect(merged.source).toContain(row('DzDataGridPro', '@dzup-ui-pro/pro', 'public-component'))
  })

  it('surfaces the collision with the symbol and the tiers that claim it', () => {
    expect(unresolvedCollisions(merged.collisions)).toEqual([
      { symbol: 'DzButton', tiers: ['core', 'pro'], resolution: 'unresolved' },
    ])
  })

  it('is not reported through `problems`, which is why it needed its own channel', () => {
    // `buildOwnershipMap` puts collisions in `map.collisions`, never in
    // `problems`. A caller that reads only `problems` — which is what this
    // function returned — sees a clean merge.
    expect(merged.problems).toEqual([])
  })
})

describe('a collision a checked-in decision settles (TASK-R3-O1 F2)', () => {
  const decisions: CollisionDecisions = {
    decisions: { DzButton: { tier: 'core', adr: 'ADR-99-cross-tier-naming' } },
  }
  const merged = buildRuntimeLookup(core, COLLIDING_PRO_MANIFEST, decisions)

  it('reports nothing unresolved once a decision names a tier and an ADR', () => {
    expect(unresolvedCollisions(merged.collisions)).toEqual([])
    expect(merged.collisions).toEqual([
      { symbol: 'DzButton', tiers: ['core', 'pro'], resolution: 'ADR-99-cross-tier-naming: core' },
    ])
    expect(merged.problems).toEqual([])
  })

  it('puts the winning tier back in the table', () => {
    expect(merged.source).toContain(row('DzButton', '@dzup-ui/core', 'public-component'))
  })

  it('awards the row to Pro when that is what the decision says', () => {
    const toPro = buildRuntimeLookup(core, COLLIDING_PRO_MANIFEST, {
      decisions: { DzButton: { tier: 'pro', adr: 'ADR-99-cross-tier-naming' } },
    })
    expect(toPro.source).toContain(row('DzButton', '@dzup-ui-pro/pro', 'public-component'))
  })

  it('reads collision-decisions.json by default, which settles nothing today', () => {
    // The F2 defect in one line: this path passed no decisions at all, so a
    // decision recorded in that file was honoured by `generate:ownership:map`
    // and ignored by `generate:ownership` — the command that writes the file
    // the resolver reads. The two artifacts disagreed and the resolver
    // followed the wrong one.
    expect(unresolvedCollisions(buildRuntimeLookup(core, COLLIDING_PRO_MANIFEST).collisions))
      .toHaveLength(1)
  })
})
