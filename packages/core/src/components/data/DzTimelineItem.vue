<script setup lang="ts">
import type { DzTimelineItemProps, DzTimelineItemSlots } from './DzTimeline.types.ts'
/**
 * DzTimelineItem — Child item within a DzTimeline compound component.
 *
 * Inherits size and orientation from parent DzTimeline via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzTimelineItem tone="success" status="2 hours ago">
 *   <template #indicator><CheckIcon /></template>
 *   Task completed
 * </DzTimelineItem>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TIMELINE_KEY } from './DzTimeline.types.ts'
import { timelineVariants } from './DzTimeline.variants.ts'

const props = withDefaults(defineProps<DzTimelineItemProps>(), {
  tone: 'neutral',
  status: undefined,
})

defineSlots<DzTimelineItemSlots>()

const attrs = useAttrs()
const timelineContext = inject(DZ_TIMELINE_KEY, null)

const resolvedSize = computed(() => timelineContext?.size.value ?? 'md')
const resolvedOrientation = computed(() => timelineContext?.orientation.value ?? 'vertical')

const styles = computed(() =>
  timelineVariants({
    size: resolvedSize.value,
    orientation: resolvedOrientation.value,
  }),
)

const itemClasses = computed(() =>
  cn(styles.value.item(), attrs.class as string | undefined),
)

/** Tone-specific indicator colors */
const indicatorToneClass = computed(() => {
  const toneMap: Record<string, string> = {
    neutral: 'bg-[var(--dz-muted-foreground)]',
    primary: 'bg-[var(--dz-primary)]',
    success: 'bg-[var(--dz-success)]',
    warning: 'bg-[var(--dz-warning)]',
    danger: 'bg-[var(--dz-danger)]',
    info: 'bg-[var(--dz-info)]',
  }
  return toneMap[props.tone] ?? toneMap.neutral
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="itemClasses"
    :data-tone="tone"
    role="listitem"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Indicator -->
    <div :class="cn(styles.indicator(), indicatorToneClass)">
      <slot name="indicator" />
    </div>

    <!-- Connector line (hidden for last item via CSS) -->
    <div
      v-if="resolvedOrientation === 'vertical'"
      :class="styles.connector()"
      aria-hidden="true"
    />

    <!-- Content -->
    <div :class="styles.content()">
      <div v-if="status" :class="styles.status()">
        {{ status }}
      </div>
      <slot />
    </div>
  </div>
</template>
