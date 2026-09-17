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
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { captionVariants } from './DzCaption.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzCaptionProps>(), {
  tone: 'muted',
  ui: undefined,
})

defineSlots<DzCaptionSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    captionVariants({ tone: props.tone }),
    attrs.class as string | undefined,
    props.ui?.root,
  ),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <small
    :id="id"
    data-part="root"
    :class="classes"
    v-bind="{ ...dzTestId('dz-caption'), ...$attrs, class: undefined }"
  >
    <slot />
  </small>
</template>
