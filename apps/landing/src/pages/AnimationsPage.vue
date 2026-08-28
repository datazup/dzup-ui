<script setup lang="ts">
import { DzButton, DzHeading, DzSearchInput, DzSwitch, DzText, DzVisuallyHidden } from '@dzup-ui/core'
import { ArrowLeft, ArrowRight, SearchX, Sparkles } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AnimationsFinale from '../components/animations/AnimationsFinale.vue'
import AnimationsHeroField from '../components/animations/AnimationsHeroField.vue'
import { LINKS } from '../config.ts'
import AnimationCard from '../gallery/AnimationCard.vue'
import { CATALOG, CATEGORIES, categoryAccentStyle } from '../gallery/catalog.ts'
import {
  DzAurora,
  DzCountUp,
  DzGradientText,
  DzOdometer,
  DzStagger,
  provideMotionPreference,
  useDocumentScrollProgress,
  vAnimateOnScroll,
  vAutoAnimate,
} from '../motion/index.ts'

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
  CATEGORIES.filter(cat => CATALOG.some(entry => entry.category === cat.id)),
)
const categoryChips = computed(() => [{ id: 'all', label: 'All' }, ...populatedCategories.value])

const CATEGORY_LABEL = new Map(CATEGORIES.map(c => [c.id, c.label]))

// Type chips, limited to the types present in the catalog.
const TYPE_LABELS: Record<string, string> = {
  directive: 'Directive',
  composable: 'Composable',
  component: 'Component',
  css: 'CSS',
}
const typeChips = computed(() => {
  const present = new Set(CATALOG.map(e => e.type))
  return [
    { id: 'all', label: 'All types' },
    ...(['directive', 'composable', 'component', 'css'] as const)
      .filter(t => present.has(t))
      .map(t => ({ id: t, label: TYPE_LABELS[t] })),
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

// Demos whose performance owns the pointer or measures its own geometry —
// their cards must NOT tilt (TASK-AV2-03): a tilting stage under a
// pointer-tracked effect sabotages the demo, and FLIP/View-Transition demos
// measure getBoundingClientRect, which a rotated ancestor skews. Audited from
// gallery/demos/ (2026-08-27; parallax-drift checked and NOT excluded — it is
// scroll-driven, not pointer-driven):
//   • pointer-tracked: spotlight-follow, tilt, glare, magnetic-button,
//     custom-cursor (DzCursor), lens (DzLens), dock (DzDock proximity);
//   • pointer-dragged: image-compare (role="slider" drag handle);
//   • hover-transform demos whose own motion an outer tilt/glare would muddy:
//     card-lift, sheen-sweep;
//   • measure-based morphs (FLIP / View Transitions under a transformed
//     ancestor): card-stack, dynamic-island, morphing-dialog.
// Keyed by id so the intent lives here, beside WIDE — the card stays
// effect-agnostic and learns it via the `interactive-stage` prop.
const POINTER_DRIVEN = new Set([
  'spotlight-follow',
  'tilt',
  'glare',
  'magnetic-button',
  'custom-cursor',
  'lens',
  'dock',
  'image-compare',
  'card-lift',
  'sheen-sweep',
  'card-stack',
  'dynamic-island',
  'morphing-dialog',
])

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
    if (activeCategory.value !== 'all' && entry.category !== activeCategory.value)
      return false
    if (activeType.value !== 'all' && entry.type !== activeType.value)
      return false
    if (!q)
      return true
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

// ── Scroll entrance (docs/animations-v2.md TASK-AV2-05) ───────────────────
// One entrance owner per lifecycle: v-animate-on-scroll owns FIRST appearance
// (cards rise as they scroll into view), AutoAnimate/TransitionGroup own
// filter-time add/remove/move. The directive is fail-open by design — content
// is visible before the observer fires and reveals at once with no IO — so a
// card can never be stranded hidden. To keep the owners from double-firing,
// only the INITIAL cohort (the ids present at setup) carries an entrance;
// cards that join later through filtering enter via AutoAnimate alone. The
// page toggle needs no `updated` handling: flipping it swaps the bento to the
// TransitionGroup branch, remounting every card with the empty entrance.
const initialCohort = new Set(filtered.value.map(entry => entry.id))

function entranceFor(id: string): { enterClass?: string } {
  const on = initialCohort.has(id) && !reduceMotion.value
  // An empty enterClass turns the directive into a no-op (nothing is added on
  // intersect) — the card simply appears, exactly like today.
  return on ? {} : { enterClass: '' }
}

// ── Empty-state rescue (TASK-AV2-05) ──────────────────────────────────────
// The three most-populated categories (derived — never hand-picked; ties break
// by CATEGORIES order because .sort() is stable), excluding the active one —
// each suggestion is guaranteed ≥1 result by construction.
const emptySuggestions = computed(() => {
  const counts = new Map<string, number>()
  for (const entry of CATALOG)
    counts.set(entry.category, (counts.get(entry.category) ?? 0) + 1)
  return CATEGORIES
    .filter(cat => cat.id !== activeCategory.value && (counts.get(cat.id) ?? 0) > 0)
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
    .slice(0, 3)
})

// A suggestion goes through the same activeCategory ref as the toolbar chips,
// so the hash contract and the atmosphere follow for free.
function applySuggestion(id: string): void {
  query.value = ''
  activeType.value = 'all'
  activeCategory.value = id
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
  if (initial && populatedCategories.value.some(c => c.id === initial)) {
    activeCategory.value = initial
  }
}

watch(activeCategory, (id) => {
  if (typeof window === 'undefined')
    return
  const hash = id === 'all' ? '' : `#${id}`
  window.history.replaceState(
    window.history.state,
    '',
    `${window.location.pathname}${window.location.search}${hash}`,
  )
})

// ── Hero stats (docs/animations-v2.md TASK-AV2-02) ────────────────────────
// Counted-up gallery truth: every figure derived from the catalog at setup —
// never hand-typed (repo rule; `build-counts.ts` and `claims.spec.ts` police
// the same numbers elsewhere).
const heroStats = {
  effects: CATALOG.length,
  categories: CATEGORIES.length,
  native: CATALOG.filter(entry => entry.native).length,
}

// ── Ambient atmosphere (docs/animations-v2.md TASK-AV2-01) ────────────────
// The active category's accent pair, promoted from chip/card tint to page
// atmosphere. Set as `--av2-accent`/`--av2-accent-2` on the page root so the
// fixed `.av2-atmosphere` washes AND the hero eyebrow inherit it; the
// `@property` registrations (unscoped style block below) make both hues
// interpolable, so switching categories cross-fades the house lights instead of
// snapping them. 'all' mixes categories, so it settles to the neutral brand
// pair. Same recipe as /blocks (`--bv2-accent`) and /templates (`--tv2-accent`)
// with its own property names — three atmosphere pages can share one SPA
// session and must not fight over a single registration.
const atmosphereStyle = computed<Record<string, string>>(() => {
  if (activeCategory.value === 'all') {
    return {
      '--av2-accent': 'var(--dz-primary)',
      '--av2-accent-2': 'var(--lp-brand-2, var(--dz-primary))',
    }
  }
  const accents = categoryAccentStyle(activeCategory.value)
  return {
    '--av2-accent': accents['--accent']!,
    '--av2-accent-2': accents['--accent-2']!,
  }
})

// ── Control booth (docs/animations-v2.md TASK-AV2-04) ─────────────────────
// Stuck-state detection for the sticky toolbar: a 1px sentinel above it leaves
// the viewport (accounting for the 64px sticky offset) exactly when the
// toolbar pins — no scroll listener. The elevated look is class-driven CSS.
const stickySentinel = ref<HTMLElement | null>(null)
const toolbarStuck = ref(false)
let stuckObserver: IntersectionObserver | null = null

// Reading progress for the toolbar's bottom hairline. Scroll-linked position
// is user-driven, not animation (the module's "static-jump" convention — see
// ScrollProgressBar.vue), so it persists under reduced motion like the home
// page's reading bar does.
const scrollProgress = useDocumentScrollProgress()
const progressStyle = computed(() => ({ transform: `scaleX(${scrollProgress.value})` }))

// The card a permalink resolved to — pulsed briefly so the reader can spot it.
const highlightedId = ref<string | null>(null)
let highlightTimer: number | null = null

// Resolve `#effect-<id>` to a card: relax any active filter that would hide it
// (so a shared link always lands on a visible card), then scroll it into view
// and trigger the highlight pulse.
function focusEffectFromHash(): void {
  if (typeof window === 'undefined')
    return
  const hash = window.location.hash.slice(1)
  if (!hash.startsWith(EFFECT_HASH_PREFIX))
    return
  const id = hash.slice(EFFECT_HASH_PREFIX.length)
  const entry = CATALOG.find(e => e.id === id)
  if (!entry)
    return

  if (!filtered.value.some(e => e.id === id)) {
    query.value = ''
    activeType.value = 'all'
    if (entry.category !== activeCategory.value)
      activeCategory.value = 'all'
  }

  nextTick(() => {
    const el = document.getElementById(`effect-${id}`)
    if (!el)
      return
    const reduce
      = reduceMotion.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
    highlightedId.value = id
    if (highlightTimer)
      window.clearTimeout(highlightTimer)
    highlightTimer = window.setTimeout(() => (highlightedId.value = null), 2200)
  })
}

onMounted(() => {
  focusEffectFromHash()
  window.addEventListener('hashchange', focusEffectFromHash)

  // Toolbar stuck-state observer (TASK-AV2-04). SSR-safe, disconnected below.
  if (typeof IntersectionObserver !== 'undefined' && stickySentinel.value) {
    stuckObserver = new IntersectionObserver(
      ([entry]) => {
        toolbarStuck.value = entry ? !entry.isIntersecting : false
      },
      // The toolbar pins at top: 64px — shrink the root's top edge by the same
      // amount so the sentinel "leaves" exactly when the toolbar touches down.
      { rootMargin: '-64px 0px 0px 0px' },
    )
    stuckObserver.observe(stickySentinel.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', focusEffectFromHash)
  if (highlightTimer)
    window.clearTimeout(highlightTimer)
  stuckObserver?.disconnect()
  stuckObserver = null
})
</script>

<template>
  <div class="anim-page" :style="atmosphereStyle">
    <!-- House lights (TASK-AV2-01): two fixed accent washes lit by the active
         category, running the full scroll height (unlike the aurora, which is
         deliberately masked out below the hero). Purely decorative — z-index -1
         inside the page's own isolated stacking context, so it paints above the
         shell background but under everything else, and never takes a click. -->
    <div class="av2-atmosphere" aria-hidden="true" />

    <!-- Ambient dreamlike backdrop: drifting aurora + grain, fading downward so
         the cards below sit on a calm surface. Purely decorative. -->
    <div class="anim-bg" aria-hidden="true">
      <DzAurora />
      <div class="lp-grain-layer" />
    </div>

    <!-- Overture (TASK-AV2-02): live mini-performances floating on a parallax
         depth field beside the hero. Decoration only — aria-hidden + inert,
         mounts post-paint, steps aside on narrow viewports, never takes a
         click. Zero image bytes: the "imagery" is the product performing. -->
    <AnimationsHeroField />

    <!-- Hero -->
    <header class="hero" aria-labelledby="animations-title">
      <span class="lp-eyebrow">
        <Sparkles :size="13" aria-hidden="true" />
        Ecosystem · Animations
      </span>
      <!-- The heading dogfoods the gallery: a one-time word cascade
           (DzStagger — instant under reduced motion) and the ANIMATED gradient
           sweep in place of the static lp-gradient-text. Same visible string,
           same id/level — the accessible tree is unchanged. -->
      <DzHeading id="animations-title" :level="1" size="3xl" weight="semibold" class="hero-title lp-balance">
        <DzStagger as="span" :step="90" class="hero-title-stagger">
          <span>Motion,</span>{{ ' ' }}<span>ready</span>{{ ' ' }}<span>to</span>{{ ' ' }}<DzGradientText>drop in</DzGradientText>
        </DzStagger>
      </DzHeading>
      <DzText size="lg" tone="muted" as="p" class="hero-lede lp-balance">
        Scroll reveals, text and number transitions, hover micro-interactions, ambient backgrounds and
        tactile feedback — each built from the same @dzup-ui/core components and design tokens, and each
        honouring prefers-reduced-motion out of the box.
      </DzText>

      <!-- Counted-up gallery truth (TASK-AV2-02): every figure derived from the
           catalog (heroStats), rolling in-view via DzCountUp — which renders
           the final number immediately under reduced motion. -->
      <dl class="hero-stats" aria-label="Gallery size">
        <div class="hero-stat">
          <dt class="hero-stat-label">
            Effects
          </dt>
          <dd class="hero-stat-value">
            <DzCountUp :value="heroStats.effects" size="lg" aria-label="live effects in the gallery" />
          </dd>
        </div>
        <div class="hero-stat">
          <dt class="hero-stat-label">
            Categories
          </dt>
          <dd class="hero-stat-value">
            <DzCountUp :value="heroStats.categories" size="lg" aria-label="categories" />
          </dd>
        </div>
        <div class="hero-stat">
          <dt class="hero-stat-label">
            Native-API upgrades
          </dt>
          <dd class="hero-stat-value">
            <DzCountUp
              :value="heroStats.native"
              size="lg"
              aria-label="effects that upgrade to a native platform API"
            />
          </dd>
        </div>
      </dl>

      <div class="hero-actions">
        <DzButton variant="solid" tone="primary" as="a" :href="LINKS.components">
          Browse components
          <template #suffix>
            <ArrowRight :size="16" aria-hidden="true" />
          </template>
        </DzButton>
        <DzButton variant="outline" tone="neutral" to="/">
          <template #prefix>
            <ArrowLeft :size="16" aria-hidden="true" />
          </template>
          Back to home
        </DzButton>
      </div>
    </header>

    <!-- Sentinel for the toolbar's stuck-state observer (TASK-AV2-04): a 1px
         marker that exits the (offset-shrunk) viewport exactly when the sticky
         toolbar pins. -->
    <div ref="stickySentinel" class="toolbar-sentinel" aria-hidden="true" />

    <!-- Frosted sticky filter toolbar -->
    <div class="toolbar" :class="{ 'is-stuck': toolbarStuck, 'is-still': reduceMotion }">
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
          <Transition name="av2-fade">
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
          </Transition>
          <DzText size="sm" tone="muted" as="span" class="result-count" aria-live="polite">
            <!-- SR text stays plain (live regions announce text, not
                 aria-labels); the rolling digits are the visual layer only
                 (TASK-AV2-04 — same recipe as /templates). -->
            <DzVisuallyHidden>{{ resultLabel }}</DzVisuallyHidden>
            <span aria-hidden="true" class="result-count-visual">
              <DzOdometer :value="filtered.length" size="sm" :duration="700" />
              {{ filtered.length === 1 ? 'animation' : 'animations' }}
            </span>
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

      <!-- Reading-progress hairline (TASK-AV2-04): the page's 0→1 scroll
           progress as a scaleX bar along the toolbar's bottom edge, in the
           atmosphere accent. Scroll-linked = user-driven, so it stays under
           reduced motion (the ScrollProgressBar convention). -->
      <div class="toolbar-progress" aria-hidden="true" :style="progressStyle" />
    </div>

    <!-- Bento gallery -->
    <div class="gallery">
      <!-- Native path: AutoAnimate owns add/remove/move on filter changes. -->
      <div
        v-if="filtered.length && useAutoAnimateBento"
        v-auto-animate
        class="bento"
      >
        <!-- Scroll entrance (TASK-AV2-05): fail-open fade-rise as each card
             first enters the viewport, initial cohort only — filter-time
             changes stay AutoAnimate's. The capped delay mirrors the bento's
             own enter stagger. -->
        <AnimationCard
          v-for="(entry, i) in filtered"
          :key="entry.id"
          v-animate-on-scroll="entranceFor(entry.id)"
          :entry="entry"
          :size="sizeFor(entry.id)"
          :highlighted="entry.id === highlightedId"
          :interactive-stage="POINTER_DRIVEN.has(entry.id)"
          class="bento-item"
          :class="`span-${sizeFor(entry.id)}`"
          :style="{ 'animation-delay': `${Math.min(i, 14) * 38}ms` }"
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
          :interactive-stage="POINTER_DRIVEN.has(entry.id)"
          class="bento-item"
          :class="`span-${sizeFor(entry.id)}`"
          :style="{ '--enter-i': i }"
        />
      </TransitionGroup>

      <!-- Empty state — with a derived rescue row (TASK-AV2-05): the three
           most-populated categories as one-tap suggestions, each in its own
           accent, guaranteed non-empty by construction. -->
      <Transition v-else name="av2-empty" appear>
        <div class="empty" :class="{ 'is-still': reduceMotion }">
          <div class="empty-icon" aria-hidden="true">
            <SearchX :size="28" />
          </div>
          <DzText weight="semibold" as="p" class="empty-title">
            No animations match those filters
          </DzText>
          <DzText size="sm" tone="muted" as="p">
            Try a different category, type, or search term.
          </DzText>
          <div class="empty-suggestions" role="group" aria-label="Suggested categories">
            <button
              v-for="cat in emptySuggestions"
              :key="cat.id"
              type="button"
              class="chip"
              :style="categoryAccentStyle(cat.id)"
              @click="applySuggestion(cat.id)"
            >
              {{ cat.label }}
            </button>
          </div>
          <DzButton variant="outline" tone="neutral" size="sm" @click="clearFilters">
            Clear filters
          </DzButton>
        </div>
      </Transition>
    </div>

    <!-- Curtain call (TASK-AV2-06): the closing CTA band — the architecture
         drawn live by the gallery's own beam/orbit primitives, truthful
         derived copy, and two next actions. -->
    <AnimationsFinale />
  </div>
</template>

<style>
/* TASK-AV2-01 — register the ambient accent pair as real <color>s so the
   browser can interpolate them: switching categories then cross-fades the
   atmosphere's hues instead of snapping. UNSCOPED on purpose: `@property` is a
   document-level registration (same precedent as BlocksIndexPage's
   `--bv2-accent` and TemplatesPage's `--tv2-accent`); the rules are harmless if
   this page never mounts. Browsers without @property simply snap the hue —
   behaviorally identical. */
@property --av2-accent {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}

@property --av2-accent-2 {
  syntax: '<color>';
  inherits: true;
  initial-value: transparent;
}
</style>

<style scoped>
/* The page owns an isolated stacking context so `.av2-atmosphere` (z-index -1)
   paints above the shell's opaque background yet below every child of the page
   — without isolation a negative z-index child vanishes behind the shell's
   background paint (the exact trap BV2-01 hit). */
.anim-page {
  position: relative;
  isolation: isolate;
  padding-bottom: clamp(48px, 8vw, 96px);
  overflow-x: clip;
  /* The hues themselves are animated (via the @property registrations above);
     every wash/tint reading --av2-accent* follows the interpolated values. */
  transition:
    --av2-accent 600ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1)),
    --av2-accent-2 600ms var(--dz-ease-out, cubic-bezier(0.22, 1, 0.36, 1));
}

/* Two large, whisper-quiet radial washes in the active category's accent pair:
   one high near the hero, one at the trailing edge mid-scroll. Fixed so the
   house stays lit across the ~82-card scroll (the aurora is masked out by
   880px on purpose — this layer is the light below the fold). */
.av2-atmosphere {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(
      52rem 36rem at 10% -4%,
      color-mix(in oklch, var(--av2-accent, var(--dz-primary, #0766ee)) 9%, transparent),
      transparent 70%
    ),
    radial-gradient(
      46rem 34rem at 104% 52%,
      color-mix(in oklch, var(--av2-accent-2, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 72%
    );
}

/* Dark rooms need dimmer lamps: the same washes at a lower mix so the accent
   reads as ambience, not a spotlight, on the dark background. */
:root[data-theme='dark'] .av2-atmosphere {
  background:
    radial-gradient(
      52rem 36rem at 10% -4%,
      color-mix(in oklch, var(--av2-accent, var(--dz-primary, #0766ee)) 6%, transparent),
      transparent 70%
    ),
    radial-gradient(
      46rem 34rem at 104% 52%,
      color-mix(in oklch, var(--av2-accent-2, var(--dz-primary, #0766ee)) 4%, transparent),
      transparent 72%
    );
}

/* The hero eyebrow takes the room's tint too — the ambient accent standing in
   for the primary, mixed toward the foreground so it stays legible in both
   themes (same recipe as the /templates eyebrow). */
.anim-page .lp-eyebrow {
  border-color: color-mix(in oklch, var(--av2-accent, var(--dz-primary, #0766ee)) 22%, transparent);
  background: color-mix(in oklch, var(--av2-accent, var(--dz-primary, #0766ee)) 9%, transparent);
  color: color-mix(
    in oklch,
    var(--av2-accent, var(--dz-primary, #0766ee)) 62%,
    var(--dz-foreground, #1b1d1f)
  );
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

/* Word-cascade wrapper: inline so the heading keeps its natural line breaks. */
.hero-title-stagger {
  display: inline;
}

/* Derived gallery stats (TASK-AV2-02) — number above its label; DOM order
   stays dt→dd for the definition list (same recipe as /templates). */
.hero-stats {
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 0;
  margin: 6px 0 0;
}

.hero-stat {
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 2px;
  padding: 0 24px;
}

.hero-stat + .hero-stat {
  border-inline-start: 1px solid var(--lp-hairline);
}

.hero-stat-label {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dz-muted-foreground, #585b60);
}

.hero-stat-value {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

/* ── Frosted sticky toolbar ── */
.toolbar-sentinel {
  height: 1px;
  margin-top: -1px;
}

.toolbar {
  position: sticky;
  top: 64px;
  z-index: 40;
  margin-top: 8px;
  background: color-mix(in oklch, var(--dz-background, #e7e8e9) 72%, transparent);
  backdrop-filter: blur(16px) saturate(1.2);
  border-top: 1px solid var(--lp-hairline);
  border-bottom: 1px solid var(--lp-hairline);
  transition:
    box-shadow var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    background var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}

/* Pinned mid-scroll: the booth visibly lifts off the page (TASK-AV2-04). */
.toolbar.is-stuck {
  background: color-mix(in oklch, var(--dz-background, #e7e8e9) 86%, transparent);
  box-shadow: 0 10px 28px -18px color-mix(in oklch, var(--dz-foreground, #1b1d1f) 45%, transparent);
}

/* Reading-progress hairline in the atmosphere accent (TASK-AV2-04). No
   transition — it tracks scroll position directly (static-jump convention). */
.toolbar-progress {
  position: absolute;
  inset-block-end: -1px;
  inset-inline: 0;
  height: 2px;
  pointer-events: none;
  transform-origin: 0 50%;
  background: linear-gradient(
    90deg,
    var(--av2-accent, var(--dz-primary, #0766ee)),
    var(--av2-accent-2, var(--dz-primary, #0766ee))
  );
}

/* Clear button + result count ease in/out instead of popping (TASK-AV2-04). */
.av2-fade-enter-active,
.av2-fade-leave-active {
  transition:
    opacity var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out),
    transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.av2-fade-enter-from,
.av2-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.result-count-visual {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
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

/* Pill filter chips — quiet by default, brand-filled when active. The press
   spring + one-shot activation pulse are TASK-AV2-04; both are stilled by the
   toolbar's `.is-still` (page toggle) and the reduced-motion media block. */
.chip {
  position: relative;
  appearance: none;
  padding: 6px 14px;
  border-radius: var(--dz-radius-full, 9999px);
  border: 1px solid var(--lp-hairline);
  background: color-mix(in oklch, var(--dz-surface, #ffffff) 60%, transparent);
  color: var(--dz-muted-foreground, #585b60);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  cursor: pointer;
  transition:
    color var(--dz-duration-fast, 150ms),
    border-color var(--dz-duration-fast, 150ms),
    background var(--dz-duration-fast, 150ms),
    box-shadow var(--dz-duration-fast, 150ms),
    transform var(--dz-duration-fast, 150ms) var(--dz-ease-out, ease-out);
}

.chip:active {
  transform: scale(0.94);
}

/* One-shot accent ring pulse the moment a chip becomes active — in the chip's
   OWN category accent (the inline `--accent` chipAccent() already sets). */
.chip.is-active::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  pointer-events: none;
  border: 2px solid color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 65%, transparent);
  opacity: 0;
  animation: av2-chip-pulse 600ms var(--dz-ease-out, ease-out) 1;
}

@keyframes av2-chip-pulse {
  0% {
    opacity: 1;
    transform: scale(0.92);
  }
  100% {
    opacity: 0;
    transform: scale(1.12);
  }
}

.chip--type {
  font-size: var(--dz-text-xs, 0.75rem);
  padding: 5px 12px;
}

.chip:hover {
  color: var(--dz-foreground, #1b1d1f);
  border-color: color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 45%, var(--lp-hairline));
}

/* Active chip fills with its category accent. Use the -600 (strong) shade so
 * white text clears WCAG AA on the lighter hues (orange, cyan, …); falls back to
 * the brand primary for the "All" chip and the type row. */
.chip.is-active {
  color: var(--dz-primary-foreground, #ffffff);
  background: var(--accent-strong, var(--dz-primary, #0766ee));
  border-color: transparent;
  box-shadow: 0 6px 16px -8px color-mix(in oklch, var(--accent, var(--dz-primary, #0766ee)) 70%, transparent);
}

.chip:focus-visible {
  outline: 2px solid var(--accent, var(--dz-ring, #0766ee));
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
  color: var(--dz-primary, #0766ee);
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #0766ee) 22%, transparent);
}

.empty-title {
  font-size: var(--dz-text-lg, 1.125rem);
}

.empty-suggestions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 2px;
}

/* Gentle scale-fade for the empty state (TASK-AV2-05); instant when either
   reduce gate is on. */
.av2-empty-enter-active {
  transition:
    opacity var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out),
    transform var(--dz-duration-normal, 240ms) var(--dz-ease-out, ease-out);
}

.av2-empty-enter-from {
  opacity: 0;
  transform: scale(0.97);
}

.empty.is-still.av2-empty-enter-active {
  transition: none;
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

/* Page-level "Reduce motion" toggle → still toolbar micro-interactions. */
.toolbar.is-still .chip,
.toolbar.is-still .chip:active {
  transform: none;
}

.toolbar.is-still .chip.is-active::after {
  animation: none;
}

.toolbar.is-still .av2-fade-enter-active,
.toolbar.is-still .av2-fade-leave-active {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  /* The atmosphere hue snap: a colour fade is harmless, but the sibling pages
     drop it too — consistency over cleverness. */
  .anim-page {
    transition: none;
  }

  .chip,
  .chip:active {
    transform: none;
  }

  .chip.is-active::after {
    animation: none;
  }

  .av2-fade-enter-active,
  .av2-fade-leave-active,
  .av2-empty-enter-active {
    transition: none;
  }

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
