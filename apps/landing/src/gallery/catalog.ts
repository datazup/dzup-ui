/**
 * Animation catalog — the metadata model that drives the `/animations` gallery
 * (docs/animations.md §4.3–4.4, §6).
 *
 * Every effect is one {@link CatalogEntry}: the copy shown on its card, the list
 * of `@dzup-ui/core` components it pairs with, a copy-pasteable usage snippet,
 * and a live `demo` component the harness mounts in the preview stage. The
 * harness ({@link AnimationCard}) is effect-agnostic — adding an effect means
 * adding an entry here (and its demo component), never touching the card.
 *
 * Seeded with two end-to-end demos (one directive, one component) to prove the
 * harness. Tasks 3–9 fill in the remaining ~30 effects across all categories.
 */
import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'

/** How an effect is consumed — surfaced as the "type" chip on each card. */
export type CatalogType = 'directive' | 'composable' | 'component' | 'css'

/** A gallery category: an anchor `id` and the human label shown in the nav. */
export interface CatalogCategory {
  /** Stable slug used for the section anchor (`/animations#scroll`). */
  id: string
  /** Display label for the sticky nav chip and section heading. */
  label: string
}

/** One animation effect's metadata + its live demo component. */
export interface CatalogEntry {
  /** Unique, URL-safe id (also the demo's `:key` seed). */
  id: string
  /** Effect name shown as the card title. */
  title: string
  /** Category id this effect belongs to (matches a {@link CatalogCategory}). */
  category: string
  /** How the effect is consumed; drives the "type" badge. */
  type: CatalogType
  /** One-line description of what the effect does. */
  blurb: string
  /** `@dzup-ui/core` components the effect pairs with (rendered as chips). */
  components: string[]
  /**
   * Copy-pasteable usage snippet revealed by "View code". The single-snippet
   * floor: every entry has one, and it is what the card shows when {@link
   * CatalogEntry.variants} is absent (the v1 path, unchanged).
   */
  code: string
  /**
   * Optional variant matrix (docs/animations.md §3.2, §5 model note) — the same
   * effect expressed in more than one consumption style so a consumer can pick
   * the one that fits their codebase: a single-file component (`sfc`), a
   * composable (`composable`), and/or a CSS/utility-class form (`css`). When
   * present the card renders these as keyboard-accessible tabs with a per-tab
   * Copy; when absent it falls back to the single {@link CatalogEntry.code}
   * block. All sub-fields are optional — an entry may offer any subset (Task N10).
   */
  variants?: { sfc?: string, composable?: string, css?: string }
  /**
   * Optional native-API badge (docs/animations.md §5 model note) — names the
   * platform API an effect upgrades to where supported (e.g. "View Transitions"),
   * with a short note on the fallback. Surfaced by the card as a "native" chip
   * (Task N10); absent on effects with no native-API path.
   */
  native?: { api: string, supports: string }
  /** Live, replayable demo mounted in the card's preview stage. */
  demo: Component
}

/**
 * The nine gallery categories, in display order (docs/animations.md §6).
 * The page renders a section per category that has at least one entry.
 */
export const CATEGORIES: CatalogCategory[] = [
  { id: 'scroll', label: 'Scroll' },
  { id: 'text', label: 'Text' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'backgrounds', label: 'Backgrounds' },
  { id: 'hover', label: 'Hover' },
  { id: 'lists', label: 'Lists' },
  { id: 'attention', label: 'Attention' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'transitions', label: 'Transitions' },
  { id: 'connections', label: 'Connections' },
  { id: 'surfaces', label: 'Surfaces' },
]

/**
 * Per-category accent hues, drawn from the decorative spectrum in
 * `@dzup-ui/tokens` (`--dz-colors-{name}-{shade}`, exposed by the recent palette
 * work). These give each category a recognisable colour signature across the
 * gallery — the card preview-stage tint + hover glow, and the active filter chip
 * — instead of every tile reading in the same brand indigo.
 *
 * Purely decorative: each entry is a `[primary, secondary]` palette pair whose
 * hues sit a short hop apart on the OKLCH wheel so the two-tone stage wash stays
 * harmonious. The primaries are chosen to span the wheel (warm → cool) and to
 * keep enough lightness contrast at shade 600 for white chip text. Categories
 * not listed fall back to the brand `primary`/`secondary` pair.
 */
export const CATEGORY_ACCENTS: Record<string, readonly [string, string]> = {
  scroll: ['indigo', 'violet'],
  text: ['violet', 'fuchsia'],
  numbers: ['emerald', 'teal'],
  backgrounds: ['fuchsia', 'purple'],
  hover: ['cyan', 'sky'],
  lists: ['orange', 'amber'],
  attention: ['rose', 'pink'],
  feedback: ['teal', 'emerald'],
  transitions: ['blue', 'sky'],
  connections: ['cyan', 'blue'],
  surfaces: ['purple', 'fuchsia'],
}

/**
 * CSS custom properties for a category's accent, ready to spread onto a host's
 * inline `style`. Cards and chips reference `var(--accent*)` (each falling back
 * to the brand primary) so the colour signature threads through without any hue
 * being hard-coded per card.
 */
export function categoryAccentStyle(category: string): Record<string, string> {
  const [primary, secondary] = CATEGORY_ACCENTS[category] ?? ['primary', 'secondary']
  return {
    '--accent': `var(--dz-colors-${primary}-500)`,
    '--accent-strong': `var(--dz-colors-${primary}-600)`,
    '--accent-soft': `var(--dz-colors-${primary}-400)`,
    '--accent-2': `var(--dz-colors-${secondary}-500)`,
  }
}

/**
 * The catalog. Demos are async-imported so each effect is its own chunk
 * (perf budget, docs/animations.md §7 — lazy-init below-the-fold demos).
 */
export const CATALOG: CatalogEntry[] = [
  {
    id: 'fade-rise',
    title: 'Fade & rise',
    category: 'scroll',
    type: 'directive',
    blurb: 'Content fades in and lifts gently into place as it scrolls into view.',
    components: ['DzCard', 'DzText'],
    code: `<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { vReveal } from '../motion'
</script>

<template>
  <DzCard v-reveal variant="elevated" padding="lg">
    <DzText weight="semibold">Fade & rise</DzText>
    <DzText size="sm" tone="muted">Opacity 0 → 1, lifts into place.</DzText>
  </DzCard>
</template>`,
    // Three ways to reach the same reveal — directive, composable, or the raw
    // scroll-driven utility — so a consumer copies whichever fits their setup.
    variants: {
      sfc: `<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { vReveal } from '../motion'
</script>

<template>
  <!-- The v-reveal directive owns the IntersectionObserver + reduced-motion guard. -->
  <DzCard v-reveal variant="elevated" padding="lg">
    <DzText weight="semibold">Fade & rise</DzText>
    <DzText size="sm" tone="muted">Opacity 0 → 1, lifts into place.</DzText>
  </DzCard>
</template>`,
      composable: `<script setup lang="ts">
import { computed, ref } from 'vue'
import { DzCard, DzText } from '@dzup-ui/core'
import { useInView, useReducedMotion } from '../motion'

const root = ref<HTMLElement | null>(null)
const inView = useInView(root, { once: true })
const reduced = useReducedMotion()
// Drive the entrance from state — fully visible when reduced or once seen.
const shown = computed(() => reduced.value || inView.value)
</script>

<template>
  <DzCard
    ref="root"
    variant="elevated"
    padding="lg"
    :style="{
      opacity: shown ? 1 : 0,
      transform: shown ? 'none' : 'translateY(16px)',
      transition: 'opacity .5s var(--dz-ease-out), transform .5s var(--dz-ease-out)',
    }"
  >
    <DzText weight="semibold">Fade & rise</DzText>
  </DzCard>
</template>`,
      css: `<template>
  <!-- The .dz-animate-in utility runs the reveal on the compositor via
       animation-timeline: view() where supported; static (visible) otherwise. -->
  <div class="dz-animate-in dz-animate-in--rise">
    <slot />
  </div>
</template>

<style>
/* tokens.css ships .dz-animate-in; this is the gist of what it expands to. */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .dz-animate-in--rise {
      animation: dz-rise linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }
    @keyframes dz-rise {
      from { opacity: 0; transform: translateY(16px); }
    }
  }
}
</style>`,
    },
    demo: defineAsyncComponent(() => import('./demos/FadeRiseDemo.vue')),
  },
  {
    id: 'stagger-children',
    title: 'Stagger children',
    category: 'scroll',
    type: 'component',
    blurb: 'Cascades a grid or list of children into view with a per-index delay.',
    components: ['DzCard', 'DzText'],
    code: `<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { DzStagger } from '../motion'
</script>

<template>
  <DzStagger class="grid">
    <DzCard v-for="c in cells" :key="c.title" variant="outlined" padding="md">
      <DzText weight="semibold" size="sm">{{ c.title }}</DzText>
    </DzCard>
  </DzStagger>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/StaggerChildrenDemo.vue')),
  },
  {
    id: 'directional-slide',
    title: 'Directional slide-in',
    category: 'scroll',
    type: 'directive',
    blurb: 'Enters from the left, right, up or down — pair with feature rows.',
    components: ['DzCard', 'DzText'],
    code: `<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { vReveal } from '../motion'
</script>

<template>
  <DzCard v-reveal.left variant="outlined" padding="md">
    <DzText size="sm">Enters from the left</DzText>
  </DzCard>
  <DzCard v-reveal.right variant="outlined" padding="md">
    <DzText size="sm">Enters from the right</DzText>
  </DzCard>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/DirectionalSlideDemo.vue')),
  },
  {
    id: 'blur-in',
    title: 'Blur-in',
    category: 'scroll',
    type: 'directive',
    blurb: 'Resolves from a soft blur to sharp while fading in — great for media.',
    components: ['DzImage'],
    code: `<script setup lang="ts">
import { DzImage } from '@dzup-ui/core'
import { vReveal } from '../motion'
</script>

<template>
  <DzImage v-reveal.blur :src="src" alt="…" fit="cover" aspect-ratio="16/9" />
</template>`,
    demo: defineAsyncComponent(() => import('./demos/BlurInDemo.vue')),
  },
  {
    id: 'scale-in',
    title: 'Scale-in',
    category: 'scroll',
    type: 'directive',
    blurb: 'Scales up from 0.96 to full size while fading in — pair with stat cards.',
    components: ['DzStatCard'],
    code: `<script setup lang="ts">
import { DzStatCard } from '@dzup-ui/core'
import { vReveal } from '../motion'
</script>

<template>
  <DzStatCard v-reveal.scale title="Monthly active" value="48.2k" trend="up" />
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ScaleInDemo.vue')),
  },
  {
    id: 'parallax-drift',
    title: 'Scroll parallax drift',
    category: 'scroll',
    type: 'composable',
    blurb: 'A background layer drifts at a fraction of the scroll speed, travel capped.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { ref, computed } from 'vue'
import { useScrollProgress, useReducedMotion } from '../motion'

const root = ref<HTMLElement | null>(null)
const progress = useScrollProgress(root)
const reduced = useReducedMotion()

const layerStyle = computed(() =>
  reduced.value
    ? { transform: 'none' }
    : { transform: \`translate3d(0, \${(0.5 - progress.value) * 96}px, 0)\` },
)
</script>

<template>
  <div ref="root" class="stage">
    <div class="layer" :style="layerStyle" aria-hidden="true" />
    <slot />
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ParallaxDriftDemo.vue')),
  },
  {
    id: 'bento-reveal',
    title: 'Bento reveal',
    category: 'scroll',
    type: 'component',
    blurb: 'A bento grid reveals with a shared spotlight and per-cell stagger as it enters view.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { DzCard, DzText } from '@dzup-ui/core'
import { DzBentoReveal } from '../motion'

const cells = [/* … */]
</script>

<template>
  <!-- DzBentoReveal tags each direct child a cell, indexes it for the cascade and
       lays a pointer-tracked spotlight over the grid. Where CSS scroll-driven
       animations exist the reveal runs on the compositor (animation-timeline:
       view()); in Firefox it falls back to useInView + the .dz-animate-in
       entrance. Cells are fully visible by default in both paths. Reduced motion →
       all cells shown at once, faint static glow. -->
  <DzBentoReveal class="bento" :step="70">
    <DzCard v-for="c in cells" :key="c.title" variant="outlined" padding="md">
      <DzText weight="semibold" size="sm">{{ c.title }}</DzText>
    </DzCard>
  </DzBentoReveal>
</template>

<style scoped>
.bento { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/BentoRevealDemo.vue')),
  },
  {
    id: 'sticky-scroll',
    title: 'Sticky / pinned scroll',
    category: 'scroll',
    type: 'composable',
    blurb: 'A panel pins while its content advances through steps; the progress bar tracks the scroll.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'
import { supportsScrollTimeline, useReducedMotion, useSticky } from '../motion'

const reduced = useReducedMotion()
const native = supportsScrollTimeline()

// useSticky reports an internal scroll container's 0→1 progress (the JS floor).
const scroller = ref<HTMLElement | null>(null)
const progress = useSticky(scroller)

const steps = [/* … */]
const active = computed(() =>
  Math.min(steps.length - 1, Math.floor(progress.value * steps.length)),
)
// Bar reads --sticky-progress (scaleX). The native path overrides it with a
// scroll()-driven animation, so the continuous fill runs on the compositor.
const barStyle = computed(() => ({ '--sticky-progress': progress.value.toFixed(3) }))
</script>

<template>
  <!-- Reduced motion → normal stacked flow (no pin, no scroll-linked bar). -->
  <div v-if="reduced"><!-- …stacked step list… --></div>

  <div v-else class="sticky" :class="{ 'dz-sticky--native': native }">
    <div ref="scroller" class="scroller">
      <div class="track">
        <div class="pinned">
          <p>{{ steps[active].title }}</p>
          <div class="bar-track"><div class="dz-sticky__bar" :style="barStyle" /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroller { height: 188px; overflow-y: auto; }
.track { height: calc(188px * 3); }          /* the scroll distance */
.pinned { position: sticky; top: 0; min-height: 188px; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/StickyScrollDemo.vue')),
  },
  {
    id: 'scroll-linked',
    title: 'Scroll-linked transforms',
    category: 'scroll',
    type: 'css',
    blurb: 'Two layers’ transform and opacity are bound to scroll position — modernised parallax.',
    components: ['DzAurora'],
    code: `<script setup lang="ts">
import { computed, ref } from 'vue'
import { supportsScrollTimeline, useReducedMotion, useScrollProgress } from '../motion'

const reduced = useReducedMotion()
const native = supportsScrollTimeline()

const root = ref<HTMLElement | null>(null)
const progress = useScrollProgress(root)

// JS floor — applied only when the native CSS path is absent and motion is
// allowed. Native: the .dz-scroll-linked animation owns the transform (return {}).
// Reduced motion: static end-state (return {}). Travel is capped.
const backStyle = computed(() =>
  native || reduced.value
    ? {}
    : { transform: \`translate3d(0, \${(progress.value - 0.5) * 80}px, 0)\` },
)
</script>

<template>
  <!-- The .dz-scroll-linked utility (tokens.css) binds each layer to the element's
       own view() progress behind @supports; here the JS fallback drives the same
       transform. The static end-state is always visible — never opacity:0. -->
  <div
    ref="root"
    class="dz-scroll-linked"
    :class="{ 'dz-scroll-linked--native': native, 'dz-scroll-linked--reduced': reduced }"
  >
    <div class="dz-scroll-linked__back" :style="backStyle" aria-hidden="true" />
    <div class="dz-scroll-linked__fore">Scroll-linked</div>
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ScrollLinkedDemo.vue')),
  },
  {
    id: 'gradient-sweep',
    title: 'Gradient sweep',
    category: 'text',
    type: 'component',
    blurb: 'An animated brand gradient sweeps continuously across a heading.',
    components: ['DzHeading'],
    code: `<script setup lang="ts">
import { DzHeading } from '@dzup-ui/core'
import { DzGradientText } from '../motion'
</script>

<template>
  <DzGradientText>
    <DzHeading :level="2" size="2xl" weight="bold">
      Motion, on brand
    </DzHeading>
  </DzGradientText>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/GradientSweepDemo.vue')),
  },
  {
    id: 'typewriter',
    title: 'Typewriter',
    category: 'text',
    type: 'composable',
    blurb: 'Types and erases a rotating list of phrases, with a blinking caret.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { DzTypewriter } from '../motion'

const phrases = ['design tokens.', 'accessible motion.', 'copy-paste demos.']
</script>

<template>
  <DzText size="lg" weight="medium">
    Built on <DzTypewriter :phrases="phrases" />
  </DzText>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/TypewriterDemo.vue')),
  },
  {
    id: 'word-stagger',
    title: 'Word stagger',
    category: 'text',
    type: 'component',
    blurb: 'Splits a line into words and reveals each one in sequence as it enters.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { DzWordReveal } from '../motion'
</script>

<template>
  <DzWordReveal as="p" text="Ship motion that respects everyone" />
</template>`,
    demo: defineAsyncComponent(() => import('./demos/WordStaggerDemo.vue')),
  },
  {
    id: 'letter-decode',
    title: 'Letter decode',
    category: 'text',
    type: 'composable',
    blurb: 'Scrambles then resolves characters left-to-right when scrolled into view.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { DzTextDecode } from '../motion'
</script>

<template>
  <DzText size="sm" weight="semibold">
    <DzTextDecode text="ECOSYSTEM · ANIMATIONS" />
  </DzText>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/LetterDecodeDemo.vue')),
  },
  {
    id: 'highlight-sweep',
    title: 'Highlight sweep',
    category: 'text',
    type: 'css',
    blurb: 'A marker grows behind an emphasised word as the line scrolls into view.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { ref, computed } from 'vue'
import { DzText } from '@dzup-ui/core'
import { useInView, useReducedMotion } from '../motion'

const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()

const mark = computed(() => ({
  'dz-highlight-sweep': true,
  'dz-highlight-sweep--in': inView.value,
  'dz-highlight-sweep--reduced': reduced.value,
}))
</script>

<template>
  <div ref="root">
    <DzText size="lg">Motion that feels <strong :class="mark">effortless</strong></DzText>
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/HighlightSweepDemo.vue')),
  },
  {
    id: 'circular-text',
    title: 'Circular text',
    category: 'text',
    type: 'component',
    blurb: 'Lays a string around a ring that slowly rotates, like a rotating seal.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { DzCircularText } from '../motion'
</script>

<template>
  <!-- The curved glyphs are aria-hidden; the full string stays in the DOM (sr-only)
       and is announced once. Reduced motion → static curved text. -->
  <div style="position: relative; display: grid; place-items: center">
    <DzCircularText text="· DESIGN TOKENS · ACCESSIBLE MOTION " :radius="74" />
    <DzText size="sm" weight="semibold" aria-hidden="true">dzup</DzText>
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/CircularTextDemo.vue')),
  },
  {
    id: 'text-flip',
    title: 'Text flip',
    category: 'text',
    type: 'component',
    blurb: 'Cycles a list of words, each flipping vertically (rotateX) in and out.',
    components: ['DzHeading'],
    code: `<script setup lang="ts">
import { DzHeading } from '@dzup-ui/core'
import { DzTextFlip } from '../motion'

const phrases = ['tokens', 'motion', 'demos', 'systems']
</script>

<template>
  <!-- The flipping word is aria-hidden; the active phrase is mirrored into a polite
       aria-live region. Box sized to the longest phrase (no shift); pauses on
       hover/focus and off-screen. Reduced motion → first phrase, static. -->
  <DzHeading :level="4">
    Built on design <DzTextFlip :phrases="phrases" />
  </DzHeading>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/TextFlipDemo.vue')),
  },
  {
    id: 'count-up',
    title: 'Count-up',
    category: 'numbers',
    type: 'component',
    blurb: 'Figures tween from 0 to their target when scrolled into view, with formatting.',
    components: ['DzAnimatedNumber'],
    code: `<script setup lang="ts">
import { DzCountUp } from '../motion'
</script>

<template>
  <!-- Thousands separators on by default; static prefix/suffix via slots. -->
  <DzCountUp :value="48200" tone="primary" />
  <DzCountUp :value="12" suffix="k" />
  <DzCountUp :value="99" suffix="+" />
</template>`,
    demo: defineAsyncComponent(() => import('./demos/CountUpDemo.vue')),
  },
  {
    id: 'odometer',
    title: 'Sliding number',
    category: 'numbers',
    type: 'component',
    blurb: 'Each digit rolls vertically to its target like a mechanical odometer when in view.',
    components: ['DzStatCard'],
    code: `<script setup lang="ts">
import { DzStatCard } from '@dzup-ui/core'
import { DzOdometer } from '../motion'
</script>

<template>
  <!-- Per-digit vertical roll (transform-only) on a left-to-right stagger; the
       value lives in a real DzStatCard via its #value slot. Thousands separators
       on by default; static prefix/suffix; tabular-nums avoids any width jump.
       Reduced motion → final number shown instantly, no roll. -->
  <DzStatCard title="Active projects" :value="48200" trend="up" trend-value="+12%">
    <template #value>
      <DzOdometer :value="48200" tone="primary" aria-label="Active projects" />
    </template>
  </DzStatCard>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/OdometerDemo.vue')),
  },
  {
    id: 'progress-fill',
    title: 'Progress fill',
    category: 'numbers',
    type: 'composable',
    blurb: 'A DzProgress bar fills from 0 to its value the moment it scrolls into view.',
    components: ['DzProgress'],
    code: `<script setup lang="ts">
import { ref, computed } from 'vue'
import { DzProgress } from '@dzup-ui/core'
import { useInView, useReducedMotion } from '../motion'

const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()

// Filled once in view; immediately filled (no sweep) under reduced motion.
const filled = computed(() => reduced.value || inView.value)
</script>

<template>
  <div ref="root">
    <DzProgress :value="filled ? 92 : 0" :max="100" tone="success" aria-label="Coverage" />
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ProgressFillDemo.vue')),
  },
  {
    id: 'rating-fill',
    title: 'Rating fill',
    category: 'numbers',
    type: 'composable',
    blurb: 'A DzRating fills star-by-star when scrolled into view; final value under reduced motion.',
    components: ['DzRating'],
    code: `<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { DzRating } from '@dzup-ui/core'
import { useInView, useReducedMotion } from '../motion'

const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()
const rating = ref(0)
let timer: ReturnType<typeof setTimeout> | null = null

function fillStep() {
  if (rating.value >= 4.5) return
  rating.value += 0.5
  timer = setTimeout(fillStep, 140)
}

watch([inView, reduced], ([visible, isReduced]) => {
  if (isReduced) rating.value = 4.5
  else if (visible && rating.value === 0) fillStep()
}, { immediate: true })

onBeforeUnmount(() => timer && clearTimeout(timer))
</script>

<template>
  <div ref="root">
    <DzRating v-model:value="rating" :count="5" allow-half readonly tone="warning" />
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/RatingFillDemo.vue')),
  },
  {
    id: 'aurora-drift',
    title: 'Aurora drift',
    category: 'backgrounds',
    type: 'component',
    blurb: 'Soft brand blobs drift on slow, offset loops behind a hero or CTA surface.',
    components: ['DzAurora'],
    code: `<script setup lang="ts">
import { DzHeading } from '@dzup-ui/core'
import { DzAurora } from '../motion'
</script>

<template>
  <!-- Parent must be positioned; DzAurora fills it, aria-hidden + non-interactive. -->
  <section class="hero">
    <DzAurora />
    <DzHeading :level="1" size="3xl" weight="bold">Motion, ready to drop in</DzHeading>
  </section>
</template>

<style scoped>
.hero { position: relative; overflow: hidden; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/AuroraDriftDemo.vue')),
  },
  {
    id: 'animated-grid',
    title: 'Animated grid/dots',
    category: 'backgrounds',
    type: 'css',
    blurb: 'A subtle line or dot pattern pans slowly behind a section as an ambient backdrop.',
    components: ['DzText'],
    code: `<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../motion'

const reduced = useReducedMotion()
// Swap 'dz-anim-grid' for 'dz-anim-dots' for the dotted variant.
const grid = computed(() => ({
  'dz-anim-grid': true,
  'dz-anim-grid--reduced': reduced.value,
}))
</script>

<template>
  <section class="stage">
    <div :class="grid" />
    <div class="content"><!-- section content --></div>
  </section>
</template>

<style scoped>
.stage { position: relative; overflow: hidden; }
.content { position: relative; z-index: 1; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/AnimatedGridDemo.vue')),
  },
  {
    id: 'spotlight-follow',
    title: 'Spotlight follow',
    category: 'backgrounds',
    type: 'component',
    blurb: 'A radial light tracks the cursor across a surface; static glow under reduced motion.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { DzCard, DzHeading } from '@dzup-ui/core'
import { DzSpotlight } from '../motion'
</script>

<template>
  <DzSpotlight>
    <DzCard variant="elevated" padding="lg">
      <DzHeading :level="2" size="lg">Follow the light</DzHeading>
    </DzCard>
  </DzSpotlight>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/SpotlightFollowDemo.vue')),
  },
  {
    id: 'gradient-border-glow',
    title: 'Gradient border glow',
    category: 'backgrounds',
    type: 'css',
    blurb: 'An animated conic-gradient ring glows around a card; static brand border when reduced.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { computed } from 'vue'
import { DzCard } from '@dzup-ui/core'
import { useReducedMotion } from '../motion'

const reduced = useReducedMotion()
const frame = computed(() => ({
  'dz-anim-border-glow': true,
  'dz-anim-border-glow--reduced': reduced.value,
}))
</script>

<template>
  <div :class="frame">
    <DzCard variant="flat" padding="lg">Featured</DzCard>
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/GradientBorderGlowDemo.vue')),
  },
  {
    id: 'meteors',
    title: 'Meteors',
    category: 'backgrounds',
    type: 'css',
    blurb: 'Diagonal shooting-star streaks cross a hero or card on offset loops; static when reduced.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { computed } from 'vue'
import { useReducedMotion } from '../motion'

const reduced = useReducedMotion()

// Cap concurrent streaks in the markup — the .dz-meteors utility loops one per
// child. Give each a randomised start, delay and duration (per-streak props).
const streaks = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  style: {
    '--dz-meteor-left': \`\${6 + (i / 14) * 90}%\`,
    '--dz-meteor-top': \`\${-12 + Math.random() * 26}%\`,
    '--dz-meteor-delay': \`\${(Math.random() * 5).toFixed(2)}s\`,
    '--dz-meteor-duration': \`\${(4.4 + Math.random() * 2.6).toFixed(2)}s\`,
  },
}))

const field = computed(() => ({ 'dz-meteors': true, 'dz-meteors--reduced': reduced.value }))
</script>

<template>
  <!-- Parent must be positioned + clip overflow; .dz-meteors fills it (aria-hidden). -->
  <section class="hero">
    <div :class="field" aria-hidden="true">
      <span v-for="s in streaks" :key="s.id" class="dz-meteors__streak" :style="s.style" />
    </div>
    <h2 class="title">Meteor shower</h2>
  </section>
</template>

<style scoped>
.hero { position: relative; overflow: hidden; }
.title { position: relative; z-index: 1; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/MeteorsDemo.vue')),
  },
  {
    id: 'particle-field',
    title: 'Particle field',
    category: 'backgrounds',
    type: 'component',
    blurb: 'A constellation of dots drifts, links near neighbours and eases aside under the pointer.',
    components: ['DzParticles'],
    code: `<script setup lang="ts">
import { DzHeading } from '@dzup-ui/core'
import { DzParticles } from '../motion'
</script>

<template>
  <!-- Parent must be positioned; DzParticles fills it (aria-hidden, non-interactive).
       The canvas loop self-pauses off-screen; touch/keyboard + reduced motion get a
       single static frame of dots + links. count is capped to the surface area. -->
  <section class="hero">
    <DzParticles :count="48" :link-distance="108" />
    <DzHeading :level="1" size="3xl" weight="bold">Constellation</DzHeading>
  </section>
</template>

<style scoped>
.hero { position: relative; overflow: hidden; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/ParticleFieldDemo.vue')),
  },
  {
    id: 'progressive-blur',
    title: 'Progressive blur',
    category: 'backgrounds',
    type: 'css',
    blurb: 'Layered backdrop-filter stops fade a scroll edge; opaque surface fade under reduced transparency.',
    components: ['DzCard'],
    code: `<template>
  <!-- Host must be positioned + clip overflow. .dz-progressive-blur pins to the
       bottom edge and ramps three masked backdrop-filter stops over it. It is
       static (no motion); under prefers-reduced-transparency the blur is swapped
       for an opaque surface fade so the rows stay legible. -->
  <div class="scroll-region">
    <div class="scroller"><!-- …scrolling content… --></div>
    <div class="dz-progressive-blur" aria-hidden="true" />
  </div>
</template>

<style scoped>
.scroll-region { position: relative; overflow: hidden; }
.scroller { overflow-y: auto; }
/* Optional: fade a different edge / depth via the utility's custom props. */
.dz-progressive-blur { --dz-progressive-blur-height: 32%; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/ProgressiveBlurDemo.vue')),
  },
  {
    id: 'glass-surface',
    title: 'Glass surface',
    category: 'backgrounds',
    type: 'component',
    blurb: 'A frosted panel over a busy backdrop; opaque raised surface when transparency is reduced.',
    components: ['DzGlass', 'DzCard'],
    code: `<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'
import { DzGlass } from '../motion'
</script>

<template>
  <!-- DzGlass frosts whatever sits behind it (backdrop-filter blur + saturate).
       prefers-reduced-transparency → opaque raised surface; forced-colors → a
       solid system surface + border. Token-only, light + dark. -->
  <div class="busy-backdrop">
    <DzGlass :blur="'16px'" padding="24px">
      <DzHeading :level="2" size="md" weight="semibold">Frosted panel</DzHeading>
      <DzText size="sm" tone="muted">Legible over a busy backdrop.</DzText>
    </DzGlass>
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/GlassSurfaceDemo.vue')),
  },
  {
    id: 'card-lift',
    title: 'Card lift + glow',
    category: 'hover',
    type: 'css',
    blurb: 'A card rises with a soft shadow and a brand-tinted border on hover.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { DzCard } from '@dzup-ui/core'
import { computed } from 'vue'
import { useReducedMotion } from '../motion'

const reduced = useReducedMotion()
// '.dz-card-lift' is the token-only, documented form of '.lp-card--hover'.
const lift = computed(() => ({
  'dz-card-lift': true,
  'dz-card-lift--reduced': reduced.value,
}))
</script>

<template>
  <DzCard variant="outlined" padding="lg" :class="lift">Hover to lift</DzCard>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/CardLiftDemo.vue')),
  },
  {
    id: 'tilt',
    title: '3D tilt',
    category: 'hover',
    type: 'directive',
    blurb: 'A card tilts toward the pointer with depth and an optional glare highlight.',
    components: ['DzImageCard', 'DzCard'],
    code: `<script setup lang="ts">
import { DzImageCard } from '@dzup-ui/core'
import { vTilt, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- Pointer-only + rAF-throttled; flat on touch/keyboard and under reduced motion. -->
  <DzImageCard
    v-tilt="{ max: 12, glare: true, scale: 1.02, disabled: reduced }"
    :src="src"
    alt="…"
    aspect-ratio="16/9"
  />
</template>`,
    demo: defineAsyncComponent(() => import('./demos/TiltDemo.vue')),
  },
  {
    id: 'sheen-sweep',
    title: 'Sheen sweep',
    category: 'hover',
    type: 'css',
    blurb: 'A diagonal light streak sweeps across a button or card on hover.',
    components: ['DzButton', 'DzCard'],
    code: `<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
import { computed } from 'vue'
import { useReducedMotion } from '../motion'

const reduced = useReducedMotion()
const sheen = computed(() => ({
  'dz-sheen': true,
  'dz-sheen--reduced': reduced.value,
}))
</script>

<template>
  <DzButton variant="solid" tone="primary" :class="sheen">Get started</DzButton>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/SheenSweepDemo.vue')),
  },
  {
    id: 'magnetic-button',
    title: 'Magnetic button',
    category: 'hover',
    type: 'directive',
    blurb: 'A CTA eases toward the cursor within a small radius and springs back on leave.',
    components: ['DzButton'],
    code: `<script setup lang="ts">
import { DzButton } from '@dzup-ui/core'
import { vMagnetic, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- Offset clamped to a few px so the click target never breaks. -->
  <DzButton
    v-magnetic="{ strength: 0.45, radius: 16, disabled: reduced }"
    variant="solid"
    tone="primary"
    size="lg"
  >
    Pull me closer
  </DzButton>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/MagneticButtonDemo.vue')),
  },
  {
    id: 'border-beam',
    title: 'Border beam',
    category: 'hover',
    type: 'component',
    blurb: 'A light beam travels continuously around a card’s border on a loop.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { DzCard } from '@dzup-ui/core'
import { DzBorderBeam } from '../motion'
</script>

<template>
  <!-- Give the inner card a matching radius + opaque surface so the ring peeks at the edges. -->
  <DzBorderBeam>
    <DzCard variant="flat" padding="lg" style="border-radius: var(--dz-radius-xl); background: var(--dz-surface)">
      Live status
    </DzCard>
  </DzBorderBeam>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/BorderBeamDemo.vue')),
  },
  {
    id: 'dock',
    title: 'Dock magnification',
    category: 'hover',
    type: 'component',
    blurb: 'A row of icons scales by pointer proximity, neighbours easing — the macOS dock.',
    components: ['DzIconButton', 'DzAvatar'],
    code: `<script setup lang="ts">
import { DzIconButton } from '@dzup-ui/core'
import { Compass, Settings, Sparkles, Users } from 'lucide-vue-next'
import { DzDock, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
const items = [
  { icon: Compass, label: 'Explore' },
  { icon: Sparkles, label: 'Highlights' },
  { icon: Users, label: 'Team' },
  { icon: Settings, label: 'Settings' },
]
</script>

<template>
  <!-- rAF pointer; each item scales about its own centre so clicks never move.
       Flat static row on touch/keyboard and under reduced motion (via disabled). -->
  <DzDock :disabled="reduced" aria-label="Workspace dock">
    <DzIconButton
      v-for="item in items"
      :key="item.label"
      :icon="item.icon"
      :ariaLabel="item.label"
      variant="ghost"
      tone="primary"
      size="lg"
    />
  </DzDock>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/DockDemo.vue')),
  },
  {
    id: 'card-stack',
    title: 'Card stack / swap',
    category: 'hover',
    type: 'component',
    blurb: 'Stacked cards cycle the front card to the back — morphs via View Transitions, FLIPs otherwise.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { DzCardStack, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
const cards = [
  { title: 'Design tokens', body: 'One source of truth.' },
  { title: 'Accessible motion', body: 'Respects reduced motion.' },
  { title: 'Copy-paste demos', body: 'Drop a snippet in and ship.' },
]
</script>

<template>
  <!-- Click the stack or the keyboard-operable "Next" button to advance. The swap
       uses startViewTransition where supported, FLIP (WAAPI) otherwise, and is
       instant under reduced motion (via disabled). -->
  <DzCardStack :items="cards" :disabled="reduced">
    <template #card="{ item }">
      <DzCard variant="elevated" padding="lg">
        <DzHeading :level="4" size="lg" weight="bold">{{ item.title }}</DzHeading>
        <DzText size="sm" tone="muted">{{ item.body }}</DzText>
      </DzCard>
    </template>
  </DzCardStack>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/CardStackDemo.vue')),
  },
  {
    id: 'glare',
    title: 'Glare card',
    category: 'hover',
    type: 'directive',
    blurb: 'A glossy specular highlight tracks the pointer across a card — the gloss, no tilt.',
    components: ['DzCard', 'DzImageCard'],
    code: `<script setup lang="ts">
import { DzCard, DzHeading } from '@dzup-ui/core'
import { vGlare, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- rAF pointer; opacity/background-position only. The glare is an aria-hidden,
       pointer-events:none overlay so the card's click target never moves. Flat
       surface on touch/keyboard and under reduced motion (via disabled). -->
  <DzCard v-glare="{ disabled: reduced }" variant="elevated" padding="lg">
    <DzHeading :level="4" size="lg" weight="bold">Membership card</DzHeading>
  </DzCard>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/GlareCardDemo.vue')),
  },
  {
    id: 'custom-cursor',
    title: 'Custom cursor',
    category: 'hover',
    type: 'component',
    blurb: 'A soft blob trails the pointer inside a region; native cursor returns on leave.',
    components: ['DzCard'],
    code: `<script setup lang="ts">
import { DzCursor, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- The blob eases toward the pointer each frame (transform only, rAF) and is
       non-interactive, so it never traps the pointer — links inside stay
       clickable. Touch/keyboard keep the native cursor; off under reduced motion. -->
  <DzCursor :disabled="reduced" :size="36">
    <!-- …any surface / content… -->
  </DzCursor>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/CustomCursorDemo.vue')),
  },
  {
    id: 'image-compare',
    title: 'Image comparison',
    category: 'hover',
    type: 'component',
    blurb: 'Drag — or arrow-key — a handle to wipe between a before and after image.',
    components: ['DzImage'],
    code: `<script setup lang="ts">
import { DzCompare, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- The handle is a real role="slider": drag it, or focus it and use
       Arrow / Home / End keys (aria-valuenow announced). The one-shot intro sweep
       is skipped under reduced motion (via disabled) — manual control still works;
       the static baseline is the full "before" image. -->
  <DzCompare
    :before-src="beforeSrc" before-alt="Before"
    :after-src="afterSrc" after-alt="After"
    aspect-ratio="16/9"
    :disabled="reduced"
  />
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ImageCompareDemo.vue')),
  },
  {
    id: 'lens',
    title: 'Lens / magnifier',
    category: 'hover',
    type: 'component',
    blurb: 'A magnified circle follows the pointer over an image, locking onto what is under it.',
    components: ['DzImage'],
    code: `<script setup lang="ts">
import { DzLens, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- rAF pointer; transform + background-position. Pointer-only: touch/keyboard
       get the plain image, and there is no lens under reduced motion (via disabled). -->
  <DzLens :src="src" alt="…" :zoom="2.4" :size="132" aspect-ratio="4/3" :disabled="reduced" />
</template>`,
    demo: defineAsyncComponent(() => import('./demos/LensMagnifierDemo.vue')),
  },
  {
    id: 'stagger-list-in',
    title: 'Stagger list-in',
    category: 'lists',
    type: 'component',
    blurb: 'List items enter one-by-one on view — pair with avatars, lists or menus.',
    components: ['DzList', 'DzAvatar', 'DzBadge'],
    code: `<script setup lang="ts">
import { DzAvatar, DzBadge, DzListItem } from '@dzup-ui/core'
import { DzStagger } from '../motion'

const team = [
  { name: 'Ada Lovelace', role: 'Design', tone: 'primary', initials: 'AL' },
  { name: 'Alan Turing', role: 'Engineering', tone: 'info', initials: 'AT' },
]
</script>

<template>
  <!-- DzStagger gives each direct child an incremental --reveal-delay. -->
  <DzStagger as="ul" :step="90">
    <DzListItem v-for="m in team" :key="m.name">
      <template #prefix><DzAvatar :fallback="m.initials" size="sm" :alt="m.name" /></template>
      {{ m.name }}
      <template #suffix><DzBadge variant="subtle" :tone="m.tone" size="sm">{{ m.role }}</DzBadge></template>
    </DzListItem>
  </DzStagger>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/StaggerListInDemo.vue')),
  },
  {
    id: 'marquee-strip',
    title: 'Marquee strip',
    category: 'lists',
    type: 'component',
    blurb: 'A logo/badge strip scrolls infinitely and seamlessly; hover to pause.',
    components: ['DzBadge'],
    code: `<script setup lang="ts">
import { DzBadge } from '@dzup-ui/core'
import { DzMarquee } from '../motion'

const logos = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Hooli']
</script>

<template>
  <!-- Content is duplicated internally for a seamless loop; static row when reduced. -->
  <DzMarquee aria-label="Trusted by teams">
    <DzBadge v-for="logo in logos" :key="logo" variant="outline" tone="neutral" size="md">
      {{ logo }}
    </DzBadge>
  </DzMarquee>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/MarqueeStripDemo.vue')),
  },
  {
    id: 'flip-on-change',
    title: 'Flip on change',
    category: 'lists',
    type: 'component',
    blurb: 'A badge value flips with a half-turn whenever the underlying data updates.',
    components: ['DzBadge', 'DzTag'],
    code: `<script setup lang="ts">
import { ref, computed } from 'vue'
import { DzBadge } from '@dzup-ui/core'
import { DzFlip } from '../motion'

const states = [
  { label: 'Queued', tone: 'neutral' },
  { label: 'Running', tone: 'info' },
  { label: 'Passed', tone: 'success' },
]
const i = ref(0)
const current = computed(() => states[i.value])
</script>

<template>
  <!-- Pass the changing value to DzFlip; it remounts + flips the face on each update. -->
  <DzFlip :value="current.label">
    <DzBadge variant="solid" :tone="current.tone">{{ current.label }}</DzBadge>
  </DzFlip>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/FlipOnChangeDemo.vue')),
  },
  {
    id: 'auto-animate-list',
    title: 'Auto-animate list',
    category: 'lists',
    type: 'directive',
    blurb: 'Add, remove and reorder list items animate in one line via AutoAnimate; snaps when reduced.',
    components: ['DzListItem', 'DzAvatar', 'DzBadge'],
    code: `<script setup lang="ts">
import { ref, watch } from 'vue'
import { DzListItem } from '@dzup-ui/core'
import { useAutoAnimate, useReducedMotion } from '../motion'

const items = ref([{ id: 1, name: 'Ada Lovelace' } /* … */])

// useAutoAnimate animates every direct-child add/remove/move of the bound parent.
// It respects OS prefers-reduced-motion by default; bind the page-level toggle too.
const [listRef, enable] = useAutoAnimate()
const reduced = useReducedMotion()
watch(reduced, (r) => enable(!r), { immediate: true })
</script>

<template>
  <!-- One directive on the parent — no per-item transition wiring. -->
  <ul ref="listRef">
    <DzListItem v-for="item in items" :key="item.id">{{ item.name }}</DzListItem>
  </ul>

  <!-- Or, with the plugin/directive registered, simply: -->
  <!-- <ul v-auto-animate> … </ul> -->
</template>`,
    demo: defineAsyncComponent(() => import('./demos/AutoAnimateListDemo.vue')),
  },
  {
    id: 'pulse-ping',
    title: 'Pulse / ping',
    category: 'attention',
    type: 'css',
    blurb: 'An expanding ring radiates from a status dot to draw the eye to live updates.',
    components: ['DzNotification'],
    code: `<script setup lang="ts">
import { DzNotification } from '@dzup-ui/core'
import { useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <DzNotification title="Deployment live" tone="info">
    <template #icon>
      <!-- .dz-ping radiates a ring (currentColor) behind the dot; static when reduced. -->
      <span class="dz-ping" :class="{ 'dz-ping--reduced': reduced }" style="color: var(--dz-info)" aria-hidden="true">
        <span class="dz-ping__ring" />
        <span class="dz-ping__dot" />
      </span>
    </template>
  </DzNotification>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/PulsePingDemo.vue')),
  },
  {
    id: 'shimmer-skeleton',
    title: 'Shimmer skeleton',
    category: 'attention',
    type: 'component',
    blurb: 'A soft highlight sweeps across loading placeholders to signal progress.',
    components: ['DzSkeleton'],
    code: `<script setup lang="ts">
import { DzSkeleton } from '@dzup-ui/core'
import { DzShimmer } from '../motion'
</script>

<template>
  <!-- Wrap placeholders; pass :animate="false" so the sweep is the only motion. -->
  <DzShimmer>
    <DzSkeleton variant="circular" width="44px" height="44px" :animate="false" />
    <DzSkeleton variant="text" :lines="3" :animate="false" />
  </DzShimmer>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ShimmerSkeletonDemo.vue')),
  },
  {
    id: 'toast-slide-in',
    title: 'Toast slide-in',
    category: 'attention',
    type: 'composable',
    blurb: 'Toasts enter and stack with a slide + fade; appear instantly when reduced.',
    components: ['DzToast', 'DzToastProvider'],
    code: `<script setup lang="ts">
import { inject } from 'vue'
import { DZ_TOAST_KEY, DzToastProvider, DzToastViewport } from '@dzup-ui/core'
import type { DzToastContext } from '@dzup-ui/core'

// Inside the provider, inject the context to push toasts imperatively (ADR-08).
const toast = inject<DzToastContext>(DZ_TOAST_KEY)
function notify() {
  toast?.add({ title: 'Build passed', description: 'CI · 2m 14s', tone: 'success' })
}
</script>

<template>
  <DzToastProvider :duration="4000">
    <!-- … app content; call notify() from any descendant … -->
    <DzToastViewport position="bottom-right" />
  </DzToastProvider>
</template>

<style scoped>
/* Slide + fade keyed on Reka's data-state — the universal floor. */
:deep([data-state='open']) {
  animation: toast-in var(--dz-duration-normal) var(--dz-ease-out) both;
}
:deep([data-state='closed']) {
  animation: toast-out var(--dz-duration-fast) var(--dz-ease-in) both;
}
@keyframes toast-in { from { opacity: 0; transform: translateY(16px) scale(0.98); } }
@keyframes toast-out { to { opacity: 0; transform: translateX(40px); } }

/* Native entrance — where @starting-style / transition-behavior: allow-discrete
   is supported, animate IN from the @starting-style state on insertion (no
   keyframe). Exit stays on the keyframe so Reka unmounts on animationend. */
@supports (transition-behavior: allow-discrete) {
  :deep([data-state='open']) {
    animation: none;
    transition:
      opacity var(--dz-duration-normal) var(--dz-ease-out),
      transform var(--dz-duration-normal) var(--dz-ease-out);
    opacity: 1;
    transform: none;
  }
  @starting-style {
    :deep([data-state='open']) { opacity: 0; transform: translateY(16px) scale(0.98); }
  }
}

/* Reduced motion → instant for both paths. */
@media (prefers-reduced-motion: reduce) {
  :deep([data-state]) { animation: none !important; transition: none !important; }
}
</style>`,
    demo: defineAsyncComponent(() => import('./demos/ToastSlideInDemo.vue')),
  },
  {
    id: 'success-check',
    title: 'Success check',
    category: 'feedback',
    type: 'component',
    blurb: 'An SVG ring and tick draw themselves in with a small pop to confirm a completed action.',
    components: ['DzButton'],
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { DzButton } from '@dzup-ui/core'
import { DzSuccessCheck } from '../motion'

// Flip \`active\` once the action resolves; the ring + tick draw via stroke-dashoffset.
const done = ref(false)
</script>

<template>
  <DzSuccessCheck v-if="done" :active="true" tone="success" label="Payment confirmed" />
  <DzButton v-else variant="solid" tone="primary" @click="done = true">
    Confirm payment
  </DzButton>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/SuccessCheckDemo.vue')),
  },
  {
    id: 'confetti-burst',
    title: 'Confetti burst',
    category: 'feedback',
    type: 'component',
    blurb: 'A celebratory multi-colour particle pop fires on a milestone action; a no-op when reduced.',
    components: ['DzButton'],
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { DzButton } from '@dzup-ui/core'
import { DzConfetti } from '../motion'

// Call the exposed burst() on a key action; the overlay fills the positioned host.
const confetti = ref<InstanceType<typeof DzConfetti> | null>(null)
</script>

<template>
  <div style="position: relative">
    <DzConfetti ref="confetti" />
    <DzButton variant="solid" tone="primary" @click="confetti?.burst()">
      Ship it
    </DzButton>
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ConfettiBurstDemo.vue')),
  },
  {
    id: 'error-shake',
    title: 'Error shake',
    category: 'feedback',
    type: 'css',
    blurb: 'A field rejects invalid input with a damped horizontal shake plus the red invalid state.',
    components: ['DzInput', 'DzButton'],
    code: `<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { DzInput } from '@dzup-ui/core'
import { useReducedMotion } from '../motion'

const value = ref('')
const invalid = ref(false)
const shaking = ref(false)
const reduced = useReducedMotion()

function submit() {
  if (value.value.trim()) { invalid.value = false; return }
  invalid.value = true
  if (reduced.value) return
  // Restart the one-shot .dz-shake: drop the class, re-add next frame.
  shaking.value = false
  nextTick(() => (shaking.value = true))
}
</script>

<template>
  <div
    :class="{ 'dz-shake': shaking, 'dz-shake--reduced': reduced }"
    @animationend="shaking = false"
  >
    <DzInput v-model="value" type="email" :invalid="invalid" placeholder="you@company.com" />
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/ErrorShakeDemo.vue')),
  },
  {
    id: 'like-pop',
    title: 'Like pop',
    category: 'feedback',
    type: 'component',
    blurb: 'A like toggle pops in scale and radiates a ring of colour sparks on the rising edge.',
    components: ['DzToggleButton'],
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { DzToggleButton } from '@dzup-ui/core'
import { Heart } from 'lucide-vue-next'
import { DzBurst } from '../motion'

const liked = ref(false)
</script>

<template>
  <!-- Burst fires when active goes false → true; the wrapped toggle owns the press state. -->
  <DzBurst :active="liked">
    <DzToggleButton v-model="liked" variant="outline" :tone="liked ? 'danger' : 'neutral'">
      <template #prefix>
        <Heart :size="18" :fill="liked ? 'currentColor' : 'none'" />
      </template>
      Like
    </DzToggleButton>
  </DzBurst>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/LikePopDemo.vue')),
  },
  {
    id: 'route-transition',
    title: 'Route transition',
    category: 'transitions',
    type: 'component',
    blurb: 'Pages fade and slide as you navigate between routes; instant under reduced motion.',
    components: ['router-view'],
    code: `// router.ts — native path: drive the swap through the View Transitions API
// when supported and motion is allowed; the browser morphs the \`root\` snapshot.
import { nextTick } from 'vue'
import { startViewTransition, supportsViewTransitions } from './motion'

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

router.beforeResolve((to, from) => {
  if (!from.name || to.path === from.path) return        // first paint / hash nav
  if (!supportsViewTransitions() || reduced()) return    // → <Transition> fallback
  return new Promise<void>((proceed) => {
    void startViewTransition(async () => { proceed(); await nextTick() })
  })
})

// App.vue — render bare on the native path (no Vue <Transition>, whose out-in
// would defer the mount past the snapshot); keep <Transition> as the fallback.
// <template>
//   <router-view v-slot="{ Component, route: current }">
//     <div v-if="useNativeRoute" :key="current.path"><component :is="Component" /></div>
//     <Transition v-else name="route" mode="out-in">
//       <div :key="current.path"><component :is="Component" /></div>
//     </Transition>
//   </router-view>
// </template>

/* App.vue (UNSCOPED) — the ::view-transition-* pseudos live on :root. Gated in
   @media no-preference so the custom morph never runs under reduced motion. */
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root) {
    animation: dz-route-vt-out var(--dz-duration-normal) var(--dz-ease-in) both;
  }
  ::view-transition-new(root) {
    animation: dz-route-vt-in var(--dz-duration-normal) var(--dz-ease-out) both;
  }
  @keyframes dz-route-vt-out { to { opacity: 0; transform: translateY(-8px); } }
  @keyframes dz-route-vt-in { from { opacity: 0; transform: translateY(8px); } }
}

/* Fallback (unsupported / reduced) — the Vue <Transition name="route"> CSS. */
.route-enter-active, .route-leave-active {
  transition:
    opacity var(--dz-duration-normal) var(--dz-ease-default),
    transform var(--dz-duration-normal) var(--dz-ease-default);
}
.route-enter-from { opacity: 0; transform: translateY(8px); }
.route-leave-to { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .route-enter-active, .route-leave-active { transition-duration: 0.01ms; }
  .route-enter-from, .route-leave-to { transform: none; }
}`,
    demo: defineAsyncComponent(() => import('./demos/RouteTransitionDemo.vue')),
  },
  {
    id: 'tabs-indicator-slide',
    title: 'Tabs indicator slide',
    category: 'transitions',
    type: 'component',
    blurb: 'The active-tab underline glides between tabs; instant move under reduced motion.',
    components: ['DzTabs', 'DzTabList', 'DzTabTrigger'],
    code: `<script setup lang="ts">
import { DzTabs, DzTabList, DzTabTrigger, DzTabContent } from '@dzup-ui/core'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '../motion'

const tabs = ['Overview', 'Pricing', 'Docs', 'Support']
const active = ref('Overview')
const reduced = useReducedMotion()

const rail = ref<HTMLElement | null>(null)
const bar = ref({ left: 0, width: 0 })

// Measure the active trigger relative to the tablist so the bar tracks any width.
function measure() {
  const list = rail.value?.querySelector<HTMLElement>('[role="tablist"]')
  const tab = rail.value?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
  if (!list || !tab) return
  const l = list.getBoundingClientRect()
  const t = tab.getBoundingClientRect()
  bar.value = { left: t.left - l.left, width: t.width }
}

const barStyle = computed(() => ({
  transform: \`translateX(\${bar.value.left}px)\`,
  width: \`\${bar.value.width}px\`,
  transition: reduced.value
    ? 'none'
    : 'transform var(--dz-duration-normal) var(--dz-ease-default), width var(--dz-duration-normal) var(--dz-ease-default)',
}))

watch(active, () => nextTick(measure), { flush: 'post' })
onMounted(() => nextTick(measure))
</script>

<template>
  <DzTabs v-model="active" variant="line" tone="primary">
    <div ref="rail" style="position: relative">
      <DzTabList aria-label="Sections">
        <DzTabTrigger v-for="t in tabs" :key="t" :value="t">{{ t }}</DzTabTrigger>
      </DzTabList>
      <span :style="barStyle" aria-hidden="true" class="indicator" />
    </div>
  </DzTabs>
</template>

<style scoped>
/* Hide the built-in snapping underline; the single bar is the indicator. */
:deep([role="tab"]) { border-bottom-color: transparent !important; }
.indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: var(--dz-radius-full);
  background: var(--dz-primary);
}
</style>`,
    demo: defineAsyncComponent(() => import('./demos/TabsIndicatorSlideDemo.vue')),
  },
  {
    id: 'accordion-height',
    title: 'Accordion height',
    category: 'transitions',
    type: 'component',
    blurb: 'Panels expand and collapse on a smooth height transition; instant under reduced motion.',
    components: ['DzAccordion', 'DzAccordionItem', 'DzAccordionContent'],
    code: `<script setup lang="ts">
import {
  DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent,
} from '@dzup-ui/core'
import { ref } from 'vue'
import { useReducedMotion } from '../motion'

// DzAccordionContent already animates height 0 → --reka-accordion-content-height
// (never to 'auto') via core's accordion-down/up keyframes — reuse it directly.
const open = ref('tokens')
const reduced = useReducedMotion()
</script>

<template>
  <div :class="{ reduced }">
    <DzAccordion v-model="open" type="single" collapsible variant="separated">
      <DzAccordionItem value="tokens">
        <DzAccordionTrigger>Is everything token-driven?</DzAccordionTrigger>
        <DzAccordionContent class="acc-content">Yes — every effect uses --dz-* tokens.</DzAccordionContent>
      </DzAccordionItem>
      <!-- …more items… -->
    </DzAccordion>
  </div>
</template>

<style scoped>
/* OS reduced motion is zeroed globally by the tokens rule; mirror the page-level
   toggle here so the height sweep collapses to an instant open/close. The
   !important wins over the native-path animation set below too. */
.reduced :deep(.acc-content) { animation-duration: 0.01ms !important; }

/* Native path — only where interpolate-size is supported (Chromium) AND motion
   is allowed: swap core's measured-var keyframes for true height: 0 → auto.
   Reka still unmounts on animationend, so the swap is transparent; every other
   browser keeps the accordion-down/up floor. */
@media (prefers-reduced-motion: no-preference) {
  @supports (interpolate-size: allow-keywords) {
    .reduced-host { interpolate-size: allow-keywords; }
    :deep(.acc-content[data-state='open']) {
      animation: dz-acc-open var(--dz-duration-normal) var(--dz-ease-out);
    }
    :deep(.acc-content[data-state='closed']) {
      animation: dz-acc-close var(--dz-duration-normal) var(--dz-ease-out);
    }
  }
}
@keyframes dz-acc-open { from { height: 0; } to { height: auto; } }
@keyframes dz-acc-close { from { height: auto; } to { height: 0; } }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/AccordionHeightDemo.vue')),
  },
  {
    id: 'presence-exit',
    title: 'Presence exit',
    category: 'transitions',
    type: 'component',
    blurb: 'A closing element stays mounted so a pure-CSS leave animation plays before unmount; instant when reduced.',
    components: ['DzPresence'],
    code: `<script setup lang="ts">
import { ref } from 'vue'
import { DzPresence } from '../motion'

// DzPresence keeps the panel mounted while its data-state="closed" animation runs,
// then unmounts it — the Reka/Radix data-[state] convention, in pure CSS.
const open = ref(true)
</script>

<template>
  <DzPresence :present="open">
    <div class="panel">Deployment live</div>
  </DzPresence>
  <button @click="open = !open">Toggle</button>
</template>

<style scoped>
/* data-state is stamped onto the child by DzPresence. transform/opacity only. */
.panel[data-state='open'] {
  animation: in var(--dz-anim-duration-enter) var(--dz-anim-ease-entrance) both;
}
.panel[data-state='closed'] {
  animation: out var(--dz-anim-duration-exit) var(--dz-anim-ease-exit) both;
}
@keyframes in { from { opacity: 0; transform: translateY(8px) scale(0.96); } }
@keyframes out { to { opacity: 0; transform: translateY(8px) scale(0.96); } }

/* Reduced motion → instant (DzPresence also skips the keep-alive wait). */
@media (prefers-reduced-motion: reduce) {
  .panel[data-state] { animation: none !important; }
}
</style>`,
    demo: defineAsyncComponent(() => import('./demos/PresenceExitDemo.vue')),
  },
  {
    id: 'animated-beam',
    title: 'Animated beam',
    category: 'connections',
    type: 'component',
    blurb: 'A light gradient travels an SVG path connecting two referenced elements.',
    components: ['DzCard', 'DzAvatar'],
    code: `<script setup lang="ts">
import { DzAvatar, DzCard } from '@dzup-ui/core'
import { ref } from 'vue'
import { DzBeam } from '../motion'

// Endpoints are element refs (or CSS selectors). DzBeam measures their live
// boxes relative to its own overlay and re-measures on resize.
const hub = ref<HTMLElement | null>(null)
const node = ref<HTMLElement | null>(null)
</script>

<template>
  <!-- The parent must be positioned; DzBeam fills it (aria-hidden, non-interactive). -->
  <div style="position: relative">
    <DzBeam :from="hub" :to="node" :curvature="38" />
    <!-- Ref the DOM wrappers, not the components, so DzBeam gets real elements. -->
    <div ref="hub"><DzCard variant="elevated" padding="sm">Core</DzCard></div>
    <div ref="node"><DzAvatar fallback="AL" alt="Ada Lovelace" /></div>
  </div>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/AnimatedBeamDemo.vue')),
  },
  {
    id: 'orbiting-icons',
    title: 'Orbiting icons',
    category: 'connections',
    type: 'component',
    blurb: 'Avatars and badges orbit a central hub on one or more slow-spinning rings.',
    components: ['DzAvatar', 'DzBadge'],
    code: `<script setup lang="ts">
import { DzAvatar, DzBadge, DzCard } from '@dzup-ui/core'
import { DzOrbit } from '../motion'
</script>

<template>
  <!-- Slotted items spread across the rings and stay upright as they orbit.
       The decorative tracks are aria-hidden; the items stay accessible. -->
  <DzOrbit :radius="52" :ring-gap="38" :rings="2" speed="26s">
    <template #center>
      <DzCard variant="elevated" padding="sm">dzup</DzCard>
    </template>
    <DzAvatar fallback="AL" alt="Ada Lovelace" size="sm" />
    <DzBadge variant="solid" tone="primary">UI</DzBadge>
    <DzAvatar fallback="GH" alt="Grace Hopper" size="sm" />
    <DzBadge variant="subtle" tone="info">API</DzBadge>
  </DzOrbit>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/OrbitingIconsDemo.vue')),
  },
  {
    id: 'morphing-dialog',
    title: 'Morphing dialog',
    category: 'surfaces',
    type: 'component',
    blurb: 'A card expands into a dialog sharing its box — morphs via View Transitions, FLIPs otherwise.',
    components: ['DzMorph', 'DzCard', 'DzDialog'],
    native: { api: 'View Transitions', supports: 'feature-detected; FLIP fallback' },
    code: `<script setup lang="ts">
import { DzCard, DzDialogTitle, DzDialogDescription, DzButton } from '@dzup-ui/core'
import { DzMorph, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- DzMorph drives core's DzDialog through its public v-model:open API (no fork).
       Where View Transitions exist, the trigger card and the dialog panel share a
       view-transition-name so the browser morphs one box into the other; otherwise
       a FLIP plays the same morph; reduced motion → instant. Reka keeps the focus
       trap + Esc + light-dismiss; DzMorph intercepts the close so the morph-out
       runs first. -->
  <DzMorph size="md" aria-label="Project Atlas details" :disabled="reduced">
    <template #trigger="{ expand, expanded }">
      <DzCard clickable aria-haspopup="dialog" :aria-expanded="expanded" @click="expand">
        Project Atlas — 8 collaborators
      </DzCard>
    </template>
    <template #default="{ collapse }">
      <DzDialogTitle>Project Atlas</DzDialogTitle>
      <DzDialogDescription>A shared workspace for the team.</DzDialogDescription>
      <DzButton tone="primary" @click="collapse">Done</DzButton>
    </template>
  </DzMorph>
</template>`,
    // The component is the drop-in; the composable + CSS forms show the native
    // View Transitions plumbing underneath for those who want to wire it by hand.
    variants: {
      sfc: `<script setup lang="ts">
import { DzCard, DzDialogTitle, DzButton } from '@dzup-ui/core'
import { DzMorph, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <DzMorph size="md" aria-label="Project Atlas details" :disabled="reduced">
    <template #trigger="{ expand, expanded }">
      <DzCard clickable :aria-expanded="expanded" @click="expand">Project Atlas</DzCard>
    </template>
    <template #default="{ collapse }">
      <DzDialogTitle>Project Atlas</DzDialogTitle>
      <DzButton tone="primary" @click="collapse">Done</DzButton>
    </template>
  </DzMorph>
</template>`,
      composable: `<script setup lang="ts">
import { ref } from 'vue'
import { startViewTransition, supportsViewTransitions, useReducedMotion } from '../motion'

const open = ref(false)
const reduced = useReducedMotion()

// Toggle inside startViewTransition so the browser snapshots before/after and
// morphs the shared view-transition-name boxes; instant when unsupported/reduced.
function toggle() {
  if (!supportsViewTransitions() || reduced.value) { open.value = !open.value; return }
  startViewTransition(() => { open.value = !open.value })
}
</script>

<template>
  <button v-if="!open" style="view-transition-name: atlas" @click="toggle">Project Atlas</button>
  <div v-else class="panel" style="view-transition-name: atlas" @click="toggle">Project Atlas — details</div>
</template>`,
      css: `/* The trigger and the panel share one view-transition-name, so the browser
   morphs one box into the other. Gate the custom timing under no-preference so
   reduced motion gets the instant default cross-fade. UNSCOPED (::view-transition
   pseudos live on :root). */
.atlas { view-transition-name: atlas; }

@media (prefers-reduced-motion: no-preference) {
  ::view-transition-group(atlas) {
    animation-duration: var(--dz-duration-normal);
    animation-timing-function: var(--dz-ease-emphasis, var(--dz-ease-out));
  }
}`,
    },
    demo: defineAsyncComponent(() => import('./demos/MorphingDialogDemo.vue')),
  },
  {
    id: 'dynamic-island',
    title: 'Dynamic island',
    category: 'surfaces',
    type: 'component',
    blurb: 'A compact pill morphs to reveal expanded content and back; sizes via interpolate-size, FLIPs otherwise.',
    components: ['DzIsland', 'DzBadge', 'DzCard'],
    native: { api: 'interpolate-size + @starting-style', supports: 'feature-detected; FLIP fallback' },
    code: `<script setup lang="ts">
import { DzIsland, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- DzIsland sizes the morph with interpolate-size: allow-keywords (a true
       width/height → auto transition) where supported, and a FLIP fallback
       elsewhere; the expanded content fades + rises in via @starting-style.
       Reduced motion → instant expand/collapse. The expanded state is announced
       politely to assistive tech via a persistent aria-live region. -->
  <DzIsland :disabled="reduced" announce="Now playing: Midnight Pulse. Controls available.">
    <template #pill="{ expanded }">
      <span class="pill">Now playing {{ expanded ? '· tap to close' : '' }}</span>
    </template>
    <template #default>
      <!-- …track + playback controls… -->
    </template>
  </DzIsland>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/DynamicIslandDemo.vue')),
  },
  {
    id: 'native-popover-entrance',
    title: 'Native popover entrance',
    category: 'surfaces',
    type: 'component',
    blurb: 'A menu/tooltip opens via the Popover API, animating in from @starting-style; <Transition> fallback.',
    components: ['DzNativePopover', 'DzMenu', 'DzTooltip'],
    native: { api: 'Popover API + @starting-style', supports: 'feature-detected; <Transition> fallback' },
    code: `<script setup lang="ts">
import { DzMenu, DzMenuItem } from '@dzup-ui/core'
import { DzNativePopover, useReducedMotion } from '../motion'

const reduced = useReducedMotion()
</script>

<template>
  <!-- DzNativePopover renders a popovertarget trigger + a [popover] panel, so the
       browser owns light-dismiss, Esc and top-layer stacking. The entrance animates
       from @starting-style with transition-behavior: allow-discrete (the exit plays
       too) behind @supports; where the Popover API is absent it falls back to a
       <Transition> with re-added Esc + outside-click. Reduced motion → instant. -->
  <DzNativePopover aria-label="Document actions" :disabled="reduced">
    <template #trigger>
      <span class="trigger">Actions</span>
    </template>
    <template #default="{ close }">
      <DzMenu aria-label="Document actions" size="sm">
        <DzMenuItem @click="close()">Edit</DzMenuItem>
        <DzMenuItem @click="close()">Share</DzMenuItem>
        <DzMenuItem @click="close()">Delete</DzMenuItem>
      </DzMenu>
    </template>
  </DzNativePopover>
</template>`,
    demo: defineAsyncComponent(() => import('./demos/NativePopoverDemo.vue')),
  },
]
