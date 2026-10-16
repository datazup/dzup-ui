<script setup lang="ts">
/**
 * Resizable workspace — an IDE-style three-pane shell built on DzResizable.
 *
 * DzResizable wires a draggable SplitterGroup; each DzResizablePanel takes a
 * `defaultSize`/`minSize` (percent) and the explorer pane is `collapsible`.
 * DzResizableHandle (`with-handle`) renders the drag affordances between panes.
 * Each pane scrolls independently inside a DzScrollArea, and a DzToolbar spans
 * the top — the canonical "chrome + resizable body" application layout.
 *
 * Drag the handles to re-balance the panes; the explorer collapses to a rail.
 *
 * Self-contained: local static data, no props, no router. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import {
  DzBadge,
  DzButton,
  DzDivider,
  DzIcon,
  DzResizable,
  DzResizableHandle,
  DzResizablePanel,
  DzScrollArea,
  DzText,
  DzToolbar,
} from '@dzup-ui/core'
import { Circle, FileCode, FileText, Folder, Play, Save } from '@lucide/vue'

interface TreeRow {
  label: string
  depth: number
  active?: boolean
  dir?: boolean
}

const tree: TreeRow[] = [
  { label: 'src', depth: 0, dir: true },
  { label: 'components', depth: 1, dir: true },
  { label: 'App.vue', depth: 2, active: true },
  { label: 'main.ts', depth: 1 },
  { label: 'router.ts', depth: 1 },
  { label: 'package.json', depth: 0 },
  { label: 'README.md', depth: 0 },
]

const code: string[] = [
  '<script setup lang="ts">',
  'import { ref } from \'vue\'',
  '',
  'const count = ref(0)',
  '<\/script>',
  '',
  '<template>',
  '  <button @click="count++">',
  '    Clicked {{ count }} times',
  '  </button>',
  '</template>',
]
</script>

<template>
  <section class="rw" aria-labelledby="rw-title">
    <DzText id="rw-title" class="dz-sr-only">
      Resizable code workspace
    </DzText>

    <DzToolbar variant="outlined" size="sm" class="rw-toolbar">
      <template #start>
        <DzIcon :icon="FileCode" size="sm" />
        <DzText size="sm" weight="semibold" as="span">
          App.vue
        </DzText>
        <DzBadge variant="subtle" tone="warning" size="sm">
          Unsaved
        </DzBadge>
      </template>
      <template #end>
        <DzButton variant="outline" tone="neutral" size="sm">
          <template #prefix>
            <DzIcon :icon="Save" size="xs" />
          </template>
          Save
        </DzButton>
        <DzButton variant="solid" tone="primary" size="sm">
          <template #prefix>
            <DzIcon :icon="Play" size="xs" />
          </template>
          Run
        </DzButton>
      </template>
    </DzToolbar>

    <DzResizable direction="horizontal" size="sm" class="rw-body">
      <!-- Explorer (collapsible) -->
      <DzResizablePanel :default-size="26" :min-size="16" collapsible :collapsed-size="0" class="rw-pane">
        <DzScrollArea class="rw-scroll">
          <DzText size="xs" tone="muted" weight="semibold" class="rw-pane-head">
            EXPLORER
          </DzText>
          <ul class="rw-tree" role="list">
            <li
              v-for="row in tree"
              :key="row.label"
              class="rw-tree-row"
              :class="{ 'rw-tree-row--active': row.active }"
              :style="{ paddingLeft: `calc(${row.depth} * 0.85rem + 0.5rem)` }"
            >
              <DzIcon :icon="row.dir ? Folder : FileText" size="xs" />
              <DzText size="sm" as="span">
                {{ row.label }}
              </DzText>
            </li>
          </ul>
        </DzScrollArea>
      </DzResizablePanel>

      <DzResizableHandle with-handle />

      <!-- Editor -->
      <DzResizablePanel :default-size="48" :min-size="30" class="rw-pane">
        <DzScrollArea class="rw-scroll">
          <pre class="rw-code"><code v-for="(line, i) in code" :key="i" class="rw-code-line"><span class="rw-gutter">{{ i + 1 }}</span>{{ line }}</code></pre>
        </DzScrollArea>
      </DzResizablePanel>

      <DzResizableHandle with-handle />

      <!-- Preview -->
      <DzResizablePanel :default-size="26" :min-size="18" class="rw-pane">
        <DzScrollArea class="rw-scroll">
          <DzText size="xs" tone="muted" weight="semibold" class="rw-pane-head">
            PREVIEW
          </DzText>
          <div class="rw-preview">
            <DzButton variant="outline" tone="neutral">
              Clicked 3 times
            </DzButton>
          </div>
          <DzDivider class="rw-preview-rule" />
          <div class="rw-status">
            <DzIcon :icon="Circle" size="xs" class="rw-status-dot" />
            <DzText size="xs" tone="muted">
              Live · port 5173
            </DzText>
          </div>
        </DzScrollArea>
      </DzResizablePanel>
    </DzResizable>
  </section>
</template>

<style scoped>
.rw {
  background: var(--dz-background, #fff);
  border: 1px solid var(--dz-border, #e5e7eb);
  border-radius: var(--dz-radius-lg, 0.75rem);
  overflow: hidden;
  max-width: 56rem;
  margin: 0 auto;
}

.dz-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.rw-toolbar {
  border-radius: 0;
  border-left: 0;
  border-right: 0;
  border-top: 0;
}

.rw-body {
  height: 22rem;
}

.rw-pane {
  background: var(--dz-background, #fff);
  min-width: 0;
}

.rw-scroll {
  height: 100%;
  padding: var(--dz-spacing-3, 0.75rem);
}

.rw-pane-head {
  display: block;
  letter-spacing: 0.06em;
  margin-bottom: var(--dz-spacing-2, 0.5rem);
}

.rw-tree {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rw-tree-row {
  display: flex;
  align-items: center;
  gap: var(--dz-spacing-2, 0.5rem);
  padding-block: var(--dz-spacing-1, 0.25rem);
  border-radius: var(--dz-radius-sm, 0.25rem);
  color: var(--dz-muted-foreground, #6b7280);
}

.rw-tree-row--active {
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 12%, transparent);
  color: var(--dz-foreground, #111);
}

.rw-code {
  margin: 0;
  font-family: var(--dz-font-mono, ui-monospace, monospace);
  font-size: var(--dz-text-xs, 0.8125rem);
  line-height: 1.7;
}

.rw-code-line {
  display: block;
  white-space: pre;
  color: var(--dz-foreground, #111);
}

.rw-gutter {
  display: inline-block;
  width: 1.75rem;
  margin-right: var(--dz-spacing-3, 0.75rem);
  text-align: right;
  color: var(--dz-muted-foreground, #9ca3af);
  user-select: none;
}

.rw-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--dz-spacing-6, 1.5rem) 0;
}

.rw-preview-rule {
  margin: var(--dz-spacing-3, 0.75rem) 0;
}

.rw-status {
  display: flex;
  align-items: center;
  gap: var(--dz-spacing-2, 0.5rem);
}

.rw-status-dot {
  color: var(--dz-success, #16a34a);
}

@media (max-width: 560px) {
  .rw-body {
    height: 30rem;
  }
}
</style>
