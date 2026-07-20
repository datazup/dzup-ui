<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import type { AnimatedNumberEasing } from '@dzup-ui/core'
import { DzAnimatedNumber } from '@dzup-ui/core'
import { computed, ref, watch } from 'vue'
import { useInView } from '../useInView.ts'
import { useReducedMotion } from '../useReducedMotion.ts'

/**
 * DzCountUp — in-view count-up (docs/animations.md §6.3, effect 12).
 *
 * A thin wrapper over core's {@link DzAnimatedNumber} that does NOT re-implement
 * number tweening (the constraint): it only owns *when* the tween fires and
 * whether* it runs. The figure holds at `from` until the element scrolls into
 * view (via the gallery's shared {@link useInView}), then tweens to `value`.
 *
 * Reduced motion (OS setting OR the page-level "Reduce motion" toggle, read
 * through {@link useReducedMotion}) shows the final number instantly — we drive
 * the target straight to `value` and set the duration to `0` so core snaps.
 *
 * Number formatting (thousands separators, currency, percent…) is delegated to
 * `DzAnimatedNumber`'s `Intl.NumberFormat` `format`/`locale` props; grouping
 * separators are on by default. Static `prefix`/`suffix` strings (e.g. "$", "k",
 * "+") render via the corresponding affix slots.
 */
interface DzCountUpProps {
  /** The target value counted up to once in view. */
  value: number
  /** Value the count-up starts from. @default 0 */
  from?: number
  /** Tween duration in ms (ignored under reduced motion). @default 1600 */
  duration?: number
  /** Easing curve — mirrors the `--dz-ease-*` tokens. @default 'ease-out' */
  easing?: AnimatedNumberEasing
  /** `Intl.NumberFormat` options (currency, percent, decimals…). */
  format?: Intl.NumberFormatOptions
  /** BCP-47 locale(s) for formatting (defaults to the runtime locale). */
  locale?: string | string[]
  /** Static text rendered before the figure (e.g. "$"). */
  prefix?: string
  /** Static text rendered after the figure (e.g. "k", "+"). */
  suffix?: string
  /** Figure size. @default 'md' */
  size?: CanonicalSize
  /** Semantic colour tone of the figure. @default 'neutral' */
  tone?: CanonicalTone
  /** Accessible label, forwarded to the SR announcement. */
  ariaLabel?: string
}

const props = withDefaults(defineProps<DzCountUpProps>(), {
  from: 0,
  duration: 1600,
  easing: 'ease-out',
  format: undefined,
  locale: undefined,
  prefix: undefined,
  suffix: undefined,
  size: 'md',
  tone: 'neutral',
  ariaLabel: undefined,
})

const root = ref<HTMLElement | null>(null)
const inView = useInView(root)
const reduced = useReducedMotion()

/**
 * The value handed to `DzAnimatedNumber`. Held at `from` until the element is in
 * view, then flipped to the target so core tweens between the two. Under reduced
 * motion we flip immediately so the final number is shown at once.
 */
const target = ref(props.from)

watch(
  [inView, reduced],
  ([visible, isReduced]) => {
    if (isReduced || visible)
      target.value = props.value
  },
  { immediate: true },
)

/** Snap (duration 0) under reduced motion; otherwise tween normally. */
const effectiveDuration = computed(() => (reduced.value ? 0 : props.duration))
</script>

<template>
  <span ref="root" class="dz-count-up">
    <DzAnimatedNumber
      :value="target"
      :from="from"
      :duration="effectiveDuration"
      :easing="easing"
      :format="format"
      :locale="locale"
      :size="size"
      :tone="tone"
      :aria-label="ariaLabel"
      :start-on-view="false"
    >
      <template v-if="prefix" #prefix>{{ prefix }}</template>
      <template v-if="suffix" #suffix>{{ suffix }}</template>
    </DzAnimatedNumber>
  </span>
</template>

<style scoped>
.dz-count-up {
  display: inline-flex;
}
</style>
