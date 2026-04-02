<script setup lang="ts">
import type { DzGridProps, DzGridSlots, ResponsiveCols } from './DzGrid.types.ts'
/**
 * DzGrid -- CSS Grid layout component.
 *
 * Supports fixed column counts, responsive column objects,
 * configurable gap, and explicit row counts.
 *
 * @example
 * ```vue
 * <DzGrid :cols="3" gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </DzGrid>
 *
 * <DzGrid :cols="{ sm: 1, md: 2, lg: 4 }" gap="md">
 *   <div v-for="i in 4" :key="i">Item {{ i }}</div>
 * </DzGrid>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { gridVariants, responsiveColsMap } from './DzGrid.variants.ts'

const props = withDefaults(defineProps<DzGridProps>(), {
  cols: 1,
  gap: 'md',
  rows: undefined,
  as: 'div',
})

defineSlots<DzGridSlots>()

const attrs = useAttrs()

/** Whether cols is a responsive object */
const isResponsive = computed(() =>
  typeof props.cols === 'object' && props.cols !== null,
)

/** Resolve responsive column classes */
const responsiveClasses = computed(() => {
  if (!isResponsive.value)
    return ''
  const responsive = props.cols as ResponsiveCols
  const classes: string[] = []
  for (const bp of ['sm', 'md', 'lg'] as const) {
    const colCount = responsive[bp]
    if (colCount !== undefined) {
      const bpMap = responsiveColsMap[bp]
      if (bpMap) {
        const cls = bpMap[colCount]
        if (cls)
          classes.push(cls)
      }
    }
  }
  return classes.join(' ')
})

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    gridVariants({
      cols: isResponsive.value ? undefined : (props.cols as 1 | 2 | 3 | 4 | 5 | 6 | 12),
      gap: props.gap,
    }),
    responsiveClasses.value,
    attrs.class as string | undefined,
  ),
)

/** Inline styles for explicit rows */
const gridStyle = computed(() => {
  if (props.rows === undefined)
    return undefined
  return { gridTemplateRows: `repeat(${props.rows}, minmax(0, 1fr))` }
})
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
    :style="gridStyle"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </component>
</template>
