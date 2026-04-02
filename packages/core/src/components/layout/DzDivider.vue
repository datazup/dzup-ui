<script setup lang="ts">
import type { DzDividerProps } from './DzDivider.types.ts'
/**
 * DzDivider -- Visual separator component.
 *
 * Renders as `<hr>` for horizontal or `<div>` for vertical orientation.
 * Supports decorative mode (role="none") for purely visual separators.
 *
 * @example
 * ```vue
 * <DzDivider />
 * <DzDivider orientation="vertical" />
 * <DzDivider decorative />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { dividerVariants } from './DzDivider.variants.ts'

const props = withDefaults(defineProps<DzDividerProps>(), {
  orientation: 'horizontal',
  decorative: false,
})

const attrs = useAttrs()

/** The HTML element to render */
const element = computed(() =>
  props.orientation === 'horizontal' ? 'hr' : 'div',
)

/** The role attribute based on decorative prop */
const role = computed(() =>
  props.decorative ? 'none' : 'separator',
)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    dividerVariants({ orientation: props.orientation }),
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
    :is="element"
    :id="id"
    :class="classes"
    :role="role"
    :aria-orientation="!decorative ? orientation : undefined"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
