<script setup lang="ts">
import type { DzDropdownMenuTriggerSlots } from './DzDropdownMenu.types.ts'
/**
 * DzDropdownMenuTrigger — Trigger for DzDropdownMenu.
 */
import { DropdownMenuTrigger } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzDropdownMenuTriggerSlots>()
</script>

<template>
  <DropdownMenuTrigger as-child>
    <slot />
  </DropdownMenuTrigger>
</template>
