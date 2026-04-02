<script setup lang="ts">
import type { DzToastContext, DzToastProviderProps, DzToastProviderSlots, ToastItem } from './DzToast.types.ts'
import { ToastProvider } from 'reka-ui'
/**
 * DzToastProvider -- Provides toast context to the component tree.
 *
 * Wraps Reka UI ToastProvider (ADR-07) and manages toast state
 * via provide/inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzToastProvider :duration="5000">
 *   <App />
 *   <DzToastViewport />
 * </DzToastProvider>
 * ```
 */
import { provide, ref } from 'vue'
import {
  DZ_TOAST_KEY,

} from './DzToast.types.ts'

const props = withDefaults(defineProps<DzToastProviderProps>(), {
  duration: 5000,
  maxToasts: 5,
  swipeDirection: 'right',
})

defineSlots<DzToastProviderSlots>()

const toasts = ref<ToastItem[]>([])

let counter = 0

/** Generate a unique toast ID */
function generateId(): string {
  counter += 1
  return `dz-toast-${counter}-${Date.now()}`
}

/** Add a new toast notification */
function add(toast: Omit<ToastItem, 'id'>): string {
  const id = generateId()
  const item: ToastItem = {
    ...toast,
    id,
    duration: toast.duration ?? props.duration,
  }

  toasts.value = [item, ...toasts.value]

  // Enforce max visible toasts
  if (toasts.value.length > props.maxToasts) {
    toasts.value = toasts.value.slice(0, props.maxToasts)
  }

  return id
}

/** Remove a toast by its ID */
function remove(id: string): void {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

/** Remove all active toasts */
function clear(): void {
  toasts.value = []
}

const context: DzToastContext = {
  toasts,
  add,
  remove,
  clear,
}

provide(DZ_TOAST_KEY, context)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ToastProvider :swipe-direction="swipeDirection" :duration="duration">
    <slot />
  </ToastProvider>
</template>
