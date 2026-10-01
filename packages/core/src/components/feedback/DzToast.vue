<script setup lang="ts">
import type { DzToastEmits, DzToastProps, DzToastSlots } from './DzToast.types.ts'
import { X } from '@lucide/vue'
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
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { toastVariants } from './DzToast.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
  cn(styles.value.root(), attrs.class as string | undefined, props.ui?.root),
)

const rootStateProps = computed(() => ({
  ...attrs,
  class: undefined,
  ...(props.open === undefined ? {} : { open: props.open }),
  ...(props.defaultOpen === undefined ? {} : { defaultOpen: props.defaultOpen }),
}))

// User-visible strings, resolved against the application's catalog (ADR-20).
const dzMessages = useComponentMessages('DzToast')

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <ToastRoot
    :duration="toast.duration"
    data-part="root"
    :class="rootClasses"
    :data-tone="toast.tone ?? 'neutral'"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-toast'), ...rootStateProps }"
    @update:open="(open: boolean) => { if (!open) handleClose() }"
  >
    <div data-part="indicator" :class="cn(styles.toneIndicator(), props.ui?.indicator)" aria-hidden="true" />

    <slot :toast="toast">
      <div class="flex-1 ps-[var(--dz-spacing-2)]">
        <ToastTitle data-part="title" :class="cn(styles.title(), props.ui?.title)">
          {{ toast.title }}
        </ToastTitle>
        <ToastDescription v-if="toast.description" data-part="description" :class="cn(styles.description(), props.ui?.description)">
          {{ toast.description }}
        </ToastDescription>
      </div>

      <div v-if="toast.actionLabel" class="flex items-center">
        <slot name="action" :toast="toast">
          <ToastAction
            data-part="action"
            :class="cn(styles.actionButton(), props.ui?.action)"
            :alt-text="toast.actionLabel"
            @click="handleAction"
          >
            {{ toast.actionLabel }}
          </ToastAction>
        </slot>
      </div>
    </slot>

    <ToastClose
      data-part="close"
      :class="cn(styles.closeButton(), props.ui?.close)"
      :aria-label="dzMessages.close"
      @click="handleClose"
    >
      <X class="h-3 w-3" aria-hidden="true" />
    </ToastClose>
  </ToastRoot>
</template>
