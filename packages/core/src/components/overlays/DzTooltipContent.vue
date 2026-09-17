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
import { useDzPortalTarget } from '../../composables/provider/useDzEnvironment.ts'
import { useDzMotionAttribute } from '../../composables/provider/useDzMotion.ts'
import { cn } from '../../utilities/cn.ts'
import { tooltipVariants } from './DzTooltip.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzTooltipContentProps>(), {
  side: 'top',
  sideOffset: 4,
  align: 'center',
  arrow: true,
  portalTo: undefined,
  portalDisabled: false,
  portalDefer: false,
})

defineSlots<DzTooltipContentSlots>()
// Portal target: an explicit `portalTo` on this instance, then the application's
// `DzProvider` target, then the portal's own default of `document.body`
// (ADR-20, TASK-OSS-P4-04). Resolution is client-side — this is a string or an
// element handed to the portal, never a DOM query run here.
const dzPortalTarget = useDzPortalTarget()
const resolvedPortalTo = computed(() => props.portalTo ?? dzPortalTarget.value)

const attrs = useAttrs()
const styles = computed(() => tooltipVariants())
const contentClasses = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)

// Reduced motion, as the APPLICATION asked for it (ADR-20 §7, TASK-R5-O3).
// The `prefers-reduced-motion` gate in the recipe answers for the OS; this
// answers for a host with its own accessibility setting, which the media
// query cannot see.
const dzMotionAttr = useDzMotionAttribute()
</script>

<template>
  <TooltipPortal
    :to="resolvedPortalTo"
    :disabled="portalDisabled"
    :defer="portalDefer"
  >
    <TooltipContent
      :side="props.side"
      :side-offset="props.sideOffset"
      :align="props.align"
      data-part="content"
      :class="contentClasses"
      :data-dz-motion="dzMotionAttr"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <slot />
      <TooltipArrow
        v-if="props.arrow"
        data-part="indicator"
        :class="cn(styles.arrow(), props.ui?.indicator)"
        :width="8"
        :height="4"
      />
    </TooltipContent>
  </TooltipPortal>
</template>
