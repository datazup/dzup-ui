<script setup lang="ts">
import type { BlockDef } from '../../blocks/registry.ts'
import { DzSkeleton } from '@dzup-ui/core'
import { computed, defineAsyncComponent } from 'vue'
import { useLazyMount } from '../../composables/useLazyMount.ts'

/**
 * LazyBlockPreview — viewport-gated wrapper around BlockPreview (Task E5).
 *
 * BlockPreview mounts a *live, interactive* block (often a whole hero / app
 * shell). A 13-block category mounting all of them at once is the heaviest
 * thing `/blocks` does. This wrapper renders a DzSkeleton of roughly the right
 * height until the card nears the viewport (via `useLazyMount`), then swaps in
 * the real preview — so a big category is cheap to render and fills in as you
 * scroll.
 *
 * `forceMount` overrides the lazy gate and renders immediately. The page sets
 * it for the deep-link / ⌘K-palette target so that BlockPreview's `id` anchor
 * actually exists for `scrollIntoView` — a skeleton has no such anchor. It also
 * covers the no-IntersectionObserver fallback (`useLazyMount` renders eagerly
 * there too), so content is never withheld.
 *
 * The skeleton mirrors BlockPreview's chrome (header · tab bar · stage) and
 * approximates its height to keep scroll position stable when the swap happens.
 * DzSkeleton drops its shimmer under `prefers-reduced-motion` on its own.
 */

const props = withDefaults(
  defineProps<{
    block: BlockDef
    /** Render the live preview immediately, bypassing the scroll gate. */
    forceMount?: boolean
    /**
     * Passed straight through to BlockPreview. 3 fits the /blocks index
     * (page h1 → category h2 → block h3); the block DETAIL page passes 2.
     */
    headingLevel?: 2 | 3
  }>(),
  { headingLevel: 3 },
)

const emit = defineEmits<{
  selectComponent: [name: string]
}>()

/**
 * BlockPreview is ASYNC, not a static import (TASK-FREE3-04).
 *
 * It anchors the heaviest chunk the site emits — 505 kB raw / 112 kB gzip at
 * baseline, because every live preview drags in the components it demonstrates.
 * As a static import that chunk became a hard dependency of any route importing
 * this file, so the browser had to fetch and parse all 112 kB before the page
 * could paint anything at all:
 *
 *   index.html → entry (158 kB gz) → route chunk → BlockPreview (112 kB gz) → paint
 *
 * Three serialised round trips on a throttled 4G link, which is most of why
 * /blocks and /blocks/hero-split were the two worst mobile LCP routes (4.15 s and
 * 4.34 s). Loading it asynchronously takes it off the critical path: the page
 * paints its heading and manifest immediately, and previews stream in after.
 *
 * The viewport gate still applies on top. Async decides WHEN the bytes are
 * fetched; `useLazyMount` decides WHICH previews ask for them at all.
 */
const BlockPreview = defineAsyncComponent(() => import('./BlockPreview.vue'))

const { setEl, shouldRender } = useLazyMount({ eager: props.forceMount })

/** Live once near the viewport, or as soon as the page forces it (deep-link). */
const live = computed(() => props.forceMount || shouldRender.value)
</script>

<template>
  <div :ref="setEl" class="lazy-block-preview">
    <BlockPreview
      v-if="live"
      :block="block"
      :heading-level="headingLevel"
      @select-component="emit('selectComponent', $event)"
    />

    <!-- Placeholder: echoes BlockPreview's frame so the swap doesn't shift the page. -->
    <div v-else class="lbp-skeleton" aria-hidden="true">
      <div class="lbp-head">
        <DzSkeleton variant="text" width="42%" height="20px" />
        <DzSkeleton variant="text" width="68%" height="14px" />
        <div class="lbp-chips">
          <DzSkeleton variant="rectangular" width="76px" height="22px" />
          <DzSkeleton variant="rectangular" width="92px" height="22px" />
          <DzSkeleton variant="rectangular" width="64px" height="22px" />
        </div>
      </div>
      <div class="lbp-tabbar">
        <DzSkeleton variant="text" width="56px" height="14px" />
        <DzSkeleton variant="text" width="44px" height="14px" />
      </div>
      <div class="lbp-stage">
        <DzSkeleton variant="rectangular" width="100%" height="320px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The placeholder copies BlockPreview's "window frame" so there's no visual
   jump (border/radius/shadow) when the live preview replaces it. Layout-only —
   colours come from DzSkeleton + the same tokens BlockPreview uses. */
.lbp-skeleton {
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-xl, 0.875rem);
  background: var(--dz-surface, #ffffff);
  box-shadow: var(--lp-shadow-sm), var(--lp-highlight);
  overflow: hidden;
}

.lbp-head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--lp-hairline);
}

.lbp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.lbp-tabbar {
  display: flex;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--lp-hairline);
}

.lbp-stage {
  padding: 24px;
}
</style>
