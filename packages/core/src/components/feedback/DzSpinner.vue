<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { DzSpinnerProps } from './DzSpinner.types.ts'
/**
 * DzSpinner — Loading indicator with rotating animation.
 *
 * Supports five sizes and six semantic tones.
 * Includes visually hidden text for screen readers.
 *
 * @example
 * ```vue
 * <DzSpinner />
 * <DzSpinner size="lg" tone="success" label="Saving..." />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { spinnerVariants } from './DzSpinner.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzSpinnerProps>(), {
  size: undefined,
  tone: undefined,
  label: 'Loading',
})

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Each axis keeps the literal it carried in `withDefaults` as `resolve`'s last
 * link, so an unprovided tree renders exactly what it rendered before.
 */
const { resolve } = useDzDefaults()

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzSpinner', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzSpinner', 'tone', [props.tone]) ?? 'primary',
)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    spinnerVariants({ size: resolvedSize.value, tone: resolvedTone.value }),
    attrs.class as string | undefined,
  ),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <span
    role="status"
    data-part="root"
    :aria-label="label"
    data-state="loading"
    :data-tone="resolvedTone"
    v-bind="{ ...dzTestId('dz-spinner'), ...$attrs, class: undefined }"
  >
    <svg
      :class="classes"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <!-- Visually hidden label for screen readers -->
    <span class="sr-only">{{ label }}</span>
  </span>
</template>
