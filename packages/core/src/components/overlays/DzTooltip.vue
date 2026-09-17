<script setup lang="ts">
import type { DzTooltipProps, DzTooltipSlots } from './DzTooltip.types.ts'
/**
 * DzTooltip -- Root compound component wrapping Reka UI TooltipRoot (ADR-07).
 *
 * Provides a TooltipProvider + TooltipRoot wrapper. Open state is optionally
 * controlled via defineModel<boolean>('open') (ADR-16).
 *
 * @example
 * ```vue
 * <DzTooltip>
 *   <DzTooltipTrigger as-child>
 *     <DzButton>Hover me</DzButton>
 *   </DzTooltipTrigger>
 *   <DzTooltipContent>Tooltip text</DzTooltipContent>
 * </DzTooltip>
 * ```
 */
import { TooltipProvider, TooltipRoot } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

/**
 * Whether the tooltip is shown. Left `undefined` (the default) Reka UI owns the
 * open state and the tooltip follows hover and focus on its own.
 */
const open = defineModel<boolean | undefined>('open')

const props = withDefaults(defineProps<DzTooltipProps>(), {
  delayDuration: 200,
  disableHoverableContent: false,
})

defineSlots<DzTooltipSlots>()
</script>

<template>
  <TooltipProvider :delay-duration="props.delayDuration">
    <TooltipRoot
      v-model:open="open"
      :delay-duration="props.delayDuration"
      :disable-hoverable-content="props.disableHoverableContent"
    >
      <slot />
    </TooltipRoot>
  </TooltipProvider>
</template>
