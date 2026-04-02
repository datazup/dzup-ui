<script setup lang="ts">
import type { DzStackProps, DzStackSlots } from './DzStack.types.ts'
/**
 * DzStack -- Simplified vertical/horizontal stack layout.
 *
 * Convenience wrapper over flexbox for common stacking patterns.
 * Use DzFlex for more fine-grained control.
 *
 * @example
 * ```vue
 * <DzStack gap="md">
 *   <DzButton>First</DzButton>
 *   <DzButton>Second</DzButton>
 * </DzStack>
 *
 * <DzStack direction="horizontal" align="center" gap="sm">
 *   <DzAvatar />
 *   <span>Username</span>
 * </DzStack>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { flexVariants } from './DzFlex.variants.ts'

const props = withDefaults(defineProps<DzStackProps>(), {
  direction: 'vertical',
  gap: 'md',
  align: undefined,
  as: 'div',
})

defineSlots<DzStackSlots>()

const attrs = useAttrs()

/** Map stack direction to flex direction */
const flexDirection = computed(() =>
  props.direction === 'horizontal' ? 'row' as const : 'column' as const,
)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    flexVariants({
      inline: false,
      direction: flexDirection.value,
      align: props.align,
      gap: props.gap,
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
