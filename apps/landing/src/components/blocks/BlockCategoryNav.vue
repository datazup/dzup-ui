<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { CategoryMeta } from '../../blocks/registry.ts'

/**
 * BlockCategoryNav — sticky tab switcher for /blocks (docs/blocks.md §3.1).
 *
 * Previously a set of hash anchors that scrolled down one long page; now a real
 * tab control. The page shows ONE category at a time, so this owns the active
 * category (`v-model`) rather than tracking scroll position. An animated pill
 * indicator glides behind the active tab on change.
 *
 * Accessibility follows the APG tabs pattern with **manual activation** — each
 * category panel mounts a stack of heavy live previews, so arrow keys only move
 * focus (roving tabindex); selection happens on Enter / Space / click. Keyboard:
 * Left/Right move focus, Home/End jump to the ends, Enter/Space activate.
 */
const props = defineProps<{
  /** Non-empty categories to list, in browse order. */
  categories: CategoryMeta[]
  /** id prefix for the tabpanels this nav controls (for aria-controls). */
  panelIdPrefix?: string
}>()

/** Selected category — drives which panel the page renders. */
const active = defineModel<string>({ required: true })

/** Which tab currently holds the roving tabindex (follows focus, not selection). */
const focusId = ref<string>(active.value)

/** CSS var reference to a category's decorative accent shade. */
function accentVar(category: CategoryMeta): string {
  return `var(--dz-colors-${category.accent}-500)`
}

/**
 * The active category's accent, exposed on the track as `--pill-accent` so the
 * sliding pill and the active tab's label both tint to the current group.
 */
const pillAccent = computed(() => {
  const current = props.categories.find((c) => c.id === active.value)
  return current ? accentVar(current) : 'var(--dz-primary)'
})

/** The scrolling track + per-tab button elements (for the indicator + focus). */
const trackEl = ref<HTMLElement | null>(null)
const tabEls = new Map<string, HTMLButtonElement>()

/** Indicator geometry, in px relative to the track. */
const indicatorX = ref(0)
const indicatorW = ref(0)
const indicatorReady = ref(false)

function setTabEl(id: string, el: Element | null) {
  if (el) tabEls.set(id, el as HTMLButtonElement)
  else tabEls.delete(id)
}

/** Move the pill behind the active tab and keep that tab in view. */
function syncIndicator() {
  const el = tabEls.get(active.value)
  if (!el) return
  indicatorX.value = el.offsetLeft
  indicatorW.value = el.offsetWidth
  indicatorReady.value = true
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

function tabId(id: string): string {
  return `blocks-tab-${id}`
}

function panelId(id: string): string {
  return `${props.panelIdPrefix ?? 'blocks-panel'}-${id}`
}

function onKeydown(event: KeyboardEvent) {
  const ids: string[] = props.categories.map((c) => c.id)
  const current = ids.indexOf(focusId.value)
  if (current === -1) return

  let next = current
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = (current + 1) % ids.length
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      next = (current - 1 + ids.length) % ids.length
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = ids.length - 1
      break
    default:
      return
  }
  const target = ids[next]
  if (target === undefined) return
  event.preventDefault()
  focusId.value = target
  tabEls.get(target)?.focus()
}

function select(id: string) {
  focusId.value = id
  active.value = id
}

// External changes to the selection (pager / deep link) move the roving focus
// and the indicator with it.
watch(active, async (id) => {
  focusId.value = id
  await nextTick()
  syncIndicator()
})

let resizeObserver: ResizeObserver | null = null

onMounted(async () => {
  await nextTick()
  syncIndicator()

  if (typeof ResizeObserver !== 'undefined' && trackEl.value) {
    // Reposition when the track reflows (font load, viewport / wrap changes).
    resizeObserver = new ResizeObserver(() => syncIndicator())
    resizeObserver.observe(trackEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <nav class="cat-nav" aria-label="Block categories">
    <div
      ref="trackEl"
      class="cat-nav-track"
      role="tablist"
      aria-label="Block categories"
      :style="{ '--pill-accent': pillAccent }"
      @keydown="onKeydown"
    >
      <!-- Sliding active-tab indicator (decorative; the buttons carry state). -->
      <span
        class="cat-nav-indicator"
        :class="{ 'is-ready': indicatorReady }"
        :style="{ transform: `translateX(${indicatorX}px)`, width: `${indicatorW}px` }"
        aria-hidden="true"
      />

      <button
        v-for="category in categories"
        :key="category.id"
        :ref="(el) => setTabEl(category.id, el as Element | null)"
        type="button"
        role="tab"
        class="cat-nav-tab"
        :class="{ 'is-active': active === category.id }"
        :style="{ '--tab-accent': accentVar(category) }"
        :id="tabId(category.id)"
        :aria-selected="active === category.id"
        :aria-controls="panelId(category.id)"
        :tabindex="focusId === category.id ? 0 : -1"
        @click="select(category.id)"
      >
        {{ category.label }}
      </button>
    </div>
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

.cat-nav-track {
  position: relative;
  margin: 0 auto;
  padding: 8px 24px;
  max-width: var(--lp-container, 1120px);
  display: flex;
  gap: 4px;
  min-height: 52px;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
}

.cat-nav-track::-webkit-scrollbar {
  display: none;
}

/* The gliding pill behind the active tab. */
.cat-nav-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  height: 34px;
  border-radius: var(--dz-radius-full, 9999px);
  /* Soft tint of the active group's accent — adapts to light/dark by mixing
     against the surface, so the active tab's label stays readable on top. */
  background: color-mix(in oklch, var(--pill-accent, var(--dz-primary, #4f46e5)) 15%, var(--dz-surface, #fff));
  /* Hidden until measured so it never flashes at 0,0 on first paint. */
  opacity: 0;
  transform: translateX(0);
  margin-top: -17px;
  pointer-events: none;
  z-index: 0;
}

.cat-nav-indicator.is-ready {
  opacity: 1;
  transition:
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    width var(--dz-duration-normal, 240ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    background-color var(--dz-duration-normal, 240ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.cat-nav-tab {
  position: relative;
  z-index: 1;
  flex: none;
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border: 0;
  background: transparent;
  border-radius: var(--dz-radius-full, 9999px);
  font-family: inherit;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-muted-foreground, #64748b);
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.cat-nav-tab:hover {
  /* Preview the tab's own hue on hover (mixed toward the foreground for
     legibility against the bar). */
  color: color-mix(in oklch, var(--tab-accent, var(--dz-primary, #4f46e5)) 55%, var(--dz-foreground, #1a202c));
}

.cat-nav-tab.is-active {
  /* Active label tints to the group accent that the pill behind it carries. */
  color: color-mix(in oklch, var(--pill-accent, var(--dz-primary, #4f46e5)) 70%, var(--dz-foreground, #1a202c));
}

.cat-nav-tab:focus-visible {
  outline: 2px solid var(--tab-accent, var(--dz-ring, #4f46e5));
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .cat-nav-indicator.is-ready {
    transition: none;
  }
}
</style>
