<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Hero from '../components/Hero.vue'
import LazySection from '../components/LazySection.vue'
import { vReveal } from '../motion/index.ts'

/**
 * The PRE-v2 home page, preserved verbatim (docs/landing-v2.md TASK-LV2-01).
 *
 * This is the composition `/` rendered before the Depth & Play redesign. It is
 * kept reachable at `/classic` (noindex, absent from the sitemap and the nav)
 * so v2 can be compared against it and, if v2 does not suit, reverted by
 * pointing the home route back at this file. It must keep importing the v1
 * section components in `../components/` — v2 sections live in
 * `../components/home/` and never replace these files.
 *
 * The hero is the only eagerly-imported section (TASK-FREE3-04).
 *
 * Everything below it is `defineAsyncComponent` + `LazySection`, so it leaves the
 * entry chunk and mounts only when scrolled near. Previously all ten sections were
 * static imports mounted in one synchronous pass, so the browser downloaded and
 * Vue mounted nine below-the-fold sections before the hero could paint.
 *
 * What this actually bought, measured (Lighthouse mobile, medians of 3 interleaved
 * runs) — worth being precise, because the obvious guess is wrong:
 *   • TBT on `/` 487ms → 197ms. That is the real win: it crosses the 300ms budget.
 *   • Entry chunk 158 kB → 135 kB gzip.
 *   • LCP on `/`: between 0 and -130ms depending on the run. Essentially flat.
 *
 * LCP barely moved because it is gated by FCP (~2.26s), and FCP is gated by the
 * whole 226 kB-gzip critical path rather than by these sections — deferring work
 * that happens AFTER first paint cannot bring first paint forward. See the
 * `//lcp-why-not-2500` note in lighthouserc.mobile.json.
 *
 * `minHeight` per section reserves roughly the right space so the page does not
 * collapse; see LazySection for why this costs no layout shift.
 */
const ShowcaseDashboard = defineAsyncComponent(() => import('../components/ShowcaseDashboard.vue'))
const FeatureGrid = defineAsyncComponent(() => import('../components/FeatureGrid.vue'))
const ThemingDemo = defineAsyncComponent(() => import('../components/ThemingDemo.vue'))
const ComponentGallery = defineAsyncComponent(() => import('../components/ComponentGallery.vue'))
const EcosystemGrid = defineAsyncComponent(() => import('../components/EcosystemGrid.vue'))
const SocialProof = defineAsyncComponent(() => import('../components/SocialProof.vue'))
const HomeTestimonials = defineAsyncComponent(() => import('../components/HomeTestimonials.vue'))
const FreeVsPro = defineAsyncComponent(() => import('../components/FreeVsPro.vue'))
const CommunityCTA = defineAsyncComponent(() => import('../components/CommunityCTA.vue'))
</script>

<template>
  <Hero />
  <div v-reveal>
    <LazySection :component="ShowcaseDashboard" min-height="720px" />
  </div>
  <div v-reveal>
    <LazySection :component="FeatureGrid" min-height="560px" />
  </div>
  <div v-reveal>
    <LazySection :component="ThemingDemo" min-height="640px" />
  </div>
  <div v-reveal>
    <LazySection :component="ComponentGallery" min-height="720px" />
  </div>
  <div id="ecosystem" v-reveal>
    <LazySection :component="EcosystemGrid" min-height="560px" />
  </div>
  <div v-reveal>
    <LazySection :component="SocialProof" min-height="400px" />
  </div>
  <!-- Renders nothing until `TESTIMONIALS` in config.ts holds real, cleared quotes. -->
  <div v-reveal>
    <LazySection :component="HomeTestimonials" min-height="0px" />
  </div>
  <div v-reveal>
    <LazySection :component="FreeVsPro" min-height="640px" />
  </div>
  <div v-reveal>
    <LazySection :component="CommunityCTA" min-height="360px" />
  </div>
</template>
