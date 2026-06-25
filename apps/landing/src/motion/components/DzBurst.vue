<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { onBeforeUnmount, ref, watch } from 'vue'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzBurst — a tactile "pop + spark" for affordance toggles like a like/favourite
 * (docs/animations.md §6.9, effect 36). Wrap the toggle control in the default
 * slot and pass the toggle's boolean to `active`; on the rising edge (false → true)
 * the slot overshoots in scale while a ring of colour spokes radiates outward and
 * fades. The `.dz-burst` motion is owned by `tokens.css`; this component drives the
 * pop window and spawns/cleans the spark spokes.
 *
 * Under reduced motion (OS or the page-level toggle) the pop and sparks are skipped
 * — the wrapped control's own pressed/colour state carries the change.
 */
const props = withDefaults(
  defineProps<{
    /** The toggle's state — a false → true transition fires the burst. */
    active: boolean
    /** Number of spark spokes. */
    spokes?: number
  }>(),
  { spokes: 8 },
)

const reduced = useReducedMotion()

interface Spark {
  id: number
  style: CSSProperties
}

const popping = ref(false)
const sparks = ref<Spark[]>([])
const timers = new Set<ReturnType<typeof setTimeout>>()
let seq = 0

// Warm spark palette (rose + amber) so the spokes read distinctly from the core.
const SPARK_COLORS = ['var(--dz-danger, #ef4444)', 'var(--dz-warning, #f59e0b)']

function fire(): void {
  if (reduced.value) return

  popping.value = true
  const batch: Spark[] = []
  for (let i = 0; i < props.spokes; i += 1) {
    const angle = (i / props.spokes) * Math.PI * 2 + (Math.random() - 0.5) * 0.3
    const distance = 22 + Math.random() * 10
    batch.push({
      id: (seq += 1),
      style: {
        '--tx': `${(Math.cos(angle) * distance).toFixed(1)}px`,
        '--ty': `${(Math.sin(angle) * distance).toFixed(1)}px`,
        '--c': SPARK_COLORS[i % SPARK_COLORS.length],
      } as CSSProperties,
    })
  }
  sparks.value = batch

  const timer = setTimeout(() => {
    popping.value = false
    sparks.value = []
    timers.delete(timer)
  }, 600)
  timers.add(timer)
}

watch(
  () => props.active,
  (now, prev) => {
    if (now && !prev) fire()
  },
)

onBeforeUnmount(() => {
  timers.forEach((t) => clearTimeout(t))
  timers.clear()
})
</script>

<template>
  <span
    class="dz-burst"
    :class="{ 'dz-burst--pop': popping, 'dz-burst--reduced': reduced }"
  >
    <span class="dz-burst__core">
      <slot />
    </span>
    <span
      v-for="spark in sparks"
      :key="spark.id"
      class="dz-burst__spark"
      :style="spark.style"
      aria-hidden="true"
    />
  </span>
</template>
