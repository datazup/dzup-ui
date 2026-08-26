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
import BlocksHeroField from '../components/blocks/BlocksHeroField.vue'
import BlockThemeToolbar from '../components/blocks/BlockThemeToolbar.vue'
import LazyBlockPreview from '../components/blocks/LazyBlockPreview.vue'
import Section from '../components/Section.vue'
import { useBlockSearch } from '../composables/useBlockSearch.ts'
import { DzCountUp, vMagnetic, vReveal } from '../motion/index.ts'

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

/**
 * Upper bound on the re-anchor loop in `scrollToBlock` (~2s at 60fps). Purely a
 * safety valve so a preview that never settles cannot spin a rAF loop forever.
 */
const MAX_SCROLL_SETTLE_FRAMES = 120

/**
 * Height of the sticky stack above the panels — TopNav (64px) + the category
 * tab bar (~52px). Mirrors the `scroll-margin-top` on `.blocks-panel` /
 * `.block-preview`, which only applies to native `#id` jumps; the scripted
 * jump has to subtract it itself.
 */
const STICKY_HEADER_OFFSET = 124

interface CategorySection extends CategoryMeta {
  blocks: ReturnType<typeof blocksByCategory>
}

/** Only categories that actually have registered blocks, in browse order. */
const sections = computed<CategorySection[]>(() =>
  CATEGORIES.map(category => ({ ...category, blocks: blocksByCategory(category.id) })).filter(
    section => section.blocks.length > 0,
  ),
)

/**
 * Hero stat figures (TASK-BV2-02) — every number DERIVED from the registry, per
 * the published-counts rule: blocks is the catalog length, categories is what
 * the page actually shows (non-empty groups), components is the distinct `Dz*`
 * names used across all blocks. Nothing here can drift from the catalog.
 */
const heroStats = computed(() => ({
  blocks: BLOCKS.length,
  categories: sections.value.length,
  components: new Set(BLOCKS.flatMap(block => block.components)).size,
}))

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
  if (typeof window === 'undefined')
    return
  requestAnimationFrame(() => {
    document.querySelector('.block-search')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    })
  })
}

/**
 * Suggested escape hatches for a dead-end filter (TASK-BV2-07): the catalog's
 * three most-used tags (frequency DERIVED from the registry) not already
 * active. Applying one REPLACES the failing filter set — adding to it would
 * keep the result empty under the AND semantics, which helps nobody.
 */
const suggestedTags = computed(() => {
  const freq = new Map<string, number>()
  for (const block of BLOCKS) {
    for (const tag of block.tags) freq.set(tag, (freq.get(tag) ?? 0) + 1)
  }
  return [...freq.entries()]
    .filter(([tag]) => !search.activeTags.value.includes(tag))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([tag]) => tag)
})

/** Swap the dead-end filters for one suggested tag (stays in results mode). */
function applySuggestedTag(tag: string): void {
  search.query.value = ''
  search.activeComponent.value = null
  search.activeTags.value = [tag]
}

/** Live, count-aware lede for the results section heading. */
const resultsLede = computed(() => {
  const n = results.value.length
  if (n === 0)
    return 'No blocks match your search and tag filters. Clear them to browse by category.'
  return `${n} ${n === 1 ? 'block' : 'blocks'} across all categories match your filters.`
})

/** Category id → decorative accent, so each cross-category card/preview keeps its group's hue. */
const accentByCategory = new Map(CATEGORIES.map(c => [c.id, c.accent] as const))

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
  if (typeof window === 'undefined')
    return fallback
  const hash = window.location.hash.slice(1)
  if (!hash)
    return fallback
  // Direct category deep link (#marketing).
  if (sections.value.some(s => s.id === hash))
    return hash
  // Legacy block deep link (#hero-centered) → open the block's category.
  const block = BLOCKS.find(b => b.id === hash)
  if (block && sections.value.some(s => s.id === block.category))
    return block.category
  return fallback
}

/** The currently shown category. */
const active = ref<string>(initialCategory())

/** The section object for the active category. */
const activeSection = computed<CategorySection | undefined>(() =>
  sections.value.find(s => s.id === active.value),
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

/**
 * Page-level ambient accent (TASK-BV2-01): the active category's hue, promoted
 * from chips/pills to atmosphere. Set as `--bv2-accent` on the page root so the
 * fixed `.bv2-atmosphere` washes AND the hero eyebrow inherit it; the `@property`
 * registration (unscoped style block below) makes the hue itself interpolable,
 * so switching categories cross-fades the room instead of snapping it. Results
 * mode mixes categories, so it settles back to the neutral brand primary.
 */
const atmosphereAccent = computed(() =>
  !isFiltering.value && activeSection.value
    ? `var(--dz-colors-${activeSection.value.accent}-500)`
    : 'var(--dz-primary)',
)

/** Index of the active category among the visible sections. */
const activeIndex = computed(() => sections.value.findIndex(s => s.id === active.value))

/** Adjacent groups for the pager (undefined at the ends). */
const prevSection = computed(() => sections.value[activeIndex.value - 1])
const nextSection = computed(() => sections.value[activeIndex.value + 1])

/**
 * Destination hue for each pager button (TASK-BV2-04): hovering "Next" previews
 * the color of the aisle you are about to enter. Exposed as `--pager-accent`
 * and consumed by the hover rules below.
 */
function pagerAccentStyle(section: CategorySection | undefined) {
  return section ? { '--pager-accent': `var(--dz-colors-${section.accent}-500)` } : undefined
}

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
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Switch to a category, recording the direction so the deck slides the right way. */
function goTo(id: string) {
  if (id === active.value)
    return
  const from = activeIndex.value
  const to = sections.value.findIndex(s => s.id === id)
  direction.value = to >= from ? 'fwd' : 'back'
  active.value = id
}

/**
 * After a user-initiated switch, pin the tab bar to the top of the viewport so
 * the new group reads from its heading, and move focus to the panel for AT.
 * The sticky stack above the panels is TopNav (64px) + the tab bar (~52px).
 */
function scrollToPanelTop() {
  if (typeof window === 'undefined')
    return
  const deck = document.getElementById('blocks-deck')
  if (!deck)
    return
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
  if (initialHash && BLOCKS.some(b => b.id === initialHash))
    forcedBlockIds.add(initialHash)
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
  if (typeof window === 'undefined')
    return
  forcedBlockIds.add(id)
  await nextTick()

  // One scroll is not enough. The previews ABOVE the target are still lazy
  // skeletons; as they scroll into range they mount and grow from skeleton
  // height to full block height, pushing the target down — which read as the
  // page "bouncing back to the top" after the jump. Re-assert the position
  // until the target's document offset stops moving.
  //
  // The correction pass writes `scrollTo` with an explicit offset rather than
  // `scrollIntoView({ behavior: 'smooth' })`: a smooth scroll is still
  // animating on the next frame, so comparing offsets mid-flight reads as
  // "settled" and we stop short of the target. One smooth glide to the first
  // estimate, then instant nudges as the layout above resolves.
  const smooth = !prefersReducedMotion()
  let lastTop = Number.NaN
  let stableFrames = 0
  let attempts = 0
  let firstPass = true

  // The final blocks in a category cannot reach the top of the viewport; without
  // clamping, `arrived` would never be true for them and the loop would spin to
  // its frame cap on every jump.
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

  // Hand control back the moment the reader scrolls themselves, so the
  // re-anchoring never fights a deliberate wheel/touch gesture.
  let cancelled = false
  const cancel = () => {
    cancelled = true
  }
  window.addEventListener('wheel', cancel, { once: true, passive: true })
  window.addEventListener('touchmove', cancel, { once: true, passive: true })
  window.addEventListener('keydown', cancel, { once: true })

  const done = () => {
    window.removeEventListener('wheel', cancel)
    window.removeEventListener('touchmove', cancel)
    window.removeEventListener('keydown', cancel)
  }

  const settle = () => {
    if (cancelled) {
      done()
      return
    }
    const el = document.getElementById(id)
    if (!el) {
      // Target not mounted yet — keep waiting for the forced mount to paint.
      if (attempts++ < MAX_SCROLL_SETTLE_FRAMES)
        requestAnimationFrame(settle)
      else done()
      return
    }
    const top = el.getBoundingClientRect().top + window.scrollY
    // Clear the sticky TopNav + category tab bar, matching the
    // `scroll-margin-top` the CSS applies for native `#id` jumps.
    const wanted = Math.max(0, Math.min(top - STICKY_HEADER_OFFSET, maxScroll()))

    // Settled means BOTH the layout above has stopped reflowing AND we have
    // actually arrived. Checking the offset alone ends the loop while the
    // opening smooth glide is still in flight, which left the block ~390px
    // below where it belongs.
    const arrived = Math.abs(window.scrollY - wanted) <= 1
    if (top === lastTop && arrived)
      stableFrames += 1
    else stableFrames = 0
    lastTop = top

    if (stableFrames < 2 && attempts++ < MAX_SCROLL_SETTLE_FRAMES) {
      // Only re-issue a scroll when we are not already there, so the smooth
      // glide is never interrupted by a same-target write each frame.
      if (!arrived) {
        window.scrollTo({ top: wanted, behavior: firstPass && smooth ? 'smooth' : 'auto' })
        firstPass = false
      }
      requestAnimationFrame(settle)
    }
    else {
      done()
    }
  }
  requestAnimationFrame(settle)
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
  const block = BLOCKS.find(b => b.id === blockId)
  if (!block)
    return
  // Keep the URL shareable/back-navigable exactly as the plain anchor did.
  if (typeof window !== 'undefined' && window.location.hash.slice(1) !== blockId)
    window.history.pushState(window.history.state, '', `#${blockId}`)
  if (block.category === active.value) {
    // Deck already showing this group — just scroll the preview into view.
    scrollToBlock(blockId)
  }
  else {
    // Switch decks first; the scroll waits for the enter transition (after-enter).
    pendingBlockId.value = blockId
    goTo(block.category)
  }
}

/** Handle a ⌘K palette selection: open the target block or category deck. */
function onPaletteNavigate(target: BlockNavTarget) {
  if (target.blockId)
    openBlock(target.blockId)
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
  if (!isMounted)
    return
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
    const block = hash ? BLOCKS.find(b => b.id === hash) : undefined
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
  <div class="blocks-page" :style="{ '--bv2-accent': atmosphereAccent }">
    <!-- Ambient atmosphere (TASK-BV2-01): two fixed accent washes lit by the
         active category. Purely decorative — z-index -1 inside the page's own
         isolated stacking context, so it paints above the shell background but
         under every piece of content, and never intercepts the pointer. -->
    <div class="bv2-atmosphere" aria-hidden="true" />

    <!-- Hero intro: the page's single H1. -->
    <Section heading-id="blocks-title">
      <div class="blocks-hero">
        <!-- Depth field (TASK-BV2-02): floating token-built block postcards on a
             pointer-parallax stage. Decoration only — aria-hidden, inert, mounts
             post-paint, and steps aside entirely on narrow viewports. -->
        <BlocksHeroField />

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

        <!-- Counted-up catalog truth (TASK-BV2-02): every figure derived from
             the registry (heroStats), rolling in-view via DzCountUp — which
             renders the final number immediately under reduced motion. -->
        <dl class="blocks-hero-stats" aria-label="Catalog size">
          <div class="blocks-hero-stat">
            <dt class="blocks-hero-stat-label">
              Blocks
            </dt>
            <dd class="blocks-hero-stat-value">
              <DzCountUp :value="heroStats.blocks" size="lg" aria-label="blocks in the catalog" />
            </dd>
          </div>
          <div class="blocks-hero-stat">
            <dt class="blocks-hero-stat-label">
              Categories
            </dt>
            <dd class="blocks-hero-stat-value">
              <DzCountUp :value="heroStats.categories" size="lg" aria-label="categories" />
            </dd>
          </div>
          <div class="blocks-hero-stat">
            <dt class="blocks-hero-stat-label">
              Components used
            </dt>
            <dd class="blocks-hero-stat-value">
              <DzCountUp
                :value="heroStats.components"
                size="lg"
                aria-label="distinct core components used"
              />
            </dd>
          </div>
        </dl>
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
            <!-- FLIP choreography (TASK-BV2-07): survivors glide to their new
                 grid slots, newcomers fade/scale in, leavers fade out. The
                 TransitionGroup owns entry here — v-reveal would double it. -->
            <TransitionGroup name="results-flip" tag="ul" class="block-grid block-grid--results">
              <li
                v-for="block in results"
                :key="block.id"
                :style="itemAccentStyle(block)"
              >
                <BlockCard
                  :block="block"
                  @select-component="showBlocksUsing"
                  @open-block="openBlock"
                />
              </li>
            </TransitionGroup>

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

          <!-- Dead end, designed (TASK-BV2-07): a ghost postcard stack, the one
               true clear path (the composable's clearAll — same code the search
               bar's Clear runs), and three derived popular tags as ramps back in. -->
          <div v-else class="blocks-empty">
            <div class="blocks-empty-art" aria-hidden="true">
              <span class="blocks-empty-card" />
              <span class="blocks-empty-card" />
              <span class="blocks-empty-card" />
            </div>
            <DzText tone="muted" class="blocks-empty-copy">
              Nothing on this shelf. Try one of the catalog's most-used tags, or
              clear the filters to browse by category.
            </DzText>
            <div class="blocks-empty-actions">
              <DzButton variant="outline" tone="neutral" @click="search.clearAll()">
                Clear filters
              </DzButton>
              <button
                v-for="tag in suggestedTags"
                :key="tag"
                type="button"
                class="blocks-empty-tag"
                :aria-label="`Show blocks tagged ${tag}`"
                @click="applySuggestedTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>
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
              v-magnetic="{ strength: 0.25, radius: 8 }"
              variant="outline"
              tone="neutral"
              :disabled="!prevSection"
              class="blocks-pager-btn"
              :style="pagerAccentStyle(prevSection)"
              @click="prevSection && goTo(prevSection.id)"
            >
              <template #prefix>
                <ChevronLeft :size="16" aria-hidden="true" />
              </template>
              <span class="blocks-pager-edge">Previous</span>
              <span class="blocks-pager-name">{{ prevSection?.label ?? 'Start' }}</span>
            </DzButton>

            <DzText size="sm" tone="muted" class="blocks-pager-count">
              <!-- The position ticks with a short roll (out-in, so the old digit
                   clears first); reduced motion collapses it to an instant swap. -->
              <Transition name="pager-count" mode="out-in">
                <span :key="activeIndex" class="blocks-pager-count-num">{{ activeIndex + 1 }}</span>
              </Transition>
              / {{ sections.length }}
            </DzText>

            <DzButton
              v-magnetic="{ strength: 0.25, radius: 8 }"
              variant="outline"
              tone="neutral"
              :disabled="!nextSection"
              class="blocks-pager-btn blocks-pager-btn--next"
              :style="pagerAccentStyle(nextSection)"
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

<style>
/* TASK-BV2-01 — register the ambient accent as a real <color> so the browser can
   interpolate it: switching categories then cross-fades the atmosphere's hue
   instead of snapping it. UNSCOPED on purpose: `@property` is a document-level
   registration (same precedent as App.vue's `::view-transition-*` block); the
   rule is harmless if this page never mounts. Browsers without @property simply
   snap the hue — behaviorally identical. */
@property --bv2-accent {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
</style>

<style scoped>
/* The page owns an isolated stacking context so `.bv2-atmosphere` (z-index -1)
   paints above `.landing-shell`'s opaque background (App.vue) yet below every
   child of the page — without isolation a negative z-index child would vanish
   behind the shell's background paint. */
.blocks-page {
  isolation: isolate;
  /* The hue itself is animated (via the @property registration above); every
     wash/tint reading `--bv2-accent` follows the interpolated value. */
  transition: --bv2-accent 600ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

/* Two large, whisper-quiet radial washes in the active category's hue: one high
   behind the hero, one at the trailing edge mid-page. Fixed so the room stays
   lit while scrolling; pointer-events none so it can never swallow a click. */
.bv2-atmosphere {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(
      52rem 36rem at 12% -6%,
      color-mix(in oklch, var(--bv2-accent, var(--dz-primary, #0766ee)) 9%, transparent),
      transparent 70%
    ),
    radial-gradient(
      44rem 32rem at 104% 44%,
      color-mix(in oklch, var(--bv2-accent, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 72%
    );
}

/* Dark rooms need dimmer lamps: the same washes at a lower mix so the accent
   reads as ambience, not a spotlight, on the dark background. */
:root[data-theme='dark'] .bv2-atmosphere {
  background:
    radial-gradient(
      52rem 36rem at 12% -6%,
      color-mix(in oklch, var(--bv2-accent, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 70%
    ),
    radial-gradient(
      44rem 32rem at 104% 44%,
      color-mix(in oklch, var(--bv2-accent, var(--dz-primary, #0766ee)) 4%, transparent),
      transparent 72%
    );
}

/* The eyebrow pill takes the room's tint too — same border/background recipe as
   the global `.lp-eyebrow`, with the ambient accent standing in for the primary,
   and the label mixed toward the foreground exactly like the chip/link treatment
   (BlockCard) so it stays legible in both themes. */
.blocks-hero .lp-eyebrow {
  border-color: color-mix(in oklch, var(--bv2-accent, var(--dz-primary, #0766ee)) 22%, transparent);
  background: color-mix(in oklch, var(--bv2-accent, var(--dz-primary, #0766ee)) 9%, transparent);
  color: color-mix(
    in oklch,
    var(--bv2-accent, var(--dz-primary, #0766ee)) 62%,
    var(--dz-foreground, #1b1d1f)
  );
}

@media (prefers-reduced-motion: reduce) {
  .blocks-page {
    transition: none;
  }
}

.blocks-hero {
  /* Anchors the BV2-02 depth field; the copy sits above it (z-index below). */
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

/* Everything except the depth field reads above it. */
.blocks-hero > :not(.bv2-hero-field) {
  position: relative;
  z-index: 1;
}

/* Derived catalog stats (TASK-BV2-02). */
.blocks-hero-stats {
  display: flex;
  align-items: stretch;
  gap: 0;
  margin: 10px 0 0;
}

.blocks-hero-stat {
  /* Number above its label; DOM order stays dt→dd for the definition list. */
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 2px;
  padding: 0 26px;
}

.blocks-hero-stat + .blocks-hero-stat {
  border-inline-start: 1px solid var(--lp-hairline);
}

.blocks-hero-stat-label {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}

.blocks-hero-stat-value {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 560px) {
  .blocks-hero-stat {
    padding: 0 14px;
  }
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
  /* TASK-BV2-04: the stage the page-turn happens on — perspective makes the
     panels' rotateY/translateZ read as depth instead of skew. */
  perspective: var(--dz-anim-depth-perspective, 1200px);
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
  color: var(--dz-muted-foreground, #585b60);
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

.blocks-pager-count-num {
  display: inline-block;
}

/* The position digit rolls: old slides up and out, new rises in (out-in). */
.pager-count-enter-active,
.pager-count-leave-active {
  transition:
    opacity 120ms var(--dz-ease-out, ease-out),
    transform 120ms var(--dz-ease-out, ease-out);
}

.pager-count-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.pager-count-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Hovering a pager button previews the DESTINATION aisle's hue (TASK-BV2-04):
   border and destination name tint toward `--pager-accent`, which the template
   sets per button from the adjacent section's accent. */
.blocks-pager-btn:not(:disabled):hover {
  border-color: color-mix(in oklch, var(--pager-accent, var(--dz-primary, #0766ee)) 55%, transparent);
}

.blocks-pager-btn:not(:disabled):hover .blocks-pager-name {
  color: color-mix(in oklch, var(--pager-accent, var(--dz-primary, #0766ee)) 62%, var(--dz-foreground, #1b1d1f));
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

/* ---- Results FLIP (TASK-BV2-07). Move/enter/leave are transform+opacity only.
   A leaving item goes absolute so it stops holding a grid cell and the
   survivors' move transitions can engage. */
.results-flip-move {
  transition: transform var(--dz-duration-slow, 320ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

.results-flip-enter-active {
  transition:
    opacity var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}

.results-flip-leave-active {
  position: absolute;
  transition: opacity var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.results-flip-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.results-flip-leave-to {
  opacity: 0;
}

/* ---- Empty state (TASK-BV2-07). */
.blocks-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
  padding: clamp(32px, 6vw, 64px) 24px;
}

/* Three ghost postcards fanned into a stack — the hero field's visual language
   at rest, in the neutral primary (results mix categories). */
.blocks-empty-art {
  position: relative;
  width: 132px;
  height: 96px;
}

.blocks-empty-card {
  position: absolute;
  inset: 0;
  border: 1px solid color-mix(in oklch, var(--dz-primary, #0766ee) 30%, var(--lp-hairline, #d5d7d9));
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 6%, var(--dz-surface, #ffffff));
}

.blocks-empty-card:nth-child(1) {
  transform: rotate(-7deg) translateX(-12px);
  opacity: 0.45;
}

.blocks-empty-card:nth-child(2) {
  transform: rotate(5deg) translateX(12px);
  opacity: 0.65;
}

.blocks-empty-card:nth-child(3) {
  box-shadow: var(--dz-shadow-sm, 0 2px 8px rgb(0 0 0 / 0.06));
}

.blocks-empty-copy {
  max-width: 44ch;
  margin: 0;
}

.blocks-empty-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.blocks-empty-tag {
  font-family: inherit;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  padding: 6px 14px;
  border: 0;
  border-radius: var(--dz-radius-full, 9999px);
  cursor: pointer;
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 12%, var(--dz-surface, #ffffff));
  color: color-mix(in oklch, var(--dz-primary, #0766ee) 62%, var(--dz-foreground, #1b1d1f));
  transition: background-color var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.blocks-empty-tag:hover {
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 20%, var(--dz-surface, #ffffff));
}

.blocks-empty-tag:focus-visible {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: 2px;
}

.block-previews {
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 5vw, 56px);
}

/* ---- Deck transition: a shallow 3D page-turn (TASK-BV2-04). ---------------
   mode="out-in" means no overlap, so plain transforms suffice. Forward (next
   group) turns the old panel out to the left and the new one in from the
   right — translateX carries the travel, a small rotateY + translateZ dip
   (under the deck's perspective) makes it read as a card turning over a
   surface rather than a flat slide; backward mirrors it. Transform-only, so
   the panel's layout box (and the skeleton height parity below it) is
   untouched. */
.deck-fwd-enter-active,
.deck-fwd-leave-active,
.deck-back-enter-active,
.deck-back-leave-active {
  transition:
    opacity var(--dz-duration-normal, 240ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    transform var(--dz-duration-slow, 320ms) var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
  will-change: opacity, transform;
}

/* The turn pivots near the edge the panel enters/leaves through. */
.deck-fwd-enter-active,
.deck-back-leave-active {
  transform-origin: 80% center;
}

.deck-back-enter-active,
.deck-fwd-leave-active {
  transform-origin: 20% center;
}

.deck-fwd-enter-from {
  opacity: 0;
  transform: translateX(48px) rotateY(-4deg) translateZ(-24px);
}
.deck-fwd-leave-to {
  opacity: 0;
  transform: translateX(-48px) rotateY(4deg) translateZ(-24px);
}
.deck-back-enter-from {
  opacity: 0;
  transform: translateX(-48px) rotateY(4deg) translateZ(-24px);
}
.deck-back-leave-to {
  opacity: 0;
  transform: translateX(48px) rotateY(-4deg) translateZ(-24px);
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

  .pager-count-enter-active,
  .pager-count-leave-active {
    transition-duration: 0.01ms;
  }

  .pager-count-enter-from,
  .pager-count-leave-to {
    transform: none;
  }

  .results-flip-move,
  .results-flip-enter-active,
  .results-flip-leave-active {
    transition-duration: 0.01ms;
  }

  .results-flip-enter-from {
    transform: none;
  }

  .blocks-empty-tag {
    transition: none;
  }
}
</style>
