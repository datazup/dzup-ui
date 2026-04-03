<script setup lang="ts">
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
import { cn } from '../../utilities/cn.ts'
import { spinnerVariants } from './DzSpinner.variants.ts'

const props = withDefaults(defineProps<DzSpinnerProps>(), {
  size: 'md',
  tone: 'primary',
  label: 'Loading',
})

const attrs = useAttrs()

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    spinnerVariants({ size: props.size, tone: props.tone }),
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <span
    role="status"
    :aria-label="label"
    data-state="loading"
    :data-tone="tone"
    v-bind="{ ...$attrs, class: undefined }"
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

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation: none;
  }
}
</style>
