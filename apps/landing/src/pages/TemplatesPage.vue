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
} from '@dzup-ui/core'
import { ArrowUpRight, Command, LayoutTemplate, X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Section from '../components/Section.vue'
import { useTheme } from '../composables/useTheme.ts'
import { ICONS } from '../icons.ts'
import { isNew, TEMPLATE_CATEGORIES, TEMPLATE_TAGS, TEMPLATES, THUMBNAIL_DIR } from '../templates/registry.ts'

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

/** Derive the dark-variant path: `foo/bar.webp` → `foo/bar-dark.webp`. */
function darkThumb(path: string): string {
  return path.replace(/(\.[a-z0-9]+)$/i, '-dark$1')
}

/**
 * The thumbnail src for a card under the current theme — always a real screenshot.
 *
 * Every registry template is GUARANTEED a light AND dark WebP:
 * `scripts/check-template-previews.ts` fails the build when either is missing
 * (FREE2-09). That guarantee retired the old `onerror` → icon-glyph fallback: a
 * missing preview is now a loud build failure, not a card that silently collapses
 * to a Lucide glyph (which is what an unfinished template used to render). So this
 * never returns undefined, and the dark variant always exists in dark mode.
 */
function thumbFor(t: TemplateMeta): string {
  const light = t.thumbnail ?? `${THUMBNAIL_DIR}/${t.slug}.webp`
  return resolved.value === 'dark' ? darkThumb(light) : light
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
 * the right foreground per theme — see the `--tile-accent` rules below. The
 * `--reveal-delay` keeps the existing staggered entrance.
 */
function tileStyle(template: TemplateMeta, index: number): Record<string, string> {
  const palette = template.accent ?? categoryAccents.get(template.category) ?? 'primary'
  return {
    '--reveal-delay': `${index * 45}ms`,
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
</script>

<template>
  <Section
    eyebrow="Templates"
    :title="count ? `${count} free templates, built from core` : 'Templates, built from core'"
    lede="Full-page and full-app starters composed entirely from the free @dzup-ui/core components — themed, accessible and responsive out of the box."
    surface
    bordered
    heading-id="templates-title"
    :heading-level="1"
  >
    <div class="templates-toolbar">
      <!-- Search + quick-find + sort -->
      <div class="templates-search-row">
        <DzSearchInput
          v-model="searchRaw"
          class="templates-search"
          placeholder="Search templates by name, tag or description…"
          aria-label="Search templates"
        />
        <DzButton
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
      </div>

      <DzText v-if="hasActiveFilters" size="sm" tone="muted" class="templates-result-count">
        Showing {{ visibleTemplates.length }} of {{ count }} templates
      </DzText>
    </div>

    <ul v-if="visibleTemplates.length" class="gallery-grid" aria-label="Templates">
      <li
        v-for="(template, i) in visibleTemplates"
        :key="template.slug"
        class="lp-card lp-card--hover tile"
        :style="tileStyle(template, i)"
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
               light + dark WebP per template, so there is no icon-glyph fallback. -->
          <img
            class="tile-thumb"
            :src="thumbFor(template)"
            alt=""
            loading="lazy"
            decoding="async"
            width="1600"
            height="1000"
          >
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
    </ul>

    <DzEmpty
      v-else
      class="templates-empty"
      :icon="LayoutTemplate"
      title="No templates match those filters"
      description="Nothing matches this combination of search, category and tags — try loosening one."
    >
      <template #actions>
        <DzButton variant="outline" size="sm" @click="clearFilters">
          Clear filters
        </DzButton>
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
</template>

<style scoped>
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
  margin-left: 8px;
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

/* The button is the focusable hit-target; the DzTag inside carries the visual. */
.tag-chip {
  display: inline-flex;
  padding: 0;
  border: none;
  background: none;
  border-radius: var(--dz-radius-full, 9999px);
  cursor: pointer;
}

.tag-chip:focus-visible {
  outline: 2px solid var(--dz-primary, #0766ee);
  outline-offset: 2px;
}

.templates-clear {
  margin-left: auto;
}

.templates-result-count {
  margin: 0;
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
}

/* Dark surfaces want the lighter 400 shade so the accent stays legible. */
[data-theme="dark"] .tile {
  --tile-accent: var(--tile-accent-dark, var(--dz-primary, #0766ee));
}

/* Tint the card's hover border with its own accent (overrides the global
   brand-tinted `.lp-card--hover:hover` border for these gallery tiles). */
.tile.lp-card--hover:hover {
  border-color: color-mix(in oklch, var(--tile-accent) 36%, var(--lp-hairline));
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
}

.tile-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--dz-radius-md, 0.5rem);
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
