<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzContextMenuTriggerSlots } from './DzContextMenu.types.ts'
/**
 * DzContextMenuTrigger — Trigger area for DzContextMenu (right-click target).
 */
import { ContextMenuTrigger } from 'reka-ui'

defineSlots<DzContextMenuTriggerSlots>()
</script>


<template>
  <ContextMenuTrigger as-child>
    <slot />
  </ContextMenuTrigger>
</template>
