<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzDropdownMenuTriggerSlots } from './DzDropdownMenu.types.ts'
/**
 * DzDropdownMenuTrigger — Trigger for DzDropdownMenu.
 */
import { DropdownMenuTrigger } from 'reka-ui'

defineSlots<DzDropdownMenuTriggerSlots>()
</script>


<template>
  <DropdownMenuTrigger as-child>
    <slot />
  </DropdownMenuTrigger>
</template>
