<script setup lang="ts">
import type { DzCaptionProps, DzCaptionSlots } from './DzCaption.types.ts'
/**
 * DzCaption — Small caption text component.
 *
 * Renders a small text element for captions, annotations, and helper text.
 *
 * @example
 * ```vue
 * <DzCaption>Last updated: 2 hours ago</DzCaption>
 * <DzCaption tone="danger">This field is required</DzCaption>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { captionVariants } from './DzCaption.variants.ts'

const props = withDefaults(defineProps<DzCaptionProps>(), {
  tone: 'muted',
})

defineSlots<DzCaptionSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    captionVariants({ tone: props.tone }),
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
  <small
    :id="id"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </small>
</template>
