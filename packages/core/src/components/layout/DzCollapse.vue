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
import { useCollapse } from '../../composables/useCollapse/useCollapse.ts'
import { cn } from '../../utilities/cn.ts'

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

const classes = computed(() =>
  cn(attrs.class as string | undefined),
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
    ref="contentRef"
    :class="classes"
    :style="{ contain: 'layout style', ...contentStyle }"
    :aria-hidden="!model || undefined"
    :data-state="model ? 'open' : 'closed'"
    role="region"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  div {
    transition-duration: 0.01ms !important;
  }
}
</style>
