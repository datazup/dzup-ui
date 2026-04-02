<script setup lang="ts">
import type { DzPopoverTriggerSlots } from './DzPopover.types.ts'
/**
 * DzPopoverTrigger -- Trigger element for DzPopover compound.
 *
 * Wraps Reka UI PopoverTrigger. Uses as-child by default.
 */
import { PopoverTrigger } from 'reka-ui'

defineSlots<DzPopoverTriggerSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <PopoverTrigger as-child>
    <slot />
  </PopoverTrigger>
</template>
