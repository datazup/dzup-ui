<script setup lang="ts">
import type { DzIconProps } from './DzIcon.types.ts'
/**
 * DzIcon — Icon wrapper component with consistent sizing and accessibility.
 *
 * Renders any Vue component icon (e.g. from lucide-vue-next) with standardized
 * size tokens. Decorative by default (aria-hidden="true"); provide `ariaLabel`
 * to make it meaningful.
 *
 * @example
 * ```
 * // In your template:
 * // <DzIcon :icon="Search" size="lg" />
 * // <DzIcon :icon="Search" aria-label="Search" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { defaultStrokeWidth, iconVariants } from './DzIcon.variants.ts'

const props = withDefaults(defineProps<DzIconProps>(), {
  size: 'md',
})

const attrs = useAttrs()

const resolvedStrokeWidth = computed(() =>
  props.strokeWidth ?? defaultStrokeWidth[props.size] ?? 2,
)

const isDecorative = computed(() => !props.ariaLabel)

const classes = computed(() =>
  cn(
    iconVariants({ size: props.size }),
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
    :is="icon"
    :id="id"
    :class="classes"
    :stroke-width="resolvedStrokeWidth"
    :aria-hidden="isDecorative ? 'true' : undefined"
    :aria-label="ariaLabel"
    :role="isDecorative ? undefined : 'img'"
    v-bind="{ ...$attrs, class: undefined }"
  />
</template>
