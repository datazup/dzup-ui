<script setup lang="ts">
import type { DzTimelineContext, DzTimelineProps, DzTimelineSlots } from './DzTimeline.types.ts'
/**
 * DzTimeline — Compound timeline root component.
 *
 * Provides size and orientation context to DzTimelineItem children
 * via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzTimeline>
 *   <DzTimelineItem tone="success" status="March 1">Created</DzTimelineItem>
 *   <DzTimelineItem tone="primary" status="March 5">Updated</DzTimelineItem>
 * </DzTimeline>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_TIMELINE_KEY } from './DzTimeline.types.ts'
import { timelineVariants } from './DzTimeline.variants.ts'

const props = withDefaults(defineProps<DzTimelineProps>(), {
  size: 'md',
  tone: undefined,
  orientation: 'vertical',
})

defineSlots<DzTimelineSlots>()

const attrs = useAttrs()

const context: DzTimelineContext = {
  size: toRef(() => props.size),
  orientation: toRef(() => props.orientation),
}

provide(DZ_TIMELINE_KEY, context)

const styles = computed(() =>
  timelineVariants({
    size: props.size,
    orientation: props.orientation,
  }),
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
    :aria-label="ariaLabel ?? 'Timeline'"
    :data-tone="tone"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    role="list"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
