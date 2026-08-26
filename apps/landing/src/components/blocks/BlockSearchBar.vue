<script setup lang="ts">
import type { UseBlockSearch } from '../../composables/useBlockSearch.ts'
import { DzSearchInput, DzText, DzVisuallyHidden } from '@dzup-ui/core'
import { X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { DzOdometer } from '../../motion/index.ts'

/**
 * BlockSearchBar — the on-page search + tag-filter control for /blocks
 * (docs/blocks.md §3.1, Task E3).
 *
 * Sits above the category nav and drives the page's *results mode*: a free-text
 * DzSearchInput bound to `search.query` plus a toggle chip per catalog tag
 * (`search.allTags()`) writing `search.activeTags` (AND semantics). When either
 * is active the index swaps the one-category deck for a flat cross-category
 * results grid — this component only owns the *input*; BlocksIndexPage reads the
 * same `useBlockSearch` instance to render the results.
 *
 * Everything is data-driven off the shared search state (no hardcoded block or
 * tag lists) and the count is live. Token-only styling; tag chips reuse the
 * pill/accent treatment of BlockCard's component chips and the category nav.
 */
const props = defineProps<{
  /** The page-level search state (shared with BlocksIndexPage's results mode). */
  search: UseBlockSearch
}>()

// Stable refs off the shared instance — the parent owns the single source of
// truth, this surface just reads/writes it.
const query = props.search.query
const activeTags = props.search.activeTags
const activeComponent = props.search.activeComponent
const isFiltering = props.search.isFiltering

/** Every tag in the catalog, unique + sorted (memoized in the registry). */
const tags = props.search.allTags()

/** Live count of the current results (all blocks when nothing is active). */
const count = computed(() => props.search.results.value.length)
const countLabel = computed(() => `${count.value} ${count.value === 1 ? 'block' : 'blocks'}`)

/** Collapse the (long) tag cloud to a couple of rows until the reader opts in. */
const tagsExpanded = ref(false)

function isActive(tag: string): boolean {
  return activeTags.value.includes(tag)
}

/** Toggle a tag in/out of the active facet (new array so the computed re-runs). */
function toggleTag(tag: string): void {
  activeTags.value = isActive(tag)
    ? activeTags.value.filter(t => t !== tag)
    : [...activeTags.value, tag]
}

/** Drop every filter — the composable owns the path (shared with the empty state, TASK-BV2-07). */
const clearAll = props.search.clearAll

/** Drop just the component reverse-lookup facet (Task E4), keeping any text/tags. */
function clearComponent(): void {
  activeComponent.value = null
}
</script>

<template>
  <section class="block-search" aria-label="Search and filter blocks">
    <div class="block-search-inner">
      <div class="block-search-row">
        <DzSearchInput
          v-model="query"
          class="block-search-input"
          placeholder="Search blocks by name, tag or component…"
          aria-label="Search blocks"
          :clearable="true"
        />

        <!-- Live status: result count + a clear affordance (only while filtering). -->
        <div class="block-search-status">
          <DzText
            v-if="isFiltering"
            size="sm"
            tone="muted"
            as="span"
            class="block-search-count"
            role="status"
            aria-live="polite"
          >
            <!-- SR text stays plain (live regions announce text, not aria-labels);
                 the rolling digits are the visual layer only (TASK-BV2-07). -->
            <DzVisuallyHidden>{{ countLabel }}</DzVisuallyHidden>
            <span aria-hidden="true" class="block-search-count-visual">
              <DzOdometer :value="count" size="sm" :duration="700" />
              {{ count === 1 ? 'block' : 'blocks' }}
            </span>
          </DzText>
          <button
            v-if="isFiltering"
            type="button"
            class="block-search-clear"
            @click="clearAll"
          >
            <X :size="14" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <!-- Active component facet (Task E4): a removable pill shown when a chip's
           "show blocks using <Dz*>" reverse-lookup is driving results mode. -->
      <div v-if="activeComponent" class="block-search-facet">
        <DzText size="sm" tone="muted" as="span">
          Showing blocks using
        </DzText>
        <button
          type="button"
          class="block-search-facet-chip"
          :aria-label="`Stop filtering by ${activeComponent}`"
          @click="clearComponent"
        >
          <span>{{ activeComponent }}</span>
          <X :size="13" aria-hidden="true" />
        </button>
      </div>

      <!-- Tag facet: a toggle chip per catalog tag (AND semantics). -->
      <div class="block-search-tags-wrap">
        <ul
          class="block-search-tags"
          :class="{ 'is-collapsed': !tagsExpanded }"
          aria-label="Filter by tag"
        >
          <li v-for="tag in tags" :key="tag">
            <button
              type="button"
              class="block-search-tag"
              :class="{ 'is-active': isActive(tag) }"
              :aria-pressed="isActive(tag)"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </li>
        </ul>
        <button
          type="button"
          class="block-search-tags-toggle"
          :aria-expanded="tagsExpanded"
          @click="tagsExpanded = !tagsExpanded"
        >
          {{ tagsExpanded ? 'Show fewer tags' : `Show all ${tags.length} tags` }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.block-search {
  padding: clamp(16px, 3vw, 28px) 24px 0;
}

.block-search-inner {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.block-search-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.block-search-input {
  flex: 1;
  min-width: min(20rem, 100%);
}

.block-search-status {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: none;
}

.block-search-count {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.block-search-clear {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border: 1px solid var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-surface, #ffffff);
  color: var(--dz-muted-foreground, #585b60);
  font-family: inherit;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  cursor: pointer;
  transition:
    color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.block-search-clear:hover {
  color: var(--dz-foreground, #1b1d1f);
  border-color: var(--dz-border-strong, #d1d5db);
}

.block-search-clear:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
}

/* Active component facet ---------------------------------------------------- */
.block-search-facet {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.block-search-facet-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 11px;
  border: 1px solid transparent;
  border-radius: var(--dz-radius-full, 9999px);
  /* Filled with the brand primary — the bar spans all categories, so there is no
     single accent in scope (mirrors the active tag chip treatment). */
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 16%, var(--dz-surface, #ffffff));
  color: color-mix(in oklch, var(--dz-primary, #0766ee) 70%, var(--dz-foreground, #1b1d1f));
  font-family: inherit;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.block-search-facet-chip:hover {
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 24%, var(--dz-surface, #ffffff));
}

.block-search-facet-chip:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
}

/* Tag cloud --------------------------------------------------------------- */
.block-search-tags-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.block-search-tags {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Collapsed: clamp to ~two rows so the cloud never dominates the page. */
.block-search-tags.is-collapsed {
  max-height: 72px;
  overflow: hidden;
}

.block-search-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 11px;
  border: 1px solid var(--dz-border, #b5b7bb);
  border-radius: var(--dz-radius-full, 9999px);
  background: transparent;
  color: var(--dz-muted-foreground, #585b60);
  font-family: inherit;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    border-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.block-search-tag:hover {
  color: color-mix(in oklch, var(--dz-primary, #0766ee) 60%, var(--dz-foreground, #1b1d1f));
  border-color: var(--dz-border-strong, #d1d5db);
}

.block-search-tag.is-active {
  /* Filled with the brand primary — the bar spans all categories, so there is no
     single accent in scope (mirrors BlockCard's chip mix against the surface). */
  border-color: transparent;
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 16%, var(--dz-surface, #ffffff));
  color: color-mix(in oklch, var(--dz-primary, #0766ee) 70%, var(--dz-foreground, #1b1d1f));
}

.block-search-tag:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
}

.block-search-tags-toggle {
  border: 0;
  background: transparent;
  padding: 2px 0;
  color: var(--dz-primary, #0766ee);
  font-family: inherit;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  cursor: pointer;
}

.block-search-tags-toggle:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm, 0.25rem);
}

@media (max-width: 560px) {
  .block-search-row {
    align-items: stretch;
  }

  .block-search-status {
    justify-content: space-between;
  }
}
.block-search-count-visual {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
</style>
