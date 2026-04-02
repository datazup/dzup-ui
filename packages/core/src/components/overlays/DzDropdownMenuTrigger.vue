<script setup lang="ts">
import type { DzDropdownMenuTriggerSlots } from './DzDropdownMenu.types.ts'
/**
 * DzDropdownMenuTrigger — Trigger for DzDropdownMenu.
 */
import { DropdownMenuTrigger } from 'reka-ui'

defineSlots<DzDropdownMenuTriggerSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DropdownMenuTrigger as-child>
    <slot />
  </DropdownMenuTrigger>
</template>
