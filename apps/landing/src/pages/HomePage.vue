<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import HeroV2 from '../components/home/HeroV2.vue'
import ScrollProgressBar from '../components/home/ScrollProgressBar.vue'
import LazySection from '../components/LazySection.vue'
import { vReveal } from '../motion/index.ts'

/**
 * The v2 "Depth & Play" home page (docs/landing-v2.md). The pre-v2 composition
 * is preserved verbatim at `/classic` (`HomeClassicPage.vue`, TASK-LV2-01) —
 * reverting v2 means pointing the home route back at that file.
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
 *
 * ## Motion choreography (TASK-LV2-09) — one entrance owner per section
 *
 * | Section                | Entrance owner            | Page wrapper       |
 * |------------------------|---------------------------|--------------------|
 * | HeroV2                 | itself (visual rise)      | none               |
 * | ShowcaseSection        | itself (scroll rise)      | plain              |
 * | FeatureBento           | DzBentoReveal cascade     | plain              |
 * | ThemingDemo (v1)       | page                      | v-reveal.up        |
 * | ComponentGallery (v1)  | page (+ tile stagger)     | v-reveal.up        |
 * | TemplateWall           | page                      | v-reveal.scale     |
 * | EcosystemConstellation | page (beams self-draw)    | v-reveal.blur      |
 * | StatsSection           | per-stat v-reveal.blur    | plain              |
 * | HomeTestimonials       | (renders nothing yet)     | plain              |
 * | FreeVsProV2            | page                      | v-reveal.up        |
 * | CommunityCTAV2         | page                      | v-reveal.up        |
 *
 * A section whose v2 component owns its entrance gets a PLAIN wrapper — a page
 * fade on top of a component cascade is the double-animation this table exists
 * to prevent. The 2px `ScrollProgressBar` is mounted here (home only), never in
 * the shared `TopNav`.
 */
const ShowcaseSection = defineAsyncComponent(() => import('../components/home/ShowcaseSection.vue'))
const FeatureBento = defineAsyncComponent(() => import('../components/home/FeatureBento.vue'))
const ThemingDemo = defineAsyncComponent(() => import('../components/ThemingDemo.vue'))
const ComponentGallery = defineAsyncComponent(() => import('../components/ComponentGallery.vue'))
const TemplateWall = defineAsyncComponent(() => import('../components/home/TemplateWall.vue'))
const EcosystemConstellation = defineAsyncComponent(() => import('../components/home/EcosystemConstellation.vue'))
const StatsSection = defineAsyncComponent(() => import('../components/home/StatsSection.vue'))
const HomeTestimonials = defineAsyncComponent(() => import('../components/HomeTestimonials.vue'))
const FreeVsProV2 = defineAsyncComponent(() => import('../components/home/FreeVsProV2.vue'))
const CommunityCTAV2 = defineAsyncComponent(() => import('../components/home/CommunityCTAV2.vue'))
</script>

<template>
  <ScrollProgressBar />
  <HeroV2 />
  <div>
    <LazySection :component="ShowcaseSection" min-height="720px" />
  </div>
  <div>
    <LazySection :component="FeatureBento" min-height="560px" />
  </div>
  <div v-reveal.up>
    <LazySection :component="ThemingDemo" min-height="640px" />
  </div>
  <div v-reveal.up>
    <LazySection :component="ComponentGallery" min-height="720px" />
  </div>
  <div v-reveal.scale>
    <LazySection :component="TemplateWall" min-height="640px" />
  </div>
  <div id="ecosystem" v-reveal.blur>
    <LazySection :component="EcosystemConstellation" min-height="560px" />
  </div>
  <div>
    <LazySection :component="StatsSection" min-height="400px" />
  </div>
  <!-- Renders nothing until `TESTIMONIALS` in config.ts holds real, cleared quotes. -->
  <div>
    <LazySection :component="HomeTestimonials" min-height="0px" />
  </div>
  <div v-reveal.up>
    <LazySection :component="FreeVsProV2" min-height="640px" />
  </div>
  <div v-reveal.up>
    <LazySection :component="CommunityCTAV2" min-height="360px" />
  </div>
</template>
