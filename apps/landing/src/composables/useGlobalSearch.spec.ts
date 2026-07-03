/**
 * useGlobalSearch — data-layer tests for the site-wide ⌘K palette.
 *
 * Exercises the unified index without mounting: the empty-query popular default,
 * cross-catalog matching, title-first ranking (shared with the blocks filter),
 * and that each result carries a resolvable routing payload for its kind.
 * Expectations derive from the live registries so they stay correct as the
 * catalogs grow — they assert behaviour, not a frozen snapshot.
 */

import { describe, expect, it } from 'vitest'
import { useGlobalSearch } from './useGlobalSearch.ts'
import type { SearchKind } from './useGlobalSearch.ts'

const kinds = (docs: { kind: SearchKind }[]): SearchKind[] => docs.map((d) => d.kind)

describe('useGlobalSearch', () => {
  it('exposes the documented reactive surface', () => {
    const search = useGlobalSearch()
    expect(search.query.value).toBe('')
    expect(search.isEmpty.value).toBe(true)
    expect(Array.isArray(search.results.value)).toBe(true)
  })

  it('shows a curated popular set spanning all three kinds when empty', () => {
    const { results } = useGlobalSearch()
    const present = new Set(kinds(results.value))
    expect(present.has('component')).toBe(true)
    expect(present.has('block')).toBe(true)
    expect(present.has('template')).toBe(true)
    // Every popular row must be routable.
    for (const doc of results.value) {
      expect(doc.storyId ?? doc.blockId ?? doc.slug).toBeTruthy()
    }
  })

  it('treats a whitespace-only query as empty', () => {
    const { query, results, isEmpty } = useGlobalSearch()
    const popular = results.value
    query.value = '   '
    expect(isEmpty.value).toBe(true)
    expect(results.value).toBe(popular)
  })

  it('surfaces the component, blocks and templates for "button"', () => {
    const { query, results } = useGlobalSearch()
    query.value = 'button'
    const present = new Set(kinds(results.value))
    expect(present.has('component')).toBe(true)
    expect(present.has('block')).toBe(true)
    // The DzButton component is a title hit, so it must appear.
    expect(results.value.some((d) => d.kind === 'component' && d.title === 'DzButton')).toBe(true)
  })

  it('ranks a title hit above a description-only hit', () => {
    const { query, results } = useGlobalSearch()
    query.value = 'pricing'
    // A block/template whose title contains "pricing" outranks one that only
    // mentions it in its blurb/description.
    const titleHit = results.value.findIndex((d) => d.title.toLowerCase().includes('pricing'))
    const descOnly = results.value.findIndex(
      (d) => !d.title.toLowerCase().includes('pricing') && d.haystack.includes('pricing'),
    )
    expect(titleHit).toBeGreaterThanOrEqual(0)
    if (descOnly !== -1) expect(titleHit).toBeLessThan(descOnly)
  })

  it('routes component results into Storybook by story id', () => {
    const { query, results } = useGlobalSearch()
    query.value = 'dztable'
    const table = results.value.find((d) => d.kind === 'component' && d.title === 'DzTable')
    expect(table?.storyId).toBe('core-data-dztable')
  })

  it('returns no matches for a nonsense query', () => {
    const { query, results } = useGlobalSearch()
    query.value = 'zzzznotathing'
    expect(results.value).toEqual([])
  })
})
