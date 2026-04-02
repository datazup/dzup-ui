<script setup lang="ts">
import type { DzContainerProps, DzContainerSlots } from './DzContainer.types.ts'
/**
 * DzContainer -- Centered content container.
 *
 * Provides responsive max-width, horizontal padding, and
 * automatic centering for page-level content sections.
 *
 * @example
 * ```vue
 * <DzContainer max-width="lg">
 *   <p>Page content</p>
 * </DzContainer>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { containerVariants } from './DzContainer.variants.ts'

const props = withDefaults(defineProps<DzContainerProps>(), {
  maxWidth: 'xl',
  padding: true,
  centered: true,
  as: 'div',
})

defineSlots<DzContainerSlots>()

const attrs = useAttrs()

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    containerVariants({
      maxWidth: props.maxWidth,
      padding: props.padding,
      centered: props.centered,
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
    :is="as"
    :id="id"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
