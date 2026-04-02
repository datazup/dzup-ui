<script setup lang="ts">
import type { DzCarouselNavProps, DzCarouselNavSlots } from './DzCarousel.types.ts'
/**
 * DzCarouselNext — Next slide navigation button.
 *
 * Injects context from parent DzCarousel (ADR-08).
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_CAROUSEL_KEY } from './DzCarousel.types.ts'
import { carouselVariants } from './DzCarousel.variants.ts'

defineProps<DzCarouselNavProps>()
defineSlots<DzCarouselNavSlots>()

const attrs = useAttrs()
const carouselContext = inject(DZ_CAROUSEL_KEY, null)

const styles = computed(() =>
  carouselVariants({
    orientation: carouselContext?.orientation.value ?? 'horizontal',
    size: carouselContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.navButton(), styles.value.navNext(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <button
    type="button"
    :class="classes"
    :disabled="!carouselContext?.canNext.value"
    aria-label="Next slide"
    v-bind="{ ...$attrs, class: undefined }"
    @click="carouselContext?.next()"
  >
    <slot>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </slot>
  </button>
</template>
