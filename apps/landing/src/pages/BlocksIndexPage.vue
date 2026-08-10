<script setup lang="ts">
import type { BlockDef, CategoryMeta } from '../blocks/registry.ts'
import type { BlockNavTarget } from '../components/blocks/BlockCommandPalette.vue'
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { BLOCKS, blocksByCategory, CATEGORIES } from '../blocks/registry.ts'
import BlockAiCallout from '../components/blocks/BlockAiCallout.vue'
import BlockCard from '../components/blocks/BlockCard.vue'
import BlockCategoryNav from '../components/blocks/BlockCategoryNav.vue'
import BlockCommandPalette from '../components/blocks/BlockCommandPalette.vue'
import BlockSearchBar from '../components/blocks/BlockSearchBar.vue'
import BlockThemeToolbar from '../components/blocks/BlockThemeToolbar.vue'
import LazyBlockPreview from '../components/blocks/LazyBlockPreview.vue'
import Section from '../components/Section.vue'
import { useBlockSearch } from '../composables/useBlockSearch.ts'
import { vReveal } from '../motion/index.ts'

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

// --- Results mode (search / tag filter) ------------------------------------
//
// An *additional* browse mode layered over the deck (docs/blocks.md §3.1): when a
// query or tag is active the deck + pager are replaced by a flat grid spanning
// every category, driven entirely by this shared `useBlockSearch` state (the
// search bar writes it, the page reads it). Clearing it restores the deck
// unchanged. The on-page filter never touches the URL hash — only selecting a
// block does (via BlockCard's `#<id>` link) — so deep-linking is preserved.
const search = useBlockSearch()
const isFiltering = search.isFiltering
const results = search.results

// Deep-linkable component filter: `/blocks?component=DzTable` opens results mode
// pre-filtered to every block using that component. This is the cross-page
// reverse-lookup target — a "Built from" chip on the standalone BlockDetailPage
// (which has no live filter of its own) routes here with the component set, so
// the affordance keeps working across the page boundary (Task E4, I4). Seeded
// synchronously at setup (validated against the catalog) so the first paint is
// already in results mode rather than flashing the deck.
if (typeof window !== 'undefined') {
  const requested = new URLSearchParams(window.location.search).get('component')
  if (requested && search.allComponents().includes(requested)) {
    search.activeComponent.value = requested
  }
}

/**
 * Reverse-lookup entry point (Task E4): a component chip on any BlockCard /
 * BlockPreview asks the index to show every block using that component. We route
 * it through the *same* `useBlockSearch` instance as the search bar — setting
 * `activeComponent` flips the page into results mode — rather than adding a
 * parallel filter. Free-text and tag facets are cleared so the component filter
 * stands alone, then the search bar (live count + Clear) is scrolled into view.
 */
function showBlocksUsing(name: string): void {
  search.query.value = ''
  search.activeTags.value = []
  search.activeComponent.value = name
  if (typeof window === 'undefined') return
  requestAnimationFrame(() => {
    document.querySelector('.block-search')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  })
}

/** Live, count-aware lede for the results section heading. */
const resultsLede = computed(() => {
  const n = results.value.length
  if (n === 0)
    return 'No blocks match your search and tag filters. Clear them to browse by category.'
  return `${n} ${n === 1 ? 'block' : 'blocks'} across all categories match your filters.`
})

/** Category id → decorative accent, so each cross-category card/preview keeps its group's hue. */
const accentByCategory = new Map(CATEGORIES.map((c) => [c.id, c.accent] as const))

/**
 * Per-block accent custom property for results mode. In the deck the accent is
 * set once on the panel; here results mix categories, so each item carries its
 * own `--lp-cat-500` (chips/preview wash inherit it through the cascade).
 */
function itemAccentStyle(block: BlockDef) {
  const accent = accentByCategory.get(block.category)
  return accent ? { '--lp-cat-500': `var(--dz-colors-${accent}-500)` } : undefined
}

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

/**
 * Block ids that must mount their live preview immediately, bypassing the lazy
 * scroll gate (Task E5). A `BlockPreview` is only mounted as it nears the
 * viewport — but a below-the-fold deep-link / ⌘K target has to render *before*
 * we can scroll to it, since the `#<id>` anchor lives on BlockPreview's root
 * (`LazyBlockPreview`'s skeleton has no such anchor). Forcing the target mount
 * makes the element exist for `scrollIntoView`. A reactive Set drives the
 * per-card `force-mount` binding.
 */
const forcedBlockIds = reactive(new Set<string>())

// Seed the initial deep-link target (#<block-id>) so it renders live on the
// first paint — no skeleton flash — and its #id anchor exists for the onMounted
// scroll, even when the block sits below the fold.
if (typeof window !== 'undefined') {
  const initialHash = window.location.hash.slice(1)
  if (initialHash && BLOCKS.some((b) => b.id === initialHash)) forcedBlockIds.add(initialHash)
}

/** Whether a block should skip the lazy gate and render its preview now. */
function isForced(id: string): boolean {
  return forcedBlockIds.has(id)
}

/**
 * Scroll a block's live preview into view by its `#<id>` anchor (the id
 * BlockPreview sets on its root). Shared by the initial deep-link jump and the
 * ⌘K palette so both honour `prefers-reduced-motion` identically. Force-mounts
 * the target first (so its anchor exists even when it's still a lazy skeleton),
 * then waits a tick + rAF so the scroll fires after the preview has painted.
 */
async function scrollToBlock(id: string) {
  if (typeof window === 'undefined') return
  forcedBlockIds.add(id)
  await nextTick()
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  })
}

/**
 * A block waiting to be scrolled to once its category deck finishes its enter
 * transition (set when the palette jumps to a block in a not-yet-active group).
 */
const pendingBlockId = ref<string | null>(null)

/**
 * When the palette or a BlockCard navigates to a block, open its deck then
 * scroll to it.
 *
 * A card's `#<id>` anchor cannot do this by itself: previews are lazily mounted
 * (LazyBlockPreview), so a below-the-fold target is still a skeleton with no
 * `#<id>` anchor and the browser's native jump silently lands nowhere. The card
 * therefore calls `preventDefault()` and routes here, which force-mounts the
 * target first — so we also own writing the hash the anchor would have set.
 */
function openBlock(blockId: string) {
  const block = BLOCKS.find((b) => b.id === blockId)
  if (!block) return
  // Keep the URL shareable/back-navigable exactly as the plain anchor did.
  if (typeof window !== 'undefined' && window.location.hash.slice(1) !== blockId)
    window.history.pushState(window.history.state, '', `#${blockId}`)
  if (block.category === active.value) {
    // Deck already showing this group — just scroll the preview into view.
    scrollToBlock(blockId)
  } else {
    // Switch decks first; the scroll waits for the enter transition (after-enter).
    pendingBlockId.value = blockId
    goTo(block.category)
  }
}

/** Handle a ⌘K palette selection: open the target block or category deck. */
function onPaletteNavigate(target: BlockNavTarget) {
  if (target.blockId) openBlock(target.blockId)
  else goTo(target.category)
}

/** After a deck enter transition, flush any pending palette block scroll. */
function onPanelEntered() {
  if (pendingBlockId.value) {
    scrollToBlock(pendingBlockId.value)
    pendingBlockId.value = null
  }
}

let isMounted = false

watch(active, async (id) => {
  // Keep the URL shareable without triggering the router's hash scroll.
  // Skip while a block jump is in flight: `openBlock` already wrote the more
  // specific `#<block-id>`, and overwriting it with the category would drop the
  // deep link the user just followed.
  if (typeof window !== 'undefined' && !pendingBlockId.value) {
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
      scrollToBlock(block.id)
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
        <DzHeading
          id="blocks-title"
          :level="1"
          size="3xl"
          weight="semibold"
          class="blocks-hero-title lp-balance"
        >
          Blocks
        </DzHeading>
        <DzText size="lg" tone="muted" class="blocks-hero-lede lp-balance">
          Pre-composed UI sections — heroes, pricing, navbars, stat rows, auth cards — built from
          the same @dzup-ui/core components and design tokens. Copy the markup, paste it in, and it
          drops in already themed, accessible, and light/dark-ready.
        </DzText>

        <!-- ⌘K navigator: jump to any block, category or component. -->
        <BlockCommandPalette class="blocks-hero-search" @navigate="onPaletteNavigate" />
      </div>
    </Section>

    <!-- Search + tag-filter bar — always visible; drives results mode below. -->
    <BlockSearchBar :search="search" />

    <!-- Global token editor (docs/blocks.md §3.4): one instance re-themes every
         live preview AND injects the same `:root{}` into copied snippets. -->
    <BlockThemeToolbar />

    <!-- Mode switch: a flat results grid while filtering, else the category deck.
         out-in fade; degrades to an instant swap under prefers-reduced-motion. -->
    <Transition name="mode-fade" mode="out-in">
      <!-- Results mode: a flat BlockCard grid + previews spanning ALL categories. -->
      <div v-if="isFiltering" key="results" class="blocks-results">
        <Section
          title="Search results"
          :lede="resultsLede"
          heading-id="blocks-results-title"
          align="left"
        >
          <template v-if="results.length">
            <ul class="block-grid">
              <li
                v-for="(block, i) in results"
                :key="block.id"
                v-reveal="i * 45"
                :style="itemAccentStyle(block)"
              >
                <BlockCard
                  :block="block"
                  @select-component="showBlocksUsing"
                  @open-block="openBlock"
                />
              </li>
            </ul>

            <!-- Reuse the same lazy preview mounting as the deck, flat. -->
            <div class="block-previews">
              <div v-for="block in results" :key="block.id" :style="itemAccentStyle(block)">
                <LazyBlockPreview
                  v-reveal
                  :block="block"
                  :force-mount="isForced(block.id)"
                  @select-component="showBlocksUsing"
                />
              </div>
            </div>
          </template>
        </Section>
      </div>

      <!-- Deck mode: the existing category nav + one-group-at-a-time deck. -->
      <div v-else key="deck" class="blocks-deck-mode">
        <!-- Sticky category tab bar — switches the visible group below. -->
        <BlockCategoryNav
          v-if="sections.length"
          v-model="active"
          :categories="sections"
          :panel-id-prefix="PANEL_PREFIX"
        />

        <!-- The deck: one animated group at a time. -->
        <div id="blocks-deck" class="blocks-deck">
          <Transition :name="transitionName" mode="out-in" @after-enter="onPanelEntered">
            <section
              v-if="activeSection"
              :id="panelId(activeSection.id)"
              :key="activeSection.id"
              ref="panelEl"
              class="blocks-panel"
              role="tabpanel"
              tabindex="-1"
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
                  <li v-for="(block, i) in activeSection.blocks" :key="block.id" v-reveal="i * 45">
                    <BlockCard
                      :block="block"
                      @select-component="showBlocksUsing"
                      @open-block="openBlock"
                    />
                  </li>
                </ul>

                <!-- Live previews: each block's full chrome (tabs / viewport / copy),
                 lazily mounted as it nears the viewport (Task E5). -->
                <div class="block-previews">
                  <LazyBlockPreview
                    v-for="block in activeSection.blocks"
                    :key="block.id"
                    v-reveal
                    :block="block"
                    :force-mount="isForced(block.id)"
                    @select-component="showBlocksUsing"
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
              <template #prefix>
                <ChevronLeft :size="16" aria-hidden="true" />
              </template>
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
              <template #suffix>
                <ChevronRight :size="16" aria-hidden="true" />
              </template>
              <span class="blocks-pager-edge">Next</span>
              <span class="blocks-pager-name">{{ nextSection?.label ?? 'End' }}</span>
            </DzButton>
          </nav>
        </div>
      </div>
    </Transition>

    <!-- "Use with AI" — the AI-native distribution entry points (Task G5):
         llms.txt, registry.json, and the copy-paste MCP server config. Outside
         the deck⇄results Transition so it's always present, below the catalog. -->
    <BlockAiCallout />
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

.blocks-hero-search {
  margin-top: 8px;
}

.blocks-deck {
  /* Clip the in/out slide so a transitioning panel never spills sideways and
     spawns a horizontal scrollbar. */
  overflow-x: clip;
}

/* ---- Mode switch (deck ⇄ results): a plain cross-fade, no overlap. ---------
   out-in means the leaving mode is gone before the next enters, so opacity
   alone reads cleanly. Degrades to an instant swap under reduced motion. */
.mode-fade-enter-active,
.mode-fade-leave-active {
  transition: opacity var(--dz-duration-normal, 240ms)
    var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.mode-fade-enter-from,
.mode-fade-leave-to {
  opacity: 0;
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
  /* minmax(0, 1fr) — NOT `1fr`. A plain `1fr` is `minmax(auto, 1fr)`, so a card
     whose content has a wide min-content floor (the install command renders
     `white-space: pre`, ~596px) inflates its track and pushes the trailing
     column outside the 1120px container. Flooring at 0 lets the track shrink
     and hands the overflow to the code block's own horizontal scroll. */
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

/* Grid items are themselves flex/grid parents; without an explicit 0 floor the
   same min-content inflation re-enters one level down. */
.block-grid > li {
  min-width: 0;
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
  .mode-fade-enter-active,
  .mode-fade-leave-active,
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
