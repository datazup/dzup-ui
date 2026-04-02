<script setup lang="ts">
import type {
  DzNotificationEmits,
  DzNotificationProps,
  DzNotificationSlots,
} from './DzNotification.types.ts'
/**
 * DzNotification — Persistent notification message with optional auto-dismiss.
 *
 * Built from scratch. Different from DzToast in that it's a standalone
 * component, not managed by a provider. Supports tone, closable, duration.
 *
 * @example
 * ```vue
 * <DzNotification title="Upload complete" tone="success" closable>
 *   Your file has been uploaded successfully.
 *   <template #actions>
 *     <DzButton size="sm" variant="outline">View</DzButton>
 *   </template>
 * </DzNotification>
 * ```
 */
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import {
  notificationCloseVariants,
  notificationDescriptionVariants,
  notificationTitleVariants,
  notificationVariants,
} from './DzNotification.variants.ts'

const props = withDefaults(defineProps<DzNotificationProps>(), {
  tone: 'neutral',
  closable: false,
  duration: 0,
})

const emit = defineEmits<DzNotificationEmits>()
defineSlots<DzNotificationSlots>()

const attrs = useAttrs()
const visible = ref(true)
let dismissTimer: ReturnType<typeof setTimeout> | null = null

const classes = computed(() =>
  cn(
    notificationVariants({ tone: props.tone }),
    attrs.class as string | undefined,
  ),
)

const isUrgent = computed(() => props.tone === 'danger' || props.tone === 'warning')

function handleClose(): void {
  visible.value = false
  emit('close')
}

function handleAction(): void {
  emit('action')
}

onMounted(() => {
  if (props.duration > 0) {
    dismissTimer = setTimeout(() => handleClose(), props.duration)
  }
})

onBeforeUnmount(() => {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer)
  }
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    v-if="visible"
    :id="id"
    :class="classes"
    :role="isUrgent ? 'alert' : 'status'"
    :aria-live="isUrgent ? 'assertive' : 'polite'"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-tone="tone"
    :data-state="visible ? 'open' : 'closed'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Icon -->
    <slot name="icon">
      <component
        :is="icon"
        v-if="icon"
        class="h-5 w-5 shrink-0"
        aria-hidden="true"
      />
    </slot>

    <!-- Content -->
    <div class="flex-1 min-w-0 pr-[var(--dz-spacing-4)]">
      <!-- Title -->
      <div :class="notificationTitleVariants()">
        {{ title }}
      </div>

      <!-- Description / default slot -->
      <div v-if="description || $slots.default" :class="notificationDescriptionVariants()" class="mt-[var(--dz-spacing-1)]">
        <slot>{{ description }}</slot>
      </div>

      <!-- Actions -->
      <div v-if="$slots.actions" class="mt-[var(--dz-spacing-3)] flex gap-[var(--dz-spacing-2)]" @click="handleAction">
        <slot name="actions" />
      </div>
    </div>

    <!-- Close button -->
    <button
      v-if="closable"
      type="button"
      :class="notificationCloseVariants()"
      aria-label="Dismiss notification"
      @click="handleClose"
    >
      <svg
        class="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  [data-state] {
    transition: none !important;
  }
}
</style>
