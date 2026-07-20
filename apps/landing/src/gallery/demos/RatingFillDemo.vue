<script setup lang="ts">
import { DzRating, DzText } from '@dzup-ui/core'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useInView, useReducedMotion } from '../../motion/index.ts'

/**
 * Rating fill demo (catalog `rating-fill`, effect 14) — a small wrapper that
 * drives a read-only {@link DzRating} model from 0 to its target star-by-star
 * once the stage scrolls into view (half a star every {@link STEP_MS}).
 *
 * Under reduced motion (OS or the page-level toggle) the model jumps straight to
 * the final rating — no stepping. Replay re-mounts the demo to re-trigger.
 */
const TARGET = 4.5
const STEP = 0.5
const STEP_MS = 140

const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()

const rating = ref(0)
let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer(): void {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

/** Add one (half-)star, then schedule the next until the target is reached. */
function fillStep(): void {
  if (rating.value >= TARGET) {
    clearTimer()
    return
  }
  rating.value = Math.min(TARGET, rating.value + STEP)
  timer = setTimeout(fillStep, STEP_MS)
}

watch(
  [inView, reduced],
  ([visible, isReduced]) => {
    if (isReduced) {
      clearTimer()
      rating.value = TARGET
    }
    else if (visible && rating.value === 0 && !timer) {
      fillStep()
    }
  },
  { immediate: true },
)

onBeforeUnmount(clearTimer)
</script>

<template>
  <div ref="root" class="stage">
    <DzText size="xs" tone="muted" as="div">
      Customer rating
    </DzText>
    <DzRating
      v-model:value="rating"
      :count="5"
      allow-half
      readonly
      size="lg"
      tone="warning"
      aria-label="Customer rating"
    />
    <DzText size="sm" weight="medium" as="div">
      {{ rating.toFixed(1) }} of 5
    </DzText>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}
</style>
