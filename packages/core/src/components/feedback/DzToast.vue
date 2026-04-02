<script setup lang="ts">
import type { DzToastEmits, DzToastProps, DzToastSlots } from './DzToast.types.ts'
import { X } from 'lucide-vue-next'
import {
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRoot,
  ToastTitle,
} from 'reka-ui'
/**
 * DzToast -- Individual toast notification using Reka UI (ADR-07).
 *
 * Renders a single toast with title, description, action, and close button.
 * Automatically dismissed after the configured duration.
 *
 * @example
 * ```vue
 * <DzToast :toast="toastItem" @close="handleClose" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { toastVariants } from './DzToast.variants.ts'

const props = withDefaults(defineProps<DzToastProps>(), {
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzToastEmits>()
defineSlots<DzToastSlots>()

const attrs = useAttrs()

const styles = computed(() =>
  toastVariants({
    tone: props.toast.tone ?? 'neutral',
  }),
)

function handleClose(): void {
  emit('close', props.toast.id)
}

function handleAction(): void {
  props.toast.onAction?.()
  emit('action', props.toast.id)
}

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <ToastRoot
    :duration="toast.duration"
    :class="rootClasses"
    :data-tone="toast.tone ?? 'neutral'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:open="(open: boolean) => { if (!open) handleClose() }"
  >
    <div :class="styles.toneIndicator()" aria-hidden="true" />

    <slot :toast="toast">
      <div class="flex-1 pl-[var(--dz-spacing-2)]">
        <ToastTitle :class="styles.title()">
          {{ toast.title }}
        </ToastTitle>
        <ToastDescription v-if="toast.description" :class="styles.description()">
          {{ toast.description }}
        </ToastDescription>
      </div>

      <div v-if="toast.actionLabel" class="flex items-center">
        <slot name="action" :toast="toast">
          <ToastAction
            :class="styles.actionButton()"
            :alt-text="toast.actionLabel"
            @click="handleAction"
          >
            {{ toast.actionLabel }}
          </ToastAction>
        </slot>
      </div>
    </slot>

    <ToastClose
      :class="styles.closeButton()"
      aria-label="Close notification"
      @click="handleClose"
    >
      <X class="h-3 w-3" aria-hidden="true" />
    </ToastClose>
  </ToastRoot>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  [data-state='open'],
  [data-state='closed'] {
    animation: none !important;
    transition: none !important;
  }
}
</style>
