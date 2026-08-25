<script setup lang="ts">
import { computed } from 'vue'
import { useDocumentScrollProgress } from '../../motion/index.ts'

/**
 * ScrollProgressBar — the 2px reading thread across the top of the home page
 * (docs/landing-v2.md TASK-LV2-09).
 *
 * Mounted by `HomePage` only — it is route-scoped by construction; `/classic`
 * and every other route never see it (the shared `TopNav` is untouched).
 *
 * Contracts: `aria-hidden` + `pointer-events: none` (pure decoration — the
 * scrollbar remains the accessible affordance); transform-only (`scaleX` from
 * `useDocumentScrollProgress`, rAF-throttled); NO transition — the bar tracks
 * scroll position directly, so under reduced motion there is no tween to
 * remove (scroll-linked position is user-driven, not animation; the module's
 * "static-jump" convention).
 */
const progress = useDocumentScrollProgress()

const style = computed(() => ({ transform: `scaleX(${progress.value})` }))
</script>

<template>
  <div class="scroll-thread" aria-hidden="true" :style="style" />
</template>

<style scoped>
.scroll-thread {
  position: fixed;
  top: 0;
  inset-inline: 0;
  height: 2px;
  z-index: 60;
  pointer-events: none;
  transform-origin: 0 50%;
  background: linear-gradient(90deg, var(--lp-brand), var(--lp-brand-2));
}
</style>
