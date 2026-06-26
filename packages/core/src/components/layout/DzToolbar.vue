<script setup lang="ts">
import type { DzToolbarProps, DzToolbarSlots } from './DzToolbar.types.ts'
/**
 * DzToolbar -- horizontal action bar with start/center/end regions.
 *
 * A semantic "controls left, title middle, actions right" bar with consistent
 * spacing, wrap, and sticky behavior. Pure layout (tv() only) — no interaction
 * logic. Tab order follows the natural DOM order: start → center → end.
 *
 * @example
 * ```vue
 * <DzToolbar variant="outlined">
 *   <template #start><DzButton>Back</DzButton></template>
 *   <template #center><h2>Title</h2></template>
 *   <template #end><DzButton tone="primary">Save</DzButton></template>
 * </DzToolbar>
 * ```
 */
import { computed, useAttrs, useSlots } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { toolbarRegionVariants, toolbarVariants } from './DzToolbar.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzToolbarProps>(), {
  variant: 'flat',
  size: 'md',
  wrap: false,
  sticky: false,
  orientation: 'horizontal',
  as: 'div',
})

const slots = defineSlots<DzToolbarSlots>()

const attrs = useAttrs()
const slotApi = useSlots()

/** Whether the trailing region has content to render. */
const hasEnd = computed(() => Boolean(slotApi.end))
/** Whether the centered region has content to render. */
const hasCenter = computed(() => Boolean(slotApi.center))

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    toolbarVariants({
      variant: props.variant,
      size: props.size,
      wrap: props.wrap || undefined,
      sticky: props.sticky || undefined,
    }),
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <component
    :is="as"
    :id="id"
    role="toolbar"
    :aria-orientation="orientation"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-size="size"
    :data-variant="variant"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <div :class="toolbarRegionVariants({ region: 'start' })" data-toolbar-region="start">
      <slot name="start">
        <slot />
      </slot>
    </div>

    <div
      v-if="hasCenter"
      :class="toolbarRegionVariants({ region: 'center' })"
      data-toolbar-region="center"
    >
      <slot name="center" />
    </div>
    <div v-else aria-hidden="true" class="flex-1" data-toolbar-region="spacer" />

    <div v-if="hasEnd" :class="toolbarRegionVariants({ region: 'end' })" data-toolbar-region="end">
      <slot name="end" />
    </div>
  </component>
</template>
