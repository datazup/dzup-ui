<script setup lang="ts">
import type { DzToastViewportProps, DzToastViewportSlots } from './DzToast.types.ts'
import { ToastViewport } from 'reka-ui'
/**
 * DzToastViewport -- Renders the toast viewport and active toasts.
 *
 * Wraps Reka UI ToastViewport (ADR-07). Must be placed as a child of
 * DzToastProvider, typically at the app root level.
 *
 * @example
 * ```vue
 * <DzToastProvider>
 *   <App />
 *   <DzToastViewport position="bottom-right" />
 * </DzToastProvider>
 * ```
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import {
  DZ_TOAST_KEY,

} from './DzToast.types.ts'
import { toastVariants } from './DzToast.variants.ts'
import DzToast from './DzToast.vue'

const props = withDefaults(defineProps<DzToastViewportProps>(), {
  position: 'bottom-right',
})

defineSlots<DzToastViewportSlots>()

const attrs = useAttrs()
const context = inject(DZ_TOAST_KEY)

const styles = computed(() =>
  toastVariants({
    position: props.position,
  }),
)

function handleToastClose(id: string): void {
  context?.remove(id)
}

const viewportClasses = computed(() =>
  cn(styles.value.viewport(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ToastViewport
    :class="viewportClasses"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <DzToast
      v-for="toast in context?.toasts.value"
      :key="toast.id"
      :toast="toast"
      @close="handleToastClose"
    />
  </ToastViewport>
</template>
