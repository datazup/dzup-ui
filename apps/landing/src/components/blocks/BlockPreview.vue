<script setup lang="ts">
import {
  DzCodeBlock,
  DzCopyButton,
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogTitle,
  DzHeading,
  DzIconButton,
  DzSegmented,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
import type { SegmentedItem } from '@dzup-ui/core'
import { Maximize2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import type { BlockDef } from '../../blocks/registry.ts'

/**
 * BlockPreview — the shared per-block shell (docs/blocks.md §3.2).
 *
 * Renders a header (title, description, viewport control, full-screen toggle)
 * over a DzTabs with two panels:
 *   • Preview — the live, interactive block in a bordered, resizable container
 *     whose max-width is driven by a DzSegmented viewport control. The block
 *     re-themes with the global toggle automatically (no theme code here).
 *   • Code — the block's exact `?raw` source in a scrollable DzCodeBlock, with a
 *     DzCopyButton that copies the source string verbatim.
 *
 * The full-screen DzIconButton opens the same live block in a full-width
 * DzDialog. The chrome is dogfooded entirely from @dzup-ui/core; the only CSS
 * here is layout (no color literals) per the token-only rule.
 */
const props = defineProps<{
  block: BlockDef
}>()

/** Active tab — Preview by default; Code on demand. */
const tab = ref<'preview' | 'code'>('preview')

/** Selected preview viewport; drives the frame's max-width. */
const viewport = ref('desktop')

/** Full-screen dialog open state. */
const fullscreen = ref(false)

/** Viewport options for the segmented control (docs §3.2: ~390 / ~768 / 100%). */
const viewports: SegmentedItem[] = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'desktop', label: 'Desktop' },
]

/** Map the selected viewport to the frame's max-width. */
const frameMaxWidth = computed(() => {
  switch (viewport.value) {
    case 'mobile':
      return '390px'
    case 'tablet':
      return '768px'
    default:
      return '100%'
  }
})

/** Stable ids so the regions/dialog have accessible names. */
const titleId = computed(() => `block-${props.block.id}-title`)
const dialogTitleId = computed(() => `block-${props.block.id}-fs-title`)
</script>

<template>
  <section
    :id="block.id"
    class="block-preview"
    :aria-labelledby="titleId"
  >
    <!-- Header: title + description, viewport control, full-screen toggle. -->
    <header class="bp-head">
      <div class="bp-head-text">
        <DzHeading :id="titleId" :level="3" size="md" weight="semibold" class="bp-title">
          {{ block.title }}
        </DzHeading>
        <DzText size="sm" tone="muted" as="p" class="bp-desc">{{ block.description }}</DzText>
        <ul
          class="bp-chips"
          :aria-label="`Built from ${block.components.length} ${block.components.length === 1 ? 'component' : 'components'}`"
        >
          <li v-for="name in block.components" :key="name" class="bp-chip">{{ name }}</li>
        </ul>
      </div>

      <div class="bp-head-controls">
        <DzSegmented
          v-show="tab === 'preview'"
          v-model="viewport"
          :items="viewports"
          size="sm"
          aria-label="Preview width"
          class="bp-viewport"
        />
        <DzIconButton
          :icon="Maximize2"
          ariaLabel="Open preview full screen"
          variant="outline"
          tone="neutral"
          size="sm"
          @click="fullscreen = true"
        />
      </div>
    </header>

    <!-- Preview / Code tabs. -->
    <DzTabs v-model="tab" variant="line" class="bp-tabs">
      <DzTabList class="bp-tablist">
        <DzTabTrigger value="preview">Preview</DzTabTrigger>
        <DzTabTrigger value="code">Code</DzTabTrigger>
      </DzTabList>

      <!-- Live, interactive, resizable preview. -->
      <DzTabContent value="preview" class="bp-panel">
        <div class="bp-stage">
          <div class="bp-frame" :style="{ maxWidth: frameMaxWidth }">
            <component :is="block.component" />
          </div>
        </div>
      </DzTabContent>

      <!-- Exact source + copy. -->
      <DzTabContent value="code" class="bp-panel">
        <div class="bp-code-toolbar">
          <DzCopyButton
            :value="block.source"
            aria-label="Copy block source"
            label="Copy"
            copied-label="Copied"
            variant="outline"
            tone="neutral"
            size="sm"
          />
        </div>
        <DzCodeBlock
          :code="block.source"
          language="vue"
          :copyable="false"
          max-height="520px"
          :aria-label="`${block.title} source`"
          class="bp-code"
        />
      </DzTabContent>
    </DzTabs>

    <!-- Full-screen live preview. -->
    <DzDialog v-model:open="fullscreen">
      <DzDialogContent size="full" scrollable :aria-labelledby="dialogTitleId">
        <template #header>
          <DzDialogTitle :id="dialogTitleId">{{ block.title }}</DzDialogTitle>
          <DzDialogClose />
        </template>
        <div class="bp-fs-stage">
          <component :is="block.component" />
        </div>
      </DzDialogContent>
    </DzDialog>
  </section>
</template>

<style scoped>
/* "Window frame" treatment, consistent with ShowcaseDashboard / BlocksIndexPage. */
.block-preview {
  scroll-margin-top: 124px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #fff);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  overflow: hidden;
}

.bp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  border-bottom: 1px solid var(--lp-hairline);
}

.bp-head-text {
  min-width: 0;
}

.bp-title {
  margin: 0 0 2px;
}

.bp-desc {
  margin: 0;
  line-height: 1.5;
}

/* "Built from" component chips — same token treatment as BlockCard. */
.bp-chips {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bp-chip {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  padding: 2px 9px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-primary-muted, #eef2ff);
  color: var(--dz-primary, #4f46e5);
}

.bp-head-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.bp-tabs {
  display: block;
}

.bp-tablist {
  padding: 0 20px;
  border-bottom: 1px solid var(--lp-hairline);
}

.bp-panel {
  padding: 0;
}

/* Contain a resized/overflowing block so it never breaks the page layout. */
.bp-stage {
  padding: 24px;
  overflow: auto;
  background:
    radial-gradient(circle at 0% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 4%, transparent), transparent 38%),
    var(--dz-background, #fff);
}

/* The resizable container — max-width set by the viewport control. */
.bp-frame {
  width: 100%;
  margin: 0 auto;
  transition: max-width var(--dz-transition-base, 250ms) ease;
}

@media (prefers-reduced-motion: reduce) {
  .bp-frame {
    transition: none;
  }
}

.bp-code-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px 0;
}

.bp-code {
  margin: 12px 20px 20px;
}

.bp-fs-stage {
  padding: clamp(16px, 3vw, 32px);
}

@media (max-width: 560px) {
  .bp-head {
    flex-direction: column;
    align-items: stretch;
  }

  .bp-head-controls {
    justify-content: space-between;
  }

  .bp-viewport {
    flex: 1;
  }
}
</style>
