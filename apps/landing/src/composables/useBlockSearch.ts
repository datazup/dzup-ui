/**
 * useBlockSearch — the headless data layer behind /blocks discovery.
 *
 * A dependency-free composable that filters the `BLOCKS` registry by free-text
 * query, by tag and by component name, and exposes the inverse "blocks using
 * <Dz*>" lookup. It is the single filtering path shared by every discovery UI
 * (the search bar E3, the ⌘K palette E2, the component reverse-lookup E4), so
 * those tasks build *views* over this state rather than re-deriving it.
 *
 * Purely reactive (`ref`/`computed`) — no DOM, no component imports — so it is
 * unit-testable without mounting. Browse stays category-indexed; this powers the
 * "results" overlay that spans all categories when a filter is active
 * (docs/blocks.md §3.1).
 */

import type { ComputedRef, Ref } from 'vue'
import type { BlockDef } from '../blocks/registry.ts'
import type { WeightedField } from '../lib/searchScore.ts'
import { computed, ref } from 'vue'
import { allComponents, allTags, BLOCKS, blocksUsingComponent } from '../blocks/registry.ts'
import { scoreFields } from '../lib/searchScore.ts'

/**
 * Per-field weights for query ranking. A block's score is the sum of the weights
 * of the fields its query matches, so a title hit outranks a description- or
 * component-only hit (the only ordering guarantee the spec asks for). Blocks with
 * equal scores keep registry order.
 */
const FIELD_WEIGHT = {
  title: 100,
  id: 10,
  tag: 5,
  component: 2,
  description: 1,
} as const

/**
 * The block's matchable fields, weighted. Tags/components collapse to one
 * space-joined value each — a substring hit anywhere in the group counts once,
 * matching the original `.some(...)` semantics — so the shared {@link scoreFields}
 * ranker treats a block exactly as the old bespoke `scoreBlock` did.
 */
function blockFields(block: BlockDef): WeightedField[] {
  return [
    { value: block.title, weight: FIELD_WEIGHT.title },
    { value: block.id, weight: FIELD_WEIGHT.id },
    { value: block.tags.join(' '), weight: FIELD_WEIGHT.tag },
    { value: block.components.join(' '), weight: FIELD_WEIGHT.component },
    { value: block.description, weight: FIELD_WEIGHT.description },
  ]
}

/** Sum of matched-field weights for `block` against the normalized query `q` (0 = no match). */
function scoreBlock(block: BlockDef, q: string): number {
  return scoreFields(blockFields(block), q)
}

/** The reactive surface returned by {@link useBlockSearch}. */
export interface UseBlockSearch {
  /** Free-text query; matched case-insensitively against title/description/id/tags/components. */
  query: Ref<string>
  /** Active tag facet — a block must carry *every* active tag to pass (AND semantics). */
  activeTags: Ref<string[]>
  /** Active component facet — exact `Dz*` name; narrows to blocks whose `components[]` include it. */
  activeComponent: Ref<string | null>
  /**
   * The filtered, ranked catalog. With no query and no facets it is the full
   * catalog in registry order. Facets (tags AND component) narrow it; a query
   * then keeps only text matches, ranked title-first.
   */
  results: ComputedRef<BlockDef[]>
  /** Whether any filter (query, tags or component) is active — i.e. show results mode, not the deck. */
  isFiltering: ComputedRef<boolean>
  /**
   * Drop every active filter (text, tags and the component reverse-lookup) and
   * restore the deck. Owned here (TASK-BV2-07) so the search bar's Clear and
   * the empty state's "Clear filters" are the same code path.
   */
  clearAll: () => void
  /** Unique, sorted tag list for building filter chips (memoized off the registry). */
  allTags: typeof allTags
  /** Unique, sorted component-name list (memoized off the registry). */
  allComponents: typeof allComponents
  /** Reverse lookup: blocks whose `components[]` include `name`, in registry order. */
  blocksUsingComponent: typeof blocksUsingComponent
}

/**
 * Create an isolated search state over the block catalog. Each call returns its
 * own `query`/`activeTags`/`activeComponent` refs, so distinct surfaces (page
 * filter vs. palette) can hold independent state; the derived registry helpers
 * are shared singletons.
 */
export function useBlockSearch(): UseBlockSearch {
  const query = ref('')
  const activeTags = ref<string[]>([])
  const activeComponent = ref<string | null>(null)

  const isFiltering = computed(
    () =>
      query.value.trim() !== '' || activeTags.value.length > 0 || activeComponent.value !== null,
  )

  const results = computed<BlockDef[]>(() => {
    const q = query.value.trim().toLowerCase()
    const tags = activeTags.value
    const component = activeComponent.value

    // Faceted filters first, preserving registry order. AND semantics: a block
    // must carry every active tag (and the active component) to survive.
    let pool = BLOCKS as readonly BlockDef[]
    if (tags.length > 0) {
      pool = pool.filter(block => tags.every(tag => block.tags.includes(tag)))
    }
    if (component !== null) {
      pool = pool.filter(block => block.components.includes(component))
    }

    // No text query → return the faceted pool in registry order (a copy, so
    // callers can't mutate BLOCKS through the result).
    if (q === '')
      return [...pool]

    // Rank text matches: title hits before description/component hits; ties keep
    // registry order via the carried index.
    return pool
      .map((block, index) => ({ block, index, score: scoreBlock(block, q) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .map(entry => entry.block)
  })

  function clearAll(): void {
    query.value = ''
    activeTags.value = []
    activeComponent.value = null
  }

  return {
    query,
    activeTags,
    activeComponent,
    results,
    isFiltering,
    clearAll,
    allTags,
    allComponents,
    blocksUsingComponent,
  }
}
