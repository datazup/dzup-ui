<script setup lang="ts">
import type { CommandGroup, CommandItem } from '@dzup-ui/core'
import type { SearchDoc, SearchKind } from '../composables/useGlobalSearch.ts'
/**
 * GlobalCommandPalette — the site-wide ⌘K / Ctrl+K navigator.
 *
 * Mounted once in App.vue so it is reachable from every page. Dogfoods the
 * library's own DzCommandPalette overlay (its `enableGlobalShortcut` binds the
 * ⌘K / Ctrl+K keydown globally; its focus trap, Esc-to-close and focus restore
 * come for free) and layers a unified, cross-catalog search over it:
 *   • Components — fuzzy-matched, deep-linked into Storybook.
 *   • Blocks     — routed to each block's /blocks/:id page.
 *   • Templates  — routed to /templates/:slug.
 *
 * All ranking lives in useGlobalSearch (which reuses the blocks filter's
 * weighted-field scorer); this component is purely the view + the routing on
 * select. With an empty query it shows a curated "popular" set across all three
 * kinds. Built only from @dzup-ui/core + `--dz-*` tokens.
 */
import { DzCommandPalette } from '@dzup-ui/core'
import { Blocks, Box, LayoutTemplate } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalSearch } from '../composables/useGlobalSearch.ts'
import { storybookDocs } from '../config.ts'

const router = useRouter()
const search = useGlobalSearch()

/** The three result groups, in display order. */
const groups: CommandGroup[] = [
  { id: 'component', label: 'Components' },
  { id: 'block', label: 'Blocks' },
  { id: 'template', label: 'Templates' },
]

/** Per-kind row icon. */
const KIND_ICON = { component: Box, block: Blocks, template: LayoutTemplate } as const

/**
 * A palette row. `label` carries the doc's flat lowercased haystack so
 * DzCommandPalette's built-in label-substring filter never drops a ranked
 * useGlobalSearch match; the visible text is rendered from `doc` via the #item slot.
 */
interface PaletteItem extends CommandItem {
  doc: SearchDoc
}

/** Map the ranked (or popular) docs to palette rows. */
const items = computed<PaletteItem[]>(() =>
  search.results.value.map(doc => ({
    id: doc.id,
    label: doc.haystack,
    icon: KIND_ICON[doc.kind],
    group: doc.kind,
    doc,
  })),
)

/** Keep useGlobalSearch in sync with the palette's own search box. */
function onSearch(query: string): void {
  search.query.value = query
}

/** Resolve a selected row to its destination and navigate there. */
function onSelect(raw: CommandItem): void {
  const { doc } = raw as PaletteItem
  if (doc.kind === 'component' && doc.storyId) {
    // Storybook is a separate app (mounted at /storybook/), so a full-page nav.
    window.location.assign(storybookDocs(doc.storyId))
  }
  else if (doc.kind === 'block' && doc.blockId) {
    void router.push(`/blocks/${doc.blockId}`)
  }
  else if (doc.kind === 'template' && doc.slug) {
    void router.push(`/templates/${doc.slug}`)
  }
}

// --- Slot accessors: narrow the slot's CommandItem to our richer PaletteItem ---
function iconOf(item: CommandItem) {
  return (item as PaletteItem).icon
}
function titleOf(item: CommandItem): string {
  return (item as PaletteItem).doc.title
}
function metaOf(item: CommandItem): string {
  return (item as PaletteItem).doc.meta
}
function kindOf(item: CommandItem): SearchKind {
  return (item as PaletteItem).doc.kind
}
</script>

<template>
  <DzCommandPalette
    :items="items"
    :groups="groups"
    enable-global-shortcut
    placeholder="Search components, blocks and templates…"
    aria-label="Search components, blocks and templates"
    @search="onSearch"
    @select="onSelect"
  >
    <template #item="{ item }">
      <component
        :is="iconOf(item)"
        v-if="iconOf(item)"
        class="gcp-item-icon"
        :size="16"
        aria-hidden="true"
      />
      <span class="gcp-item-body">
        <span class="gcp-item-title">{{ titleOf(item) }}</span>
      </span>
      <span class="gcp-item-meta" :data-kind="kindOf(item)">{{ metaOf(item) }}</span>
    </template>

    <template #empty>
      No components, blocks or templates match.
    </template>
  </DzCommandPalette>
</template>

<style scoped>
/* The core item row is `display:flex; align-items:center`; these fill it. */
.gcp-item-icon {
  flex-shrink: 0;
  margin-inline-end: var(--dz-space-2, 0.5rem);
  color: var(--dz-muted-foreground, #585b60);
}

.gcp-item-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.gcp-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.gcp-item-meta {
  margin-inline-start: auto;
  padding-inline-start: var(--dz-space-3, 0.75rem);
  flex-shrink: 0;
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, #585b60);
}
</style>
