<script setup lang="ts">
import type { DzCarouselDotsProps, DzCarouselDotsSlots } from './DzCarousel.types.ts'
/**
 * DzCarouselDots — Dot indicators for carousel navigation.
 *
 * Injects context from parent DzCarousel (ADR-08).
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_CAROUSEL_KEY } from './DzCarousel.types.ts'
import { carouselVariants } from './DzCarousel.variants.ts'

defineProps<DzCarouselDotsProps>()
defineSlots<DzCarouselDotsSlots>()

const attrs = useAttrs()
const carouselContext = inject(DZ_CAROUSEL_KEY, null)

const styles = computed(() =>
  carouselVariants({
    orientation: carouselContext?.orientation.value ?? 'horizontal',
    size: carouselContext?.size.value ?? 'md',
  }),
)

const dotsClasses = computed(() =>
  cn(styles.value.dots(), attrs.class as string | undefined),
)

const slideIndices = computed(() =>
  Array.from({ length: carouselContext?.slideCount.value ?? 0 }, (_, i) => i),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="dotsClasses"
    role="tablist"
    aria-label="Slide navigation"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <button
      v-for="index in slideIndices"
      :key="index"
      type="button"
      role="tab"
      :aria-selected="index === carouselContext?.activeIndex.value"
      :aria-label="`Go to slide ${index + 1}`"
      :class="cn(
        styles.dot(),
        index === carouselContext?.activeIndex.value ? styles.dotActive() : '',
      )"
      @click="carouselContext?.goTo(index)"
    >
      <slot :index="index" :active="index === carouselContext?.activeIndex.value" />
    </button>
  </div>
</template>
