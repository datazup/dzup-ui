<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzSheetTriggerSlots } from './DzSheet.types.ts'
/**
 * DzSheetTrigger — Trigger button for DzSheet.
 */
import { DialogTrigger } from 'reka-ui'

defineSlots<DzSheetTriggerSlots>()
</script>


<template>
  <DialogTrigger as-child>
    <slot />
  </DialogTrigger>
</template>
