<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import Section from '../components/Section.vue'
import BlockCard from '../components/blocks/BlockCard.vue'
import BlockCategoryNav from '../components/blocks/BlockCategoryNav.vue'
import BlockPreview from '../components/blocks/BlockPreview.vue'
import { BLOCKS, CATEGORIES, blocksByCategory } from '../blocks/registry.ts'
import type { CategoryMeta } from '../blocks/registry.ts'
import { vReveal } from '../composables/useScrollReveal.ts'

/**
 * /blocks — the Blocks ecosystem index (docs/blocks.md §3.1, §3.2, §4).
 *
 * A hero intro over a sticky category tab bar that switches between groups
 * (Marketing, Application, Layout, …) one at a time — rather than scrolling one
 * long stacked page. Only the active category mounts (a big win, since each
 * group holds many heavy live previews), and switching plays a directional
 * slide-and-fade so groups feel like pages turning. A prev/next pager flips
 * between adjacent groups.
 *
 * Everything is still driven by the block registry: tabs, panels and the pager
 * all read `CATEGORIES` / `blocksByCategory`, so the page grows automatically as
 * authors register blocks. Motion honours `prefers-reduced-motion` (the deck
 * transition degrades to an instant opacity swap; switch-scroll uses `auto`).
 *
 * Deep links work both ways: `#<category>` opens that group, and a legacy
 * `#<block-id>` resolves to the block's category and scrolls to its preview.
 */

const PANEL_PREFIX = 'blocks-panel'

interface CategorySection extends CategoryMeta {
  blocks: ReturnType<typeof blocksByCategory>
}

/** Only categories that actually have registered blocks, in browse order. */
const sections = computed<CategorySection[]>(() =>
  CATEGORIES.map((category) => ({ ...category, blocks: blocksByCategory(category.id) })).filter(
    (section) => section.blocks.length > 0,
  ),
)

/** Resolve the category to open on load from the URL hash, if any. */
function initialCategory(): string {
  const fallback = sections.value[0]?.id ?? ''
  if (typeof window === 'undefined') return fallback
  const hash = window.location.hash.slice(1)
  if (!hash) return fallback
  // Direct category deep link (#marketing).
  if (sections.value.some((s) => s.id === hash)) return hash
  // Legacy block deep link (#hero-centered) → open the block's category.
  const block = BLOCKS.find((b) => b.id === hash)
  if (block && sections.value.some((s) => s.id === block.category)) return block.category
  return fallback
}

/** The currently shown category. */
const active = ref<string>(initialCategory())

/** The section object for the active category. */
const activeSection = computed<CategorySection | undefined>(() =>
  sections.value.find((s) => s.id === active.value),
)

/**
 * The active category's decorative accent as a `--lp-cat-500` custom property,
 * set on the panel so every BlockCard / BlockPreview inside inherits it through
 * the cascade — chips, links and the preview wash all derive their colour from
 * it (with `--dz-primary` as the fallback when unset).
 */
const accentStyle = computed(() =>
  activeSection.value
    ? { '--lp-cat-500': `var(--dz-colors-${activeSection.value.accent}-500)` }
    : undefined,
)

/** Index of the active category among the visible sections. */
const activeIndex = computed(() => sections.value.findIndex((s) => s.id === active.value))

/** Adjacent groups for the pager (undefined at the ends). */
const prevSection = computed(() => sections.value[activeIndex.value - 1])
const nextSection = computed(() => sections.value[activeIndex.value + 1])

/** Slide direction for the deck transition, set just before `active` changes. */
const direction = ref<'fwd' | 'back'>('fwd')
const transitionName = computed(() => (direction.value === 'fwd' ? 'deck-fwd' : 'deck-back'))

/** The active tabpanel element (for focus management on switch). */
const panelEl = ref<HTMLElement | null>(null)

function panelId(id: string): string {
  return `${PANEL_PREFIX}-${id}`
}
function tabId(id: string): string {
  return `blocks-tab-${id}`
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Switch to a category, recording the direction so the deck slides the right way. */
function goTo(id: string) {
  if (id === active.value) return
  const from = activeIndex.value
  const to = sections.value.findIndex((s) => s.id === id)
  direction.value = to >= from ? 'fwd' : 'back'
  active.value = id
}

/**
 * After a user-initiated switch, pin the tab bar to the top of the viewport so
 * the new group reads from its heading, and move focus to the panel for AT.
 * The sticky stack above the panels is TopNav (64px) + the tab bar (~52px).
 */
function scrollToPanelTop() {
  if (typeof window === 'undefined') return
  const deck = document.getElementById('blocks-deck')
  if (!deck) return
  const top = deck.getBoundingClientRect().top + window.scrollY - 116
  // Only pull the page up when the panel top is above the fold; never scroll down
  // past content the reader can already see.
  if (window.scrollY > top) {
    window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }
}

let isMounted = false

watch(active, async (id) => {
  // Keep the URL shareable without triggering the router's hash scroll.
  if (typeof window !== 'undefined') {
    window.history.replaceState(window.history.state, '', `#${id}`)
  }
  if (!isMounted) return
  await nextTick()
  scrollToPanelTop()
  panelEl.value?.focus({ preventScroll: true })
})

onMounted(async () => {
  isMounted = true
  // If we opened on a legacy block deep link, scroll its preview into view once
  // the (async) panel has had a chance to mount.
  if (typeof window !== 'undefined') {
    const hash = window.location.hash.slice(1)
    const block = hash ? BLOCKS.find((b) => b.id === hash) : undefined
    if (block) {
      await nextTick()
      requestAnimationFrame(() => {
        document.getElementById(block.id)?.scrollIntoView({
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
          block: 'start',
        })
      })
    }
  }
})
</script>

<template>
  <!-- Single root element: this page is rendered inside App.vue's <Transition>,
       which can only animate a component with one root node. -->
  <div class="blocks-page">
    <!-- Hero intro: the page's single H1. -->
    <Section heading-id="blocks-title">
      <div class="blocks-hero">
        <span class="lp-eyebrow">Ecosystem</span>
        <DzHeading id="blocks-title" :level="1" size="3xl" weight="semibold" class="blocks-hero-title lp-balance">
          Blocks
        </DzHeading>
        <DzText size="lg" tone="muted" class="blocks-hero-lede lp-balance">
          Pre-composed UI sections — heroes, pricing, navbars, stat rows, auth cards — built from the same
          @dzup-ui/core components and design tokens. Copy the markup, paste it in, and it drops in already
          themed, accessible, and light/dark-ready.
        </DzText>
      </div>
    </Section>

    <!-- Sticky category tab bar — switches the visible group below. -->
    <BlockCategoryNav
      v-if="sections.length"
      v-model="active"
      :categories="sections"
      :panel-id-prefix="PANEL_PREFIX"
    />

    <!-- The deck: one animated group at a time. -->
    <div id="blocks-deck" class="blocks-deck">
      <Transition :name="transitionName" mode="out-in">
        <section
          v-if="activeSection"
          :key="activeSection.id"
          ref="panelEl"
          class="blocks-panel"
          role="tabpanel"
          tabindex="-1"
          :id="panelId(activeSection.id)"
          :aria-labelledby="tabId(activeSection.id)"
          :style="accentStyle"
        >
          <Section
            :title="activeSection.label"
            :lede="activeSection.blurb"
            :heading-id="`blocks-cat-${activeSection.id}`"
            align="left"
          >
            <!-- Index: a card per block, scrolling to its preview within the panel. -->
            <ul class="block-grid">
              <li
                v-for="(block, i) in activeSection.blocks"
                :key="block.id"
                v-reveal="i * 45"
              >
                <BlockCard :block="block" />
              </li>
            </ul>

            <!-- Live previews: each block's full chrome (tabs / viewport / copy). -->
            <div class="block-previews">
              <BlockPreview
                v-for="block in activeSection.blocks"
                :key="block.id"
                :block="block"
                v-reveal
              />
            </div>
          </Section>
        </section>
      </Transition>

      <!-- Pager: flip to the previous / next group like turning a page. -->
      <nav v-if="sections.length > 1" class="blocks-pager" aria-label="Browse block groups">
        <DzButton
          variant="outline"
          tone="neutral"
          :disabled="!prevSection"
          class="blocks-pager-btn"
          @click="prevSection && goTo(prevSection.id)"
        >
          <template #prefix><ChevronLeft :size="16" aria-hidden="true" /></template>
          <span class="blocks-pager-edge">Previous</span>
          <span class="blocks-pager-name">{{ prevSection?.label ?? 'Start' }}</span>
        </DzButton>

        <DzText size="sm" tone="muted" class="blocks-pager-count">
          {{ activeIndex + 1 }} / {{ sections.length }}
        </DzText>

        <DzButton
          variant="outline"
          tone="neutral"
          :disabled="!nextSection"
          class="blocks-pager-btn blocks-pager-btn--next"
          @click="nextSection && goTo(nextSection.id)"
        >
          <template #suffix><ChevronRight :size="16" aria-hidden="true" /></template>
          <span class="blocks-pager-edge">Next</span>
          <span class="blocks-pager-name">{{ nextSection?.label ?? 'End' }}</span>
        </DzButton>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.blocks-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.blocks-hero-title {
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.blocks-hero-lede {
  margin: 0;
  max-width: 60ch;
  line-height: 1.65;
}

.blocks-deck {
  /* Clip the in/out slide so a transitioning panel never spills sideways and
     spawns a horizontal scrollbar. */
  overflow-x: clip;
}

.blocks-panel {
  /* Clear the sticky TopNav (64px) + tab bar (~52px) for in-panel #id jumps. */
  scroll-margin-top: 124px;
  outline: none;
}

/* Pager — adjacent-group flip controls. */
.blocks-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: 0 24px clamp(56px, 8vw, 96px);
}

.blocks-pager-btn {
  min-width: 0;
}

.blocks-pager-btn--next {
  text-align: right;
}

/* Stack the "Previous/Next" caption over the destination name inside the button. */
.blocks-pager-edge {
  display: block;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #64748b);
  line-height: 1.2;
}

.blocks-pager-name {
  display: block;
  font-weight: 600;
  line-height: 1.2;
}

.blocks-pager-count {
  flex: none;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.block-grid {
  list-style: none;
  margin: 0 0 clamp(40px, 6vw, 72px);
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.block-previews {
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 5vw, 56px);
}

/* ---- Deck transition: a directional slide + fade with a hint of depth. ----
   mode="out-in" means no overlap, so plain transforms suffice. Forward (next
   group) slides the old panel out left and the new one in from the right;
   backward mirrors it. */
.deck-fwd-enter-active,
.deck-fwd-leave-active,
.deck-back-enter-active,
.deck-back-leave-active {
  transition:
    opacity var(--dz-duration-normal, 240ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    transform var(--dz-duration-slow, 320ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
  will-change: opacity, transform;
}

.deck-fwd-enter-from {
  opacity: 0;
  transform: translateX(36px) scale(0.99);
}
.deck-fwd-leave-to {
  opacity: 0;
  transform: translateX(-36px) scale(0.99);
}
.deck-back-enter-from {
  opacity: 0;
  transform: translateX(-36px) scale(0.99);
}
.deck-back-leave-to {
  opacity: 0;
  transform: translateX(36px) scale(0.99);
}

@media (max-width: 900px) {
  .block-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .block-grid {
    grid-template-columns: 1fr;
  }

  .blocks-pager-edge {
    display: none;
  }
}

/* Reduced motion: instant opacity swap, no slide/scale. */
@media (prefers-reduced-motion: reduce) {
  .deck-fwd-enter-active,
  .deck-fwd-leave-active,
  .deck-back-enter-active,
  .deck-back-leave-active {
    transition-duration: 0.01ms;
  }

  .deck-fwd-enter-from,
  .deck-fwd-leave-to,
  .deck-back-enter-from,
  .deck-back-leave-to {
    transform: none;
  }
}
</style>
