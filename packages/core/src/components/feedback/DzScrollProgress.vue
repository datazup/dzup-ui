<script setup lang="ts">
import type { DzScrollProgressEmits, DzScrollProgressProps, DzScrollProgressSlots } from './DzScrollProgress.types.ts'
/**
 * DzScrollProgress — Scroll-position progress indicator.
 *
 * A thin bar (or compact corner ring) pinned to the top or bottom of the
 * viewport that reflects how far a page or scroll container has been scrolled.
 * Built on the `useScrollProgress` composable (passive, rAF-throttled scroll
 * tracking with resize/content-change recomputation). The indicator is
 * decorative-supplementary: it exposes `role="progressbar"` with live value
 * semantics but never takes focus.
 *
 * @example
 * ```vue
 * <DzScrollProgress position="top" tone="primary" />
 * <DzScrollProgress variant="circular" :target="scrollEl" />
 * <DzScrollProgress v-slot="{ value }">{{ Math.round(value) }}%</DzScrollProgress>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useScrollProgress } from '../../composables/useScrollProgress/index.ts'
import { cn } from '../../utilities/cn.ts'
import {
  scrollProgressBarVariants,
  scrollProgressCircularSize,
  scrollProgressRootVariants,
  scrollProgressToneVar,
} from './DzScrollProgress.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzScrollProgressProps>(), {
  target: undefined,
  position: 'top',
  variant: 'bar',
  thickness: undefined,
  size: 'md',
  tone: 'primary',
  ariaLabel: 'Page scroll progress',
})

const emit = defineEmits<DzScrollProgressEmits>()
defineSlots<DzScrollProgressSlots>()

const attrs = useAttrs()

const { progress } = useScrollProgress({
  target: () => props.target ?? null,
  onChange: value => emit('change', value),
})

/** Integer 0–100 used for ARIA and the rendered fill. */
const valueNow = computed(() => Math.round(progress.value))

const rootClasses = computed(() =>
  cn(
    scrollProgressRootVariants({ variant: props.variant, position: props.position }),
    attrs.class as string | undefined,
  ),
)

/** Inline overrides: per-instance thickness for the bar variant. */
const rootStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.variant === 'bar' && props.thickness != null)
    style['--dz-scroll-progress-height'] = `${props.thickness}px`
  return style
})

const barClasses = computed(() => scrollProgressBarVariants({ tone: props.tone }))

// -- Circular variant geometry -------------------------------------------------

const circularDiameter = computed(() => scrollProgressCircularSize[props.size] ?? 44)
const circularStroke = computed(() => props.thickness ?? Math.max(2, Math.round(circularDiameter.value * 0.1)))
const circularRadius = computed(() => (circularDiameter.value - circularStroke.value) / 2)
const circularCircumference = computed(() => 2 * Math.PI * circularRadius.value)
const circularOffset = computed(() => circularCircumference.value * (1 - progress.value / 100))
const circularToneVar = computed(() => scrollProgressToneVar[props.tone] ?? 'var(--dz-primary)')
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :style="rootStyle"
    role="progressbar"
    :aria-valuenow="valueNow"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-tone="tone"
    :data-variant="variant"
    :data-position="position"
    data-component="dz-scroll-progress"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot :value="progress">
      <!-- Bar variant: a horizontal fill whose width tracks the percentage. -->
      <div
        v-if="variant === 'bar'"
        :class="barClasses"
        :style="{ width: `${valueNow}%` }"
      />

      <!-- Circular variant: a corner ring that fills as the reader scrolls. -->
      <svg
        v-else
        :width="circularDiameter"
        :height="circularDiameter"
        :viewBox="`0 0 ${circularDiameter} ${circularDiameter}`"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          :cx="circularDiameter / 2"
          :cy="circularDiameter / 2"
          :r="circularRadius"
          stroke="var(--dz-muted)"
          :stroke-width="circularStroke"
          fill="none"
        />
        <circle
          :cx="circularDiameter / 2"
          :cy="circularDiameter / 2"
          :r="circularRadius"
          :stroke="circularToneVar"
          :stroke-width="circularStroke"
          fill="none"
          stroke-linecap="round"
          :stroke-dasharray="circularCircumference"
          :stroke-dashoffset="circularOffset"
          :style="{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 150ms ease-out' }"
        />
      </svg>
    </slot>
  </div>
</template>
