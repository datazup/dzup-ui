<script setup lang="ts">
import type { DzDialogCompatProps } from '../adapter-types.ts'
import {
  DzDialog,
  DzDialogClose,
  DzDialogContent,
  DzDialogDescription,
  DzDialogOverlay,
  DzDialogTitle,
} from '@dzup-ui/core'
/**
 * DzDialogCompat — backward-compatible wrapper for DzDialog.
 *
 * Maps old dzup-ui dialog API to the new vNext API:
 * - `visible` / `v-model:visible` -> `open` / `v-model:open` (via defineModel)
 * - `title` prop -> forwarded to DzDialogTitle slot
 * - `width` prop -> mapped to `size` on DzDialogContent
 * - `@close` -> forwarded from DzDialogContent events
 *
 * The new DzDialog uses Reka UI compound components (DzDialog, DzDialogContent,
 * DzDialogOverlay, DzDialogTitle, etc.). This compat adapter provides the
 * simpler old single-component API.
 *
 * @deprecated Use DzDialog compound components from @dzup-ui/core instead.
 */
import { onMounted, watch } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/**
 * Old API: v-model:visible  ->  New API: v-model:open
 * We expose `visible` as the model name for backward compatibility.
 */
const visible = defineModel<boolean>('visible', { default: false })

/** Also support the new `open` name for gradual migration */
const open = defineModel<boolean>('open', { default: undefined })

withDefaults(defineProps<DzDialogCompatProps>(), {
  modal: true,
  showClose: true,
  size: 'md',
})

const emit = defineEmits<{
  close: []
}>()

onMounted(() => {
  warnDeprecated('DzDialogCompat', 'DzDialog')
})

/**
 * Sync visible <-> open. `visible` is the primary model for compat.
 * If consumer uses v-model:open, sync it to visible.
 */
watch(open, (val) => {
  if (val !== undefined) {
    visible.value = val
  }
})

function handleClose(): void {
  visible.value = false
  emit('close')
}
</script>

<template>
  <DzDialog v-model:open="visible" :modal="modal">
    <DzDialogOverlay />
    <DzDialogContent :size="size">
      <DzDialogTitle v-if="title">
        {{ title }}
      </DzDialogTitle>
      <DzDialogDescription v-if="description">
        {{ description }}
      </DzDialogDescription>

      <!-- Default slot: dialog body content -->
      <slot />

      <!-- Actions slot: footer buttons -->
      <slot name="actions" />

      <DzDialogClose
        v-if="showClose"
        aria-label="Close"
        @click="handleClose"
      />
    </DzDialogContent>
  </DzDialog>
</template>
