<script setup lang="ts">
import type { DzContextMenuTriggerSlots } from './DzContextMenu.types.ts'
/**
 * DzContextMenuTrigger — Trigger area for DzContextMenu (right-click target).
 */
import { ContextMenuTrigger } from 'reka-ui'

defineSlots<DzContextMenuTriggerSlots>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ContextMenuTrigger as-child>
    <slot />
  </ContextMenuTrigger>
</template>
