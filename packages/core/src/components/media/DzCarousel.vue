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
import { useDzMotion } from '../../composables/provider/useDzMotion.ts'
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

/**
 * Autoplay follows the APG carousel pattern (UI-DZUP-UI-DESIGN-M-13):
 *
 * - it never starts while reduced motion resolves true (OS or provider policy,
 *   through the shared `useDzMotion` seam), and stops if that flips mid-run;
 * - it pauses while the pointer is over the carousel or focus is inside it, and
 *   resumes only when neither holds;
 * - the live region is `off` while rotating, so automatic slide changes are not
 *   announced; it is `polite` whenever a user is driving.
 */
const { reduced: motionReduced } = useDzMotion()
const rotating = ref(false)
let hovered = false
let focusWithin = false

function startAutoplay(): void {
  stopAutoplay()
  if (props.autoplay && props.interval > 0 && !motionReduced.value && !hovered && !focusWithin) {
    autoplayTimer = setInterval(() => next(), props.interval)
    rotating.value = true
  }
}

function stopAutoplay(): void {
  if (autoplayTimer !== null) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
  rotating.value = false
}

function onMouseEnter(): void {
  hovered = true
  stopAutoplay()
}

function onMouseLeave(): void {
  hovered = false
  if (props.autoplay)
    startAutoplay()
}

function onFocusIn(): void {
  focusWithin = true
  stopAutoplay()
}

function onFocusOut(event: FocusEvent): void {
  const root = event.currentTarget as HTMLElement | null
  const target = event.relatedTarget as Node | null
  if (root && target && root.contains(target))
    return
  focusWithin = false
  if (props.autoplay)
    startAutoplay()
}

watch(() => props.autoplay, (val) => {
  if (val)
    startAutoplay()
  else stopAutoplay()
})

watch(motionReduced, (isReduced) => {
  if (isReduced)
    stopAutoplay()
  else if (props.autoplay)
    startAutoplay()
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
    class="[contain:layout_style]"
    v-bind="{ ...dzTestId('dz-carousel'), ...$attrs, class: undefined }"
    @keydown="onKeydown"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
  >
    <div :aria-live="rotating ? 'off' : 'polite'" data-part="viewport" :class="cn(styles.viewport(), props.ui?.viewport)">
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
