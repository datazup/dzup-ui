<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { ArrowDown } from 'lucide-vue-next'
import type { BlockDef } from '../../blocks/registry.ts'

/**
 * BlockCard — index tile for a single block on /blocks (docs/blocks.md §3.1, §4).
 *
 * Shows the block's title, one-line description, and a "Built from N components"
 * line with the real `Dz*` component names as chips (from `BlockDef.components`).
 * The whole card is a hash link that scrolls to the block's live preview (`#<id>`),
 * mirroring the ComponentGallery tile treatment (lp-card + full-tile link cover).
 */
defineProps<{
  block: BlockDef
}>()
</script>

<template>
  <article class="lp-card lp-card--hover block-card">
    <div class="block-card-body">
      <DzText weight="semibold" as="div" class="block-card-title">{{ block.title }}</DzText>
      <DzText size="sm" tone="muted" as="div" class="block-card-desc">{{ block.description }}</DzText>
    </div>

    <div class="block-card-foot">
      <DzText size="xs" tone="muted" as="div" class="block-card-built">
        Built from {{ block.components.length }}
        {{ block.components.length === 1 ? 'component' : 'components' }}
      </DzText>
      <ul class="block-card-chips" aria-hidden="true">
        <li v-for="name in block.components" :key="name" class="block-card-chip">{{ name }}</li>
      </ul>
    </div>

    <a class="block-card-link" :href="`#${block.id}`" :aria-label="`View block: ${block.title}`">
      <span>View block</span>
      <ArrowDown :size="14" aria-hidden="true" />
      <span class="block-card-cover" aria-hidden="true" />
    </a>
  </article>
</template>

<style scoped>
.block-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.block-card-body {
  flex: 1;
}

.block-card-title {
  font-size: var(--dz-text-base, 1rem);
  margin-bottom: 6px;
}

.block-card-desc {
  line-height: 1.6;
}

.block-card-foot {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--lp-hairline);
}

.block-card-built {
  font-weight: 600;
  letter-spacing: 0.01em;
  margin-bottom: 10px;
}

.block-card-chips {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.block-card-chip {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  padding: 2px 9px;
  border-radius: var(--dz-radius-full, 9999px);
  /* Tinted with the active category's decorative accent (`--lp-cat-500`, set on
     the panel), mixed against surface/foreground so it stays legible in both
     light and dark; falls back to the brand primary when no accent is in scope. */
  background: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 13%, var(--dz-surface, #fff));
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 62%, var(--dz-foreground, #1a202c));
}

.block-card-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 16px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #4f46e5)) 62%, var(--dz-foreground, #1a202c));
  text-decoration: none;
}

/* Whole-card click target without nesting interactive content. */
.block-card-cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.block-card-link:focus-visible .block-card-cover {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #4f46e5));
  outline-offset: -2px;
  border-radius: var(--dz-radius-xl, 0.875rem);
}
</style>
