<script setup lang="ts">
import type { DzConfirmDialogEmits, DzConfirmDialogProps, DzConfirmDialogSlots } from './DzConfirmDialog.types.ts'
/**
 * DzConfirmDialog -- Pre-composed confirmation dialog.
 *
 * Wraps the DzDialog compound components to provide a simple
 * confirm/cancel interaction pattern with variant-based styling.
 *
 * @example
 * ```vue
 * <DzConfirmDialog
 *   v-model:open="showConfirm"
 *   title="Delete item?"
 *   message="This action cannot be undone."
 *   variant="danger"
 *   @confirm="handleDelete"
 *   @cancel="showConfirm = false"
 * />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import DzButton from '../buttons/DzButton.vue'
import { confirmDialogVariants } from './DzConfirmDialog.variants.ts'
import DzDialog from './DzDialog.vue'
import DzDialogContent from './DzDialogContent.vue'
import DzDialogDescription from './DzDialogDescription.vue'
import DzDialogTitle from './DzDialogTitle.vue'

const props = withDefaults(defineProps<DzConfirmDialogProps>(), {
  id: undefined,
  open: false,
  message: undefined,
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
  loading: false,
  size: 'sm',
})

const emit = defineEmits<DzConfirmDialogEmits>()
defineSlots<DzConfirmDialogSlots>()

const attrs = useAttrs()

/** Map CanonicalSize to DialogContentSize (xs -> sm, rest pass through) */
const dialogSize = computed(() => {
  if (props.size === 'xs')
    return 'sm'
  return props.size
})

const styles = computed(() => confirmDialogVariants({ variant: props.variant }))

const iconClasses = computed(() =>
  cn(styles.value.icon(), attrs.class as string | undefined),
)
const titleClasses = computed(() => styles.value.title())
const messageClasses = computed(() => styles.value.message())
const actionsClasses = computed(() => styles.value.actions())

/** Tone for the confirm button based on variant */
const confirmTone = computed(() =>
  props.variant === 'danger' ? 'danger' as const : 'primary' as const,
)

function handleOpenChange(value: boolean): void {
  emit('update:open', value)
}

function handleConfirm(): void {
  emit('confirm')
}

function handleCancel(): void {
  emit('update:open', false)
  emit('cancel')
}

function handleEscapeKeyDown(): void {
  handleCancel()
}

function handleInteractOutside(): void {
  handleCancel()
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DzDialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <DzDialogContent
      :id="id"
      :size="dialogSize"
      v-bind="{ ...$attrs, class: undefined }"
      @escape-key-down="handleEscapeKeyDown"
      @interact-outside="handleInteractOutside"
    >
      <!-- Icon -->
      <div :class="iconClasses" aria-hidden="true">
        <slot name="icon">
          <!-- Default icon: question mark for default, exclamation for danger -->
          <svg
            v-if="variant === 'danger'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
            />
          </svg>
        </slot>
      </div>

      <!-- Title -->
      <DzDialogTitle :class="titleClasses">
        {{ title }}
      </DzDialogTitle>

      <!-- Message / default slot -->
      <DzDialogDescription :class="messageClasses">
        <slot>
          {{ message }}
        </slot>
      </DzDialogDescription>

      <!-- Actions -->
      <div :class="actionsClasses">
        <DzButton
          variant="ghost"
          tone="neutral"
          :disabled="loading"
          data-testid="confirm-dialog-cancel"
          @click="handleCancel"
        >
          {{ cancelLabel }}
        </DzButton>
        <DzButton
          variant="solid"
          :tone="confirmTone"
          :loading="loading"
          :disabled="loading"
          data-testid="confirm-dialog-confirm"
          @click="handleConfirm"
        >
          {{ confirmLabel }}
        </DzButton>
      </div>
    </DzDialogContent>
  </DzDialog>
</template>
