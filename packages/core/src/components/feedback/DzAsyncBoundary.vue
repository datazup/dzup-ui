<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { DzAsyncBoundaryEmits, DzAsyncBoundaryProps, DzAsyncBoundarySlots } from './DzAsyncBoundary.types.ts'
import { onErrorCaptured, ref } from 'vue'
import DzSpinner from './DzSpinner.vue'

const props = withDefaults(defineProps<DzAsyncBoundaryProps>(), {
  onError: undefined,
  timeout: undefined,
  delay: undefined,
})

const emit = defineEmits<DzAsyncBoundaryEmits>()
defineSlots<DzAsyncBoundarySlots>()

const capturedError = ref<unknown>(null)

let timeoutId: ReturnType<typeof setTimeout> | undefined

function onPending(): void {
  if (props.timeout !== undefined) {
    timeoutId = setTimeout(() => emit('timeout'), props.timeout)
  }
}

function onResolve(): void {
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId)
    timeoutId = undefined
  }
}

/** Handles async errors surfaced by <Suspense> via @error event */
function handleSuspenseError(err: unknown): void {
  capturedError.value = err
  props.onError?.(err, null, 'Suspense')
}

/** Handles sync render errors from child components via onErrorCaptured */
onErrorCaptured((err: unknown, instance: ComponentPublicInstance | null, info: string) => {
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
  <template v-if="capturedError !== null">
    <slot name="error" :error="capturedError" :reset="reset" />
  </template>
  <Suspense v-else @pending="onPending" @resolve="onResolve" @error="handleSuspenseError">
    <slot />
    <template #fallback>
      <slot name="loading">
        <DzSpinner />
      </slot>
    </template>
  </Suspense>
</template>
