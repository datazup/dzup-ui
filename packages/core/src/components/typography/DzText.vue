<script setup lang="ts">
import type { DzTextProps } from './DzText.types.ts'
/**
 * DzText — General-purpose text component with semantic element and tone control.
 *
 * Renders text in any inline or block element with consistent sizing, weight,
 * color tone, and alignment.
 *
 * @example
 * ```vue
 * <DzText size="sm" tone="muted">Helper text goes here.</DzText>
 * <DzText as="span" weight="bold">Inline bold text</DzText>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { textVariants } from './DzText.variants.ts'

const props = withDefaults(defineProps<DzTextProps>(), {
  as: 'p',
  size: 'md',
  tone: 'default',
  truncate: false,
})

defineSlots<{
  /** Text content */
  default: () => unknown
}>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    textVariants({
      size: props.size,
      tone: props.tone,
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
    :is="as"
    :id="id"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
