<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzPopoverTriggerSlots } from './DzPopover.types.ts'
/**
 * DzPopoverTrigger -- Trigger element for DzPopover compound.
 *
 * Wraps Reka UI PopoverTrigger. Uses as-child by default.
 */
import { PopoverTrigger } from 'reka-ui'

defineSlots<DzPopoverTriggerSlots>()
</script>


<template>
  <PopoverTrigger as-child>
    <slot />
  </PopoverTrigger>
</template>
