<script setup lang="ts">
import type { DzErrorBoundaryProps, DzErrorBoundarySlots } from './DzErrorBoundary.types.ts'
/**
 * DzErrorBoundary — catches the render errors its subtree throws and swaps in a fallback slot instead of letting them reach the application root.
 *
 * Synchronous render errors only (`onErrorCaptured` returning `false`); an async
 * child that rejects needs `DzAsyncBoundary`. The error is held locally, handed
 * to `fallback` with a `reset` callback, and not re-thrown.
 *
 * @example
 * ```vue
 * <DzErrorBoundary :on-error="report">
 *   <RiskyPanel />
 *   <template #fallback="{ error, reset }">
 *     <DzAlert tone="danger">{{ error }}</DzAlert>
 *     <DzButton @click="reset">Try again</DzButton>
 *   </template>
 * </DzErrorBoundary>
 * ```
 */
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

defineExpose({
  /** Clear the captured error so the guarded content renders again in place of the fallback. */
  reset,
})
</script>

<template>
  <slot v-if="capturedError === null" />
  <slot v-else name="fallback" :error="capturedError" :reset="reset" />
</template>
