<script setup lang="ts">
import type { BlockDef } from '../../blocks/registry.ts'
import { DzCopyButton, DzText } from '@dzup-ui/core'
import { ArrowDown, ArrowUpRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { REGISTRY_ENABLED, registryAddCommands } from '../../blocks/config.ts'
import { blocksUsingComponent } from '../../blocks/registry.ts'
import { getBlockSource } from '../../blocks/sources.ts'
import BlockTrustMarks from './BlockTrustMarks.vue'
import PmCommandTabs from './PmCommandTabs.vue'

/**
 * BlockCard — index tile for a single block on /blocks (docs/blocks.md §3.1, §4).
 *
 * Shows the block's title, one-line description, and a "Built from N components"
 * line with the real `Dz*` component names as chips (from `BlockDef.components`).
 * The whole card is a hash link that scrolls to the block's live preview (`#<id>`),
 * mirroring the ComponentGallery tile treatment (lp-card + full-tile link cover).
 * That in-page anchor is the PRIMARY affordance — the /blocks deck is the primary
 * browse surface (docs/blocks.md §10). A secondary "Open page" RouterLink points
 * at the block's deep-linkable, indexable detail route (`/blocks/<id>`, Task I4),
 * lifted above the whole-card cover so its click isn't swallowed by the anchor.
 *
 * Each chip is also a reverse-lookup button: clicking it asks the page to filter
 * the index to every block using that component. It emits `selectComponent` —
 * BlocksIndexPage owns the single `useBlockSearch` filtering path (Task E3/E4) and
 * sets `activeComponent`; the card never derives results itself. The chip carries
 * a subtle usage count (`blocksUsingComponent(name).length`, Task E1) so the
 * affordance reads as "DzTable — used in N blocks".
 */
const props = defineProps<{
  block: BlockDef
}>()

const emit = defineEmits<{
  /** Request the index filter to all blocks using this `Dz*` component. */
  selectComponent: [name: string]
}>()

/** How many catalog blocks use `name` (memoized reverse index, Task E1). */
function usageCount(name: string): number {
  return blocksUsingComponent(name).length
}

/** `npx shadcn@latest add …/r/<id>.json` per PM — the one-command install. */
const registryAddCmds = computed(() => registryAddCommands(props.block.id))
</script>

<template>
  <article class="lp-card lp-card--hover block-card">
    <div class="block-card-body">
      <DzText weight="semibold" as="div" class="block-card-title">
        {{ block.title }}
      </DzText>
      <DzText size="sm" tone="muted" as="div" class="block-card-desc">
        {{ block.description }}
      </DzText>
      <!-- Earned trust marks (Task I3): present only because the per-block axe
           suite backs them. Renders nothing for a block with known a11y debt. -->
      <BlockTrustMarks :block-id="block.id" class="block-card-marks" />
    </div>

    <div class="block-card-foot">
      <DzText size="xs" tone="muted" as="div" class="block-card-built">
        Built from {{ block.components.length }}
        {{ block.components.length === 1 ? 'component' : 'components' }}
      </DzText>
      <ul class="block-card-chips">
        <li v-for="name in block.components" :key="name">
          <button
            type="button"
            class="block-card-chip"
            :aria-label="`Show ${usageCount(name)} ${usageCount(name) === 1 ? 'block' : 'blocks'} using ${name}`"
            @click="emit('selectComponent', name)"
          >
            <span class="block-card-chip-name">{{ name }}</span>
            <span class="block-card-chip-count" aria-hidden="true">{{ usageCount(name) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- One-command install + copy-code. Lifted above the whole-card `.block-card-cover`
         link (like the chips) so the tabs/buttons stay independently clickable. -->
    <div v-if="REGISTRY_ENABLED" class="block-card-cli">
      <PmCommandTabs :commands="registryAddCmds" :aria-label="`Add ${block.title} from the dzup-ui registry`" />
      <DzCopyButton
        :value="getBlockSource(block.path)"
        label="Copy code"
        copied-label="Copied!"
        variant="ghost"
        tone="neutral"
        size="sm"
        :aria-label="`Copy the ${block.title} block source`"
        class="block-card-copy"
      />
    </div>

    <div class="block-card-actions">
      <a class="block-card-link" :href="`#${block.id}`" :aria-label="`View block: ${block.title}`">
        <span>View block</span>
        <ArrowDown :size="14" aria-hidden="true" />
        <span class="block-card-cover" aria-hidden="true" />
      </a>
      <RouterLink
        class="block-card-permalink"
        :to="`/blocks/${block.id}`"
        :aria-label="`Open the ${block.title} block page`"
      >
        <span>Open page</span>
        <ArrowUpRight :size="13" aria-hidden="true" />
      </RouterLink>
    </div>
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

.block-card-marks {
  margin-top: 12px;
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
  /* Lift the (now interactive) chips above the whole-card `.block-card-cover`
     link, which is absolutely positioned over the tile — otherwise the cover
     would swallow chip clicks. */
  position: relative;
  z-index: 1;
}

.block-card-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  padding: 2px 9px;
  border: 0;
  border-radius: var(--dz-radius-full, 9999px);
  cursor: pointer;
  /* Tinted with the active category's decorative accent (`--lp-cat-500`, set on
     the panel), mixed against surface/foreground so it stays legible in both
     light and dark; falls back to the brand primary when no accent is in scope. */
  background: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 13%, var(--dz-surface, #ffffff));
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 62%, var(--dz-foreground, #1b1d1f));
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.block-card-chip:hover {
  background: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 22%, var(--dz-surface, #ffffff));
}

.block-card-chip:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #0766ee));
  outline-offset: 2px;
}

/* Usage count — a subtle "used in N blocks" hint kept quieter than the name. */
.block-card-chip-count {
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}

/* Install command + copy-code, lifted above the whole-card cover link so its
   tabs and buttons receive clicks (mirrors the interactive chips). */
.block-card-cli {
  position: relative;
  z-index: 1;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--lp-hairline);
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

/* Bottom action row: the primary whole-card anchor + the secondary permalink. */
.block-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.block-card-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 62%, var(--dz-foreground, #1b1d1f));
  text-decoration: none;
}

/* Secondary deep-link to the block's indexable detail page (Task I4). Lifted
   above the whole-card cover so it stays independently clickable. */
.block-card-permalink {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #585b60);
  text-decoration: none;
  white-space: nowrap;
}

.block-card-permalink:hover {
  color: color-mix(in oklch, var(--lp-cat-500, var(--dz-primary, #0766ee)) 62%, var(--dz-foreground, #1b1d1f));
}

.block-card-permalink:focus-visible {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #0766ee));
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm, 0.375rem);
}

/* Whole-card click target without nesting interactive content. */
.block-card-cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.block-card-link:focus-visible .block-card-cover {
  outline: 2px solid var(--lp-cat-500, var(--dz-ring, #0766ee));
  outline-offset: -2px;
  border-radius: var(--dz-radius-xl, 0.875rem);
}
</style>
