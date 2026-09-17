<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { DzAsyncBoundaryEmits, DzAsyncBoundaryProps, DzAsyncBoundarySlots } from './DzAsyncBoundary.types.ts'
/**
 * DzAsyncBoundary — `<Suspense>` wrapper that shows a loading fallback, catches the errors its subtree throws, and can time a pending child out.
 *
 * Combines `<Suspense>` with `onErrorCaptured`, so one boundary covers both an
 * async child that rejects and a synchronous child that throws during render.
 * The caught error is held locally and rendered through the `error` slot with a
 * `reset` callback; it is not re-thrown.
 *
 * @example
 * ```vue
 * <DzAsyncBoundary :timeout="5000" @timeout="warn">
 *   <AsyncReport />
 *   <template #loading><DzSkeleton /></template>
 *   <template #error="{ error, reset }">
 *     <DzAlert tone="danger">{{ error }}</DzAlert>
 *     <DzButton @click="reset">Retry</DzButton>
 *   </template>
 * </DzAsyncBoundary>
 * ```
 */
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

defineExpose({
  /** Clear the captured error so the default slot renders again and its async work re-runs. */
  reset,
})
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
