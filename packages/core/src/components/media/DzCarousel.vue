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
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_CAROUSEL_KEY } from './DzCarousel.types.ts'
import { carouselVariants } from './DzCarousel.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** Zero-based index of the slide currently in view; defaults to `0`, the first slide. */
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

const dzDirection = useDzDirection()

/**
 * ArrowRight / ArrowLeft show the next and previous slide (RESIDUAL-13, closing
 * RESIDUAL-12 §4 `F7`).
 *
 * Both rows have been published as APG `carousel` with `rtl: 'mirrored'` since
 * TASK-R5-O5 and nothing implemented them: the root was a `role="region"` and a
 * slot, so a pointer user could move between slides with the previous/next
 * controls and a keyboard user had to tab to a button for every slide.
 *
 * Bound on the **root**, with no `tabindex` added to it. A carousel region is
 * not itself a focus target in the APG pattern — the keys arrive because focus
 * is on one of its own controls (previous, next, a dot) and the event bubbles,
 * which is exactly what the unscoped rows mean by "wherever the component has
 * focus". Giving the region a tab stop of its own would add a stop to every
 * page that has a carousel in order to implement a row that does not ask for
 * one.
 *
 * Only the inline axis, because only the inline axis is declared. `orientation`
 * chooses which way the content translates; it is not announced to an assistive
 * technology, so a block-axis pair would be a new claim rather than this one.
 */
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled)
    return
  const nextKey = dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const prevKey = dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
  if (event.key === nextKey) {
    event.preventDefault()
    next()
  }
  else if (event.key === prevKey) {
    event.preventDefault()
    prev()
  }
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
  cn(styles.value.root(), attrs.class as string | undefined, props.ui?.root),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div
    :id="id"
    data-part="root"
    :class="rootClasses"
    :aria-label="ariaLabel ?? 'Carousel'"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    aria-roledescription="carousel"
    role="region"
    :data-disabled="disabled ? '' : undefined"
    :data-state="slideCount > 0 ? 'ready' : 'empty'"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-carousel'), ...$attrs, class: undefined }"
    @keydown="onKeydown"
    @mouseenter="stopAutoplay"
    @mouseleave="autoplay ? startAutoplay() : undefined"
  >
    <div aria-live="polite" data-part="viewport" :class="cn(styles.viewport(), props.ui?.viewport)">
      <div
        data-part="content"
        :class="cn(styles.container(), props.ui?.content)"
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
