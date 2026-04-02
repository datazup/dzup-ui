<script setup lang="ts">
import type { DzFlexProps, DzFlexSlots } from './DzFlex.types.ts'
/**
 * DzFlex -- Flexbox layout component.
 *
 * Full control over flex direction, alignment, justification,
 * gap, wrapping, and inline vs block display.
 *
 * @example
 * ```vue
 * <DzFlex direction="row" align="center" justify="between" gap="md">
 *   <span>Left</span>
 *   <span>Right</span>
 * </DzFlex>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { flexVariants } from './DzFlex.variants.ts'

const props = withDefaults(defineProps<DzFlexProps>(), {
  direction: 'row',
  align: undefined,
  justify: undefined,
  gap: 'md',
  wrap: false,
  inline: false,
  as: 'div',
})

defineSlots<DzFlexSlots>()

const attrs = useAttrs()

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    flexVariants({
      inline: props.inline,
      direction: props.direction,
      align: props.align,
      justify: props.justify,
      gap: props.gap,
      wrap: props.wrap || undefined,
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
