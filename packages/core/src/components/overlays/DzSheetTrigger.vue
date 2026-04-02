<script setup lang="ts">
import type { DzSheetTriggerSlots } from './DzSheet.types.ts'
/**
 * DzSheetTrigger — Trigger button for DzSheet.
 */
import { DialogTrigger } from 'reka-ui'

defineSlots<DzSheetTriggerSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DialogTrigger as-child>
    <slot />
  </DialogTrigger>
</template>
