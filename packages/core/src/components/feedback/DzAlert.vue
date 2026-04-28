<script setup lang="ts">
import type { DzAlertEmits, DzAlertProps, DzAlertSlots } from './DzAlert.types.ts'
/**
 * DzAlert — Contextual alert messages for user feedback.
 *
 * Supports four variants (filled, outline, subtle, ghost),
 * six semantic tones, optional icon, title, close button,
 * and action slot.
 *
 * @example
 * ```vue
 * <DzAlert tone="success" title="Saved">Your changes have been saved.</DzAlert>
 * <DzAlert tone="danger" closable @close="dismiss">Error occurred.</DzAlert>
 * ```
 */
import { computed, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { alertVariants } from './DzAlert.variants.ts'

const props = withDefaults(defineProps<DzAlertProps>(), {
  variant: 'subtle',
  tone: 'info',
  closable: false,
  icon: undefined,
  title: undefined,
})

const emit = defineEmits<DzAlertEmits>()
defineSlots<DzAlertSlots>()

const attrs = useAttrs()
const visible = ref(true)

/** Merged class string using cn() (ADR-10) */
const classes = computed(() =>
  cn(
    alertVariants({ variant: props.variant, tone: props.tone }),
    attrs.class as string | undefined,
  ),
)

/** Whether to use role="alert" (for danger/warning) or aria-live="polite" */
const isUrgent = computed(() => props.tone === 'danger' || props.tone === 'warning')

function handleClose(): void {
  visible.value = false
  emit('close')
}
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
    :role="isUrgent ? 'alert' : undefined"
    :aria-live="isUrgent ? undefined : 'polite'"
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

    <!-- Content area -->
    <div class="flex-1 min-w-0">
      <!-- Title -->
      <div v-if="title || $slots.title" class="font-medium mb-[var(--dz-spacing-1)]">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <!-- Message body -->
      <div class="text-[length:var(--dz-text-sm)]">
        <slot />
      </div>

      <!-- Actions -->
      <div v-if="$slots.actions" class="mt-[var(--dz-spacing-3)] flex gap-[var(--dz-spacing-2)]">
        <slot name="actions" />
      </div>
    </div>

    <!-- Close button -->
    <button
      v-if="closable"
      type="button"
      class="shrink-0 inline-flex items-center justify-center rounded-[var(--dz-radius-sm)] p-[var(--dz-spacing-1)] opacity-70 hover:opacity-100 dz-focus-ring-button transition-opacity"
      aria-label="Close"
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
/* Accessibility: respect user's motion preference */
@media (prefers-reduced-motion: reduce) {
  :deep(*),
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
