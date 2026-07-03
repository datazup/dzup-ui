/**
 * useGlobalSearch — the headless data layer behind the site-wide ⌘K palette.
 *
 * Unifies the three catalogs a visitor reaches for from anywhere on the site into
 * one ranked, fuzzy-searchable index:
 *   • Components — every `@dzup-ui/core` component with a Storybook docs page
 *     (`src/generated/components.ts`), deep-linked into Storybook.
 *   • Blocks     — the `/blocks` registry, routed to each block's `/blocks/:id`.
 *   • Templates  — the `/templates` registry, routed to `/templates/:slug`.
 *
 * It reuses the SAME weighted-field ranker as the blocks-only filter
 * ({@link rankBySearch} / `scoreFields` in `../lib/searchScore.ts`) — title hits
 * beat tag/description hits, ties keep source order — so all discovery surfaces
 * rank identically instead of each re-deriving the scoring. Purely reactive
 * (`ref`/`computed`), no DOM, so it is unit-testable without mounting.
 *
 * With no query it returns a small curated "popular" set spanning all three
 * kinds (the palette's empty-state default); with a query it returns the ranked
 * matches across every kind, which the palette groups by `kind` for display.
 */

import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { BLOCKS, CATEGORIES } from '../blocks/registry.ts'
import { TEMPLATES, TEMPLATE_CATEGORIES } from '../templates/registry.ts'
import { COMPONENTS } from '../generated/components.ts'
import { rankBySearch } from '../lib/searchScore.ts'
import type { WeightedField } from '../lib/searchScore.ts'

/** Which catalog a result came from — also the palette group it renders under. */
export type SearchKind = 'component' | 'block' | 'template'

/**
 * One unified, rankable search result. `fields` carries the weighted text the
 * shared ranker scores; `haystack` is the flat lowercased search text the
 * palette's own label-substring filter runs on (so it never drops a ranked
 * match); the `storyId`/`blockId`/`slug` triple is the routing payload the
 * palette resolves on select (exactly one is set per `kind`).
 */
export interface SearchDoc {
  kind: SearchKind
  /** Stable, unique palette item id, e.g. `component:DzButton`. */
  id: string
  /** Visible primary text (component name / block title / template name). */
  title: string
  /** Secondary line — the family or category the result belongs to. */
  meta: string
  /** Flat lowercased search text for the palette's built-in label filter. */
  haystack: string
  /** Weighted fields for {@link rankBySearch}. */
  fields: WeightedField[]
  /** Component → `storybookDocs(storyId)`. */
  storyId?: string
  /** Block → `/blocks/:id`. */
  blockId?: string
  /** Template → `/templates/:slug`. */
  slug?: string
}

/** Per-field ranking weights, shared shape across kinds (title always dominates). */
const WEIGHT = {
  title: 100,
  id: 10,
  tag: 5,
  category: 3,
  component: 2,
  description: 1,
} as const

const blockCategoryLabel = new Map(CATEGORIES.map((c) => [c.id, c.label]))
const templateCategoryLabel = new Map(TEMPLATE_CATEGORIES.map((c) => [c.key, c.label]))

/** Build the component docs. */
function componentDocs(): SearchDoc[] {
  return COMPONENTS.map((c) => {
    const haystack = `${c.name} ${c.familyLabel} ${c.family}`.toLowerCase()
    return {
      kind: 'component' as const,
      id: `component:${c.name}`,
      title: c.name,
      meta: c.familyLabel,
      haystack,
      fields: [
        { value: c.name, weight: WEIGHT.title },
        { value: `${c.familyLabel} ${c.family}`, weight: WEIGHT.category },
      ],
      storyId: c.storyId,
    }
  })
}

/** Build the block docs (registry order). */
function blockDocs(): SearchDoc[] {
  return BLOCKS.map((b) => {
    const categoryLabel = blockCategoryLabel.get(b.category) ?? b.category
    const haystack =
      `${b.title} ${b.id} ${b.tags.join(' ')} ${b.components.join(' ')} ${b.description} ${categoryLabel}`.toLowerCase()
    return {
      kind: 'block' as const,
      id: `block:${b.id}`,
      title: b.title,
      meta: categoryLabel,
      haystack,
      fields: [
        { value: b.title, weight: WEIGHT.title },
        { value: b.id, weight: WEIGHT.id },
        { value: b.tags.join(' '), weight: WEIGHT.tag },
        { value: categoryLabel, weight: WEIGHT.category },
        { value: b.components.join(' '), weight: WEIGHT.component },
        { value: b.description, weight: WEIGHT.description },
      ],
      blockId: b.id,
    }
  })
}

/** Build the template docs (registry order). */
function templateDocs(): SearchDoc[] {
  return TEMPLATES.map((t) => {
    const categoryLabel = templateCategoryLabel.get(t.category) ?? t.category
    const tags = t.tags?.join(' ') ?? ''
    const haystack =
      `${t.name} ${t.slug} ${tags} ${t.stack.join(' ')} ${t.blurb} ${categoryLabel}`.toLowerCase()
    return {
      kind: 'template' as const,
      id: `template:${t.slug}`,
      title: t.name,
      meta: categoryLabel,
      haystack,
      fields: [
        { value: t.name, weight: WEIGHT.title },
        { value: t.slug, weight: WEIGHT.id },
        { value: tags, weight: WEIGHT.tag },
        { value: categoryLabel, weight: WEIGHT.category },
        { value: t.stack.join(' '), weight: WEIGHT.component },
        { value: t.blurb, weight: WEIGHT.description },
      ],
      slug: t.slug,
    }
  })
}

/**
 * The unified index, built once (the three registries are immutable). Component
 * docs first, then blocks, then templates — the source order the ranker preserves
 * on score ties and the empty-state default draws from.
 */
const INDEX: SearchDoc[] = [...componentDocs(), ...blockDocs(), ...templateDocs()]

/** Fast id → doc lookup for assembling the curated empty-state default. */
const BY_ID = new Map(INDEX.map((doc) => [doc.id, doc]))

/**
 * Curated "most-popular" defaults shown when the query is empty — the components,
 * blocks and templates a first-time visitor is most likely to want. Ids that no
 * longer resolve (a renamed block/template) are skipped, and any `featured`
 * template is appended, so the default stays useful without hand-maintenance.
 */
const POPULAR_IDS = [
  'component:DzButton',
  'component:DzInput',
  'component:DzSelect',
  'component:DzCard',
  'component:DzTable',
  'component:DzDialog',
  'block:hero-split',
  'block:pricing-3',
  'block:sign-in',
  'block:stat-row',
  'template:analytics-dashboard',
  'template:sign-in',
]

const POPULAR: SearchDoc[] = (() => {
  const seen = new Set<string>()
  const out: SearchDoc[] = []
  for (const id of POPULAR_IDS) {
    const doc = BY_ID.get(id)
    if (doc && !seen.has(doc.id)) {
      seen.add(doc.id)
      out.push(doc)
    }
  }
  for (const t of TEMPLATES) {
    if (!t.featured) continue
    const doc = BY_ID.get(`template:${t.slug}`)
    if (doc && !seen.has(doc.id)) {
      seen.add(doc.id)
      out.push(doc)
    }
  }
  return out
})()

/** The reactive surface returned by {@link useGlobalSearch}. */
export interface UseGlobalSearch {
  /** Free-text query; matched case-insensitively across all three catalogs. */
  query: Ref<string>
  /** Whether the query is blank (i.e. show the popular default, not ranked hits). */
  isEmpty: ComputedRef<boolean>
  /**
   * The results to render: the curated popular set when the query is blank, else
   * the ranked cross-catalog matches (title-first, ties in index order).
   */
  results: ComputedRef<SearchDoc[]>
}

/**
 * Create an isolated global-search state over the unified component/block/template
 * index. The index and popular default are shared module singletons (built once);
 * each call owns its own `query` ref so independent surfaces don't collide.
 */
export function useGlobalSearch(): UseGlobalSearch {
  const query = ref('')

  const isEmpty = computed(() => query.value.trim() === '')

  const results = computed<SearchDoc[]>(() => {
    const q = query.value.trim().toLowerCase()
    if (q === '') return POPULAR
    return rankBySearch(INDEX, q, (doc) => doc.fields)
  })

  return { query, isEmpty, results }
}
