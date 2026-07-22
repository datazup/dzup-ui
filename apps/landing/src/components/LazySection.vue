<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { useLazyMount } from '../composables/useLazyMount.ts'

/**
 * LazySection — viewport-gated mount for a below-the-fold page section
 * (TASK-FREE3-04).
 *
 * The home page eagerly imported and mounted nine below-the-fold sections
 * (ShowcaseDashboard, FeatureGrid, ThemingDemo, ComponentGallery, EcosystemGrid,
 * SocialProof, testimonials, FreeVsPro, CommunityCTA). Two costs followed:
 *
 *  1. **Entry weight.** All nine landed in the entry chunk, so the browser
 *     downloaded and parsed every one of them before it could paint the hero.
 *  2. **Mount cost.** Vue mounted the whole tree in one synchronous pass, so the
 *     hero's first paint waited on nine sections nobody had scrolled to yet.
 *     Measured mobile TBT on `/` was 577 ms.
 *
 * Mobile FCP was 2.26 s and LCP 2.73 s — and since LCP can never precede FCP,
 * no amount of below-the-fold trimming helps unless it shortens the *critical
 * path*. That is what this does: pass an async `component` and it stays out of
 * the entry chunk entirely, loading only once the section nears the viewport.
 *
 * **On layout shift:** the placeholder reserves `minHeight` so the page does not
 * collapse before the real section arrives. These sections all sit below a hero
 * that fills the viewport, so growth happens off-screen and never displaces
 * painted pixels — but the reservation keeps the scrollbar honest and protects
 * the CLS gate (hard-asserted at 0.1) if the hero ever shortens. `useLazyMount`
 * renders eagerly when IntersectionObserver is missing, so content is never
 * withheld.
 */
const props = withDefaults(
  defineProps<{
    /** Usually a `defineAsyncComponent(() => import('...'))`. */
    component: Component
    /**
     * Height to reserve before the section mounts. A rough approximation is
     * enough — it only has to stop the page collapsing, not match exactly.
     */
    minHeight?: string
  }>(),
  { minHeight: '480px' },
)

const { setEl, shouldRender } = useLazyMount()

const placeholderStyle = computed(() => ({ minHeight: props.minHeight }))
</script>

<template>
  <div :ref="setEl">
    <component :is="props.component" v-if="shouldRender" />
    <!-- Height-reserving placeholder. Purely structural: no chrome, nothing to
         announce, so it is hidden from assistive tech. -->
    <div v-else :style="placeholderStyle" aria-hidden="true" />
  </div>
</template>
