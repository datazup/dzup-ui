/**
 * useBlockSearch — data-layer tests (docs/blocks.md §3.1, Task E1).
 *
 * Exercises the headless filtering surface without mounting: query matching and
 * ranking, the tag and component facets, the reverse lookup, and the empty-query
 * default (full catalog, registry order). Assertions derive expectations from the
 * live `BLOCKS` array so they stay correct as the catalog grows — they assert the
 * filtering *behaviour*, not a frozen snapshot of the catalog.
 */

import { describe, expect, it } from 'vitest'
import { BLOCKS } from '../blocks/registry.ts'
import { useBlockSearch } from './useBlockSearch.ts'

const ids = (blocks: { id: string }[]): string[] => blocks.map(block => block.id)

describe('useBlockSearch', () => {
  it('exposes the documented reactive surface', () => {
    const search = useBlockSearch()
    expect(search.query.value).toBe('')
    expect(search.activeTags.value).toEqual([])
    expect(search.activeComponent.value).toBeNull()
    expect(Array.isArray(search.results.value)).toBe(true)
    expect(search.isFiltering.value).toBe(false)
  })

  it('returns all blocks in registry order for an empty query', () => {
    const { results } = useBlockSearch()
    expect(results.value).toEqual(BLOCKS)
    expect(ids(results.value)).toEqual(ids(BLOCKS))
  })

  it('treats a whitespace-only query as empty', () => {
    const { query, results, isFiltering } = useBlockSearch()
    query.value = '   '
    expect(isFiltering.value).toBe(false)
    expect(results.value).toEqual(BLOCKS)
  })

  it('does not leak a mutable reference to BLOCKS', () => {
    const { results } = useBlockSearch()
    expect(results.value).not.toBe(BLOCKS)
  })

  it('matches a query case-insensitively against title/description/id/tags/components', () => {
    const { query, results } = useBlockSearch()
    query.value = 'PRICING'
    const matched = ids(results.value)
    // "Three-tier pricing" — title + id (pricing-3) + tag ('pricing') all hit.
    expect(matched).toContain('pricing-3')
    // Every result must genuinely match the query somewhere.
    for (const block of results.value) {
      const haystack = [
        block.title,
        block.description,
        block.id,
        ...block.tags,
        ...block.components,
      ]
        .join(' ')
        .toLowerCase()
      expect(haystack).toContain('pricing')
    }
  })

  it('ranks title hits ahead of description-only hits', () => {
    const { query, results } = useBlockSearch()
    query.value = 'hero'
    const matched = ids(results.value)
    // hero-centered ("Centered hero") and hero-split ("Split hero with media")
    // match on title; they must lead the description-only matches (e.g. the
    // bento-grid blurb mentions a "revenue hero").
    expect(matched.slice(0, 2)).toEqual(['hero-centered', 'hero-split'])
    if (matched.includes('bento-grid')) {
      expect(matched.indexOf('hero-centered')).toBeLessThan(matched.indexOf('bento-grid'))
    }
  })

  it('finds blocks by component name in the query', () => {
    const { query, results } = useBlockSearch()
    query.value = 'dztable'
    const matched = ids(results.value)
    expect(matched).toContain('table-card')
    for (const block of results.value) {
      const hit = block.components.some(name => name.toLowerCase().includes('dztable'))
      // a component-name match is the only reason these surface for this query
      expect(hit).toBe(true)
    }
  })

  it('narrows results by an active tag (AND semantics), preserving registry order', () => {
    const { activeTags, results, isFiltering } = useBlockSearch()
    activeTags.value = ['cta']
    expect(isFiltering.value).toBe(true)
    const expected = BLOCKS.filter(block => block.tags.includes('cta'))
    expect(results.value).toEqual(expected)
    expect(results.value.length).toBeLessThan(BLOCKS.length)
    expect(results.value.length).toBeGreaterThan(0)
  })

  it('requires every active tag to be present (intersection, not union)', () => {
    const { activeTags, results } = useBlockSearch()
    activeTags.value = ['hero', 'image']
    for (const block of results.value) {
      expect(block.tags).toContain('hero')
      expect(block.tags).toContain('image')
    }
    // hero-split carries both; hero-centered carries only 'hero' and is excluded.
    const matched = ids(results.value)
    expect(matched).toContain('hero-split')
    expect(matched).not.toContain('hero-centered')
  })

  it('combines a tag facet with a text query', () => {
    const { query, activeTags, results } = useBlockSearch()
    activeTags.value = ['cta']
    query.value = 'hero'
    const matched = ids(results.value)
    for (const block of results.value) {
      expect(block.tags).toContain('cta')
    }
    expect(matched).toContain('hero-centered')
    // cta-band has the 'cta' tag but no 'hero' text → filtered out by the query.
    expect(matched).not.toContain('cta-band')
  })

  it('narrows by an active component facet', () => {
    const { activeComponent, results, isFiltering } = useBlockSearch()
    activeComponent.value = 'DzTable'
    expect(isFiltering.value).toBe(true)
    const expected = BLOCKS.filter(block => block.components.includes('DzTable'))
    expect(results.value).toEqual(expected)
    for (const block of results.value) {
      expect(block.components).toContain('DzTable')
    }
  })

  describe('blocksUsingComponent', () => {
    it('returns only blocks whose components[] includes the name, in registry order', () => {
      const { blocksUsingComponent } = useBlockSearch()
      const using = blocksUsingComponent('DzButton')
      expect(using.length).toBeGreaterThan(0)
      for (const block of using) {
        expect(block.components).toContain('DzButton')
      }
      const expected = BLOCKS.filter(block => block.components.includes('DzButton'))
      expect(using).toEqual(expected)
    })

    it('excludes blocks that do not use the component', () => {
      const { blocksUsingComponent } = useBlockSearch()
      const usingTable = blocksUsingComponent('DzTable')
      // button-showcase is built from DzButton/DzText only — never DzTable.
      expect(ids(usingTable)).not.toContain('button-showcase')
    })

    it('matches component names exactly and returns [] for unknown names', () => {
      const { blocksUsingComponent } = useBlockSearch()
      expect(blocksUsingComponent('DzNotAComponent')).toEqual([])
      // exact match: the lower-cased name is not a real export key
      expect(blocksUsingComponent('dzbutton')).toEqual([])
    })

    it('returns a fresh array callers may mutate without corrupting the index', () => {
      const { blocksUsingComponent } = useBlockSearch()
      const first = blocksUsingComponent('DzButton')
      first.pop()
      expect(blocksUsingComponent('DzButton').length).toBe(first.length + 1)
    })
  })

  describe('allTags / allComponents', () => {
    it('allTags is unique, sorted, and covers every tag in the catalog', () => {
      const { allTags } = useBlockSearch()
      const tags = allTags()
      expect([...tags]).toEqual([...tags].sort())
      expect(new Set(tags).size).toBe(tags.length)
      const everyTag = new Set(BLOCKS.flatMap(block => block.tags))
      expect(new Set(tags)).toEqual(everyTag)
    })

    it('allComponents is the unique, sorted union of every block components[]', () => {
      const { allComponents } = useBlockSearch()
      const components = allComponents()
      expect([...components]).toEqual([...components].sort())
      expect(new Set(components).size).toBe(components.length)
      const everyComponent = new Set(BLOCKS.flatMap(block => block.components))
      expect(new Set(components)).toEqual(everyComponent)
      expect(components).toContain('DzButton')
    })

    it('memoizes the derived lists (stable identity across calls)', () => {
      const { allTags, allComponents } = useBlockSearch()
      expect(allTags()).toBe(allTags())
      expect(allComponents()).toBe(allComponents())
    })
  })
})
