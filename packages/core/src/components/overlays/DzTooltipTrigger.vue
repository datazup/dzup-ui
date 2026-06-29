<script setup lang="ts">
import type { DzTooltipTriggerSlots } from './DzTooltip.types.ts'
/**
 * DzTooltipTrigger -- Trigger element for DzTooltip compound.
 *
 * Wraps Reka UI TooltipTrigger. Uses as-child by default so
 * the consumer's element is the actual trigger.
 */
import { TooltipTrigger } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzTooltipTriggerSlots>()
</script>

<template>
  <TooltipTrigger as-child>
    <slot />
  </TooltipTrigger>
</template>
