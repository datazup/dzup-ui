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
  /** Copy-pasteable usage snippet revealed by "View code". */
  code: string
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
</template>`,
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
    code: `<script setup lang="ts">
// In App.vue — wrap <router-view> in a <Transition>. Key by path so it fires on
// route changes (not in-page hash nav); out-in lets scrollBehavior land cleanly.
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <Transition name="route" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>

<style scoped>
/* Fade + short vertical slide; transform/opacity only, tokens for timing. */
.route-enter-active,
.route-leave-active {
  transition:
    opacity var(--dz-duration-normal) var(--dz-ease-default),
    transform var(--dz-duration-normal) var(--dz-ease-default);
}
.route-enter-from { opacity: 0; transform: translateY(8px); }
.route-leave-to { opacity: 0; transform: translateY(-8px); }

/* Reduced motion → instant opacity swap, no slide. */
@media (prefers-reduced-motion: reduce) {
  .route-enter-active,
  .route-leave-active { transition-duration: 0.01ms; }
  .route-enter-from,
  .route-leave-to { transform: none; }
}
</style>`,
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
   toggle here so the height sweep collapses to an instant open/close. */
.reduced :deep(.acc-content) { animation-duration: 0.01ms !important; }
</style>`,
    demo: defineAsyncComponent(() => import('./demos/AccordionHeightDemo.vue')),
  },
]
