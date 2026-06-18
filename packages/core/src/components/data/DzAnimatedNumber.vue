<script setup lang="ts">
import type {
  DzAnimatedNumberEmits,
  DzAnimatedNumberProps,
  DzAnimatedNumberSlots,
} from './DzAnimatedNumber.types.ts'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { sampleTween } from './DzAnimatedNumber.tween.ts'
import { animatedNumberVariants } from './DzAnimatedNumber.variants.ts'

/**
 * DzAnimatedNumber — a figure that counts from its previous value to the next.
 *
 * Whenever `value` changes the component tweens from the currently-displayed
 * value to the new one with `requestAnimationFrame`, formatting each frame
 * through `Intl.NumberFormat` (currency, percent, decimals via `format`). The
 * first animation counts up from `from` (default `0`); with `startOnView` it
 * waits until scrolled into view.
 *
 * Accessibility: the counting digits are `aria-hidden`; a visually-hidden polite
 * live region exposes only the settled final value so screen-reader users aren't
 * flooded mid-count. `prefers-reduced-motion` snaps straight to the target.
 *
 * @example
 * ```vue
 * <DzAnimatedNumber :value="revenue" :format="{ style: 'currency', currency: 'USD' }" />
 * ```
 */
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzAnimatedNumberProps>(), {
  from: 0,
  duration: 1000,
  easing: 'ease-out',
  startOnView: true,
  size: 'md',
  tone: 'neutral',
  format: undefined,
  locale: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzAnimatedNumberEmits>()
defineSlots<DzAnimatedNumberSlots>()

const attrs = useAttrs()

/** The root element — observed when `startOnView` is enabled. */
const root = ref<HTMLElement | null>(null)

// Initialise to the target so SSR / pre-hydration markup shows the correct,
// final figure (and matches the server render). The client resets to `from`
// in onMounted before animating.
const displayValue = ref(props.value)

// ---------------------------------------------------------------------------
// Formatting — one cached Intl.NumberFormat reused every frame
// ---------------------------------------------------------------------------

const formatter = computed<Intl.NumberFormat | null>(() => {
  try {
    return new Intl.NumberFormat(props.locale, props.format)
  }
  catch {
    return null
  }
})

function format(value: number): string {
  const f = formatter.value
  return f ? f.format(value) : String(value)
}

/** The live, mid-tween figure shown to sighted users. */
const displayText = computed(() => format(displayValue.value))
/** The settled target, formatted — announced to screen readers. */
const finalText = computed(() => format(props.value))

/** SR announcement: only ever the final value, optionally labelled. */
const srText = computed(() =>
  props.ariaLabel ? `${props.ariaLabel}: ${finalText.value}` : finalText.value,
)

const slotProps = computed(() => ({ value: props.value, formatted: finalText.value }))

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

let rafId = 0
let started = false
let observer: IntersectionObserver | null = null

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Whether a real tween can run (vs. snapping straight to the target). */
function canAnimate(): boolean {
  return (
    typeof window !== 'undefined'
    && typeof requestAnimationFrame === 'function'
    && props.duration > 0
    && !prefersReducedMotion()
  )
}

function cancel(): void {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

/** Tween the figure from `fromValue` to `to`, or snap when motion is off. */
function animateTo(to: number, fromValue: number): void {
  cancel()

  if (!canAnimate()) {
    displayValue.value = to
    emit('complete', to)
    return
  }

  displayValue.value = fromValue
  emit('start', to)

  const startTime = performance.now()
  function step(now: number): void {
    const { value, done } = sampleTween({
      from: fromValue,
      to,
      elapsed: now - startTime,
      duration: props.duration,
      easing: props.easing,
    })
    displayValue.value = value
    if (done) {
      rafId = 0
      emit('complete', to)
    }
    else {
      rafId = requestAnimationFrame(step)
    }
  }
  rafId = requestAnimationFrame(step)
}

/** Kick off the very first animation (count-up from `from`). */
function startInitial(): void {
  if (started)
    return
  started = true
  animateTo(props.value, props.from)
}

// Later value changes always animate immediately from the current figure. Before
// the first trigger they're absorbed: the pending initial animation reads the
// latest `props.value` when it fires.
watch(
  () => props.value,
  (next) => {
    if (started)
      animateTo(next, displayValue.value)
  },
)

onMounted(() => {
  const shouldObserve
    = canAnimate()
      && props.startOnView
      && typeof IntersectionObserver === 'function'
      && root.value != null

  if (!shouldObserve) {
    startInitial()
    return
  }

  // Show the count-up origin while we wait for the element to scroll into view.
  displayValue.value = props.from
  observer = new IntersectionObserver((entries) => {
    if (entries.some(entry => entry.isIntersecting)) {
      observer?.disconnect()
      observer = null
      startInitial()
    }
  })
  observer.observe(root.value as HTMLElement)
})

onBeforeUnmount(() => {
  cancel()
  observer?.disconnect()
  observer = null
})

defineExpose({
  get displayValue() {
    return displayValue.value
  },
  get displayText() {
    return displayText.value
  },
})

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const styles = computed(() => animatedNumberVariants({ size: props.size, tone: props.tone }))
const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))
</script>

<template>
  <span
    :id="id"
    ref="root"
    :class="rootClasses"
    :data-size="size"
    :data-tone="tone"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Visible counting figure — hidden from screen readers to avoid flooding -->
    <span :class="styles.figure()" aria-hidden="true">
      <span v-if="$slots.prefix" :class="styles.affix()"><slot name="prefix" v-bind="slotProps" /></span>
      <span :class="styles.value()">{{ displayText }}</span>
      <span v-if="$slots.suffix" :class="styles.affix()"><slot name="suffix" v-bind="slotProps" /></span>
    </span>

    <!-- SR-only: announces only the settled final value, politely -->
    <span class="sr-only" aria-live="polite" aria-atomic="true">{{ srText }}</span>
  </span>
</template>
