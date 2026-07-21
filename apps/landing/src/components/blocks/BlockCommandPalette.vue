<script lang="ts">
import type { BlockCategory, BlockDef } from '../../blocks/registry.ts'
</script>

<script setup lang="ts">
import type { CommandGroup, CommandItem } from '@dzup-ui/core'
/**
 * BlockCommandPalette — a ⌘K / Ctrl+K navigator for /blocks.
 *
 * Dogfoods the library's own DzCommandPalette overlay. A search-field launcher
 * (carrying a ⌘K hint) plus the global ⌘K / Ctrl+K shortcut open a grouped,
 * live-filtered palette that searches the block registry three ways:
 *   • Blocks      — by title, id, tags, components and description, ranked
 *                   title-first via useBlockSearch.
 *   • Categories  — jump straight to a section of the deck.
 *   • Components  — every real Dz* export; selecting one jumps to the first block
 *                   that uses it (the filtered "blocks using <X>" view is deferred
 *                   to E3/E4).
 *
 * The palette is purely a *navigation* shortcut layered over the page
 * (docs/blocks.md §3.1) — it never touches the on-page filter. On select it
 * emits `navigate`, and BlocksIndexPage reuses its own deck-switch + scroll
 * logic to open the target. Focus trap, Esc-to-close and focus-restore-to-trigger
 * all come from DzCommandPalette; we do not re-implement them.
 *
 * Built only from @dzup-ui/core + `--dz-*` tokens.
 */
import { DzCommandPalette, DzKbd } from '@dzup-ui/core'
import { Box, LayoutGrid, LayoutTemplate, Search } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { blocksByCategory, CATEGORIES } from '../../blocks/registry.ts'
import { useBlockSearch } from '../../composables/useBlockSearch.ts'

/** Where a palette selection wants the page to go. */
export interface BlockNavTarget {
  /** Category deck to open. */
  category: BlockCategory
  /** Optional block to scroll into view once its deck is shown. */
  blockId?: string
}

const emit = defineEmits<{
  /** A palette item was chosen — open this target in the deck. */
  navigate: [target: BlockNavTarget]
}>()

/** The three result groups, in display order (Blocks first when querying). */
const groups: CommandGroup[] = [
  { id: 'blocks', label: 'Blocks' },
  { id: 'categories', label: 'Categories' },
  { id: 'components', label: 'Components' },
]

/**
 * A palette row. Extends the core CommandItem with the registry payload needed
 * to navigate on select and to render rich content in the #item slot. `label`
 * carries a lowercased search *haystack* so DzCommandPalette's built-in
 * label-substring filter never drops a useBlockSearch match; the visible primary
 * text is `display`, rendered via the slot.
 */
interface PaletteItem extends CommandItem {
  kind: 'block' | 'category' | 'component'
  display: string
  meta: string
  block?: BlockDef
  categoryId?: BlockCategory
  componentName?: string
  chips?: string[]
}

const open = ref(false)
const search = useBlockSearch()

/** Human label for a category id. */
const categoryLabels = new Map(CATEGORIES.map(c => [c.id, c.label]))

/** Categories that actually hold blocks, with their block counts, in browse order. */
const categorySections = computed(() =>
  CATEGORIES.map(c => ({ ...c, count: blocksByCategory(c.id).length })).filter(
    c => c.count > 0,
  ),
)

function countLabel(n: number): string {
  return `${n} ${n === 1 ? 'block' : 'blocks'}`
}

/**
 * The palette items for the current query. With no query we show just the
 * Categories group — a light "jump to a section" default. With a query we add
 * the ranked block matches (useBlockSearch), the matching categories, and the
 * matching component names.
 */
const items = computed<PaletteItem[]>(() => {
  const q = search.query.value.trim().toLowerCase()
  const out: PaletteItem[] = []

  // Categories — always available as the default navigation set.
  for (const cat of categorySections.value) {
    const hay = `${cat.label} ${cat.blurb} ${cat.id}`.toLowerCase()
    if (q && !hay.includes(q))
      continue
    out.push({
      id: `cat:${cat.id}`,
      label: hay,
      icon: LayoutGrid,
      group: 'categories',
      kind: 'category',
      categoryId: cat.id,
      display: cat.label,
      meta: countLabel(cat.count),
    })
  }

  if (q) {
    // Blocks — already filtered and ranked title-first by useBlockSearch.
    for (const block of search.results.value) {
      const hay
        = `${block.title} ${block.id} ${block.tags.join(' ')} ${block.components.join(' ')} ${block.description} ${categoryLabels.get(block.category) ?? ''}`.toLowerCase()
      out.push({
        id: `block:${block.id}`,
        label: hay,
        icon: LayoutTemplate,
        group: 'blocks',
        kind: 'block',
        block,
        display: block.title,
        meta: categoryLabels.get(block.category) ?? block.category,
        chips: block.components,
      })
    }
    // Components — every Dz* export whose name matches the query.
    for (const name of search.allComponents()) {
      if (!name.toLowerCase().includes(q))
        continue
      out.push({
        id: `comp:${name}`,
        label: name.toLowerCase(),
        icon: Box,
        group: 'components',
        kind: 'component',
        componentName: name,
        display: name,
        meta: countLabel(search.blocksUsingComponent(name).length),
      })
    }
  }

  return out
})

/** Keep useBlockSearch in sync with the palette's own search box. */
function onSearch(query: string): void {
  search.query.value = query
}

/** Resolve a selected row to a navigation target and ask the page to open it. */
function onSelect(raw: CommandItem): void {
  const item = raw as PaletteItem
  if (item.kind === 'block' && item.block) {
    emit('navigate', { category: item.block.category, blockId: item.block.id })
  }
  else if (item.kind === 'category' && item.categoryId) {
    emit('navigate', { category: item.categoryId })
  }
  else if (item.kind === 'component' && item.componentName) {
    // Defer the filtered "blocks using <X>" view (E3/E4) — jump to the first match.
    const first = search.blocksUsingComponent(item.componentName)[0]
    if (first)
      emit('navigate', { category: first.category, blockId: first.id })
  }
}

// --- Slot accessors: narrow the slot's CommandItem to our richer PaletteItem ---
function iconOf(item: CommandItem) {
  return (item as PaletteItem).icon
}
function displayOf(item: CommandItem): string {
  return (item as PaletteItem).display
}
function metaOf(item: CommandItem): string {
  return (item as PaletteItem).meta
}
function chipsOf(item: CommandItem): string[] {
  return (item as PaletteItem).chips ?? []
}
</script>

<template>
  <div class="bcp">
    <!-- Launcher: a search-field affordance carrying the ⌘K hint. -->
    <button type="button" class="bcp-launcher" aria-haspopup="dialog" @click="open = true">
      <Search :size="16" class="bcp-launcher-icon" aria-hidden="true" />
      <span class="bcp-launcher-text">Search blocks, categories, components…</span>
      <DzKbd :keys="['mod', 'k']" size="sm" class="bcp-launcher-kbd" />
    </button>

    <DzCommandPalette
      v-model:open="open"
      :items="items"
      :groups="groups"
      placeholder="Search blocks, categories or components…"
      aria-label="Search and jump to a block, category or component"
      @search="onSearch"
      @select="onSelect"
    >
      <template #item="{ item }">
        <component
          :is="iconOf(item)"
          v-if="iconOf(item)"
          class="bcp-item-icon"
          :size="16"
          aria-hidden="true"
        />
        <span class="bcp-item-body">
          <span class="bcp-item-title">{{ displayOf(item) }}</span>
          <span v-if="chipsOf(item).length" class="bcp-item-chips">
            <span class="bcp-item-cat">{{ metaOf(item) }}</span>
            <span v-for="name in chipsOf(item).slice(0, 4)" :key="name" class="bcp-item-chip">
              {{ name }}
            </span>
            <span v-if="chipsOf(item).length > 4" class="bcp-item-chip bcp-item-chip--more">
              +{{ chipsOf(item).length - 4 }}
            </span>
          </span>
        </span>
        <span v-if="!chipsOf(item).length" class="bcp-item-meta">{{ metaOf(item) }}</span>
      </template>

      <template #empty>
        No blocks, categories or components match.
      </template>
    </DzCommandPalette>
  </div>
</template>

<style scoped>
/* Launcher ---------------------------------------------------------------- */
.bcp-launcher {
  display: inline-flex;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  min-width: min(22rem, 100%);
  padding: var(--dz-space-2, 0.5rem) var(--dz-space-3, 0.75rem);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
  color: var(--dz-muted-foreground, #6b7280);
  cursor: text;
  text-align: left;
  transition:
    border-color var(--dz-transition-fast, 150ms) ease,
    box-shadow var(--dz-transition-fast, 150ms) ease;
}

.bcp-launcher:hover {
  border-color: var(--dz-border-strong, #d1d5db);
}

.bcp-launcher:focus-visible {
  outline: none;
  border-color: var(--dz-primary, #6366f1);
  box-shadow: 0 0 0 3px var(--dz-ring, rgba(99, 102, 241, 0.35));
}

.bcp-launcher-icon {
  flex-shrink: 0;
}

.bcp-launcher-text {
  flex: 1;
  font-size: var(--dz-text-sm, 0.875rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bcp-launcher-kbd {
  flex-shrink: 0;
}

/* Palette item ------------------------------------------------------------ */
/* The core item row is `display:flex; align-items:center`; these fill it. */
.bcp-item-icon {
  flex-shrink: 0;
  margin-right: var(--dz-space-2, 0.5rem);
  color: var(--dz-muted-foreground, #6b7280);
}

.bcp-item-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.bcp-item-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bcp-item-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.bcp-item-cat {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: var(--dz-primary, #6366f1);
  margin-right: 2px;
}

.bcp-item-chip {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 500;
  padding: 1px 7px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-muted, #f3f4f6);
  color: var(--dz-muted-foreground, #6b7280);
  white-space: nowrap;
}

.bcp-item-chip--more {
  font-variant-numeric: tabular-nums;
}

.bcp-item-meta {
  margin-left: auto;
  padding-left: var(--dz-space-3, 0.75rem);
  flex-shrink: 0;
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, #6b7280);
}
</style>
