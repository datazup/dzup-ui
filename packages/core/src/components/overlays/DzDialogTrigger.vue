<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzDialogTriggerSlots } from './DzDialog.types.ts'
/**
 * DzDialogTrigger -- Trigger element for DzDialog compound.
 *
 * Wraps Reka UI DialogTrigger. Supports `as-child` for custom trigger elements.
 */
import { DialogTrigger } from 'reka-ui'

defineSlots<DzDialogTriggerSlots>()
</script>


<template>
  <DialogTrigger as-child>
    <slot />
  </DialogTrigger>
</template>
