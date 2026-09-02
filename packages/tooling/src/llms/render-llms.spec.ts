/**
 * Specs for the llms renderers (TASK-N2-A3).
 *
 * Two halves, deliberately:
 *
 *   1. **Fabricated records** drive each rule the N2-A2 handoff §13 names — the
 *      declared/effective default distinction, `descriptionSource`, absent
 *      examples — because those are the rules a renderer gets wrong silently.
 *   2. **The real committed artifact** is rendered and asserted against, so a
 *      change to the catalog that breaks an invariant fails here as well as in
 *      the gate.
 */

import type { ComponentMetaArtifact, ComponentMetaRecord } from '../meta/component-meta.ts'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { COMPONENT_META_PATH } from './generate-llms.ts'
import {
  eventDescription,
  groupByFamily,
  inheritedPropCount,
  modelBindings,
  ownPropNames,
  renderComponentSection,
  renderFull,
  renderIndex,
  taxonomyLine,
  taxonomyMembers,
} from './render-llms.ts'

function record(over: Partial<ComponentMetaRecord> = {}): ComponentMetaRecord {
  return {
    name: 'DzThing',
    kind: 'public-component',
    description: 'A thing.',
    descriptionSource: 'sfc-header',
    family: 'buttons',
    subpaths: ['.'],
    source: 'packages/core/src/components/buttons/DzThing.vue',
    typesSource: 'packages/core/src/components/buttons/DzThing.types.ts',
    componentCommit: 'abc',
    componentType: 'class',
    anatomy: { state: 'absent', parts: [] },
    props: [],
    globalPropCount: 0,
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
  } as ComponentMetaRecord
}

function artifact(components: ComponentMetaRecord[]): ComponentMetaArtifact {
  return {
    schemaVersion: '1.1.0',
    sourceCommit: 'test',
    extractor: 'vue-component-meta@test',
    generatedFrom: [],
    inputs: {},
    taxonomies: { ButtonVariant: ['solid', 'outline'], CanonicalSize: ['sm', 'md'], CanonicalTone: ['neutral'] },
    totals: {
      components: components.length,
      publicComponents: components.filter(c => c.kind === 'public-component').length,
      compoundParts: components.filter(c => c.kind === 'compound-part').length,
    },
    components,
  } as unknown as ComponentMetaArtifact
}

describe('taxonomyMembers', () => {
  const tax = { ButtonVariant: ['solid', 'outline'] }

  it('expands a named alias, with or without the undefined arm', () => {
    expect(taxonomyMembers('ButtonVariant | undefined', tax)).toEqual(['solid', 'outline'])
    expect(taxonomyMembers('ButtonVariant', tax)).toEqual(['solid', 'outline'])
  })

  it('expands an inline string union from the printed type alone', () => {
    expect(taxonomyMembers('"button" | "submit" | "reset" | undefined', tax))
      .toEqual(['button', 'submit', 'reset'])
  })

  it('returns null for anything that is not a taxonomy', () => {
    expect(taxonomyMembers('string | undefined', tax)).toBeNull()
    expect(taxonomyMembers('Record<string, unknown>', tax)).toBeNull()
  })
})

describe('taxonomyLine', () => {
  it('renders only the taxonomy props the component actually has', () => {
    const r = record({
      props: [
        { name: 'variant', type: 'ButtonVariant | undefined', required: false, default: null, description: '', descriptionSource: 'none' },
        { name: 'size', type: 'CanonicalSize | undefined', required: false, default: null, description: '', descriptionSource: 'none' },
      ] as ComponentMetaRecord['props'],
    })
    const line = taxonomyLine(r, { ButtonVariant: ['solid', 'outline'], CanonicalSize: ['sm', 'md'] })
    expect(line).toBe('variant: `solid` `outline` · size: `sm` `md`')
  })

  it('is empty for a component with no taxonomy props', () => {
    expect(taxonomyLine(record(), {})).toBe('')
  })
})

describe('modelBindings', () => {
  it('requires BOTH an update: event and a prop of that name', () => {
    const withProp = record({
      props: [{ name: 'open', type: 'boolean', required: false, default: null, description: '', descriptionSource: 'none' }] as ComponentMetaRecord['props'],
      events: [{ name: 'update:open', type: '[value: boolean]', signature: '', description: '', descriptionSource: 'none', modelDerived: true }] as ComponentMetaRecord['events'],
    })
    expect(modelBindings(withProp)).toEqual([{ name: 'open', type: 'boolean' }])

    const withoutProp = record({
      events: [{ name: 'update:open', type: '[value: boolean]', signature: '', description: '', descriptionSource: 'none', modelDerived: true }] as ComponentMetaRecord['events'],
    })
    expect(modelBindings(withoutProp)).toEqual([])
  })
})

describe('ownPropNames / inheritedPropCount', () => {
  const r = record({
    props: [
      { name: 'ariaLabel', type: 'string', required: false, default: null, description: '', descriptionSource: 'none', declaredIn: 'packages/contracts/src/props.types.ts' },
      { name: 'loading', type: 'boolean', required: false, default: null, description: '', descriptionSource: 'none', declaredIn: 'packages/core/src/components/buttons/DzThing.types.ts' },
    ] as ComponentMetaRecord['props'],
  })

  it('separates own from inherited by declaring file, not by name', () => {
    expect(ownPropNames(r)).toEqual(['loading'])
    expect(inheritedPropCount(r)).toBe(1)
  })

  it('falls back to every prop when no declaring file resolved', () => {
    const noDecl = record({
      props: [{ name: 'x', type: 'string', required: false, default: null, description: '', descriptionSource: 'none' }] as ComponentMetaRecord['props'],
    })
    expect(ownPropNames(noDecl)).toEqual(['x'])
  })
})

describe('eventDescription — §13 rule 2', () => {
  it('renders authored prose plainly', () => {
    expect(eventDescription({ name: 'click', type: '', signature: '', description: 'Clicked', descriptionSource: 'emits-interface', modelDerived: false }))
      .toBe('Clicked')
  })

  it('states the defineModel origin rather than an empty cell', () => {
    expect(eventDescription({ name: 'update:modelValue', type: '', signature: '', description: '', descriptionSource: 'none', modelDerived: true }))
      .toMatch(/synthesised by `defineModel`/)
  })

  it('leaves an authored-but-undescribed event empty, so the caller renders —', () => {
    expect(eventDescription({ name: 'escapeKeyDown', type: '', signature: '', description: '', descriptionSource: 'none', modelDerived: false }))
      .toBe('')
  })
})

describe('renderComponentSection — the three §13 rules', () => {
  it('labels the default column "Declared default" and keeps null and "undefined" distinct', () => {
    const r = record({
      props: [
        { name: 'a', type: 'string', required: false, default: null, description: 'none declared', descriptionSource: 'vue-component-meta' },
        { name: 'variant', type: 'ButtonVariant | undefined', required: false, default: 'undefined', description: 'provider-supplied', descriptionSource: 'vue-component-meta' },
      ] as ComponentMetaRecord['props'],
    })
    const md = renderComponentSection(r, artifact([r])).join('\n')
    expect(md).toContain('Declared default')
    expect(md).toMatch(/\| `a` \|.*\| — \|/)
    expect(md).toMatch(/\| `variant` \|.*\| `undefined` \|/)
    // The story-derived answer must never appear: nothing generated says it.
    expect(md).not.toContain('`solid` |')
  })

  it('omits the description column for exposed members entirely', () => {
    const r = record({
      exposed: [{ name: 'reset', type: '() => void', description: '', descriptionSource: 'none' }] as ComponentMetaRecord['exposed'],
    })
    const md = renderComponentSection(r, artifact([r])).join('\n')
    expect(md).toContain('| Member | Type |')
    expect(md).not.toContain('| Member | Type | Description |')
  })

  it('states an absent example instead of synthesising markup', () => {
    const md = renderComponentSection(record(), artifact([record()])).join('\n')
    expect(md).toContain('No published Storybook story')
    expect(md).not.toContain('```vue')
  })

  it('points a compound part at its parent rather than inventing a snippet', () => {
    const r = record({ name: 'DzCardBody', kind: 'compound-part', parentComponent: 'DzCard' })
    const md = renderComponentSection(r, artifact([r])).join('\n')
    expect(md).toContain('compound sub-part of `DzCard`')
    expect(md).not.toContain('```vue')
  })

  it('renders the story template verbatim in a vue fence', () => {
    const r = record({
      stories: {
        file: 'packages/core/stories/buttons/DzThing.stories.ts',
        stories: [],
        primary: { id: 'Default', lines: [1, 2], source: 'export const Default = {}', template: '<DzThing />' },
      } as ComponentMetaRecord['stories'],
    })
    const md = renderComponentSection(r, artifact([r])).join('\n')
    expect(md).toContain('```vue\n<DzThing />\n```')
  })

  it('escapes pipes so a union type cannot break the table', () => {
    const r = record({
      props: [{ name: 'x', type: '"a" | "b"', required: false, default: null, description: 'has | a pipe', descriptionSource: 'vue-component-meta' }] as ComponentMetaRecord['props'],
    })
    const row = renderComponentSection(r, artifact([r])).join('\n').split('\n').find(l => l.startsWith('| `x`'))!
    expect(row.split(/(?<!\\)\|/).length).toBe(7)
  })

  it('uses a longer fence when the snippet contains one', () => {
    const r = record({
      stories: {
        file: 'f.ts',
        stories: [],
        primary: { id: 'Default', lines: [1, 2], source: 'x', template: 'a ``` b' },
      } as ComponentMetaRecord['stories'],
    })
    expect(renderComponentSection(r, artifact([r])).join('\n')).toContain('````vue')
  })
})

describe('groupByFamily', () => {
  it('orders families by the curated list and puts public components before their parts', () => {
    const parts = [
      record({ name: 'DzCardBody', kind: 'compound-part', family: 'cards', parentComponent: 'DzCard' }),
      record({ name: 'DzCard', family: 'cards' }),
      record({ name: 'DzButton', family: 'buttons' }),
    ]
    const groups = groupByFamily(parts)
    expect(groups.map(g => g.key)).toEqual(['buttons', 'cards'])
    expect(groups[1]!.components.map(c => c.name)).toEqual(['DzCard', 'DzCardBody'])
  })

  it('keeps an unknown family rather than dropping its components', () => {
    const groups = groupByFamily([record({ family: 'brand-new' })])
    expect(groups.map(g => g.key)).toEqual(['brand-new'])
    expect(groups[0]!.label).toBe('brand-new')
  })
})

describe('the real committed artifact', () => {
  const real = JSON.parse(readFileSync(COMPONENT_META_PATH, 'utf8')) as ComponentMetaArtifact
  const index = renderIndex(real)
  const full = renderFull(real)

  it('renders exactly one H1 in each document', () => {
    for (const doc of [index, full])
      expect(doc.split('\n').filter(l => l.startsWith('# ')).length).toBe(1)
  })

  it('gives every public component a bullet and a section', () => {
    const publicNames = real.components.filter(c => c.kind === 'public-component').map(c => c.name)
    for (const name of publicNames) {
      expect(index, `${name} bullet`).toContain(`- **${name}**`)
      expect(full, `${name} section`).toContain(`### ${name}`)
    }
    expect(publicNames.length).toBe(real.totals.publicComponents)
  })

  it('names every family it renders — an unlabelled family is a documentation defect', () => {
    const labels = groupByFamily(real.components).map(g => g.label)
    expect(labels).not.toContain('unknown')
    for (const label of labels)
      expect(label[0]).toBe(label[0]!.toUpperCase())
  })

  it('leaks no absolute host path', () => {
    for (const doc of [index, full]) {
      expect(doc).not.toMatch(/[A-Za-z]:[\\/]Users/)
      expect(doc).not.toMatch(/\/home\/[a-z]/)
    }
  })

  it('never prints a story-derived default for a provider-supplied prop', () => {
    const button = full.slice(full.indexOf('### DzButton'), full.indexOf('### DzButtonGroup'))
    const row = button.split('\n').find(l => l.startsWith('| `variant` |'))!
    // Cells split on UNESCAPED pipes; the type cell is full of escaped ones.
    const cells = row.split(/(?<!\\)\|/).map(c => c.trim())
    expect(cells[4]).toBe('`undefined`')
    expect(cells[5]).toBe('Visual style variant')
  })

  it('balances every code fence', () => {
    for (const doc of [index, full])
      expect(doc.split('\n').filter(l => l.trim().startsWith('```')).length % 2).toBe(0)
  })

  it('is deterministic — rendering twice from the same artifact is byte-identical', () => {
    expect(renderIndex(real)).toBe(index)
    expect(renderFull(real)).toBe(full)
  })

  it('matches what is committed on disk', () => {
    const root = resolve(COMPONENT_META_PATH, '../../../..')
    expect(readFileSync(resolve(root, 'packages/core/docs/llms.txt'), 'utf8')).toBe(index)
    expect(readFileSync(resolve(root, 'packages/core/docs/llms-full.txt'), 'utf8')).toBe(full)
  })
})
