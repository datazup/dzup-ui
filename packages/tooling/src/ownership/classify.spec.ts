import type { Classification, ComponentClassificationInput } from './classify.ts'
import { describe, expect, it } from 'vitest'
import { barrelFor, classifyComponent, prefixParent, resolveCompoundParents } from './classify.ts'

function input(overrides: Partial<ComponentClassificationInput> = {}): ComponentClassificationInput {
  return {
    symbol: 'DzCardBody',
    family: 'cards',
    siblings: ['DzCard', 'DzCardBody', 'DzCardHeader'],
    vuePath: 'packages/core/src/components/cards/DzCardBody.vue',
    contextParents: [],
    ...overrides,
  }
}

describe('prefixParent', () => {
  it('picks the longest strict prefix so nested compounds resolve to the right owner', () => {
    const siblings = ['DzButton', 'DzSplitButton', 'DzSplitButtonMenu']
    expect(prefixParent('DzSplitButtonMenu', siblings)).toBe('DzSplitButton')
  })

  it('never returns the symbol itself', () => {
    expect(prefixParent('DzCard', ['DzCard'])).toBeUndefined()
  })

  it('returns undefined when no sibling name is a prefix', () => {
    expect(prefixParent('DzTabList', ['DzTabs', 'DzTabTrigger'])).toBeUndefined()
  })
})

describe('classifyComponent', () => {
  it('treats a story of its own as the authority that a component is public', () => {
    const result = classifyComponent(input({
      symbol: 'DzButtonGroup',
      siblings: ['DzButton', 'DzButtonGroup'],
      storyPath: 'packages/core/stories/buttons/DzButtonGroup.stories.ts',
    }))
    // Note this is exactly the case a prefix heuristic gets wrong: DzButtonGroup
    // starts with DzButton but is a component in its own right.
    expect(result.kind).toBe('public-component')
    expect(result.parentComponent).toBeUndefined()
  })

  it('classifies a part from the export list alone when nothing is wired', () => {
    const result = classifyComponent(input())
    expect(result).toMatchObject({ kind: 'compound-part', parentComponent: 'DzCard' })
  })

  it('classifies a part from the wiring alone when the name is not a prefix', () => {
    const result = classifyComponent(input({
      symbol: 'DzTabList',
      family: 'navigation',
      siblings: ['DzTabs', 'DzTabList'],
      contextParents: ['DzTabs'],
    }))
    expect(result).toMatchObject({ kind: 'compound-part', parentComponent: 'DzTabs' })
  })

  it('accepts a provider that is itself part of the named compound', () => {
    const result = classifyComponent(input({
      symbol: 'DzToastViewport',
      family: 'feedback',
      siblings: ['DzToast', 'DzToastProvider', 'DzToastViewport'],
      contextParents: ['DzToastProvider'],
    }))
    expect(result).toMatchObject({ kind: 'compound-part', parentComponent: 'DzToast' })
  })

  it('reports rather than guesses when the two authorities contradict each other', () => {
    const result = classifyComponent(input({
      symbol: 'DzCardBody',
      siblings: ['DzCard', 'DzCardBody', 'DzGrid'],
      contextParents: ['DzGrid'],
    }))
    expect(result.kind).toBe('unclassified')
    expect(result.evidence.join(' ')).toContain('authorities disagree')
  })

  it('reports an ambiguous parent instead of picking one', () => {
    const result = classifyComponent(input({
      symbol: 'DzPanel',
      family: 'layout',
      siblings: ['DzResizable', 'DzSplitter', 'DzPanel'],
      contextParents: ['DzResizable', 'DzSplitter'],
    }))
    expect(result.kind).toBe('unclassified')
    expect(result.evidence.join(' ')).toContain('ambiguous parent')
  })

  it('reports a symbol no authority speaks for', () => {
    const result = classifyComponent(input({ symbol: 'DzOrphan', siblings: ['DzOrphan'] }))
    expect(result.kind).toBe('unclassified')
    expect(result.evidence.join(' ')).toContain('no story declares it a component')
  })

  it('always cites the family barrel and the .vue file as evidence', () => {
    expect(classifyComponent(input()).evidence).toContain(
      'packages/core/src/components/cards/index.ts',
    )
    expect(classifyComponent(input()).evidence).toContain(
      'packages/core/src/components/cards/DzCardBody.vue',
    )
  })

  it('cites the barrel a component outside src/components actually ships from', () => {
    // The regression this guards: the barrel used to be assembled from
    // `packages/core/src/components/${family}`, which is true for every
    // component that lives there and false for `DzProvider`, which ships from
    // `packages/core/src/providers`. The generator wrote a path to a file that
    // does not exist, and nothing noticed — evidence is prose to every consumer
    // of the manifest, so no validator reads it.
    const result = classifyComponent(input({
      symbol: 'DzProvider',
      family: 'providers',
      siblings: ['DzProvider', 'DzThemeProvider'],
      vuePath: 'packages/core/src/providers/DzProvider.vue',
      storyPath: 'packages/core/stories/providers/DzProvider.stories.ts',
    }))

    expect(result.kind).toBe('public-component')
    expect(result.evidence).toContain('packages/core/src/providers/index.ts')
    expect(result.evidence).not.toContain('packages/core/src/components/providers/index.ts')
  })
})

describe('barrelFor', () => {
  it('derives the barrel from the component path', () => {
    expect(barrelFor('cards', 'packages/core/src/components/cards/DzCard.vue'))
      .toBe('packages/core/src/components/cards/index.ts')
    expect(barrelFor('providers', 'packages/core/src/providers/DzProvider.vue'))
      .toBe('packages/core/src/providers/index.ts')
  })

  it('falls back to the family convention when there is no .vue to read', () => {
    expect(barrelFor('cards')).toBe('packages/core/src/components/cards/index.ts')
  })
})

describe('resolveCompoundParents', () => {
  function map(entries: Record<string, Classification>): Map<string, Classification> {
    return new Map(Object.entries(entries))
  }

  it('walks a part-of-a-part up to the nearest public component', () => {
    const classifications = map({
      DzToast: { kind: 'public-component', evidence: ['story'] },
      DzToastProvider: { kind: 'compound-part', parentComponent: 'DzToast', evidence: ['prefix'] },
      DzToastViewport: { kind: 'compound-part', parentComponent: 'DzToastProvider', evidence: ['wiring'] },
    })
    resolveCompoundParents(classifications)
    expect(classifications.get('DzToastViewport')?.parentComponent).toBe('DzToast')
  })

  it('leaves an already-public parent untouched', () => {
    const classifications = map({
      DzCard: { kind: 'public-component', evidence: ['story'] },
      DzCardBody: { kind: 'compound-part', parentComponent: 'DzCard', evidence: ['prefix'] },
    })
    resolveCompoundParents(classifications)
    expect(classifications.get('DzCardBody')).toMatchObject({
      kind: 'compound-part',
      parentComponent: 'DzCard',
    })
  })

  it('downgrades a chain that never reaches a public component', () => {
    const classifications = map({
      DzGhost: { kind: 'unclassified', evidence: ['nothing'] },
      DzGhostPart: { kind: 'compound-part', parentComponent: 'DzGhost', evidence: ['prefix'] },
    })
    resolveCompoundParents(classifications)
    expect(classifications.get('DzGhostPart')?.kind).toBe('unclassified')
  })

  it('does not loop forever on a cycle', () => {
    const classifications = map({
      DzA: { kind: 'compound-part', parentComponent: 'DzB', evidence: ['x'] },
      DzB: { kind: 'compound-part', parentComponent: 'DzA', evidence: ['x'] },
    })
    resolveCompoundParents(classifications)
    expect(classifications.get('DzA')?.kind).toBe('unclassified')
    expect(classifications.get('DzB')?.kind).toBe('unclassified')
  })

  it('downgrades a part whose parent is missing from the manifest', () => {
    const classifications = map({
      DzOrphanPart: { kind: 'compound-part', parentComponent: 'DzNotHere', evidence: ['prefix'] },
    })
    resolveCompoundParents(classifications)
    expect(classifications.get('DzOrphanPart')?.kind).toBe('unclassified')
  })
})
