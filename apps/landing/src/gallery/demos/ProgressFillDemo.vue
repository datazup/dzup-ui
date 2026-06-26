<script setup lang="ts">
import { DzProgress, DzText } from '@dzup-ui/core'
import { computed, ref } from 'vue'
import { useInView, useReducedMotion } from '../../motion/index.ts'

/**
 * Progress fill demo (catalog `progress-fill`, effect 13) — a small wrapper that
 * ramps each {@link DzProgress} value from 0 to its target the moment the stage
 * scrolls into view (core's bar already carries the width transition, so this
 * only flips the value — no tween re-implementation).
 *
 * Under reduced motion (OS or the page-level toggle) the values resolve to their
 * targets from the first render, so the bars show their final fill at once with
 * no animated sweep. Replay re-mounts the demo to re-trigger.
 */
const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()

/** Filled once in view; immediately filled (no sweep) under reduced motion. */
const filled = computed(() => reduced.value || inView.value)

const metrics: { label: string, target: number, tone: 'primary' | 'success' | 'info' }[] = [
  { label: 'Coverage', target: 92, tone: 'success' },
  { label: 'Bundle budget', target: 64, tone: 'primary' },
  { label: 'A11y score', target: 100, tone: 'info' },
]
</script>

<template>
  <div ref="root" class="stage">
    <div v-for="m in metrics" :key="m.label" class="row">
      <div class="label">
        <DzText size="xs" tone="muted" as="span">{{ m.label }}</DzText>
        <DzText size="xs" weight="medium" as="span">{{ filled ? m.target : 0 }}%</DzText>
      </div>
      <DzProgress
        :value="filled ? m.target : 0"
        :max="100"
        :tone="m.tone"
        size="sm"
        :aria-label="m.label"
      />
    </div>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(320px, 100%);
}

.row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
</style>
