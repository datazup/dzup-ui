<script setup lang="ts">
import type { DzCarouselDotsProps, DzCarouselDotsSlots } from './DzCarousel.types.ts'
/**
 * DzCarouselDots — Dot indicators for carousel navigation.
 *
 * Injects context from parent DzCarousel (ADR-08).
 */
import { computed, inject, useAttrs } from 'vue'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_CAROUSEL_KEY } from './DzCarousel.types.ts'
import { carouselVariants } from './DzCarousel.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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

// User-visible strings, resolved against the application's catalog (ADR-20).
const dzMessages = useComponentMessages('DzCarouselDots')
</script>

<template>
  <div
    :class="dotsClasses"
    role="tablist"
    :aria-label="dzMessages.slideNavigation"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <button
      v-for="index in slideIndices"
      :key="index"
      type="button"
      role="tab"
      :aria-selected="index === carouselContext?.activeIndex.value"
      :aria-label="`Go to slide ${index + 1}`"
      :class="styles.dotButton()"
      @click="carouselContext?.goTo(index)"
    >
      <!-- The button is the ≥24px touch target; the visible dot is this inner
           span (also the default slot content, so custom dots keep the hit area). -->
      <slot :index="index" :active="index === carouselContext?.activeIndex.value">
        <span
          :class="cn(
            styles.dot(),
            index === carouselContext?.activeIndex.value ? styles.dotActive() : '',
          )"
        />
      </slot>
    </button>
  </div>
</template>
