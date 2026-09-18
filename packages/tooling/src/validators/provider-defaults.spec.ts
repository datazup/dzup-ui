/**
 * Specs for `yarn validate:provider-defaults` (TASK-R5-O3, D32(a) + D33(a)).
 *
 * Every clause is driven to FAILURE with fabricated inputs, plus a block that
 * runs the real repository through `checkProviderDefaults()` and asserts zero
 * violations — so the repository's actual state is asserted by a test, not
 * only by a CLI run somebody remembered to do.
 *
 * @module @dzup-ui/tooling/validators/provider-defaults.spec
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import type { DefaultsExclusion, ProviderDefaultsCeilings } from './provider-defaults.ts'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { COMPONENT_META_PATH } from '../meta/generate-component-meta.ts'
import {
  ADOPTION_SPEC_PATH,
  canonicalAxes,
  checkProviderDefaults,
  defaultsConsumers,
  measureResidual,
  readAuditTable,
  readProviderDefaultsCeilings,
} from './provider-defaults.ts'

// ── Fabricated inputs ────────────────────────────────────────────────────────

interface Fixture {
  name: string
  axes?: Record<string, string>
  hooks?: string[]
  source?: string
}

function record({ name, axes = {}, hooks = [], source }: Fixture): ComponentMetaRecord {
  return {
    name,
    kind: 'public-component',
    source: source ?? `packages/core/src/components/buttons/${name}.vue`,
    providerHooks: hooks,
    props: Object.entries(axes).map(([prop, type]) => ({ name: prop, type })),
  } as unknown as ComponentMetaRecord
}

function artifact(...components: ComponentMetaRecord[]): ComponentMetaArtifact {
  return { components } as unknown as ComponentMetaArtifact
}

/**
 * A spec source carrying an executed audit table that mounts `names`, laid out
 * the way lint formats the real one. Each row asserts one attribute unless its
 * name is listed in `silent`, which renders the row with nothing to assert.
 */
function spec(names: string[], executed = true, silent: string[] = []): string {
  return [
    'interface AdoptionCase { name: string }',
    '',
    'const adoptionCases: AdoptionCase[] = [',
    ...names.map(n => [
      '  {',
      `    name: '${n} (a title)',`,
      `    component: ${n},`,
      '    selector: \'button[aria-haspopup="menu"]\',',
      `    bare: { 'data-tone': 'primary' },`,
      silent.includes(n) ? '    configured: {},' : `    configured: { 'data-tone': 'danger' },`,
      '  },',
    ].join('\n')),
    ']',
    '',
    executed ? 'describe.each(adoptionCases)(\'defaults adoption — $name\', () => {})' : '',
    '',
    '// after the table: must not be read as a row',
    'mount({ component: DzNotARow })',
  ].join('\n')
}

function ceilings(ceiling: number, exclusions: DefaultsExclusion[] = []): ProviderDefaultsCeilings {
  return { residual: { ceiling }, exclusions }
}

const REASON = 'A reason long enough to be an argument rather than a label.'

const ADOPTER = record({ name: 'DzAdopter', axes: { size: 'CanonicalSize | undefined' }, hooks: ['useDzDefaults'] })
const PROVIDER = record({ name: 'DzProvider', hooks: ['useDzDefaults'], source: 'packages/core/src/providers/DzProvider.vue' })

// ── What counts ──────────────────────────────────────────────────────────────

describe('provider-defaults — what counts as a canonical axis', () => {
  it('counts size, tone and variant by name, including component-specific unions', () => {
    const r = record({ name: 'DzX', axes: { size: 'TextSize | undefined', tone: 'CanonicalTone | undefined', variant: 'CardVariant | undefined', color: 'string' } })
    expect(canonicalAxes(r)).toEqual(['size', 'tone', 'variant'])
  })

  it('does not count a numeric size (a pixel count is not a design-system axis)', () => {
    expect(canonicalAxes(record({ name: 'DzQRCode', axes: { size: 'number | undefined' } }))).toEqual([])
  })

  it('does not count a `never` axis that extracts as bare undefined', () => {
    expect(canonicalAxes(record({ name: 'DzKnob', axes: { variant: 'undefined', size: 'CanonicalSize | undefined' } }))).toEqual(['size'])
  })

  it('never treats a provider writer as a consumer', () => {
    expect(defaultsConsumers(artifact(ADOPTER, PROVIDER))).toEqual(['DzAdopter'])
  })
})

describe('provider-defaults — reading the audit table from source', () => {
  it('reads the mounted component of every row, deduplicated, and nothing after the table', () => {
    const table = readAuditTable(spec(['DzB', 'DzA', 'DzB']))
    expect(table).toEqual({ rows: ['DzA', 'DzB'], vacuous: [], executed: true })
  })

  it('credits a component when ANY of its rows asserts something', () => {
    const source = spec(['DzA', 'DzA'], true, []).replace('configured: { \'data-tone\': \'danger\' },', 'configured: {},')
    expect(readAuditTable(source)).toEqual({ rows: ['DzA'], vacuous: [], executed: true })
  })

  it('accepts a classToken or an appearsWhenConfigured selector as the assertion', () => {
    const token = spec(['DzA'], true, ['DzA']).replace('configured: {},', 'configured: {},\n    classToken: [\'h-2\', \'h-3\'],')
    const branch = spec(['DzA'], true, ['DzA']).replace('configured: {},', 'configured: {},\n    appearsWhenConfigured: \'svg\',')
    expect(readAuditTable(token)?.rows).toEqual(['DzA'])
    expect(readAuditTable(branch)?.rows).toEqual(['DzA'])
  })

  it('reports a table nothing executes', () => {
    expect(readAuditTable(spec(['DzA'], false))?.executed).toBe(false)
  })

  it('returns null when there is no table at all', () => {
    expect(readAuditTable('describe(\'nothing\', () => {})')).toBeNull()
  })
})

// ── Clause 1: D32(a) ─────────────────────────────────────────────────────────

describe('provider-defaults — D32(a) every consumer has an audit row', () => {
  it('passes when every consumer has a row', () => {
    expect(checkProviderDefaults(artifact(ADOPTER, PROVIDER), spec(['DzAdopter']), ceilings(0))).toEqual([])
  })

  it('goes RED, by name, when a consumer has no row', () => {
    const v = checkProviderDefaults(artifact(ADOPTER), spec([]), ceilings(0))
    expect(v.map(x => x.rule)).toEqual(['audit-row'])
    expect(v[0]!.message).toContain('DzAdopter')
  })

  it('goes RED when a consumer\'s only row asserts nothing', () => {
    const v = checkProviderDefaults(artifact(ADOPTER), spec(['DzAdopter'], true, ['DzAdopter']), ceilings(0))
    expect(v.map(x => x.rule)).toEqual(['audit-row'])
    expect(v[0]!.message).toContain('asserts nothing')
  })

  it('goes RED when a row mounts a component that no longer consumes the context', () => {
    const lapsed = record({ name: 'DzLapsed', axes: {} })
    const v = checkProviderDefaults(artifact(ADOPTER, lapsed), spec(['DzAdopter', 'DzLapsed']), ceilings(0))
    expect(v.map(x => x.rule)).toEqual(['audit-row-stale'])
    expect(v[0]!.message).toContain('DzLapsed')
  })

  it('goes RED when the table is not executed', () => {
    const v = checkProviderDefaults(artifact(ADOPTER), spec(['DzAdopter'], false), ceilings(0))
    expect(v.map(x => x.rule)).toEqual(['audit-table'])
  })

  it('goes RED when the spec is missing', () => {
    const v = checkProviderDefaults(artifact(ADOPTER), null, ceilings(0))
    expect(v.map(x => x.rule)).toEqual(['audit-table'])
  })
})

// ── Clause 2: D33(a) ─────────────────────────────────────────────────────────

describe('provider-defaults — D33(a) the residual ratchet', () => {
  const unadopted = record({ name: 'DzUnadopted', axes: { size: 'CanonicalSize | undefined' } })

  it('passes when the residual equals the ceiling', () => {
    expect(checkProviderDefaults(artifact(ADOPTER, unadopted), spec(['DzAdopter']), ceilings(1))).toEqual([])
  })

  it('goes RED when the residual RISES', () => {
    const v = checkProviderDefaults(artifact(ADOPTER, unadopted), spec(['DzAdopter']), ceilings(0))
    expect(v.map(x => x.rule)).toEqual(['ratchet'])
    expect(v[0]!.message).toContain('ROSE 0 → 1')
  })

  it('goes RED when the residual FALLS and the ceiling was not lowered', () => {
    const v = checkProviderDefaults(artifact(ADOPTER), spec(['DzAdopter']), ceilings(1))
    expect(v.map(x => x.rule)).toEqual(['ratchet'])
    expect(v[0]!.message).toContain('FELL 1 → 0')
  })

  it('goes RED when no ceiling is recorded', () => {
    const v = checkProviderDefaults(artifact(ADOPTER), spec(['DzAdopter']), { exclusions: [] } as unknown as ProviderDefaultsCeilings)
    expect(v.map(x => x.rule)).toEqual(['ratchet'])
  })

  it('excludes a component only when EVERY axis it declares is excluded', () => {
    const two = record({ name: 'DzItem', axes: { size: 'CanonicalSize | undefined', tone: 'CanonicalTone | undefined' } })
    const toneOnly = [{ component: 'DzItem', axes: ['tone' as const], reason: REASON }]
    expect(measureResidual(artifact(two), toneOnly).residual).toEqual(['DzItem'])
    expect(measureResidual(artifact(two), [{ ...toneOnly[0]!, axes: ['size', 'tone'] }]).excluded).toEqual(['DzItem'])
  })
})

describe('provider-defaults — D33(a) exclusions are argued and current', () => {
  const grouped = record({ name: 'DzGroup', axes: { size: 'CanonicalSize | undefined' } })

  it('accepts an argued, current exclusion', () => {
    const c = ceilings(0, [{ component: 'DzGroup', axes: ['size'], reason: REASON, decision: 'D31' }])
    expect(checkProviderDefaults(artifact(grouped), spec([]), c)).toEqual([])
  })

  it('goes RED on an exclusion with no reason', () => {
    const c = ceilings(0, [{ component: 'DzGroup', axes: ['size'], reason: '' }])
    expect(checkProviderDefaults(artifact(grouped), spec([]), c).map(x => x.rule)).toEqual(['exclusion'])
  })

  it('goes RED when an excluded component now resolves through the provider', () => {
    const adopted = record({ name: 'DzGroup', axes: { size: 'CanonicalSize | undefined' }, hooks: ['useDzDefaults'] })
    const c = ceilings(0, [{ component: 'DzGroup', axes: ['size'], reason: REASON }])
    const v = checkProviderDefaults(artifact(adopted), spec(['DzGroup']), c)
    expect(v.map(x => x.rule)).toEqual(['exclusion'])
    expect(v[0]!.message).toContain('now calls')
  })

  it('goes RED when an excluded axis is no longer declared', () => {
    const c = ceilings(0, [{ component: 'DzGroup', axes: ['size', 'tone'], reason: REASON }])
    const v = checkProviderDefaults(artifact(grouped), spec([]), c)
    expect(v.map(x => x.rule)).toContain('exclusion')
    expect(v.find(x => x.rule === 'exclusion')!.message).toContain('no longer declares tone')
  })

  it('goes RED when an excluded component does not exist', () => {
    const c = ceilings(1, [{ component: 'DzGone', axes: ['size'], reason: REASON }])
    const v = checkProviderDefaults(artifact(grouped), spec([]), c)
    expect(v.map(x => x.rule)).toEqual(['exclusion'])
  })

  it('goes RED when a component is excluded twice', () => {
    const entry = { component: 'DzGroup', axes: ['size' as const], reason: REASON }
    const v = checkProviderDefaults(artifact(grouped), spec([]), ceilings(0, [entry, entry]))
    expect(v.map(x => x.rule)).toEqual(['exclusion'])
  })
})

// ── The real repository ──────────────────────────────────────────────────────

describe.runIf(existsSync(COMPONENT_META_PATH) && existsSync(ADOPTION_SPEC_PATH))('provider-defaults — against the real catalogue', () => {
  const real = JSON.parse(readFileSync(COMPONENT_META_PATH, 'utf8')) as ComponentMetaArtifact
  const source = readFileSync(ADOPTION_SPEC_PATH, 'utf8')
  const recorded = readProviderDefaultsCeilings()

  it('has zero violations: every consumer audited, every exclusion current, the residual at its ceiling', () => {
    expect(checkProviderDefaults(real, source, recorded)).toEqual([])
  })

  /**
   * Deliberately not a pinned number: the ceiling file already holds the one
   * number that may move, and a second copy here would have to be edited by
   * every adoption. (At 569d887 + the 2026-09-17 tree this measured 101
   * canonical-axis components, 22 resolving, 79 unresolved — D33's hand count,
   * reproduced exactly.)
   */
  it('partitions the canonical-axis components exactly: resolving + excluded + residual', () => {
    const m = measureResidual(real, recorded.exclusions)
    expect(m.resolving.length + m.excluded.length + m.residual.length).toBe(m.axisBearing.length)
    expect(m.unresolved).toEqual([...m.excluded, ...m.residual].sort())
    expect(m.resolving.every(name => defaultsConsumers(real).includes(name))).toBe(true)
  })
})
