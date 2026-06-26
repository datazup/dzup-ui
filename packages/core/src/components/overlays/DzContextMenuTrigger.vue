<script setup lang="ts">
import type { DzContextMenuTriggerSlots } from './DzContextMenu.types.ts'
/**
 * DzContextMenuTrigger — Trigger area for DzContextMenu (right-click target).
 */
import { ContextMenuTrigger } from 'reka-ui'

defineOptions({
  inheritAttrs: false,
})

defineSlots<DzContextMenuTriggerSlots>()
</script>

<template>
  <ContextMenuTrigger as-child>
    <slot />
  </ContextMenuTrigger>
</template>
