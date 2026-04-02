<script setup lang="ts">
import type { DzHeadingProps, HeadingLevel, HeadingSize } from './DzHeading.types.ts'
/**
 * DzHeading — Semantic heading component with independent visual sizing.
 *
 * Renders <h1> through <h6> based on `level` prop while allowing visual `size`
 * to be set independently for design flexibility.
 *
 * @example
 * ```vue
 * <DzHeading :level="2" size="xl">Section Title</DzHeading>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { headingVariants } from './DzHeading.variants.ts'

const props = withDefaults(defineProps<DzHeadingProps>(), {
  level: 2,
  truncate: false,
})

defineSlots<{
  /** Heading content */
  default: () => unknown
}>()

const attrs = useAttrs()

/** Maps heading level to a default visual size when `size` prop is omitted */
const levelToSize: Record<HeadingLevel, HeadingSize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'md',
}

const resolvedSize = computed(() => props.size ?? levelToSize[props.level])

const tag = computed(() => `h${props.level}` as const)

const classes = computed(() =>
  cn(
    headingVariants({
      size: resolvedSize.value,
      weight: props.weight,
      align: props.align,
      truncate: props.truncate,
    }),
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <component
    :is="tag"
    :id="id"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
