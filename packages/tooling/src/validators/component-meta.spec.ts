/**
 * Specs for `yarn validate:component-meta` (TASK-N2-A2).
 *
 * Every clause is driven to FAILURE with a fabricated artifact, plus one case
 * that runs the real repository through `checkComponentMeta()` and asserts zero
 * errors — so the repo's actual state is asserted by a test, not only by a CLI
 * run somebody remembered to do.
 *
 * A gate never observed failing is not a gate.
 *
 * @module @dzup-ui/tooling/validators/component-meta.spec
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  serializeComponentMeta,
  stripProvenance,
} from '../meta/component-meta.ts'
import { COMPONENT_META_PATH } from '../meta/generate-component-meta.ts'
import { ROOT } from '../ownership/generate-ownership-manifest.ts'
import { checkComponentMeta, measure, readCeilings, readPublicSymbols } from './component-meta.ts'

// ── Fabricated inputs ────────────────────────────────────────────────────────

function record(over: Partial<ComponentMetaRecord> = {}): ComponentMetaRecord {
  return {
    name: 'DzButton',
    kind: 'public-component',
    // schema 1.1.0 (TASK-N2-A3): the component-level one-liner llms.txt renders.
    description: 'Primary button component.',
    descriptionSource: 'sfc-header',
    family: 'buttons',
    subpaths: ['.', './buttons'],
    source: 'packages/core/src/components/buttons/DzButton.vue',
    componentCommit: 'aaaa',
    componentType: 'class',
    anatomy: { state: 'absent', parts: [] },
    props: [],
    globalPropCount: 12,
    events: [],
    slots: [],
    exposed: [],
    stories: { stories: [] },
    extraction: {
      props: 0,
      propsWithDescription: 0,
      propsWithDeclaredDefault: 0,
      events: 0,
      eventsWithDescription: 0,
      eventsModelDerived: 0,
      slots: 0,
      slotsWithDescription: 0,
      slotsWithPayload: 0,
      exposed: 0,
      exposedWithDescription: 0,
      unresolvedTypes: [],
    },
    ...over,
  }
}

function artifact(components: ComponentMetaRecord[] = [record()]): ComponentMetaArtifact {
  const t = {
    components: components.length,
    publicComponents: components.filter(c => c.kind === 'public-component').length,
    compoundParts: components.filter(c => c.kind === 'compound-part').length,
    unclassifiable: components.filter(c => c.extractionError !== undefined).length,
    props: 0,
    propsWithDescription: 0,
    propsWithDeclaredDefault: 0,
    propsWithLiteralUndefinedDefault: 0,
    events: 0,
    eventsWithDescription: 0,
    eventsFromExtractor: 0,
    eventsFromEmitsInterface: 0,
    eventsModelDerived: 0,
    slots: 0,
    slotsWithDescription: 0,
    slotsWithPayload: 0,
    exposed: 0,
    exposedWithDescription: 0,
    unresolvedTypes: 0,
    componentsWithStories: 0,
    componentsWithPrimaryExample: components.filter(c => c.stories.primary !== undefined).length,
    componentsWithStaticTemplate: components.filter(c => c.stories.primary?.template !== undefined).length,
  }
  return {
    schemaVersion: '1.1.0',
    sourceCommit: 'deadbeef',
    extractor: 'vue-component-meta@0.0.0-spec',
    generatedFrom: [],
    inputs: {},
    // schema 1.1.0 (TASK-N2-A3): the ADR-02 frozen taxonomies, resolved once.
    taxonomies: { ButtonVariant: ['solid', 'outline'] },
    totals: t,
    components,
  }
}

/** Ceilings that exactly match a one-component, zero-everything artifact. */
const EXACT_CEILINGS: Record<string, number> = {
  unclassifiable: 0,
  unresolvedTypes: 0,
  publicComponentsWithoutRecord: 0,
  propsWithoutDescription: 0,
  slotsWithoutDescription: 0,
  eventsWithoutDescription: 0,
  exposedWithoutDescription: 0,
  publicComponentsWithoutExample: 1,
  componentsWithoutStaticTemplate: 1,
}

/**
 * The real copy statement, verbatim.
 *
 * It has to be the real call and not a paraphrase: the reachability clause
 * matches the CALL (`await copyFile(COMPONENT_META_SRC` plus the destination
 * `resolve(OUT_DIR, 'component-meta.json')`), because the first version of the
 * clause matched the bare filename and stayed green on a seeded run that had
 * deleted the copy — the constant and its comment still mentioned it. See the
 * handoff, finding F-4.
 */
const COPY_LINE = 'await copyFile(COMPONENT_META_SRC, resolve(OUT_DIR, \'component-meta.json\'))'

function errors(v: ReturnType<typeof checkComponentMeta>): string[] {
  return v.filter(x => x.level === 'error').map(x => x.message)
}

// ── Clause 2 · coverage ──────────────────────────────────────────────────────

describe('coverage', () => {
  it('is green when every public component has a record', () => {
    const v = checkComponentMeta(artifact(), new Set(['DzButton']), EXACT_CEILINGS, COPY_LINE)
    expect(errors(v)).toEqual([])
  })

  it('fails, by name, when a public component has no record', () => {
    const v = checkComponentMeta(
      artifact(),
      new Set(['DzButton', 'DzRating', 'DzCalendar']),
      { ...EXACT_CEILINGS, publicComponentsWithoutRecord: 2 },
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('2 public component(s) have no metadata record: DzCalendar, DzRating')
  })
})

// ── Clause 3 · schema ────────────────────────────────────────────────────────

describe('schema', () => {
  it('fails when a component has no resolved family', () => {
    const v = checkComponentMeta(
      artifact([record({ family: 'unknown' })]),
      new Set(['DzButton']),
      EXACT_CEILINGS,
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('DzButton has no resolved family')
  })

  it('fails when a prop claims a description source it does not have', () => {
    const v = checkComponentMeta(
      artifact([record({
        props: [{ name: 'variant', type: 'string', required: false, default: null, description: '', descriptionSource: 'vue-component-meta' }],
      })]),
      new Set(['DzButton']),
      EXACT_CEILINGS,
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('DzButton.variant: description and descriptionSource disagree')
  })

  it('fails when a prop carries prose but claims none — the case that would hide it from D1', () => {
    const v = checkComponentMeta(
      artifact([record({
        props: [{ name: 'variant', type: 'string', required: false, default: null, description: 'Visual style', descriptionSource: 'none' }],
      })]),
      new Set(['DzButton']),
      EXACT_CEILINGS,
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('description and descriptionSource disagree')
  })

  it('fails when an event claims a description source it does not have', () => {
    const v = checkComponentMeta(
      artifact([record({
        events: [{ name: 'click', type: '[e: MouseEvent]', signature: 's', description: '', descriptionSource: 'emits-interface', modelDerived: false }],
      })]),
      new Set(['DzButton']),
      EXACT_CEILINGS,
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('event click: description and descriptionSource disagree')
  })

  it('fails when a published example has an empty source slice', () => {
    const v = checkComponentMeta(
      artifact([record({
        stories: { file: 'x.stories.ts', stories: [], primary: { id: 'Default', lines: [1, 2], source: '   ' } },
      })]),
      new Set(['DzButton']),
      { ...EXACT_CEILINGS, publicComponentsWithoutExample: 0 },
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('the primary example has an empty source slice')
  })

  it('fails when props/events/slots is not an array at all', () => {
    const broken = record()
    ;(broken as unknown as { props: unknown }).props = null
    const v = checkComponentMeta(artifact([broken]), new Set(['DzButton']), EXACT_CEILINGS, COPY_LINE)
    expect(errors(v).join('\n')).toContain('is missing one of props/events/slots')
  })

  it('reports, rather than fails, a component the extractor could not process — the ratchet is the gate', () => {
    const v = checkComponentMeta(
      artifact([record({ extractionError: 'TS7056: type is too complex' })]),
      new Set(['DzButton']),
      { ...EXACT_CEILINGS, unclassifiable: 1 },
      COPY_LINE,
    )
    expect(errors(v)).toEqual([])
    expect(v.filter(x => x.level === 'report').map(x => x.message).join('\n'))
      .toContain('vue-component-meta could not process it — TS7056')
  })
})

// ── Clause 4 · ratchets ──────────────────────────────────────────────────────

describe('ratchets', () => {
  it('fails when a debt number rises', () => {
    const v = checkComponentMeta(
      artifact([record({ extractionError: 'boom' })]),
      new Set(['DzButton']),
      EXACT_CEILINGS,
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('`unclassifiable` is 1, above the ceiling of 0')
  })

  it('fails when a debt number FALLS without the ceiling being lowered', () => {
    const v = checkComponentMeta(
      artifact(),
      new Set(['DzButton']),
      { ...EXACT_CEILINGS, publicComponentsWithoutExample: 5 },
      COPY_LINE,
    )
    expect(errors(v).join('\n')).toContain('`publicComponentsWithoutExample` fell to 1 (ceiling 5)')
  })

  it('fails when a measured number has no declared ceiling at all', () => {
    const { unclassifiable: _drop, ...missing } = EXACT_CEILINGS
    const v = checkComponentMeta(artifact(), new Set(['DzButton']), missing, COPY_LINE)
    expect(errors(v).join('\n')).toContain('no ceiling declared for `unclassifiable`')
  })

  it('counts undescribed props, slots, events and exposed members separately', () => {
    const m = measure(
      artifact([record({
        extraction: { ...record().extraction, props: 3 },
      })]),
      new Set(['DzButton']),
    )
    expect(m).toMatchObject({ propsWithoutDescription: 0, publicComponentsWithoutExample: 1 })
  })
})

// ── Clause 5 · reachability ──────────────────────────────────────────────────

describe('reachability', () => {
  it('fails when the landing build stops copying the artifact into /r/', () => {
    const v = checkComponentMeta(
      artifact(),
      new Set(['DzButton']),
      EXACT_CEILINGS,
      'await writeFile(resolve(OUT_DIR, \'registry.json\'), toJson(index))',
    )
    expect(errors(v).join('\n')).toContain('does not copy component-meta.json into /r/')
  })

  it('reports, not fails, when the landing script is absent entirely', () => {
    const v = checkComponentMeta(artifact(), new Set(['DzButton']), EXACT_CEILINGS, null)
    expect(errors(v)).toEqual([])
    expect(v.filter(x => x.level === 'report').map(x => x.message).join('\n'))
      .toContain('cannot verify that the deployed site serves')
  })

  it('is green against the real apps/landing/scripts/build-registry.ts', () => {
    const path = join(ROOT, 'apps/landing/scripts/build-registry.ts')
    expect(existsSync(path)).toBe(true)
    const v = checkComponentMeta(
      artifact(),
      new Set(['DzButton']),
      EXACT_CEILINGS,
      readFileSync(path, 'utf8'),
    )
    expect(errors(v)).toEqual([])
  })
})

// ── Provenance stripping ─────────────────────────────────────────────────────

describe('stripProvenance', () => {
  it('neutralises sourceCommit so an unrelated commit cannot fail the freshness gate', () => {
    const a = serializeComponentMeta(artifact())
    const b = serializeComponentMeta({ ...artifact(), sourceCommit: 'a'.repeat(40) })
    expect(a).not.toBe(b)
    expect(stripProvenance(a)).toBe(stripProvenance(b))
  })

  it('does not neutralise anything else', () => {
    const a = serializeComponentMeta(artifact())
    const b = serializeComponentMeta({ ...artifact(), extractor: 'vue-component-meta@9.9.9' })
    expect(stripProvenance(a)).not.toBe(stripProvenance(b))
  })
})

// ── The real repository ──────────────────────────────────────────────────────

describe('the real repository', () => {
  const committedPath = COMPONENT_META_PATH
  const present = existsSync(committedPath)

  it.skipIf(!present)('the committed artifact passes every content clause', () => {
    const committed = JSON.parse(readFileSync(committedPath, 'utf8')) as ComponentMetaArtifact
    const v = checkComponentMeta(
      committed,
      readPublicSymbols(),
      readCeilings(),
      readFileSync(join(ROOT, 'apps/landing/scripts/build-registry.ts'), 'utf8'),
    )
    expect(errors(v)).toEqual([])
  })

  it.skipIf(!present)('records all 144 public components and no unclassifiable one', () => {
    const committed = JSON.parse(readFileSync(committedPath, 'utf8')) as ComponentMetaArtifact
    expect(committed.totals.publicComponents).toBe(readPublicSymbols().size)
    expect(committed.totals.unclassifiable).toBe(0)
  })

  it.skipIf(!present)('publishes no absolute host path anywhere in the artifact', () => {
    // The determinism property, asserted rather than assumed: an absolute path
    // in a printed type would make this file machine-specific and turn the
    // freshness gate red on every other checkout.
    const raw = readFileSync(committedPath, 'utf8')
    // A Windows drive letter, as it would appear JSON-escaped (`"C:\\Users\\…"`).
    // The `i` flag is safe here — unlike the published JSON Schema patterns in
    // `@dzup-ui/mcp` (TASK-N2-A1 F-8), this regex is never serialised anywhere.
    expect(raw).not.toMatch(/[a-z]:\\\\/i)
    expect(raw).not.toContain(ROOT.replace(/\\/g, '/'))
  })

  it.skipIf(!present)('every published description carries a source, and every source a description', () => {
    const committed = JSON.parse(readFileSync(committedPath, 'utf8')) as ComponentMetaArtifact
    for (const c of committed.components) {
      for (const m of [...c.props, ...c.events, ...c.slots, ...c.exposed])
        expect(m.description !== '', `${c.name}.${m.name}`).toBe(m.descriptionSource !== 'none')
    }
  })

  it.skipIf(!present)('every published example is real story source with a file and a line range', () => {
    const committed = JSON.parse(readFileSync(committedPath, 'utf8')) as ComponentMetaArtifact
    for (const c of committed.components) {
      if (c.stories.primary === undefined)
        continue
      expect(c.stories.file, c.name).toBeDefined()
      expect(c.stories.primary.source, c.name).toContain(`export const ${c.stories.primary.id}`)
      expect(c.stories.primary.lines[0], c.name).toBeGreaterThan(0)
      expect(existsSync(join(ROOT, c.stories.file!)), c.stories.file).toBe(true)
    }
  })
})
