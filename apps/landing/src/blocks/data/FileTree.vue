<script setup lang="ts">
/**
 * File explorer — a hierarchical DzTree with per-node icons + selection.
 *
 * DzTree renders the whole hierarchy from a `:items` array of TreeNodes
 * (each carrying an optional lucide `icon` component); expand/collapse and
 * selection are v-modelled (`expanded-keys` / `selected-keys`), and the tree
 * ships the full APG roving-tabindex keyboard model. A side panel reflects the
 * current selection to show the wiring.
 *
 * Self-contained: local static tree, no props. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import { computed, ref } from 'vue'
import { DzBadge, DzCard, DzHeading, DzText, DzTree } from '@dzup-ui/core'
import type { TreeNode } from '@dzup-ui/core'
import { FileCode2, FileJson, FileText, Folder, Image } from 'lucide-vue-next'

const items: TreeNode[] = [
  {
    key: 'src',
    label: 'src',
    icon: Folder,
    children: [
      {
        key: 'components',
        label: 'components',
        icon: Folder,
        children: [
          { key: 'button.vue', label: 'DzButton.vue', icon: FileCode2 },
          { key: 'card.vue', label: 'DzCard.vue', icon: FileCode2 },
          { key: 'tree.vue', label: 'DzTree.vue', icon: FileCode2 },
        ],
      },
      {
        key: 'assets',
        label: 'assets',
        icon: Folder,
        children: [
          { key: 'logo.svg', label: 'logo.svg', icon: Image },
          { key: 'hero.png', label: 'hero.png', icon: Image },
        ],
      },
      { key: 'main.ts', label: 'main.ts', icon: FileCode2 },
    ],
  },
  {
    key: 'config',
    label: 'config',
    icon: Folder,
    children: [
      { key: 'tsconfig', label: 'tsconfig.json', icon: FileJson },
      { key: 'vite', label: 'vite.config.ts', icon: FileCode2 },
    ],
  },
  { key: 'readme', label: 'README.md', icon: FileText },
]

const expandedKeys = ref<string[]>(['src', 'components'])
const selectedKeys = ref<string[]>(['tree.vue'])

const LABELS: Record<string, string> = Object.fromEntries(
  flatten(items).map((node) => [node.key, node.label]),
)

const selectedLabel = computed(() => {
  const first = selectedKeys.value[0]
  return first ? LABELS[first] ?? '—' : '—'
})

function flatten(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flatten(node.children) : [])])
}
</script>

<template>
  <section class="ft-wrap" aria-labelledby="ft-title">
    <DzCard variant="outlined" padding="none">
      <header class="ft-head">
        <DzHeading id="ft-title" :level="4" size="md" weight="semibold" class="ft-title">Project files</DzHeading>
        <DzBadge variant="subtle" tone="neutral" size="sm">{{ flatten(items).length }} nodes</DzBadge>
      </header>

      <div class="ft-grid">
        <div class="ft-pane">
          <DzTree
            :items="items"
            v-model:expanded-keys="expandedKeys"
            v-model:selected-keys="selectedKeys"
            selectable
            size="sm"
            aria-label="Project file tree"
          />
        </div>

        <aside class="ft-detail" aria-live="polite">
          <DzText size="xs" tone="muted" as="p" class="ft-detail-label">Selected</DzText>
          <DzText size="sm" weight="medium" as="p" class="ft-detail-value">{{ selectedLabel }}</DzText>
        </aside>
      </div>
    </DzCard>
  </section>
</template>

<style scoped>
.ft-wrap {
  background: var(--dz-background, #fff);
  max-width: 40rem;
  margin: 0 auto;
}

.ft-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dz-space-3, 0.75rem);
  padding: var(--dz-space-4, 1rem);
  border-bottom: 1px solid var(--dz-border, #e5e7eb);
}

.ft-title {
  margin: 0;
}

.ft-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
}

.ft-pane {
  padding: var(--dz-space-3, 0.75rem);
  min-height: 16rem;
}

.ft-detail {
  padding: var(--dz-space-4, 1rem);
  border-left: 1px solid var(--dz-border, #e5e7eb);
  background: var(--dz-surface, #f8fafc);
}

.ft-detail-label {
  margin: 0 0 var(--dz-space-1, 0.25rem);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ft-detail-value {
  margin: 0;
  word-break: break-word;
}

@media (max-width: 560px) {
  .ft-grid {
    grid-template-columns: 1fr;
  }

  .ft-detail {
    border-left: none;
    border-top: 1px solid var(--dz-border, #e5e7eb);
  }
}
</style>
