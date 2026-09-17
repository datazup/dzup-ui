<script setup lang="ts">
import type { DzCollapseProps, DzCollapseSlots } from './DzCollapse.types.ts'
/**
 * DzCollapse — Animated expand/collapse container.
 *
 * Uses the `useCollapse()` composable for smooth height transitions.
 * v-model via defineModel<boolean>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzButton @click="open = !open">Toggle</DzButton>
 * <DzCollapse v-model="open">
 *   <p>Collapsible content here.</p>
 * </DzCollapse>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useCollapse } from '../../composables/useCollapse/useCollapse.ts'
import { cn } from '../../utilities/cn.ts'

defineOptions({
  inheritAttrs: false,
})

/** Whether the panel is expanded; `false` renders it collapsed. */
const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzCollapseProps>(), {
  duration: 200,
})

defineSlots<DzCollapseSlots>()

const attrs = useAttrs()

const { contentRef, contentStyle } = useCollapse({
  expanded: model,
  duration: props.duration,
})

/** Bind the composable's content ref via a function ref (type-safe template ref). */
function setContentRef(el: unknown): void {
  contentRef.value = (el as HTMLElement | null)
}

const classes = computed(() =>
  cn(attrs.class as string | undefined),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div
    :id="id"
    :ref="setContentRef"
    data-part="root"
    :class="classes"
    :style="{ contain: 'layout style', ...contentStyle }"
    :aria-hidden="!model || undefined"
    :data-state="model ? 'open' : 'closed'"
    role="region"
    v-bind="{ ...dzTestId('dz-collapse'), ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
