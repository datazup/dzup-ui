<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
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
import { useDzDefaults } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_TIMELINE_KEY } from './DzTimeline.types.ts'
import { timelineVariants } from './DzTimeline.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzTimelineProps>(), {
  size: undefined,
  tone: undefined,
  orientation: 'vertical',
})

defineSlots<DzTimelineSlots>()

const attrs = useAttrs()

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Resolved on the compound root so the injected context and the root recipe
 * agree. `tone` had no literal default and does not acquire one.
 */
const { resolve } = useDzDefaults()

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzTimeline', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider — no literal default to fall back to */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzTimeline', 'tone', [props.tone]),
)

const context: DzTimelineContext = {
  size: toRef(() => resolvedSize.value),
  orientation: toRef(() => props.orientation),
}

provide(DZ_TIMELINE_KEY, context)

const styles = computed(() =>
  timelineVariants({
    size: resolvedSize.value,
    orientation: props.orientation,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :aria-label="ariaLabel ?? 'Timeline'"
    data-state="ready"
    :data-tone="resolvedTone"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    role="list"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
