import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import type { SectionCeilings } from './page-contract.ts'
import { describe, expect, it } from 'vitest'
import { readComponentMeta } from '../llms/generate-llms.ts'
import {
  checkPageContract,
  measureSections,
  readSectionCeilings,
  SECTION_CHECKS,
} from './page-contract.ts'

/**
 * The page contract's gate (TASK-R5-O5).
 *
 * `<gate>`: *"validate:docs-pages gains one check per section with a downward
 * ratchet, seed one failure per check, prove it, remove it."* These are those
 * seeded failures, kept rather than removed — a seeded failure that is deleted
 * after it goes red proves the check worked once, and a spec proves it every
 * run. The program's own lesson from eight sessions is that every session which
 * seeded a deliberate failure found a real defect; this file is that practice
 * written down.
 *
 * The first thing it does is prove the check can go red **per section**, one
 * section at a time, so a gate that passes because it is checking nothing
 * cannot hide behind a green aggregate.
 */

function record(over: Partial<ComponentMetaRecord> = {}): ComponentMetaRecord {
  return {
    name: 'DzThing',
    kind: 'public-component',
    description: '',
    descriptionSource: 'none',
    family: 'buttons',
    subpaths: [],
    source: 'packages/core/src/components/buttons/DzThing.vue',
    componentCommit: 'abcdef1234567890',
    componentType: 'function',
    anatomy: { state: 'absent', parts: [] },
    providerHooks: [],
    props: [],
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
    globalPropCount: 0,
    ...over,
  } as ComponentMetaRecord
}

function artifactOf(records: ComponentMetaRecord[]): ComponentMetaArtifact {
  return {
    components: records,
    totals: { publicComponents: records.filter(r => r.kind === 'public-component').length },
  } as unknown as ComponentMetaArtifact
}

/** Ceilings that make every section's debt exactly what the given records carry. */
function exactCeilings(artifact: ComponentMetaArtifact): SectionCeilings {
  const measured = measureSections(artifact)
  const out: SectionCeilings = {}
  for (const check of SECTION_CHECKS)
    out[check.id] = { ceiling: measured[check.id]! }
  return out
}

/** A page body containing every section heading — the "nothing missing" case. */
function fullPage(): string {
  return SECTION_CHECKS.map(c => `${c.heading} (n)\n\nbody\n`).join('\n')
}

describe('page contract — the per-section checks', () => {
  it('passes when every section is on the page and every ceiling is exact', () => {
    const artifact = artifactOf([record()])
    const pages = new Map([['DzThing', fullPage()]])
    expect(checkPageContract(artifact, pages, exactCeilings(artifact))).toEqual([])
  })

  // ── Seeded failure, one per section ───────────────────────────────────────
  for (const check of SECTION_CHECKS) {
    it(`goes RED when section ${check.section} (${check.id}) is missing from a page`, () => {
      const artifact = artifactOf([record()])
      const seeded = fullPage().replace(`${check.heading} (n)`, '<!-- section deleted -->')
      const violations = checkPageContract(artifact, new Map([['DzThing', seeded]]), exactCeilings(artifact))

      expect(violations.map(v => v.rule)).toContain(`section-${check.id}`)
      expect(violations.find(v => v.rule === `section-${check.id}`)!.message).toContain('DzThing')
    })
  }

  it('names every page that lost the section, not just a count', () => {
    const artifact = artifactOf([record({ name: 'DzA' }), record({ name: 'DzB' })])
    const pages = new Map([['DzA', '<!-- empty -->'], ['DzB', fullPage()]])
    const v = checkPageContract(artifact, pages, exactCeilings(artifact))
      .find(x => x.rule === 'section-keyboard')!
    expect(v.message).toContain('DzA')
    expect(v.message).not.toContain('DzB')
  })
})

describe('page contract — the per-section ratchets', () => {
  it('goes RED when a section debt RISES', () => {
    const clean = artifactOf([record({ anatomy: { state: 'declared', parts: ['root'], keyboard: 'none' } })])
    const ceilings = exactCeilings(clean)
    // Now regress: the component loses its keyboard contract.
    const regressed = artifactOf([record({ anatomy: { state: 'declared', parts: ['root'] } })])
    const v = checkPageContract(regressed, new Map([['DzThing', fullPage()]]), ceilings)
      .find(x => x.rule === 'ratchet-keyboard')

    expect(v).toBeDefined()
    expect(v!.message).toContain('ROSE 0 → 1')
    expect(v!.message).toContain('do not')
  })

  it('goes RED when a section debt FALLS and the ceiling was not lowered', () => {
    // A ceiling nobody lowers stops meaning anything, so good news fails too.
    const artifact = artifactOf([record({ anatomy: { state: 'declared', parts: ['root'], keyboard: 'none' } })])
    const stale: SectionCeilings = { ...exactCeilings(artifact), keyboard: { ceiling: 7 } }
    const v = checkPageContract(artifact, new Map([['DzThing', fullPage()]]), stale)
      .find(x => x.rule === 'ratchet-keyboard')

    expect(v).toBeDefined()
    expect(v!.message).toContain('FELL 7 → 0')
  })

  it('goes RED when a section has no ceiling recorded at all', () => {
    const artifact = artifactOf([record()])
    const ceilings = exactCeilings(artifact)
    delete ceilings.parts
    const v = checkPageContract(artifact, new Map([['DzThing', fullPage()]]), ceilings)
      .find(x => x.rule === 'ratchet-parts')

    expect(v).toBeDefined()
    expect(v!.message).toContain('No ceiling is recorded')
  })

  it('counts an explicit `keyboard: \'none\'` as DECLARED, not as debt', () => {
    // The distinction the whole contract turns on: "this component has no
    // keyboard behaviour" is a claim; "nobody wrote one down" is a gap.
    const declared = artifactOf([record({ anatomy: { state: 'declared', parts: ['root'], keyboard: 'none' } })])
    const absent = artifactOf([record({ anatomy: { state: 'declared', parts: ['root'] } })])

    expect(measureSections(declared).keyboard).toBe(0)
    expect(measureSections(absent).keyboard).toBe(1)
  })
})

describe('page contract — against the real catalogue', () => {
  const artifact = readComponentMeta()
  const measured = measureSections(artifact)
  const ceilings = readSectionCeilings()

  it('has a recorded ceiling for every section', () => {
    for (const check of SECTION_CHECKS)
      expect(ceilings[check.id], `no ceiling for ${check.id}`).toBeDefined()
  })

  it('every ceiling equals the measured debt — neither raised nor left stale', () => {
    for (const check of SECTION_CHECKS) {
      const entry = ceilings[check.id] as { ceiling: number }
      expect(measured[check.id], `${check.id} debt`).toBe(entry.ceiling)
    }
  })

  it('no page in the catalogue says "not yet derived" any more', () => {
    // The state this packet found: 144 of 144. The check is kept so the
    // sentence cannot come back through a renderer edit.
    const keyboardless = artifact.components
      .filter(c => c.kind === 'public-component' && c.anatomy.keyboard === undefined)
    expect(keyboardless.length).toBe(measured.keyboard)
  })
})
