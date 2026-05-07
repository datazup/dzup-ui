<script setup lang="ts">
import type { DzErrorBoundaryProps, DzErrorBoundarySlots } from './DzErrorBoundary.types.ts'
import { onErrorCaptured, ref } from 'vue'

const props = defineProps<DzErrorBoundaryProps>()
defineSlots<DzErrorBoundarySlots>()

const capturedError = ref<unknown>(null)

onErrorCaptured((err, instance, info) => {
  capturedError.value = err
  props.onError?.(err, instance, info)
  return false
})

function reset(): void {
  capturedError.value = null
}

defineExpose({ reset })
</script>

<template>
  <slot v-if="capturedError === null" />
  <slot v-else name="fallback" :error="capturedError" :reset="reset" />
</template>
