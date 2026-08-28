<script setup lang="ts">
import type { CommandGroup, CommandItem } from '@dzup-ui/core'
import type { Component } from 'vue'
import type { TemplateCategory, TemplateMeta } from '../templates/registry.ts'
import {
  DzBadge,
  DzButton,
  DzCommandPalette,
  DzEmpty,
  DzSearchInput,
  DzSegmented,
  DzSelect,
  DzTag,
  DzText,
  DzVisuallyHidden,
} from '@dzup-ui/core'
import { ArrowUpRight, Command, LayoutTemplate, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Section from '../components/Section.vue'
import TemplatesHeroField from '../components/templates/TemplatesHeroField.vue'
import { useTheme } from '../composables/useTheme.ts'
import { ICONS } from '../icons.ts'
import { DzCountUp, DzOdometer, useReducedMotion, vMagnetic, vReveal, vTilt } from '../motion/index.ts'
import { resolveTemplateAccent } from '../templates/accent.ts'
import { isNew, TEMPLATE_CATEGORIES, TEMPLATE_TAGS, TEMPLATES } from '../templates/registry.ts'
import { darkThumb, templateThumb } from '../templates/thumbs.ts'

/**
 * Templates gallery (/templates) — the marketing-grade index for the free,
 * full-page starters built from `@dzup-ui/core` (docs/templates.md §2, §5, §6).
 *
 * Mirrors `ComponentGallery.vue`: a `Section` shell, a staggered `lp-card` grid
 * with whole-card cover links, and token-only styling. On top of the original
 * `DzSegmented` category filter (preserved), this adds the discovery surface a
 * >20-item catalogue needs (docs/templates.md §2): a debounced inline search, a
 * ⌘K command palette, AND-composing tag chips, "Featured"/"New" badges and a
 * sort control. Every facet feeds ONE filter pipeline (query → category → tags →
 * sort), and the palette reuses the exact same text predicate as the inline
 * search, so the two never disagree about what matches.
 */

const router = useRouter()

const count = TEMPLATES.length

/** Slug → template, for O(1) lookups from palette items (keyed by slug). */
const bySlug = new Map<string, TemplateMeta>(TEMPLATES.map(t => [t.slug, t]))

/** Category key → display label, for the per-card category caption + palette. */
const categoryLabels = new Map<TemplateCategory, string>(
  TEMPLATE_CATEGORIES.map(c => [c.key, c.label]),
)

/** Category key → decorative palette name, for the per-card accent tint. */
const categoryAccents = new Map<TemplateCategory, string>(
  TEMPLATE_CATEGORIES.map(c => [c.key, c.accent]),
)

/** Tag key → display label, so search can match the human label as well as the key. */
const tagLabelByKey = new Map<string, string>(TEMPLATE_TAGS.map(t => [t.key, t.label]))

/** Only the tags actually used by a template, in vocabulary order — no dead chips. */
const tagFilterItems = TEMPLATE_TAGS.filter(tag =>
  TEMPLATES.some(t => t.tags?.includes(tag.key)),
)

/**
 * Single "now" read for the whole render so every `isNew()` call agrees and the
 * clock is read once (in setup, never at module load). The 24 shipped rows all
 * predate the 30-day window, so none light up today — the C-task templates dated
 * on their ship date are what surface the "New" badge.
 */
const now = new Date()
function isNewTemplate(t: TemplateMeta): boolean {
  return isNew(t, now)
}

/** Resolve a registry icon key to its component, falling back to a generic one. */
function iconFor(key: string): Component {
  return ICONS[key] ?? LayoutTemplate
}

// ---------------------------------------------------------------------------
// Thumbnails (light/dark pair) with a graceful icon fallback
// ---------------------------------------------------------------------------

/**
 * Current resolved theme — drives which thumbnail variant a card shows. Paired
 * thumbnails follow the convention `<thumb>.webp` (light) + `<thumb>-dark.webp`
 * (dark): the registry stores the light path in `thumbnail`, and the dark path
 * is derived by inserting `-dark` before the extension. E6 must generate BOTH
 * files for any template that sets `thumbnail`.
 */
const { resolved } = useTheme()

/**
 * Page-level reduced-motion signal for the card tilt (TASK-TV2-03); the
 * directive additionally self-gates on the OS setting and on coarse pointers.
 */
const reduced = useReducedMotion()

/**
 * Card thumbnails (TASK-TV2-03): every tile renders BOTH theme variants as
 * stacked imgs and cross-fades between them on theme change — the old
 * `thumbFor()` src swap made all 46 screenshots blank/refetch at flip time.
 *
 * Every registry template is GUARANTEED a light AND dark WebP:
 * `scripts/check-template-previews.ts` fails the build when either is missing
 * (FREE2-09), so neither layer needs a fallback. Path derivation is shared with
 * the hero depth field via `templates/thumbs.ts`. Both imgs stay `loading="lazy"`
 * so offscreen fetches remain deferred.
 */
function lightThumbFor(t: TemplateMeta): string {
  return templateThumb(t)
}
function darkThumbFor(t: TemplateMeta): string {
  return darkThumb(templateThumb(t))
}

/**
 * Counted-up catalogue truth for the hero stats row (TASK-TV2-02): every figure
 * derived from the registry at setup — never hand-typed (repo rule).
 */
const heroStats = {
  templates: TEMPLATES.length,
  categories: TEMPLATE_CATEGORIES.length,
  components: new Set(TEMPLATES.flatMap(t => t.stack)).size,
}

// ---------------------------------------------------------------------------
// The shared filter predicate
// ---------------------------------------------------------------------------

/**
 * The lowercased text a query is matched against: name + blurb + tag keys + tag
 * labels. Concatenating once means a single `includes()` covers every field, and
 * it is the SAME haystack the command-palette items carry as their `label`, so
 * the palette's built-in substring filter and the inline grid filter resolve to
 * identical results.
 */
function haystack(t: TemplateMeta): string {
  const tagText = (t.tags ?? []).map(k => tagLabelByKey.get(k) ?? k).join(' ')
  return `${t.name} ${t.blurb} ${(t.tags ?? []).join(' ')} ${tagText}`.toLowerCase()
}

/**
 * The one text predicate shared by the inline search and the ⌘K palette. `q` is
 * expected pre-normalized (trimmed + lowercased) by the caller; empty matches all.
 */
function matchesQuery(t: TemplateMeta, q: string): boolean {
  if (!q)
    return true
  return haystack(t).includes(q)
}

// ---------------------------------------------------------------------------
// Filter / sort state
// ---------------------------------------------------------------------------

/** Raw search box value (updates on every keystroke). */
const searchRaw = ref('')
/** Debounced, normalized query that actually drives the grid (180ms after typing). */
const query = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | undefined
watch(searchRaw, (value) => {
  if (debounceTimer !== undefined)
    clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    query.value = value.trim().toLowerCase()
  }, 180)
})
onBeforeUnmount(() => {
  if (debounceTimer !== undefined)
    clearTimeout(debounceTimer)
})

/** Active category; 'all' shows every category. */
const activeCategory = ref<string>('all')
/** Active tag facets — AND semantics: a row must carry *every* active tag. */
const activeTags = ref<string[]>([])
/** Sort mode, applied after filtering. Kept as a plain string for DzSelect's v-model. */
const sortMode = ref<string>('featured')

const sortItems = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'A–Z' },
]

function toggleTag(key: string): void {
  const i = activeTags.value.indexOf(key)
  if (i === -1)
    activeTags.value = [...activeTags.value, key]
  else activeTags.value = activeTags.value.filter(k => k !== key)
}

const hasActiveFilters = computed(
  () => query.value !== '' || activeCategory.value !== 'all' || activeTags.value.length > 0,
)

function clearFilters(): void {
  searchRaw.value = ''
  query.value = ''
  activeCategory.value = 'all'
  activeTags.value = []
}

/**
 * The catalogue's most-used tags (TASK-TV2-04) — the empty state's ramps back
 * in. Frequency-derived from the registry (ties broken by vocabulary order),
 * EXCLUDING tags already active: those just participated in the dead end, so
 * suggesting them back is a guaranteed second dead end. Each suggestion,
 * applied alone, always yields ≥1 result by construction (it appears on at
 * least one template).
 */
const suggestedTags = computed<string[]>(() => {
  const freq = new Map<string, number>()
  for (const t of TEMPLATES) {
    for (const tag of t.tags ?? []) freq.set(tag, (freq.get(tag) ?? 0) + 1)
  }
  // Widened to string keys: `freq` iterates plain strings, and a closed-union
  // Map would reject `.get(string)` under strict checks.
  const order = new Map<string, number>(TEMPLATE_TAGS.map((t, i) => [t.key, i]))
  return [...freq.entries()]
    .filter(([tag]) => !activeTags.value.includes(tag))
    .sort((a, b) => b[1] - a[1] || (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0))
    .slice(0, 3)
    .map(([tag]) => tag)
})

/** Replace the failing filter state with just the suggested tag. */
function applySuggestedTag(tag: string): void {
  clearFilters()
  activeTags.value = [tag]
}

// ---------------------------------------------------------------------------
// The pipeline: query → tags → (counts) → category → sort
// ---------------------------------------------------------------------------

function matchesTags(t: TemplateMeta): boolean {
  // Widen the row's `TemplateTag[]` to string[] for the comparison: `activeTags`
  // is a plain string[] (filter state is stringly-typed for v-model), and
  // `TemplateTag[].includes(string)` would not typecheck against the closed union.
  const tags: string[] = t.tags ?? []
  return activeTags.value.every(tag => tags.includes(tag))
}

/**
 * Templates passing the query + tag facets but BEFORE the category narrows them.
 * The category counts read off this set, so each segment shows how many results
 * it would hold under the current search/tags.
 */
const queryTagFiltered = computed<TemplateMeta[]>(() =>
  TEMPLATES.filter(t => matchesQuery(t, query.value) && matchesTags(t)),
)

function countFor(key: string): number {
  if (key === 'all')
    return queryTagFiltered.value.length
  return queryTagFiltered.value.filter(t => t.category === key).length
}

/** 'all' plus one segment per category, each label carrying its live count. */
const categoryItems = computed(() => [
  { value: 'all', label: `All (${countFor('all')})` },
  ...TEMPLATE_CATEGORIES.map(c => ({ value: c.key, label: `${c.label} (${countFor(c.key)})` })),
])

function sortTemplates(list: TemplateMeta[], mode: string): TemplateMeta[] {
  const copy = [...list]
  if (mode === 'newest') {
    return copy.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  }
  if (mode === 'az') {
    return copy.sort((a, b) => a.name.localeCompare(b.name))
  }
  // 'featured' (default): featured first; stable sort keeps registry order for ties.
  return copy.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
}

const visibleTemplates = computed<TemplateMeta[]>(() => {
  const inCategory
    = activeCategory.value === 'all'
      ? queryTagFiltered.value
      : queryTagFiltered.value.filter(t => t.category === activeCategory.value)
  return sortTemplates(inCategory, sortMode.value)
})

/**
 * Per-card CSS custom properties that paint a template's gallery card in its
 * accent hue. A template's own `accent` wins over its category default. We emit
 * a light/dark shade *pair* (600 reads on a light surface, 400 on a dark one)
 * plus a vivid 500 for the decorative preview wash, then let the stylesheet pick
 * the right foreground per theme — see the `--tile-accent` rules below. (The
 * entrance stagger moved to the `v-reveal` value — TASK-TV2-04: the old
 * `--reveal-delay` here fed a `.reveal` class no element ever carried.)
 */
function tileStyle(template: TemplateMeta): Record<string, string> {
  const palette = resolveTemplateAccent(template)
  return {
    '--tile-accent-light': `var(--dz-colors-${palette}-600)`,
    '--tile-accent-dark': `var(--dz-colors-${palette}-400)`,
    '--tile-accent-wash': `var(--dz-colors-${palette}-500)`,
  }
}

// ---------------------------------------------------------------------------
// ⌘K command palette
// ---------------------------------------------------------------------------

/**
 * The palette's open state. DzCommandPalette owns the global ⌘K / Ctrl+K binding
 * via `enable-global-shortcut` (it adds the `keydown` listener on mount and
 * removes it on unmount), so we don't register or tear down a listener ourselves.
 */
const paletteOpen = ref(false)
/** Mirrors the palette's own search box (via @search), so its items reuse `matchesQuery`. */
const paletteQuery = ref('')

const paletteGroups: CommandGroup[] = TEMPLATE_CATEGORIES.map(c => ({ id: c.key, label: c.label }))

const paletteItems = computed<CommandItem[]>(() => {
  const q = paletteQuery.value.trim().toLowerCase()
  return TEMPLATES.filter(t => matchesQuery(t, q))
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.name.localeCompare(b.name))
    .map(t => ({
      id: t.slug,
      // The label is the same haystack `matchesQuery` reads, so the palette's
      // built-in substring filter agrees with our predicate. Display is the
      // rich #item slot below — this string is never shown.
      label: haystack(t),
      group: t.category,
      icon: iconFor(t.icon),
    }))
})

/** Non-null slug → template lookup for the palette's #item slot. */
function templateOf(id: string): TemplateMeta {
  // Every palette item id is a registry slug, so the lookup always hits; the
  // assertion only satisfies `noUncheckedIndexedAccess` on the fallback.
  return bySlug.get(id) ?? TEMPLATES[0]!
}

function onPaletteSelect(item: CommandItem): void {
  router.push(`/templates/${item.id}`)
}

/** Platform-aware hint on the quick-find button (⌘K on mac, Ctrl K elsewhere). */
const isMac
  = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? '')
const shortcutHint = isMac ? '⌘K' : 'Ctrl K'

// ---------------------------------------------------------------------------
// Ambient atmosphere (TASK-TV2-01)
// ---------------------------------------------------------------------------

/**
 * Page-level ambient accent: the active category's hue, promoted from the card
 * tint to atmosphere. Set as `--tv2-accent` on the page root so the fixed
 * `.tv2-atmosphere` washes AND the section eyebrow inherit it; the `@property`
 * registration (unscoped style block below) makes the hue interpolable, so
 * switching categories cross-fades the room instead of snapping it. 'all'
 * mixes categories, so it settles to the neutral brand primary. Same recipe as
 * /blocks (TASK-BV2-01) with its own property name — both pages can live in one
 * SPA session and must not fight over a single registration.
 */
const atmosphereAccent = computed(() => {
  if (activeCategory.value === 'all')
    return 'var(--dz-primary)'
  const palette = categoryAccents.get(activeCategory.value as TemplateCategory)
  return palette ? `var(--dz-colors-${palette}-500)` : 'var(--dz-primary)'
})
</script>

<template>
  <!-- Single root: the page renders inside App.vue's <Transition>. The root owns
       the ambient accent (TASK-TV2-01) so the wash layer and the eyebrow inherit
       the interpolated hue through the cascade. -->
  <div class="templates-page" :style="{ '--tv2-accent': atmosphereAccent }">
    <!-- Ambient atmosphere: two fixed accent washes lit by the active category.
         Purely decorative — z-index -1 inside the page's own isolated stacking
         context, so it paints above the shell background but under every piece
         of content, and never intercepts the pointer. -->
    <div class="tv2-atmosphere" aria-hidden="true" />

    <!-- Depth field (TASK-TV2-02): featured template screenshots floating on a
         pointer-parallax stage, flanking the Section header. Decoration only —
         aria-hidden + inert, mounts post-paint, steps aside on narrow
         viewports, and never intercepts the pointer. -->
    <TemplatesHeroField />

    <Section
      eyebrow="Templates"
      :title="count ? `${count} free templates, built from core` : 'Templates, built from core'"
      lede="Full-page and full-app starters composed entirely from the free @dzup-ui/core components — themed, accessible and responsive out of the box."
      surface
      bordered
      heading-id="templates-title"
      :heading-level="1"
    >
      <!-- Counted-up catalogue truth (TASK-TV2-02): every figure derived from
           the registry (heroStats), rolling in-view via DzCountUp — which
           renders the final number immediately under reduced motion. -->
      <dl class="templates-hero-stats" aria-label="Catalogue size">
        <div class="templates-hero-stat">
          <dt class="templates-hero-stat-label">
            Templates
          </dt>
          <dd class="templates-hero-stat-value">
            <DzCountUp :value="heroStats.templates" size="lg" aria-label="templates in the catalogue" />
          </dd>
        </div>
        <div class="templates-hero-stat">
          <dt class="templates-hero-stat-label">
            Categories
          </dt>
          <dd class="templates-hero-stat-value">
            <DzCountUp :value="heroStats.categories" size="lg" aria-label="categories" />
          </dd>
        </div>
        <div class="templates-hero-stat">
          <dt class="templates-hero-stat-label">
            Components used
          </dt>
          <dd class="templates-hero-stat-value">
            <DzCountUp
              :value="heroStats.components"
              size="lg"
              aria-label="distinct core components used"
            />
          </dd>
        </div>
      </dl>

      <div class="templates-toolbar">
        <!-- Search + quick-find + sort -->
        <div class="templates-search-row">
          <DzSearchInput
            v-model="searchRaw"
            class="templates-search"
            placeholder="Search templates by name, tag or description…"
            aria-label="Search templates"
          />
          <!-- TASK-TV2-05: the quick-find button leans toward a fine pointer
               (the directive self-gates on coarse pointers + reduced motion). -->
          <DzButton
            v-magnetic="{ strength: 0.25, radius: 8, disabled: reduced }"
            class="templates-cmdk"
            variant="outline"
            size="md"
            :aria-label="`Open quick-find search (${shortcutHint})`"
            @click="paletteOpen = true"
          >
            <template #prefix>
              <Command :size="15" aria-hidden="true" />
            </template>
            Quick find
            <kbd class="templates-kbd">{{ shortcutHint }}</kbd>
          </DzButton>
          <DzSelect
            v-model="sortMode"
            class="templates-sort"
            :items="sortItems"
            size="md"
            aria-label="Sort templates"
          />
        </div>

        <!-- Category filter + trust framing -->
        <div class="templates-filter-row">
          <div class="templates-filter">
            <DzSegmented
              v-model="activeCategory"
              :items="categoryItems"
              size="sm"
              aria-label="Filter templates by category"
            />
          </div>
          <DzText size="sm" tone="muted" class="templates-note">
            Free · MIT
          </DzText>
        </div>

        <!-- Tag chips -->
        <div class="templates-tags" role="group" aria-label="Filter templates by tag">
          <button
            v-for="tag in tagFilterItems"
            :key="tag.key"
            type="button"
            class="tag-chip"
            :aria-pressed="activeTags.includes(tag.key)"
            @click="toggleTag(tag.key)"
          >
            <DzTag
              :variant="activeTags.includes(tag.key) ? 'solid' : 'subtle'"
              :tone="activeTags.includes(tag.key) ? 'primary' : 'neutral'"
              size="sm"
            >
              {{ tag.label }}
            </DzTag>
          </button>
          <!-- TASK-TV2-05: eased in/out instead of popping. -->
          <Transition name="tv2-fade">
            <DzButton
              v-if="hasActiveFilters"
              class="templates-clear"
              variant="ghost"
              size="sm"
              @click="clearFilters"
            >
              <template #prefix>
                <X :size="14" aria-hidden="true" />
              </template>
              Clear filters
            </DzButton>
          </Transition>
        </div>

        <Transition name="tv2-fade">
          <DzText
            v-if="hasActiveFilters"
            size="sm"
            tone="muted"
            as="span"
            class="templates-result-count"
            role="status"
            aria-live="polite"
          >
            <!-- SR text stays plain (live regions announce text, not aria-labels);
               the rolling digits are the visual layer only (TASK-TV2-04). -->
            <DzVisuallyHidden>
              Showing {{ visibleTemplates.length }} of {{ count }} templates
            </DzVisuallyHidden>
            <span aria-hidden="true" class="templates-result-count-visual">
              Showing <DzOdometer :value="visibleTemplates.length" size="sm" :duration="700" /> of
              {{ count }} templates
            </span>
          </DzText>
        </Transition>
      </div>

      <!-- FLIP choreography (TASK-TV2-04): survivors glide to their new grid
           slots on filter/sort changes, newcomers fade/scale in, leavers fade
           out. No `appear` — first paint belongs to v-reveal's staggered
           scroll-in, so the two entrance owners never double-fire. -->
      <!-- role="list" is the ul's implicit role, declared explicitly so the
           list semantics survive environments that stub TransitionGroup to a
           custom element (the a11y sweep mounts with test-utils' auto-stubs). -->
      <TransitionGroup
        v-if="visibleTemplates.length"
        name="tv2-flip"
        tag="ul"
        role="list"
        class="gallery-grid"
        aria-label="Templates"
      >
        <li
          v-for="(template, i) in visibleTemplates"
          :key="template.slug"
          v-tilt="{ max: 4.5, scale: 1.01, glare: true, disabled: reduced }"
          v-reveal="i * 45"
          class="lp-card lp-card--hover tile"
          :style="tileStyle(template)"
        >
          <div class="tile-head">
            <DzText weight="semibold" as="span">
              {{ template.name }}
            </DzText>
            <div v-if="template.featured || isNewTemplate(template)" class="tile-badges">
              <DzBadge v-if="template.featured" variant="solid" tone="primary" size="sm">
                Featured
              </DzBadge>
              <DzBadge v-if="isNewTemplate(template)" variant="solid" tone="success" size="sm">
                New
              </DzBadge>
            </div>
          </div>

          <span class="tile-category">{{ categoryLabels.get(template.category) }}</span>

          <div class="tile-preview" aria-hidden="true">
            <!-- Always a real screenshot: check-template-previews.ts guarantees a
               light + dark WebP per template, so there is no icon-glyph fallback.
               Both variants are stacked in one reserved box (zero CLS) and the
               resolved theme picks which one is opacity-visible (TASK-TV2-03). -->
            <div class="tile-shot">
              <img
                class="tile-thumb"
                :class="{ 'is-active': resolved !== 'dark' }"
                :src="lightThumbFor(template)"
                alt=""
                loading="lazy"
                decoding="async"
                width="1600"
                height="1000"
              >
              <img
                class="tile-thumb tile-thumb--overlay"
                :class="{ 'is-active': resolved === 'dark' }"
                :src="darkThumbFor(template)"
                alt=""
                loading="lazy"
                decoding="async"
                width="1600"
                height="1000"
              >
            </div>
          </div>

          <DzText size="xs" tone="muted" class="tile-stack" truncate>
            {{ template.stack.join(' · ') }}
          </DzText>

          <router-link class="tile-link" :to="`/templates/${template.slug}`">
            <span>View template</span>
            <ArrowUpRight :size="14" aria-hidden="true" />
            <span class="tile-link-cover" :aria-label="`View the ${template.name} template`" />
          </router-link>
        </li>
      </TransitionGroup>

      <DzEmpty
        v-else
        class="templates-empty"
        :icon="LayoutTemplate"
        title="No templates match those filters"
        description="Nothing matches this combination of search, category and tags — try loosening one."
      >
        <template #actions>
          <!-- Dead end, designed (TASK-TV2-04): the one true clear path plus the
               catalogue's most-used tags as ramps back in — derived, never
               hand-picked, and never a tag that just failed. -->
          <div class="templates-empty-actions">
            <DzButton variant="outline" size="sm" @click="clearFilters">
              Clear filters
            </DzButton>
            <button
              v-for="tag in suggestedTags"
              :key="tag"
              type="button"
              class="templates-empty-tag"
              :aria-label="`Show templates tagged ${tagLabelByKey.get(tag) ?? tag}`"
              @click="applySuggestedTag(tag)"
            >
              {{ tagLabelByKey.get(tag) ?? tag }}
            </button>
          </div>
        </template>
      </DzEmpty>

      <!-- ⌘K command palette: full-catalogue search, grouped by category. Selecting
         an entry jumps to its detail route. The global shortcut is owned by the
         component (registered on mount, removed on unmount). -->
      <DzCommandPalette
        v-model:open="paletteOpen"
        :items="paletteItems"
        :groups="paletteGroups"
        placeholder="Search templates by name, tag or description…"
        aria-label="Search templates"
        enable-global-shortcut
        @search="paletteQuery = $event"
        @select="onPaletteSelect"
      >
        <template #item="{ item }">
          <component
            :is="iconFor(templateOf(item.id).icon)"
            :size="16"
            class="palette-icon"
            aria-hidden="true"
          />
          <span class="palette-text">
            <span class="palette-name">{{ templateOf(item.id).name }}</span>
            <span class="palette-cat">{{ categoryLabels.get(templateOf(item.id).category) }}</span>
          </span>
          <DzBadge
            v-if="templateOf(item.id).featured"
            variant="subtle"
            tone="primary"
            size="sm"
          >
            Featured
          </DzBadge>
          <DzBadge
            v-if="isNewTemplate(templateOf(item.id))"
            variant="subtle"
            tone="success"
            size="sm"
          >
            New
          </DzBadge>
        </template>
        <template #empty>
          No templates match your search.
        </template>
      </DzCommandPalette>
    </Section>
  </div>
</template>

<style>
/* TASK-TV2-01 — register the ambient accent as a real <color> so the browser
   can interpolate it: switching categories then cross-fades the atmosphere's
   hue instead of snapping it. UNSCOPED on purpose: `@property` is a
   document-level registration (same precedent as BlocksIndexPage's
   `--bv2-accent` and App.vue's `::view-transition-*` block); the rule is
   harmless if this page never mounts. Browsers without @property simply snap
   the hue — behaviorally identical. */
@property --tv2-accent {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
</style>

<style scoped>
/* The page owns an isolated stacking context so `.tv2-atmosphere` (z-index -1)
   paints above `.landing-shell`'s opaque background (App.vue) yet below every
   child of the page — without isolation a negative z-index child would vanish
   behind the shell's background paint (the exact trap BV2-01 hit). */
.templates-page {
  isolation: isolate;
  /* Anchors the TV2-02 hero depth field (absolute against this box). */
  position: relative;
  /* The hue itself is animated (via the @property registration above); every
     wash/tint reading `--tv2-accent` follows the interpolated value. */
  transition: --tv2-accent 600ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

/* Two large, whisper-quiet radial washes in the active category's hue: one high
   behind the header, one at the trailing edge mid-page. Fixed so the room stays
   lit while scrolling; pointer-events none so it can never swallow a click.
   The washes read at the page margins around the opaque Section surface — the
   same geometry the /blocks atmosphere lights. */
.tv2-atmosphere {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(
      52rem 36rem at 12% -6%,
      color-mix(in oklch, var(--tv2-accent, var(--dz-primary, #0766ee)) 9%, transparent),
      transparent 70%
    ),
    radial-gradient(
      44rem 32rem at 104% 44%,
      color-mix(in oklch, var(--tv2-accent, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 72%
    );
}

/* Dark rooms need dimmer lamps: the same washes at a lower mix so the accent
   reads as ambience, not a spotlight, on the dark background. */
:root[data-theme='dark'] .tv2-atmosphere {
  background:
    radial-gradient(
      52rem 36rem at 12% -6%,
      color-mix(in oklch, var(--tv2-accent, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 70%
    ),
    radial-gradient(
      44rem 32rem at 104% 44%,
      color-mix(in oklch, var(--tv2-accent, var(--dz-primary, #0766ee)) 4%, transparent),
      transparent 72%
    );
}

/* The section eyebrow takes the room's tint too — same border/background recipe
   as the global `.lp-eyebrow`, with the ambient accent standing in for the
   primary, mixed toward the foreground so it stays legible in both themes.
   :deep() because Section renders the eyebrow inside its own scope. */
.templates-page :deep(.lp-eyebrow) {
  border-color: color-mix(in oklch, var(--tv2-accent, var(--dz-primary, #0766ee)) 22%, transparent);
  background: color-mix(in oklch, var(--tv2-accent, var(--dz-primary, #0766ee)) 9%, transparent);
  color: color-mix(
    in oklch,
    var(--tv2-accent, var(--dz-primary, #0766ee)) 62%,
    var(--dz-foreground, #1b1d1f)
  );
}

@media (prefers-reduced-motion: reduce) {
  .templates-page {
    transition: none;
  }
}

/* Derived catalogue stats (TASK-TV2-02) — number above its label; DOM order
   stays dt→dd for the definition list. Sits between the Section lede and the
   toolbar, pulled up into the header's bottom margin. */
.templates-hero-stats {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  margin: calc(-1 * clamp(16px, 3vw, 40px)) 0 36px;
}

.templates-hero-stat {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 2px;
  padding: 0 26px;
}

.templates-hero-stat + .templates-hero-stat {
  border-inline-start: 1px solid var(--lp-hairline);
}

.templates-hero-stat-label {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}

.templates-hero-stat-value {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.templates-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: -24px;
  margin-bottom: 28px;
}

/* Search + quick-find + sort sit on one line and wrap gracefully when narrow. */
.templates-search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.templates-search {
  flex: 1 1 280px;
  min-width: 0;
}

.templates-cmdk {
  flex: none;
}

/* The keyboard-shortcut pill inside the quick-find button. */
.templates-kbd {
  margin-inline-start: 8px;
  padding: 1px 6px;
  border-radius: var(--dz-radius-sm, 0.375rem);
  border: 1px solid color-mix(in oklch, currentColor 28%, transparent);
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: var(--dz-text-xs, 0.75rem);
  line-height: 1.4;
  white-space: nowrap;
}

.templates-sort {
  flex: none;
  min-width: 150px;
}

.templates-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Let the segmented control scroll horizontally rather than wrap at narrow widths. */
.templates-filter {
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.templates-filter::-webkit-scrollbar {
  display: none;
}

.templates-note {
  flex: none;
  font-weight: 600;
  white-space: nowrap;
}

/* Tag filter chips — a wrapping row of toggle buttons. */
.templates-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* The button is the focusable hit-target; the DzTag inside carries the visual.
   TASK-TV2-05: a press/settle spring plus a one-shot accent ring pulse when a
   chip becomes active — transform/opacity only, cut under reduced motion. */
.tag-chip {
  display: inline-flex;
  position: relative;
  padding: 0;
  border: none;
  background: none;
  border-radius: var(--dz-radius-full, 9999px);
  cursor: pointer;
  transition: transform 180ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.tag-chip:active {
  transform: scale(0.9);
}

.tag-chip[aria-pressed='true'] {
  animation: tv2-chip-pop 260ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.tag-chip::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
}

.tag-chip[aria-pressed='true']::after {
  animation: tv2-chip-pulse 480ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

@keyframes tv2-chip-pop {
  0% {
    transform: scale(0.9);
  }
  60% {
    transform: scale(1.06);
  }
  100% {
    transform: none;
  }
}

@keyframes tv2-chip-pulse {
  0% {
    opacity: 0.7;
    box-shadow: 0 0 0 0 color-mix(in oklch, var(--dz-primary, #0766ee) 45%, transparent);
  }
  100% {
    opacity: 0;
    box-shadow: 0 0 0 10px color-mix(in oklch, var(--dz-primary, #0766ee) 0%, transparent);
  }
}

/* Fade + small rise for conditional toolbar rows (clear button, result count). */
.tv2-fade-enter-active,
.tv2-fade-leave-active {
  transition:
    opacity 200ms var(--dz-ease-out, ease-out),
    transform 200ms var(--dz-ease-out, ease-out);
}

.tv2-fade-enter-from,
.tv2-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

@media (prefers-reduced-motion: reduce) {
  .tag-chip,
  .tag-chip::after {
    transition: none;
    animation: none;
  }
  .tag-chip[aria-pressed='true'],
  .tag-chip[aria-pressed='true']::after {
    animation: none;
  }
  .tag-chip:active {
    transform: none;
  }
  .tv2-fade-enter-active,
  .tv2-fade-leave-active {
    transition: none;
  }
}

.tag-chip:focus-visible {
  outline: 2px solid var(--dz-primary, #0766ee);
  outline-offset: 2px;
}

.templates-clear {
  margin-inline-start: auto;
}

.templates-result-count {
  margin: 0;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

/* ---- FLIP choreography (TASK-TV2-04). Survivors glide, newcomers fade/scale
   in, leavers fade out in place (absolute, out of flow, so movers can glide
   into their slot immediately — the 150ms fade makes any box mismatch moot). */
.tv2-flip-move {
  transition: transform var(--dz-duration-slow, 320ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.tv2-flip-enter-active {
  transition:
    opacity var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}

.tv2-flip-leave-active {
  position: absolute;
  transition: opacity var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.tv2-flip-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.tv2-flip-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .tv2-flip-move,
  .tv2-flip-enter-active,
  .tv2-flip-leave-active {
    transition: none;
  }
}

/* ---- Empty-state suggestions (TASK-TV2-04). */
.templates-empty-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.templates-empty-tag {
  font-family: inherit;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  padding: 6px 14px;
  border: 0;
  border-radius: var(--dz-radius-full, 9999px);
  cursor: pointer;
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 12%, var(--dz-surface, #ffffff));
  color: color-mix(in oklch, var(--dz-primary, #0766ee) 62%, var(--dz-foreground, #1b1d1f));
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.templates-empty-tag:hover {
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 20%, var(--dz-surface, #ffffff));
}

.templates-empty-tag:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
}

.gallery-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  /* Allow the track to shrink below its content's max-content size so the
     nowrap/truncate stack text can't force the grid wider than its container. */
  min-width: 0;
  padding: 20px;
  /* The card's accent foreground, resolved per theme from the shade pair
     `tileStyle()` sets inline. The 600 shade carries enough contrast on the
     light surface; the fallback keeps the brand tint if no accent was emitted.
     (Inline props only set the *sources*, so the dark rule below can win.) */
  --tile-accent: var(--tile-accent-light, var(--dz-primary, #0766ee));
  /* TASK-TV2-03: the v-tilt rotation is written on this element; children with
     translateZ then read as real planes instead of being flattened. Invisible
     at rest (no rotation → no perspective), so touch/reduced-motion keep
     today's flat card. */
  transform-style: preserve-3d;
}

/* Dark surfaces want the lighter 400 shade so the accent stays legible. */
[data-theme="dark"] .tile {
  --tile-accent: var(--tile-accent-dark, var(--dz-primary, #0766ee));
}

/* Tint the card's hover border with its own accent (overrides the global
   brand-tinted `.lp-card--hover:hover` border for these gallery tiles), and
   switch the screen on: an accent glow under the card (TASK-TV2-03). */
.tile.lp-card--hover:hover {
  border-color: color-mix(in oklch, var(--tile-accent) 36%, var(--lp-hairline));
  box-shadow:
    0 18px 42px -20px color-mix(in oklch, var(--tile-accent-wash, var(--dz-primary, #0766ee)) 55%, transparent),
    var(--lp-shadow),
    var(--lp-highlight);
}

/* Chrome floats on shallow planes above the screenshot — only visible while the
   tilt rotates the card, so the resting composition is untouched. */
.tile-head,
.tile-category {
  transform: translateZ(22px);
}

.tile-stack {
  transform: translateZ(12px);
}

.tile-link {
  transform: translateZ(18px);
}

.tile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

/* Featured / New badges, right-aligned in the card head. */
.tile-badges {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tile-category {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--tile-accent);
  margin-bottom: 16px;
}

.tile-preview {
  flex: 1;
  min-height: 96px;
  /* Reserve a fixed thumbnail box so a lazy <img> (intrinsic 1600×1000) paints
     into already-laid-out space — no layout shift on load (CLS). The icon
     fallback centers in the same box. */
  aspect-ratio: 16 / 10;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid var(--lp-hairline);
  /* Decorative accent wash — a soft diagonal tint in the card's hue so the
     preview reads as colour-coded to its category, not a flat panel. */
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--tile-accent-wash, var(--dz-primary, #0766ee)) 12%, transparent), transparent 62%),
    radial-gradient(circle at 0% 100%, color-mix(in oklch, var(--tile-accent-wash, var(--dz-primary, #0766ee)) 7%, transparent), transparent 55%),
    var(--dz-background, #e7e8e9);
  /* Decorative only — the card cover link owns the interaction. */
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Anchors the hover light-up overlay below. */
  position: relative;
}

/* "Screen on" (TASK-TV2-03): a soft top-light in the card's accent that fades
   in over the wash while hovered. Pure opacity — the gradient never repaints. */
.tile-preview::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle at 50% 0%,
    color-mix(in oklch, var(--tile-accent-wash, var(--dz-primary, #0766ee)) 16%, transparent),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 400ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.tile:hover .tile-preview::after {
  opacity: 1;
}

/* The screen itself: both theme variants stacked in one clipped, rounded box —
   the reserved 16/10 frame is unchanged, so CLS stays zero. */
.tile-shot {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--dz-radius-md, 0.5rem);
  overflow: hidden;
}

.tile-thumb {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition:
    opacity 400ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    transform 600ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.tile-thumb.is-active {
  opacity: 1;
}

.tile-thumb--overlay {
  position: absolute;
  inset: 0;
}

/* Hover zoom: the screenshot leans in ~4% inside its clipped frame. */
.tile:hover .tile-thumb {
  transform: scale(1.04);
}

@media (prefers-reduced-motion: reduce) {
  .tile-thumb {
    transition: opacity 0.2s linear;
  }
  .tile:hover .tile-thumb {
    transform: none;
  }
  .tile-preview::after {
    transition: none;
  }
}

.tile-stack {
  margin-bottom: 16px;
  line-height: 1.5;
}

.tile-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--tile-accent);
  text-decoration: none;
}

/* Make the whole card activate the link without nesting the preview inside it. */
.tile-link-cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.tile-link:focus-visible .tile-link-cover {
  outline: 2px solid var(--tile-accent);
  outline-offset: -2px;
  border-radius: var(--dz-radius-xl, 0.875rem);
}

/* Command-palette item: icon · name + category · badges. */
.palette-icon {
  flex: none;
  color: var(--tile-accent, var(--dz-primary));
}

.palette-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.palette-name {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-cat {
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, var(--dz-colors-neutral-500));
}

.templates-empty {
  padding: clamp(32px, 6vw, 64px) 24px;
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .gallery-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .templates-hero-stat {
    padding: 0 14px;
  }
  .templates-toolbar {
    margin-top: 0;
  }
  .templates-search-row {
    flex-direction: column;
    align-items: stretch;
  }
  .templates-search,
  .templates-cmdk,
  .templates-sort {
    width: 100%;
  }
  .templates-filter-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
