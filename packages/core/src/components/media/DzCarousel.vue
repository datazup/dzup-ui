<script setup lang="ts">
import type {
  DzCarouselContext,
  DzCarouselEmits,
  DzCarouselProps,
  DzCarouselSlots,
} from './DzCarousel.types.ts'
/**
 * DzCarousel — Image/content carousel with autoplay and navigation.
 *
 * Built from scratch. Provides context to child components via
 * DZ_CAROUSEL_KEY injection (ADR-08). v-model via defineModel (ADR-16).
 *
 * @example
 * ```vue
 * <DzCarousel v-model="activeSlide" autoplay :interval="3000" loop>
 *   <DzCarouselSlide>Slide 1</DzCarouselSlide>
 *   <DzCarouselSlide>Slide 2</DzCarouselSlide>
 *   <DzCarouselPrevious />
 *   <DzCarouselNext />
 *   <DzCarouselDots />
 * </DzCarousel>
 * ```
 */
import { computed, onBeforeUnmount, onMounted, provide, ref, toRef, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_CAROUSEL_KEY } from './DzCarousel.types.ts'
import { carouselVariants } from './DzCarousel.variants.ts'

const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<DzCarouselProps>(), {
  orientation: 'horizontal',
  autoplay: false,
  interval: 5000,
  loop: false,
  size: 'md',
  disabled: false,
})

const emit = defineEmits<DzCarouselEmits>()
defineSlots<DzCarouselSlots>()

const attrs = useAttrs()
const slideCount = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

const canPrev = computed(() => props.loop || model.value > 0)
const canNext = computed(() => props.loop || model.value < slideCount.value - 1)

function goTo(index: number): void {
  if (props.disabled)
    return
  let resolved = index
  if (props.loop) {
    if (resolved < 0)
      resolved = slideCount.value - 1
    if (resolved >= slideCount.value)
      resolved = 0
  }
  else {
    resolved = Math.max(0, Math.min(resolved, slideCount.value - 1))
  }
  model.value = resolved
  emit('slideChange', resolved)
}

function prev(): void {
  goTo(model.value - 1)
}

function next(): void {
  goTo(model.value + 1)
}

function registerSlide(): () => void {
  slideCount.value++
  return () => {
    slideCount.value--
  }
}

function startAutoplay(): void {
  stopAutoplay()
  if (props.autoplay && props.interval > 0) {
    autoplayTimer = setInterval(() => next(), props.interval)
  }
}

function stopAutoplay(): void {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

watch(() => props.autoplay, (val) => {
  if (val)
    startAutoplay()
  else stopAutoplay()
})

onMounted(() => {
  if (props.autoplay)
    startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})

const context: DzCarouselContext = {
  slideCount,
  activeIndex: model,
  orientation: toRef(() => props.orientation),
  size: toRef(() => props.size),
  loop: toRef(() => props.loop),
  goTo,
  prev,
  next,
  registerSlide,
  canPrev,
  canNext,
}

provide(DZ_CAROUSEL_KEY, context)

const styles = computed(() =>
  carouselVariants({ orientation: props.orientation, size: props.size }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :aria-label="ariaLabel ?? 'Carousel'"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    aria-roledescription="carousel"
    role="region"
    :data-disabled="disabled ? '' : undefined"
    :data-state="slideCount > 0 ? 'ready' : 'empty'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @mouseenter="stopAutoplay"
    @mouseleave="autoplay ? startAutoplay() : undefined"
  >
    <div aria-live="polite" :class="styles.viewport()">
      <div
        :class="styles.container()"
        :style="{
          transform: orientation === 'horizontal'
            ? `translateX(-${model * 100}%)`
            : `translateY(-${model * 100}%)`,
        }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .transition-transform {
    transition: none !important;
  }
}
</style>
