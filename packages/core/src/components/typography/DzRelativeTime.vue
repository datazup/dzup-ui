<script setup lang="ts">
import type { DzRelativeTimeProps, DzRelativeTimeSlots } from './DzRelativeTime.types.ts'
/**
 * DzRelativeTime — self-updating relative timestamp.
 *
 * Renders a value (Date, epoch ms, or ISO string) as a live, localised phrase
 * like "2 minutes ago" and keeps it fresh with an age-adaptive timer (every
 * second under a minute, minute under an hour, hour under a day — then it
 * stops). Built on the platform `Intl.RelativeTimeFormat`, so it is
 * dependency-free and locale-aware.
 *
 * The text lives in a `<time datetime="…">` element for machine readability;
 * the full absolute date is surfaced to assistive tech via `aria-label` and,
 * by default, shown in a DzTooltip on hover/focus.
 *
 * @example
 * ```vue
 * <DzRelativeTime :value="run.startedAt" />          <!-- "2 minutes ago", live -->
 * <DzRelativeTime :value="comment.at" mode="absolute" :tooltip="false" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useRelativeTime } from '../../composables/useRelativeTime/index.ts'
import { cn } from '../../utilities/cn.ts'
import DzTooltip from '../overlays/DzTooltip.vue'
import DzTooltipContent from '../overlays/DzTooltipContent.vue'
import DzTooltipTrigger from '../overlays/DzTooltipTrigger.vue'
import { relativeTimeVariants } from './DzRelativeTime.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzRelativeTimeProps>(), {
  mode: 'relative',
  locale: undefined,
  updateInterval: undefined,
  tooltip: true,
  tone: 'muted',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ui: undefined,
})

defineSlots<DzRelativeTimeSlots>()

const attrs = useAttrs()

const { relative, absolute, datetime, display } = useRelativeTime({
  value: () => props.value,
  mode: () => props.mode,
  locale: () => props.locale,
  updateInterval: () => props.updateInterval,
})

const classes = computed(() =>
  cn(relativeTimeVariants({ tone: props.tone }), attrs.class as string | undefined, props.ui?.root),
)

/**
 * Expose the absolute date to assistive tech. When showing the relative phrase
 * the visible text is terse, so default the accessible name to the full date
 * (a consumer-supplied `ariaLabel` always wins). In absolute mode the text is
 * already complete, so no override is needed.
 */
const accessibleLabel = computed(() =>
  props.ariaLabel ?? (props.mode === 'absolute' ? undefined : absolute.value),
)

/** Only wrap in a tooltip when requested and there is an absolute date to show. */
const showTooltip = computed(() => props.tooltip && absolute.value !== '')

const slotProps = computed(() => ({
  display: display.value,
  relative: relative.value,
  absolute: absolute.value,
  datetime: datetime.value,
}))
</script>

<template>
  <DzTooltip v-if="showTooltip">
    <DzTooltipTrigger>
      <time
        :id="id"
        data-part="root"
        :datetime="datetime"
        :class="classes"
        :aria-label="accessibleLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        v-bind="{ ...$attrs, class: undefined }"
      >
        <slot v-bind="slotProps">{{ display }}</slot>
      </time>
    </DzTooltipTrigger>
    <DzTooltipContent>{{ absolute }}</DzTooltipContent>
  </DzTooltip>

  <time
    v-else
    :id="id"
    data-part="root"
    :datetime="datetime"
    :class="classes"
    :aria-label="accessibleLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot v-bind="slotProps">{{ display }}</slot>
  </time>
</template>
