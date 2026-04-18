<script setup lang="ts">
import type { DzTokenProgressBarProps, DzTokenProgressBarSlots } from './DzTokenProgressBar.types.ts'
/**
 * DzTokenProgressBar — Token-usage progress bar with threshold colors.
 *
 * Computes `percent = min(100, used/total * 100)`.
 * When `showWarning` (default true): bar fill flips to amber at ≥70 %
 * and red at ≥90 %.
 *
 * @example
 * ```vue
 * <DzTokenProgressBar :used="7500" :total="10000" />
 * <DzTokenProgressBar :used="9200" :total="10000">
 *   {{ 9200 }} / {{ 10000 }} tokens
 * </DzTokenProgressBar>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'

const props = withDefaults(defineProps<DzTokenProgressBarProps>(), {
  showWarning: true,
})

defineSlots<DzTokenProgressBarSlots>()

const attrs = useAttrs()

/** Clamped 0–100 percent (guards divide-by-zero / negative) */
const percent = computed<number>(() => {
  if (!props.total || props.total <= 0)
    return 0
  const raw = (props.used / props.total) * 100
  return Math.max(0, Math.min(100, raw))
})

/** Threshold state — normal < 70, warn 70–89, danger ≥ 90 */
const state = computed<'normal' | 'warn' | 'danger'>(() => {
  if (!props.showWarning)
    return 'normal'
  if (percent.value >= 90)
    return 'danger'
  if (percent.value >= 70)
    return 'warn'
  return 'normal'
})

/** CSS var for bar fill based on threshold state */
const barColor = computed<string>(() => {
  switch (state.value) {
    case 'danger':
      return 'var(--dz-progress-red)'
    case 'warn':
      return 'var(--dz-progress-amber)'
    default:
      return 'var(--dz-primary)'
  }
})

const rootClasses = computed(() =>
  cn(
    'relative h-2 w-full overflow-hidden rounded-[var(--dz-radius-full)] bg-[var(--dz-muted)]',
    attrs.class as string | undefined,
  ),
)

const labelBindings = computed(() => ({
  percent: percent.value,
  used: props.used,
  total: props.total,
  state: state.value,
}))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="rootClasses"
    role="progressbar"
    :aria-valuenow="used"
    aria-valuemin="0"
    :aria-valuemax="total"
    aria-label="Token usage"
    :data-state="state"
    :data-warn="state === 'warn' ? '' : undefined"
    :data-danger="state === 'danger' ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div
      class="h-full rounded-[var(--dz-radius-full)] transition-[width] duration-200 ease-out"
      :style="{ width: `${percent}%`, backgroundColor: barColor }"
      :class="{
        'dz-progress-warn': state === 'warn',
        'dz-progress-danger': state === 'danger',
      }"
    />
    <slot v-bind="labelBindings" />
  </div>
</template>
