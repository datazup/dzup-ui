<script setup lang="ts">
import type { DzCarouselSlideProps, DzCarouselSlideSlots } from './DzCarousel.types.ts'
/**
 * DzCarouselSlide — Single slide within a DzCarousel.
 *
 * Registers itself with the parent carousel context on mount (ADR-08).
 */
import { computed, inject, onBeforeUnmount, onMounted, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_CAROUSEL_KEY } from './DzCarousel.types.ts'
import { carouselVariants } from './DzCarousel.variants.ts'

defineProps<DzCarouselSlideProps>()
defineSlots<DzCarouselSlideSlots>()

const attrs = useAttrs()
const carouselContext = inject(DZ_CAROUSEL_KEY, null)

let unregister: (() => void) | null = null

onMounted(() => {
  if (carouselContext) {
    unregister = carouselContext.registerSlide()
  }
})

onBeforeUnmount(() => {
  unregister?.()
})

const styles = computed(() =>
  carouselVariants({
    orientation: carouselContext?.orientation.value ?? 'horizontal',
    size: carouselContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.slide(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="classes"
    role="group"
    aria-roledescription="slide"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
