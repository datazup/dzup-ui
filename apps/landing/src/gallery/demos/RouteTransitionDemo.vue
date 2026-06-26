<script setup lang="ts">
import { DzButton, DzHeading, DzText } from '@dzup-ui/core'
import { ArrowLeftRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Route transition demo (catalog `route-transition`, effect 30) — a contained
 * illustration of the fade+slide that `App.vue` wraps `<router-view>` in: two
 * mock "pages" swap with the same `<Transition mode="out-in">` (outgoing lifts
 * out, incoming rises in). Replay (harness remount) resets to the first page.
 *
 * Under reduced motion (OS or the page toggle) the transition name switches to
 * one with no transform and a near-instant duration, so the swap is immediate —
 * mirroring the real route transition's reduced-motion fallback in App.vue.
 */
const pages = [
  { name: 'Home', eyebrow: 'index', body: 'Hero, ecosystem, social proof.' },
  { name: 'Pricing', eyebrow: '/pricing', body: 'Plans, FAQ and a checkout CTA.' },
] as const

const index = ref(0)
const current = computed(() => pages[index.value] ?? pages[0])

const reduced = useReducedMotion()
// Swap the transition name (not just the timing) so the slide transform is fully
// dropped under reduced motion — leaving a quick, transform-free opacity swap.
const transitionName = computed(() => (reduced.value ? 'route-demo-reduced' : 'route-demo'))

function swap(): void {
  index.value = (index.value + 1) % pages.length
}
</script>

<template>
  <div class="stage">
    <div class="frame">
      <Transition :name="transitionName" mode="out-in">
        <div :key="current.name" class="page">
          <DzText size="xs" tone="muted" as="div" class="eyebrow">{{ current.eyebrow }}</DzText>
          <DzHeading :level="4" size="lg" weight="bold">{{ current.name }}</DzHeading>
          <DzText size="sm" tone="muted" as="p" class="body">{{ current.body }}</DzText>
        </div>
      </Transition>
    </div>

    <DzButton size="sm" variant="outline" tone="neutral" @click="swap">
      <template #prefix>
        <ArrowLeftRight :size="14" aria-hidden="true" />
      </template>
      Navigate
    </DzButton>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}

/* A mock viewport: the transition is clipped to this frame so the slide reads. */
.frame {
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(280px, 100%);
  min-height: 132px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}

.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
}

.eyebrow {
  font-family: var(--dz-font-mono, monospace);
  letter-spacing: 0.04em;
}

.body {
  margin: 0;
  max-width: 32ch;
}

/* Fade + slide — transform/opacity only; tokens for duration/easing. */
.route-demo-enter-active,
.route-demo-leave-active {
  transition:
    opacity var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease),
    transform var(--dz-duration-normal, 200ms) var(--dz-ease-default, ease);
}

.route-demo-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.route-demo-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Reduced fallback: instant, transform-free swap. */
.route-demo-reduced-enter-active,
.route-demo-reduced-leave-active {
  transition: opacity 0.01ms linear;
}

.route-demo-reduced-enter-from,
.route-demo-reduced-leave-to {
  opacity: 0;
}
</style>
