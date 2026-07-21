<script setup lang="ts">
import type { CanonicalTone } from '@dzup-ui/contracts'
import type { FileEntry, FolderInfo } from './data.ts'
/**
 * File Manager — full-page app template (docs/templates.md §6.4).
 *
 * A DzAppShell hosting a cloud-drive: a folder DzTree in the sidebar (with a
 * storage meter), a DzBreadcrumb path + DzSearchInput in the header, and a main
 * DzDataView that toggles between list and grid of files/folders — each with a
 * type icon, a type DzBadge and size/modified meta, a right-click DzContextMenu
 * of folder actions and a per-row DzDropdownMenu (rename / move / delete).
 * Navigation (tree, breadcrumb, opening a folder), the list/grid toggle, search
 * and delete are all wired client-side. Built only from free `@dzup-ui/core`
 * components, token-styled (no `lp-*`), correct in light + dark, reflows to 390px.
 */
import {
  DzAppShell,
  DzBadge,
  DzBreadcrumb,
  DzBreadcrumbItem,
  DzButton,
  DzContextMenu,
  DzContextMenuContent,
  DzContextMenuItem,
  DzContextMenuSeparator,
  DzContextMenuTrigger,
  DzDataView,
  DzDropdownMenu,
  DzDropdownMenuContent,
  DzDropdownMenuItem,
  DzDropdownMenuSeparator,
  DzDropdownMenuTrigger,
  DzHeading,
  DzSearchInput,
  DzSidebar,
  DzSidebarFooter,
  DzSidebarHeader,
  DzSidebarSection,
  DzText,
  DzTree,
} from '@dzup-ui/core'
import { Boxes, FolderPlus, MoreHorizontal, Upload } from 'lucide-vue-next'
import { computed, reactive, ref } from 'vue'
import {
  CONTENTS,
  DEFAULT_EXPANDED,

  FOLDER_INDEX,
  FOLDER_TREE,

  STORAGE,
} from './data.ts'

// Working copy of the contents so delete feels live in the preview (spread each
// entry; the icon Component is shared by reference, which is fine).
const contents = reactive<Record<string, FileEntry[]>>(
  Object.fromEntries(Object.entries(CONTENTS).map(([key, rows]) => [key, rows.map(e => ({ ...e }))])),
)

const current = ref('root')
const expanded = ref<string[]>([...DEFAULT_EXPANDED])
const query = ref('')
const layout = ref<'list' | 'grid'>('list')

const currentLabel = computed(() => FOLDER_INDEX[current.value]?.label ?? 'My Drive')

// Resolve the breadcrumb trail by walking parents from the current folder.
const trail = computed(() => {
  const out: { key: string, label: string }[] = []
  let cursor: string | null = current.value
  while (cursor) {
    const meta: FolderInfo | undefined = FOLDER_INDEX[cursor]
    if (!meta)
      break
    out.unshift({ key: cursor, label: meta.label })
    cursor = meta.parent
  }
  return out
})

const visibleEntries = computed(() => {
  const rows = contents[current.value] ?? []
  const q = query.value.trim().toLowerCase()
  if (!q)
    return rows
  return rows.filter(e => e.name.toLowerCase().includes(q))
})

function goTo(key: string): void {
  current.value = key
  query.value = ''
  // Make sure the destination's ancestors are visible in the tree.
  for (let k: string | null = key; k; k = FOLDER_INDEX[k]?.parent ?? null) {
    if (!expanded.value.includes(k))
      expanded.value = [...expanded.value, k]
  }
}

function onSelect(keys: string[]): void {
  const key = keys[keys.length - 1]
  if (key)
    goTo(key)
}

function open(entry: FileEntry): void {
  if (entry.kind === 'folder' && entry.target)
    goTo(entry.target)
}

function removeEntry(entry: FileEntry): void {
  const rows = contents[current.value]
  if (!rows)
    return
  const i = rows.findIndex(e => e.id === entry.id)
  if (i !== -1)
    rows.splice(i, 1)
}

// Tone → semantic token, used to tint each entry's type glyph.
const TONE_VAR: Record<CanonicalTone, string> = {
  neutral: '--dz-muted-foreground',
  primary: '--dz-primary',
  success: '--dz-success',
  warning: '--dz-warning',
  danger: '--dz-danger',
  info: '--dz-info',
}
function iconStyle(tone: CanonicalTone): Record<string, string> {
  const v = `var(${TONE_VAR[tone]})`
  return { color: v, background: `color-mix(in oklch, ${v} 14%, transparent)` }
}
</script>

<template>
  <DzAppShell aria-label="File manager workspace" class="fm-shell">
    <template #sidebar>
      <DzSidebar aria-label="Folders">
        <DzSidebarHeader>
          <span class="brand">
            <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
            <span class="brand-name">Northwind Drive</span>
          </span>
        </DzSidebarHeader>

        <DzSidebarSection title="Folders">
          <DzTree
            :items="FOLDER_TREE"
            selectable
            size="sm"
            :selected-keys="[current]"
            :expanded-keys="expanded"
            aria-label="Folder tree"
            @update:selected-keys="onSelect($event as string[])"
            @update:expanded-keys="expanded = ($event as string[])"
          />
        </DzSidebarSection>

        <DzSidebarFooter>
          <div class="storage">
            <div class="storage-head">
              <DzText size="sm" weight="medium" as="span">
                Storage
              </DzText>
              <DzBadge variant="subtle" tone="primary" size="sm">
                {{ STORAGE.percent }}%
              </DzBadge>
            </div>
            <div
              class="storage-track"
              role="progressbar"
              :aria-valuenow="STORAGE.percent"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Storage used"
            >
              <div class="storage-fill" :style="{ width: `${STORAGE.percent}%` }" />
            </div>
            <DzText size="xs" tone="muted" as="div">
              {{ STORAGE.usedLabel }} of {{ STORAGE.totalLabel }} used
            </DzText>
          </div>
        </DzSidebarFooter>
      </DzSidebar>
    </template>

    <template #header>
      <div class="fm-title">
        <DzHeading :level="1" size="lg" weight="semibold">
          Files
        </DzHeading>
        <DzBreadcrumb separator="/" aria-label="Folder path" class="fm-crumbs">
          <DzBreadcrumbItem
            v-for="(crumb, i) in trail"
            :key="crumb.key"
            :href="i < trail.length - 1 ? '#' : undefined"
            :current="i === trail.length - 1"
            @click.prevent="i < trail.length - 1 && goTo(crumb.key)"
          >
            {{ crumb.label }}
          </DzBreadcrumbItem>
        </DzBreadcrumb>
      </div>
    </template>

    <template #header-end>
      <DzSearchInput
        v-model="query"
        placeholder="Search this folder…"
        size="sm"
        class="fm-search"
        aria-label="Search files"
      />
      <DzButton size="sm" variant="outline" tone="neutral" class="fm-upload">
        <template #prefix>
          <Upload :size="15" aria-hidden="true" />
        </template>
        Upload
      </DzButton>
      <DzButton size="sm" variant="solid" tone="primary">
        <template #prefix>
          <FolderPlus :size="15" aria-hidden="true" />
        </template>
        New
      </DzButton>
    </template>

    <div class="fm-body">
      <DzContextMenu>
        <DzContextMenuTrigger>
          <div class="fm-area">
            <DzDataView
              v-model:layout="layout"
              :items="visibleEntries"
              data-key="id"
              layout-toggle
              size="sm"
              :cols="{ sm: 1, md: 2, lg: 3 }"
              gap="md"
              :empty-title="query ? 'No matches' : 'This folder is empty'"
              :empty-description="query ? 'Try a different search term.' : 'Drop files here or use New to add one.'"
            >
              <template #header>
                <div class="dv-head">
                  <DzText weight="semibold">
                    {{ currentLabel }}
                  </DzText>
                  <DzBadge variant="subtle" tone="neutral" size="sm">
                    {{ visibleEntries.length }} {{ visibleEntries.length === 1 ? 'item' : 'items' }}
                  </DzBadge>
                </div>
              </template>

              <template #item="{ item, layout: lay }">
                <div class="entry" :class="lay === 'grid' ? 'entry--grid' : 'entry--row'">
                  <button
                    type="button"
                    class="entry-main"
                    :class="{ 'entry-main--folder': item.kind === 'folder' }"
                    @click="open(item)"
                  >
                    <span class="entry-icon" :style="iconStyle(item.tone)" aria-hidden="true">
                      <component :is="item.icon" :size="lay === 'grid' ? 22 : 18" />
                    </span>
                    <span class="entry-text">
                      <span class="entry-name">{{ item.name }}</span>
                      <span class="entry-sub">{{ item.size }} · {{ item.modified }}</span>
                    </span>
                  </button>

                  <div class="entry-side">
                    <DzBadge variant="subtle" :tone="item.tone" size="sm">
                      {{ item.type }}
                    </DzBadge>
                    <DzDropdownMenu>
                      <DzDropdownMenuTrigger as-child>
                        <DzButton
                          variant="ghost"
                          tone="neutral"
                          size="sm"
                          class="entry-menu"
                          :aria-label="`Actions for ${item.name}`"
                        >
                          <MoreHorizontal :size="16" aria-hidden="true" />
                        </DzButton>
                      </DzDropdownMenuTrigger>
                      <DzDropdownMenuContent align="end">
                        <DzDropdownMenuItem @select="open(item)">
                          {{ item.kind === 'folder' ? 'Open' : 'Preview' }}
                        </DzDropdownMenuItem>
                        <DzDropdownMenuItem>Rename</DzDropdownMenuItem>
                        <DzDropdownMenuItem>Move to…</DzDropdownMenuItem>
                        <DzDropdownMenuItem>Download</DzDropdownMenuItem>
                        <DzDropdownMenuSeparator />
                        <DzDropdownMenuItem @select="removeEntry(item)">
                          Delete
                        </DzDropdownMenuItem>
                      </DzDropdownMenuContent>
                    </DzDropdownMenu>
                  </div>
                </div>
              </template>
            </DzDataView>
          </div>
        </DzContextMenuTrigger>
        <DzContextMenuContent>
          <DzContextMenuItem>New folder</DzContextMenuItem>
          <DzContextMenuItem>Upload files</DzContextMenuItem>
          <DzContextMenuSeparator />
          <DzContextMenuItem>Sort by name</DzContextMenuItem>
          <DzContextMenuItem>Select all</DzContextMenuItem>
        </DzContextMenuContent>
      </DzContextMenu>
    </div>
  </DzAppShell>
</template>

<style scoped>
.fm-shell {
  font-family: var(--dz-font-sans);
  color: var(--dz-foreground);
}

/* Brand lockup in the sidebar header. */
.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

/* Storage meter in the sidebar footer. */
.storage {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
}

.storage-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.storage-track {
  height: 6px;
  border-radius: var(--dz-radius-full);
  background: color-mix(in oklch, var(--dz-muted-foreground) 18%, transparent);
  overflow: hidden;
}

.storage-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--dz-primary);
}

.fm-title {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.fm-crumbs {
  min-width: 0;
}

.fm-search {
  width: 220px;
}

.fm-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fm-area {
  min-width: 0;
}

.dv-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* One file/folder entry — shared shell, list and grid modifiers below. */
.entry {
  display: flex;
  gap: 8px;
  border: 1px solid var(--dz-border);
  border-radius: var(--dz-radius-md);
  background: var(--dz-surface);
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.entry:hover {
  border-color: color-mix(in oklch, var(--dz-primary) 40%, var(--dz-border));
  background: color-mix(in oklch, var(--dz-primary) 5%, var(--dz-surface));
}

.entry--row {
  align-items: center;
  padding: 8px 10px;
}

.entry--grid {
  flex-direction: column;
  padding: 14px;
  height: 100%;
}

.entry-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: default;
}

.entry-main--folder {
  cursor: pointer;
}

.entry--grid .entry-main {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.entry-icon {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--dz-radius-md);
}

.entry--grid .entry-icon {
  width: 44px;
  height: 44px;
}

.entry-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.entry-name {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-sub {
  font-size: var(--dz-text-xs);
  color: var(--dz-muted-foreground);
}

.entry-side {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.entry--grid .entry-side {
  width: 100%;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
}

.entry-menu {
  padding-inline: 6px;
}

@media (max-width: 560px) {
  .fm-crumbs {
    display: none;
  }
  .fm-search {
    width: 140px;
  }
  .fm-upload {
    display: none;
  }
}
</style>
