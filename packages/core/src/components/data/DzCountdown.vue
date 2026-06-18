<script setup lang="ts">
import type { CountdownRemaining } from '../../composables/useCountdown/index.ts'
import type {
  DzCountdownEmits,
  DzCountdownProps,
  DzCountdownSlots,
} from './DzCountdown.types.ts'
import { computed, ref, useAttrs, watch } from 'vue'
import { formatRemaining, useCountdown } from '../../composables/useCountdown/index.ts'
import { cn } from '../../utilities/cn.ts'
import { countdownVariants } from './DzCountdown.variants.ts'

/**
 * DzCountdown — live countdown / elapsed timer.
 *
 * Ticks towards a fixed time (`mode="to"`) or down across a span
 * (`mode="duration"`), rendering the remaining time against a token `format`
 * (default `HH:mm:ss`). The ticking is drift-corrected, stops at zero (never
 * negative), and emits `finish` exactly once; `change` fires every tick with the
 * structured remainder, which the default slot also receives for custom layouts.
 *
 * The figure is mirrored into a polite live region throttled to one announcement
 * per second so screen readers aren't spammed when `interval < 1000`.
 *
 * @example
 * ```vue
 * <DzCountdown :target="expiresAt" format="mm:ss" @finish="resendEnabled = true" />
 * ```
 */
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzCountdownProps>(), {
  mode: 'to',
  format: 'HH:mm:ss',
  interval: 1000,
  autoStart: true,
  pauseOnHidden: false,
  size: 'md',
  tone: 'neutral',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzCountdownEmits>()
defineSlots<DzCountdownSlots>()

const attrs = useAttrs()

const { remaining, finished, start, pause, reset } = useCountdown({
  mode: () => props.mode,
  target: () => props.target,
  interval: () => props.interval,
  autoStart: props.autoStart,
  pauseOnHidden: () => props.pauseOnHidden,
  onTick: r => emit('change', r),
  onFinish: () => emit('finish'),
})

defineExpose({ start, pause, reset })

/** The figure shown to sighted users, formatted against the token string. */
const formatted = computed(() => formatRemaining(remaining.value.total, props.format))

const styles = computed(() => countdownVariants({ size: props.size, tone: props.tone }))

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

const slotProps = computed(() => ({ remaining: remaining.value, formatted: formatted.value }))

/**
 * Polite announcement, throttled to whole-second changes. Sub-second ticks
 * (when `interval < 1000`) update the visible figure but not the live region.
 */
const liveLabel = ref('')
let lastWholeSecond = -1

function humanize(parts: CountdownRemaining): string {
  if (parts.total <= 0)
    return 'Countdown finished'
  const segments: string[] = []
  if (parts.days)
    segments.push(`${parts.days} day${parts.days === 1 ? '' : 's'}`)
  if (parts.hours)
    segments.push(`${parts.hours} hour${parts.hours === 1 ? '' : 's'}`)
  if (parts.minutes)
    segments.push(`${parts.minutes} minute${parts.minutes === 1 ? '' : 's'}`)
  segments.push(`${parts.seconds} second${parts.seconds === 1 ? '' : 's'}`)
  return `${segments.join(', ')} remaining`
}

watch(
  remaining,
  (parts) => {
    const whole = Math.floor(parts.total / 1000)
    if (whole !== lastWholeSecond) {
      lastWholeSecond = whole
      liveLabel.value = humanize(parts)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :data-size="size"
    :data-tone="tone"
    :data-finished="finished ? '' : undefined"
    role="timer"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Live region: per-second announcement of the remaining time -->
    <span class="sr-only" aria-live="polite" aria-atomic="true">{{ liveLabel }}</span>

    <!-- Visible figure (hidden from SR; the live region carries the value) -->
    <span :class="styles.value()" aria-hidden="true">
      <slot v-bind="slotProps">{{ formatted }}</slot>
    </span>
  </div>
</template>
