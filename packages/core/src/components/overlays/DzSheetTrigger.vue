<script setup lang="ts">
import type { DzSheetTriggerSlots } from './DzSheet.types.ts'
/**
 * DzSheetTrigger — Trigger button for DzSheet.
 */
import { DialogTrigger } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzSheetTriggerSlots>()
</script>

<template>
  <DialogTrigger as-child>
    <slot />
  </DialogTrigger>
</template>
