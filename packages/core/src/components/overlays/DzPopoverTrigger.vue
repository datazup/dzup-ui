<script setup lang="ts">
import type { DzPopoverTriggerSlots } from './DzPopover.types.ts'
/**
 * DzPopoverTrigger -- Trigger element for DzPopover compound.
 *
 * Wraps Reka UI PopoverTrigger. Uses as-child by default.
 */
import { PopoverTrigger } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzPopoverTriggerSlots>()
</script>

<template>
  <PopoverTrigger as-child>
    <slot />
  </PopoverTrigger>
</template>
