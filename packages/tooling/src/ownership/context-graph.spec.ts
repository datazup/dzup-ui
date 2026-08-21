import { describe, expect, it } from 'vitest'
import { buildContextGraph, contextComposablePairs, contextParentsOf } from './context-graph.ts'

describe('contextComposablePairs', () => {
  it('pairs useX with useXContext and ignores composables with no consumer half', () => {
    expect(contextComposablePairs([
      'useFormField',
      'useFormFieldContext',
      'useToast',
      'useClickOutside',
    ])).toEqual(['useFormField'])
  })

  it('ignores a lone useXContext with no provider half', () => {
    expect(contextComposablePairs(['useGhostContext'])).toEqual([])
  })
})

describe('buildContextGraph', () => {
  it('reads provide/inject injection keys', () => {
    const graph = buildContextGraph(new Map([
      ['DzTabs', 'provide(DZ_TABS_KEY, ctx)'],
      ['DzTabList', 'const ctx = inject(DZ_TABS_KEY)'],
    ]), [])

    expect(graph.providers.get('DZ_TABS_KEY')).toEqual(['DzTabs'])
    expect(graph.consumes.get('DzTabList')).toEqual(['DZ_TABS_KEY'])
  })

  it('reads a composable pair without mistaking the consumer call for the provider call', () => {
    const graph = buildContextGraph(new Map([
      ['DzFormField', 'useFormField({ id })'],
      ['DzFormLabel', 'const context = useFormFieldContext()'],
    ]), ['useFormField'])

    expect(graph.providers.get('composable:useFormField')).toEqual(['DzFormField'])
    expect(graph.consumes.get('DzFormLabel')).toEqual(['composable:useFormField'])
    expect(graph.providers.get('composable:useFormField')).not.toContain('DzFormLabel')
  })

  it('records one provider once, however many times it provides', () => {
    const graph = buildContextGraph(new Map([
      ['DzDialog', 'provide(DZ_DIALOG_KEY, a)\nprovide(DZ_DIALOG_KEY, b)'],
    ]), [])
    expect(graph.providers.get('DZ_DIALOG_KEY')).toEqual(['DzDialog'])
  })
})

describe('contextParentsOf', () => {
  const graph = buildContextGraph(new Map([
    ['DzResizable', 'provide(DZ_RESIZABLE_KEY, ctx)'],
    ['DzSplitter', 'provide(DZ_RESIZABLE_KEY, ctx)'],
    ['DzSplitterPanel', 'inject(DZ_RESIZABLE_KEY)'],
    ['DzOutsider', 'provide(DZ_RESIZABLE_KEY, ctx)'],
  ]), [])

  it('returns every family member that provides a token the symbol consumes', () => {
    expect(contextParentsOf('DzSplitterPanel', ['DzResizable', 'DzSplitter', 'DzSplitterPanel'], graph))
      .toEqual(['DzResizable', 'DzSplitter'])
  })

  it('ignores providers outside the family — cross-family wiring is a defect to report, not a parent', () => {
    expect(contextParentsOf('DzSplitterPanel', ['DzSplitterPanel'], graph)).toEqual([])
  })

  it('returns nothing for a symbol that consumes no context', () => {
    expect(contextParentsOf('DzResizable', ['DzResizable'], graph)).toEqual([])
  })
})
