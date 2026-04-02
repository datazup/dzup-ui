<script setup lang="ts">
import type {
  DzTooltipContentProps,
  DzTooltipContentSlots,
} from './DzTooltip.types.ts'
import { TooltipArrow, TooltipContent, TooltipPortal } from 'reka-ui'
/**
 * DzTooltipContent -- Content panel for DzTooltip compound.
 *
 * Wraps Reka UI TooltipPortal + TooltipContent + optional TooltipArrow.
 * Token-based styling (ADR-04).
 *
 * @example
 * ```vue
 * <DzTooltipContent side="bottom" :side-offset="8">
 *   Helpful tooltip text
 * </DzTooltipContent>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { tooltipVariants } from './DzTooltip.variants.ts'

const props = withDefaults(defineProps<DzTooltipContentProps>(), {
  side: 'top',
  sideOffset: 4,
  align: 'center',
  arrow: true,
})

defineSlots<DzTooltipContentSlots>()

const attrs = useAttrs()
const styles = computed(() => tooltipVariants())
const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      :side="props.side"
      :side-offset="props.sideOffset"
      :align="props.align"
      :class="contentClasses"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <slot />
      <TooltipArrow
        v-if="props.arrow"
        :class="styles.arrow()"
        :width="8"
        :height="4"
      />
    </TooltipContent>
  </TooltipPortal>
</template>
