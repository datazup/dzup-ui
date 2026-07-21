<script setup lang="ts">
/**
 * Context menu board — right-click actions on a file canvas (DzContextMenu).
 *
 * A grid of file tiles wrapped in a DzContextMenuTrigger: right-click (or use
 * the context-menu key) anywhere on the board to open a DzContextMenu with
 * icon-prefixed items, shortcut suffixes (DzKbd), separators, a disabled item,
 * and a destructive Delete. The last action is echoed below.
 *
 * Self-contained — free @dzup-ui/core components and `--dz-*` tokens only.
 * Heading level 4 to nest under the BlockPreview H3.
 */
import {
  DzBadge,
  DzContextMenu,
  DzContextMenuContent,
  DzContextMenuItem,
  DzContextMenuSeparator,
  DzContextMenuTrigger,
  DzHeading,
  DzKbd,
  DzText,
} from '@dzup-ui/core'
import {
  Copy,
  Download,
  FileText,
  FolderOpen,
  Image,
  PencilLine,
  Share2,
  Sheet,
  Star,
  Trash2,
} from 'lucide-vue-next'
import { ref } from 'vue'

interface Tile { name: string, icon: typeof FileText, kind: string }

const tiles: Tile[] = [
  { name: 'Roadmap.pdf', icon: FileText, kind: 'PDF' },
  { name: 'Brand kit', icon: Image, kind: 'Folder' },
  { name: 'Q3 budget.xlsx', icon: Sheet, kind: 'Sheet' },
  { name: 'Designs', icon: FolderOpen, kind: 'Folder' },
]

const lastAction = ref('')

function run(label: string): void {
  lastAction.value = label
}
</script>

<template>
  <section class="cb-wrap" aria-labelledby="cb-title">
    <header class="cb-head">
      <DzHeading id="cb-title" :level="4" size="md" weight="semibold" class="cb-title">
        File canvas
      </DzHeading>
      <DzText size="sm" tone="muted" as="p" class="cb-sub">
        Right-click the board to open the context menu.
      </DzText>
    </header>

    <DzContextMenu>
      <DzContextMenuTrigger as-child>
        <div class="cb-board" role="group" aria-label="Files (right-click for actions)">
          <article v-for="tile in tiles" :key="tile.name" class="cb-tile">
            <span class="cb-tile-icon" aria-hidden="true"><component :is="tile.icon" :size="22" /></span>
            <DzText size="sm" weight="medium" as="span" class="cb-tile-name">
              {{ tile.name }}
            </DzText>
            <DzBadge variant="subtle" tone="neutral" size="sm">
              {{ tile.kind }}
            </DzBadge>
          </article>
        </div>
      </DzContextMenuTrigger>

      <DzContextMenuContent>
        <DzContextMenuItem @select="run('Open')">
          <template #prefix>
            <FolderOpen :size="16" aria-hidden="true" />
          </template>
          Open
          <template #suffix>
            <DzKbd :keys="['enter']" size="sm" />
          </template>
        </DzContextMenuItem>
        <DzContextMenuItem @select="run('Rename')">
          <template #prefix>
            <PencilLine :size="16" aria-hidden="true" />
          </template>
          Rename
          <template #suffix>
            <DzKbd :keys="['f2']" size="sm" :platform-aware="false" />
          </template>
        </DzContextMenuItem>
        <DzContextMenuItem @select="run('Duplicate')">
          <template #prefix>
            <Copy :size="16" aria-hidden="true" />
          </template>
          Duplicate
          <template #suffix>
            <DzKbd :keys="['mod', 'd']" size="sm" />
          </template>
        </DzContextMenuItem>

        <DzContextMenuSeparator />

        <DzContextMenuItem @select="run('Add to favourites')">
          <template #prefix>
            <Star :size="16" aria-hidden="true" />
          </template>
          Add to favourites
        </DzContextMenuItem>
        <DzContextMenuItem @select="run('Download')">
          <template #prefix>
            <Download :size="16" aria-hidden="true" />
          </template>
          Download
        </DzContextMenuItem>
        <DzContextMenuItem disabled>
          <template #prefix>
            <Share2 :size="16" aria-hidden="true" />
          </template>
          Share (Pro)
        </DzContextMenuItem>

        <DzContextMenuSeparator />

        <DzContextMenuItem @select="run('Delete')">
          <template #prefix>
            <Trash2 :size="16" aria-hidden="true" />
          </template>
          <span class="cb-danger">Delete</span>
          <template #suffix>
            <DzKbd :keys="['del']" size="sm" :platform-aware="false" />
          </template>
        </DzContextMenuItem>
      </DzContextMenuContent>
    </DzContextMenu>

    <div class="cb-result" role="status" aria-live="polite">
      <DzText v-if="lastAction" size="sm" as="span">
        Action: <strong>{{ lastAction }}</strong>
      </DzText>
      <DzText v-else size="sm" tone="muted" as="span">
        No action yet.
      </DzText>
    </div>
  </section>
</template>

<style scoped>
.cb-wrap {
  max-width: 38rem;
  margin: 0 auto;
}

.cb-head {
  margin-bottom: var(--dz-space-4, 1rem);
}

.cb-title {
  margin: 0;
}

.cb-sub {
  margin: var(--dz-space-1, 0.25rem) 0 0;
}

.cb-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-4, 1rem);
  border-radius: var(--dz-radius-lg, 0.5rem);
  border: 1px dashed var(--dz-border, #e5e7eb);
  background: var(--dz-surface-sunken, #f9fafb);
}

.cb-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  padding: var(--dz-space-4, 1rem) var(--dz-space-2, 0.5rem);
  border-radius: var(--dz-radius-md, 0.375rem);
  border: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #fff);
  text-align: center;
}

.cb-tile-icon {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--dz-radius-md, 0.375rem);
  background: var(--dz-primary-subtle, #eef2ff);
  color: var(--dz-primary, #6366f1);
}

.cb-tile-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cb-danger {
  color: var(--dz-danger, #dc2626);
}

.cb-result {
  margin-top: var(--dz-space-3, 0.75rem);
  min-height: 1.25rem;
}

@media (max-width: 560px) {
  .cb-board {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
