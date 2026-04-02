<script setup lang="ts">
import type { DzProgressProps, DzProgressSlots } from './DzProgress.types.ts'
/**
 * DzProgress — Visual indicator of task completion.
 *
 * Supports bar and circular variants, five sizes,
 * six tones, and indeterminate state.
 *
 * @example
 * ```vue
 * <DzProgress :value="75" tone="success" />
 * <DzProgress variant="circular" :value="50" size="lg" />
 * <DzProgress indeterminate />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import {
  circularSizeMap,
  progressBarVariants,
  progressTrackVariants,
} from './DzProgress.variants.ts'

const props = withDefaults(defineProps<DzProgressProps>(), {
  value: 0,
  max: 100,
  variant: 'bar',
  size: 'md',
  tone: 'primary',
  indeterminate: false,
})

defineSlots<DzProgressSlots>()

const attrs = useAttrs()

/** Clamped percentage value */
const percentage = computed(() => {
  if (props.indeterminate)
    return 0
  const clamped = Math.min(Math.max(props.value, 0), props.max)
  return Math.round((clamped / props.max) * 100)
})

/** Track classes for bar variant */
const trackClasses = computed(() =>
  cn(
    progressTrackVariants({ size: props.size }),
    attrs.class as string | undefined,
  ),
)

/** Bar fill classes */
const barClasses = computed(() =>
  progressBarVariants({ tone: props.tone, indeterminate: props.indeterminate }),
)

/** Circular SVG dimensions */
const circularConfig = computed(() => {
  const config = (circularSizeMap[props.size] ?? circularSizeMap.md) as { size: number, strokeWidth: number }
  const radius = (config.size - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  return { size: config.size, strokeWidth: config.strokeWidth, radius, circumference }
})

/** Circular stroke-dashoffset for current percentage */
const circularOffset = computed(() => {
  if (props.indeterminate)
    return circularConfig.value.circumference * 0.75
  return circularConfig.value.circumference * (1 - percentage.value / 100)
})

/** Tone-to-CSS-var mapping for SVG stroke */
const toneColorVar = computed(() => {
  const map: Record<string, string> = {
    neutral: 'var(--dz-foreground)',
    primary: 'var(--dz-primary)',
    success: 'var(--dz-success)',
    warning: 'var(--dz-warning)',
    danger: 'var(--dz-danger)',
    info: 'var(--dz-info)',
  }
  return map[props.tone] ?? map.primary
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    v-if="variant === 'bar'"
    :id="id"
    :class="trackClasses"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : percentage"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="ariaLabel ?? 'Progress'"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-tone="tone"
    :data-state="indeterminate ? 'indeterminate' : 'determinate'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div
      :class="barClasses"
      :style="{ width: indeterminate ? '50%' : `${percentage}%` }"
    />
    <slot :value="value" :max="max" :percentage="percentage" />
  </div>

  <div
    v-else
    :id="id"
    :class="cn('inline-flex items-center justify-center', $attrs.class as string | undefined)"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : percentage"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="ariaLabel ?? 'Progress'"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-tone="tone"
    :data-state="indeterminate ? 'indeterminate' : 'determinate'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <svg
      :width="circularConfig.size"
      :height="circularConfig.size"
      :class="{ 'animate-spin': indeterminate }"
      :viewBox="`0 0 ${circularConfig.size} ${circularConfig.size}`"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        :cx="circularConfig.size / 2"
        :cy="circularConfig.size / 2"
        :r="circularConfig.radius"
        stroke="var(--dz-muted)"
        :stroke-width="circularConfig.strokeWidth"
        fill="none"
      />
      <circle
        :cx="circularConfig.size / 2"
        :cy="circularConfig.size / 2"
        :r="circularConfig.radius"
        :stroke="toneColorVar"
        :stroke-width="circularConfig.strokeWidth"
        fill="none"
        stroke-linecap="round"
        :stroke-dasharray="circularConfig.circumference"
        :stroke-dashoffset="circularOffset"
        :style="{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }"
      />
    </svg>
    <slot :value="value" :max="max" :percentage="percentage" />
  </div>
</template>

<style scoped>
@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .animate-progress-indeterminate {
    animation: none;
  }

  .animate-spin {
    animation: none;
  }
}
</style>
