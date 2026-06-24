<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { CategoryMeta } from '../../blocks/registry.ts'

/**
 * BlockCategoryNav — sticky in-page category nav for /blocks (docs/blocks.md §3.1).
 *
 * Lists the catalog categories as hash anchors (`#<category>`) and highlights the
 * one currently in view via a single IntersectionObserver over the section
 * elements (matched by `category.id`). Smooth vs. instant scrolling is handled by
 * the global `html { scroll-behavior }` rule in index.html, which already degrades
 * to `auto` under `prefers-reduced-motion` — so anchor clicks honor it for free.
 *
 * Only the categories passed in are rendered (the page filters out empty ones),
 * so the nav never advertises a section that isn't on the page.
 */
const props = defineProps<{
  /** Non-empty categories to list, in browse order. */
  categories: CategoryMeta[]
}>()

const activeId = ref<string>(props.categories[0]?.id ?? '')

let observer: IntersectionObserver | null = null
/** id → distance of the section top from the viewport top (for nearest-to-top pick). */
const visible = new Map<string, number>()

function recomputeActive() {
  if (visible.size === 0) return
  let bestId = ''
  let bestTop = Number.POSITIVE_INFINITY
  for (const [id, top] of visible) {
    // The section nearest the top of the viewport (but still on screen) wins.
    const distance = Math.abs(top)
    if (distance < bestTop) {
      bestTop = distance
      bestId = id
    }
  }
  if (bestId) activeId.value = bestId
}

onMounted(() => {
  if (typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id
        if (entry.isIntersecting) {
          visible.set(id, entry.boundingClientRect.top)
        } else {
          visible.delete(id)
        }
      }
      recomputeActive()
    },
    // Bias the "active" band toward the top of the viewport so the highlight
    // tracks the section the reader is actually on, not one scrolling in.
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
  )

  for (const category of props.categories) {
    const el = document.getElementById(category.id)
    if (el) observer.observe(el)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <nav class="cat-nav" aria-label="Block categories">
    <ul class="cat-nav-list">
      <li v-for="category in categories" :key="category.id">
        <a
          class="cat-nav-link"
          :class="{ 'is-active': activeId === category.id }"
          :href="`#${category.id}`"
          :aria-current="activeId === category.id ? 'true' : undefined"
        >
          {{ category.label }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.cat-nav {
  position: sticky;
  /* Sit directly beneath the 64px sticky TopNav. */
  top: 64px;
  z-index: 40;
  background: color-mix(in oklch, var(--dz-background, #fff) 82%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--lp-hairline);
}

.cat-nav-list {
  list-style: none;
  margin: 0 auto;
  padding: 0 24px;
  max-width: var(--lp-container, 1120px);
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 52px;
  align-items: center;
}

.cat-nav-link {
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: var(--dz-radius-full, 9999px);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  text-decoration: none;
  transition:
    color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    background var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.cat-nav-link:hover {
  color: var(--dz-foreground, #1a202c);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 7%, transparent);
}

.cat-nav-link.is-active {
  color: var(--dz-primary, #4f46e5);
  background: var(--dz-primary-muted, #eef2ff);
}

.cat-nav-link:focus-visible {
  outline: 2px solid var(--dz-ring, #4f46e5);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .cat-nav-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
