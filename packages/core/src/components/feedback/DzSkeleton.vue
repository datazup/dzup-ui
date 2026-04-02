<script setup lang="ts">
import type { DzSkeletonProps } from './DzSkeleton.types.ts'
/**
 * DzSkeleton — Placeholder loading state for content.
 *
 * Supports text (with multiple lines), circular, and rectangular
 * shape variants with pulse animation.
 *
 * @example
 * ```vue
 * <DzSkeleton variant="text" :lines="3" />
 * <DzSkeleton variant="circular" width="48px" height="48px" />
 * <DzSkeleton variant="rectangular" width="100%" height="200px" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { skeletonVariants } from './DzSkeleton.variants.ts'

const props = withDefaults(defineProps<DzSkeletonProps>(), {
  variant: 'text',
  width: undefined,
  height: undefined,
  lines: 1,
  animate: true,
})

const attrs = useAttrs()

/** Classes for a single skeleton element */
const classes = computed(() =>
  cn(
    skeletonVariants({ variant: props.variant, animate: props.animate }),
    attrs.class as string | undefined,
  ),
)

/** Inline style for custom dimensions */
const elementStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width)
    style.width = props.width
  if (props.height)
    style.height = props.height
  return style
})

/** Whether to render multiple lines */
const isMultiline = computed(() => props.variant === 'text' && props.lines > 1)

/** Line widths for text variant — last line is shorter for natural appearance */
function lineWidth(index: number): string {
  if (props.width)
    return props.width
  if (index === props.lines - 1 && props.lines > 1)
    return '75%'
  return '100%'
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    v-if="isMultiline"
    aria-hidden="true"
    class="flex flex-col gap-[var(--dz-spacing-2)]"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div
      v-for="i in lines"
      :key="i"
      :class="classes"
      :style="{ width: lineWidth(i - 1), ...(height ? { height } : {}) }"
    />
  </div>

  <div
    v-else
    :class="classes"
    :style="elementStyle"
    aria-hidden="true"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .animate-pulse {
    animation: none;
  }
}
</style>
