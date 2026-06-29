<script setup lang="ts">
import { DzButton, DzHeading, DzSearchInput, DzSwitch, DzText } from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, SearchX, Sparkles } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AnimationCard from '../gallery/AnimationCard.vue'
import { CATALOG, CATEGORIES, categoryAccentStyle } from '../gallery/catalog.ts'
import { DzAurora, provideMotionPreference, vAutoAnimate } from '../motion/index.ts'
import { LINKS } from '../config.ts'

/**
 * /animations — the live motion gallery (docs/animations.md §4.3–4.4).
 *
 * Reworked from per-category stacked grids into a single, filterable "bento"
 * gallery so the motion itself is the hero. A drifting aurora backdrop + grain
 * give the page an ambient, dreamlike depth; a frosted sticky toolbar carries a
 * live search, category + type filters and the global "Reduce motion" toggle;
 * and the results flow into a dense bento where inherently wide/ambient effects
 * (backgrounds, marquees, transitions) get a roomier stage. Cards float in with
 * a staggered reveal whenever the filter set changes.
 *
 * Still fully data-driven by the catalog — Tasks add effects by appending to
 * CATALOG, with no changes here or to AnimationCard.
 */

// Page-level reduced-motion override; bound to the toolbar DzSwitch. Also gates
// the bento's own enter/move transitions so the gallery demos its accessible
// fallback end-to-end.
const reduceMotion = provideMotionPreference()

// Bento animation path (docs/animations.md §3.4 — Task N2). When motion is allowed
// we let AutoAnimate (@formkit/auto-animate) own the add/remove/move of cards on
// every filter change — one directive, GPU-cheap, and reduced-motion-aware by
// default. When the page-level "Reduce motion" toggle is on we fall back to the
// TransitionGroup path with `is-still`, which snaps instantly (and the
// TransitionGroup is also the staggered-enter / no-Web-Animations floor).
// AutoAnimate honours the OS prefers-reduced-motion setting on its own.
const useAutoAnimateBento = computed(() => !reduceMotion.value)

// ── Filter state ──────────────────────────────────────────────────────────
const query = ref('')
const activeCategory = ref('all')
const activeType = ref('all')

// Only offer categories that actually have effects, so there are no dead chips
// while the catalog fills in.
const populatedCategories = computed(() =>
  CATEGORIES.filter((cat) => CATALOG.some((entry) => entry.category === cat.id)),
)
const categoryChips = computed(() => [{ id: 'all', label: 'All' }, ...populatedCategories.value])

const CATEGORY_LABEL = new Map(CATEGORIES.map((c) => [c.id, c.label]))

// Type chips, limited to the types present in the catalog.
const TYPE_LABELS: Record<string, string> = {
  directive: 'Directive',
  composable: 'Composable',
  component: 'Component',
  css: 'CSS',
}
const typeChips = computed(() => {
  const present = new Set(CATALOG.map((e) => e.type))
  return [
    { id: 'all', label: 'All types' },
    ...(['directive', 'composable', 'component', 'css'] as const)
      .filter((t) => present.has(t))
      .map((t) => ({ id: t, label: TYPE_LABELS[t] })),
  ]
})

// Inherently wide/ambient effects get a 2-column stage in the bento. Keyed by id
// so the layout intent lives here, not in the catalog or the card.
const WIDE = new Set([
  'bento-reveal',
  'gradient-sweep',
  'aurora-drift',
  'animated-grid',
  'spotlight-follow',
  'marquee-strip',
  'route-transition',
  'tabs-indicator-slide',
  'confetti-burst',
])
function sizeFor(id: string): 'normal' | 'wide' {
  return WIDE.has(id) ? 'wide' : 'normal'
}

// Give each category chip its category's accent (the same decorative hue its
// cards carry), so the active chip lights up in that colour rather than the one
// brand indigo. "All" has no category → keep the brand fallback (undefined).
function chipAccent(id: string): Record<string, string> | undefined {
  return id === 'all' ? undefined : categoryAccentStyle(id)
}

// ── Filtering ─────────────────────────────────────────────────────────────
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return CATALOG.filter((entry) => {
    if (activeCategory.value !== 'all' && entry.category !== activeCategory.value) return false
    if (activeType.value !== 'all' && entry.type !== activeType.value) return false
    if (!q) return true
    const haystack = [
      entry.title,
      entry.blurb,
      entry.type,
      CATEGORY_LABEL.get(entry.category) ?? '',
      ...entry.components,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})

const resultLabel = computed(() => {
  const n = filtered.value.length
  return `${n} ${n === 1 ? 'animation' : 'animations'}`
})

const hasFilters = computed(
  () => query.value.trim() !== '' || activeCategory.value !== 'all' || activeType.value !== 'all',
)

function clearFilters(): void {
  query.value = ''
  activeCategory.value = 'all'
  activeType.value = 'all'
}

// Pin a leaving card to its current box so it fades out in place (absolute) while
// the cards that remain glide to their new positions via `.bento-move`. Standard
// staggered-list leave technique — offsets are relative to the positioned grid.
function onBeforeLeave(el: Element): void {
  const node = el as HTMLElement
  node.style.left = `${node.offsetLeft}px`
  node.style.top = `${node.offsetTop}px`
  node.style.width = `${node.offsetWidth}px`
  node.style.height = `${node.offsetHeight}px`
}

// ── Deep-linking ──────────────────────────────────────────────────────────
// Two distinct hash shapes share `/animations`, told apart by the `effect-`
// prefix so neither breaks the other:
//   • a bare category id (`#text`) preselects that filter (the old contract);
//   • `#effect-<id>` scrolls to and briefly highlights one card (Task N10).
// Category ids never carry the prefix, so an effect permalink never trips the
// category logic and vice-versa.
const EFFECT_HASH_PREFIX = 'effect-'

// Preserve the old `/animations#text` contract: an initial category hash
// preselects that filter, and changing the category reflects back into the URL
// (replaceState — no scroll, no history spam). An `effect-` hash is left alone
// here; onMounted resolves it to a card below.
if (typeof window !== 'undefined') {
  const initial = window.location.hash.slice(1)
  if (initial && populatedCategories.value.some((c) => c.id === initial)) {
    activeCategory.value = initial
  }
}

watch(activeCategory, (id) => {
  if (typeof window === 'undefined') return
  const hash = id === 'all' ? '' : `#${id}`
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${hash}`,
  )
})

// The card a permalink resolved to — pulsed briefly so the reader can spot it.
const highlightedId = ref<string | null>(null)
let highlightTimer: number | null = null

// Resolve `#effect-<id>` to a card: relax any active filter that would hide it
// (so a shared link always lands on a visible card), then scroll it into view
// and trigger the highlight pulse.
function focusEffectFromHash(): void {
  if (typeof window === 'undefined') return
  const hash = window.location.hash.slice(1)
  if (!hash.startsWith(EFFECT_HASH_PREFIX)) return
  const id = hash.slice(EFFECT_HASH_PREFIX.length)
  const entry = CATALOG.find((e) => e.id === id)
  if (!entry) return

  if (!filtered.value.some((e) => e.id === id)) {
    query.value = ''
    activeType.value = 'all'
    if (entry.category !== activeCategory.value) activeCategory.value = 'all'
  }

  nextTick(() => {
    const el = document.getElementById(`effect-${id}`)
    if (!el) return
    const reduce
      = reduceMotion.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    highlightedId.value = id
    if (highlightTimer) window.clearTimeout(highlightTimer)
    highlightTimer = window.setTimeout(() => (highlightedId.value = null), 2200)
  })
}

onMounted(() => {
  focusEffectFromHash()
  window.addEventListener('hashchange', focusEffectFromHash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', focusEffectFromHash)
  if (highlightTimer) window.clearTimeout(highlightTimer)
})
</script>

<template>
  <div class="anim-page">
    <!-- Ambient dreamlike backdrop: drifting aurora + grain, fading downward so
         the cards below sit on a calm surface. Purely decorative. -->
    <div class="anim-bg" aria-hidden="true">
      <DzAurora />
      <div class="lp-grain-layer" />
    </div>

    <!-- Hero -->
    <header class="hero" aria-labelledby="animations-title">
      <span class="lp-eyebrow">
        <Sparkles :size="13" aria-hidden="true" />
        Ecosystem · Animations
      </span>
      <DzHeading id="animations-title" :level="1" size="3xl" weight="semibold" class="hero-title lp-balance">
        Motion, ready to
        <span class="lp-gradient-text">drop in</span>
      </DzHeading>
      <DzText size="lg" tone="muted" as="p" class="hero-lede lp-balance">
        Scroll reveals, text and number transitions, hover micro-interactions, ambient backgrounds and
        tactile feedback — each built from the same @dzup-ui/core components and design tokens, and each
        honouring prefers-reduced-motion out of the box.
      </DzText>

      <div class="hero-actions">
        <DzButton variant="solid" tone="primary" as="a" :href="LINKS.components">
          Browse components
          <template #suffix><ArrowRight :size="16" aria-hidden="true" /></template>
        </DzButton>
        <DzButton variant="outline" tone="neutral" :to="'/'">
          <template #prefix><ArrowLeft :size="16" aria-hidden="true" /></template>
          Back to home
        </DzButton>
      </div>
    </header>

    <!-- Frosted sticky filter toolbar -->
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="toolbar-search">
          <DzSearchInput
            v-model="query"
            placeholder="Search effects, components…"
            clearable
            aria-label="Search animations"
          />
        </div>

        <div class="toolbar-right">
          <DzButton
            v-if="hasFilters"
            variant="text"
            tone="neutral"
            size="sm"
            class="clear-btn"
            @click="clearFilters"
          >
            Clear
          </DzButton>
          <DzText size="sm" tone="muted" as="span" class="result-count" aria-live="polite">
            {{ resultLabel }}
          </DzText>
          <label class="reduce-toggle">
            <DzSwitch v-model="reduceMotion" aria-label="Reduce motion in all demos" />
            <DzText size="sm" weight="medium" as="span">Reduce motion</DzText>
          </label>
        </div>

        <div class="filter-rows">
          <div class="chip-row" role="group" aria-label="Filter by category">
            <button
              v-for="cat in categoryChips"
              :key="cat.id"
              type="button"
              class="chip"
              :class="{ 'is-active': activeCategory === cat.id }"
              :style="chipAccent(cat.id)"
              :aria-pressed="activeCategory === cat.id"
              @click="activeCategory = cat.id"
            >
              {{ cat.label }}
            </button>
          </div>

          <div class="chip-row chip-row--types" role="group" aria-label="Filter by type">
            <button
              v-for="t in typeChips"
              :key="t.id"
              type="button"
              class="chip chip--type"
              :class="{ 'is-active': activeType === t.id }"
              :aria-pressed="activeType === t.id"
              @click="activeType = t.id"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bento gallery -->
    <div class="gallery">
      <!-- Native path: AutoAnimate owns add/remove/move on filter changes. -->
      <div
        v-if="filtered.length && useAutoAnimateBento"
        v-auto-animate
        class="bento"
      >
        <AnimationCard
          v-for="entry in filtered"
          :key="entry.id"
          :entry="entry"
          :size="sizeFor(entry.id)"
          :highlighted="entry.id === highlightedId"
          class="bento-item"
          :class="`span-${sizeFor(entry.id)}`"
        />
      </div>

      <!-- Fallback / reduced-motion path: TransitionGroup (staggered enter, snaps
           instantly when the page toggle is on). -->
      <TransitionGroup
        v-else-if="filtered.length"
        tag="div"
        name="bento"
        class="bento"
        :class="{ 'is-still': reduceMotion }"
        @before-leave="onBeforeLeave"
      >
        <AnimationCard
          v-for="(entry, i) in filtered"
          :key="entry.id"
          :entry="entry"
          :size="sizeFor(entry.id)"
          :highlighted="entry.id === highlightedId"
          class="bento-item"
          :class="`span-${sizeFor(entry.id)}`"
          :style="{ '--enter-i': i }"
        />
      </TransitionGroup>

      <!-- Empty state -->
      <div v-else class="empty">
        <div class="empty-icon" aria-hidden="true"><SearchX :size="28" /></div>
        <DzText weight="semibold" as="p" class="empty-title">No animations match those filters</DzText>
        <DzText size="sm" tone="muted" as="p">Try a different category, type, or search term.</DzText>
        <DzButton variant="outline" tone="neutral" size="sm" @click="clearFilters">
          Clear filters
        </DzButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anim-page {
  position: relative;
  padding-bottom: clamp(48px, 8vw, 96px);
  overflow-x: clip;
}

/* Ambient backdrop — tall, pinned behind everything, faded out toward the grid. */
.anim-bg {
  position: absolute;
  inset: 0 0 auto 0;
  height: 880px;
  z-index: 0;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 0%, #000 42%, transparent 100%);
}

/* ── Hero ── */
.hero {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(56px, 10vw, 104px) 24px clamp(28px, 4vw, 44px);
}

.lp-eyebrow {
  gap: 6px;
}

.hero-title {
  margin: 0;
  font-size: clamp(2.25rem, 5vw, 3.25rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
}

.hero-lede {
  margin: 0;
  max-width: 60ch;
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

/* ── Frosted sticky toolbar ── */
.toolbar {
  position: sticky;
  top: 64px;
  z-index: 40;
  margin-top: 8px;
  background: color-mix(in oklch, var(--dz-background, #fff) 72%, transparent);
  backdrop-filter: blur(16px) saturate(1.2);
  border-top: 1px solid var(--lp-hairline);
  border-bottom: 1px solid var(--lp-hairline);
}

.toolbar-inner {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: 14px 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px 16px;
}

.toolbar-search {
  min-width: 0;
  max-width: 360px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: end;
}

.result-count {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.reduce-toggle {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
  user-select: none;
}

.filter-rows {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-row--types {
  padding-top: 8px;
  border-top: 1px solid color-mix(in oklch, var(--lp-hairline) 60%, transparent);
}

/* Pill filter chips — quiet by default, brand-filled when active. */
.chip {
  appearance: none;
  padding: 6px 14px;
  border-radius: var(--dz-radius-full, 9999px);
  border: 1px solid var(--lp-hairline);
  background: color-mix(in oklch, var(--dz-surface, #fff) 60%, transparent);
  color: var(--dz-muted-foreground, #64748b);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  cursor: pointer;
  transition:
    color var(--dz-duration-fast, 150ms),
    border-color var(--dz-duration-fast, 150ms),
    background var(--dz-duration-fast, 150ms),
    box-shadow var(--dz-duration-fast, 150ms);
}

.chip--type {
  font-size: var(--dz-text-xs, 0.75rem);
  padding: 5px 12px;
}

.chip:hover {
  color: var(--dz-foreground, #0f172a);
  border-color: color-mix(in oklch, var(--accent, var(--dz-primary, #6366f1)) 45%, var(--lp-hairline));
}

/* Active chip fills with its category accent. Use the -600 (strong) shade so
 * white text clears WCAG AA on the lighter hues (orange, cyan, …); falls back to
 * the brand primary for the "All" chip and the type row. */
.chip.is-active {
  color: var(--dz-primary-foreground, #fff);
  background: var(--accent-strong, var(--dz-primary, #4f46e5));
  border-color: transparent;
  box-shadow: 0 6px 16px -8px color-mix(in oklch, var(--accent, var(--dz-primary, #6366f1)) 70%, transparent);
}

.chip:focus-visible {
  outline: 2px solid var(--accent, var(--dz-ring, #6366f1));
  outline-offset: 2px;
}

/* ── Bento gallery ── */
.gallery {
  position: relative;
  z-index: 1;
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: clamp(28px, 4vw, 48px) 24px 0;
}

.bento {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-flow: dense;
  gap: 20px;
}

.span-wide {
  grid-column: span 2;
}

/* ── Float-in transition (staggered, capped) ── */
.bento-item {
  transition:
    opacity 0.6s var(--dz-ease-out, cubic-bezier(0.16, 1, 0.3, 1)),
    transform 0.6s var(--dz-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

.bento-enter-from {
  opacity: 0;
  transform: translateY(22px) scale(0.97);
}

.bento-enter-active {
  transition-delay: calc(min(var(--enter-i, 0), 14) * 38ms);
}

.bento-leave-active {
  position: absolute;
  margin: 0;
}

.bento-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.bento-move {
  transition: transform 0.5s var(--dz-ease-out, cubic-bezier(0.16, 1, 0.3, 1));
}

/* Page-level toggle (or OS preference) → snap, no float/stagger. */
.bento.is-still .bento-enter-active,
.bento.is-still .bento-leave-active,
.bento.is-still .bento-move {
  transition: none;
}

.bento.is-still .bento-enter-from {
  opacity: 1;
  transform: none;
}

/* ── Empty state ── */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: clamp(48px, 9vw, 96px) 24px;
}

.empty-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin-bottom: 4px;
  border-radius: var(--dz-radius-full, 9999px);
  color: var(--dz-primary, #6366f1);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #6366f1) 22%, transparent);
}

.empty-title {
  font-size: var(--dz-text-lg, 1.125rem);
}

.empty .dz-button {
  margin-top: 8px;
}

@media (max-width: 900px) {
  .bento {
    grid-template-columns: repeat(2, 1fr);
  }

  .span-wide {
    grid-column: span 2;
  }
}

@media (max-width: 620px) {
  .toolbar-inner {
    grid-template-columns: 1fr;
  }

  .toolbar-search {
    max-width: none;
  }

  .toolbar-right {
    justify-self: start;
  }

  .bento {
    grid-template-columns: 1fr;
  }

  .span-wide {
    grid-column: span 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bento-item,
  .bento-move {
    transition-duration: 0.01ms;
  }

  .bento-enter-from {
    opacity: 1;
    transform: none;
  }
}
</style>
