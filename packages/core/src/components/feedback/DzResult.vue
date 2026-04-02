<script setup lang="ts">
import type { DzResultProps, DzResultSlots } from './DzResult.types.ts'
/**
 * DzResult — Operation result display component.
 *
 * Shows the outcome of an operation with a status icon, title,
 * description, and optional action buttons.
 *
 * @example
 * ```vue
 * <DzResult
 *   status="success"
 *   title="Payment Successful"
 *   description="Your order has been placed."
 * >
 *   <template #actions>
 *     <DzButton tone="primary">View Order</DzButton>
 *     <DzButton variant="outline">Go Home</DzButton>
 *   </template>
 * </DzResult>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { resultVariants } from './DzResult.variants.ts'

const props = defineProps<DzResultProps>()
defineSlots<DzResultSlots>()

const attrs = useAttrs()
const styles = computed(() => resultVariants({ status: props.status }))

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
  <div
    :id="id"
    :class="rootClasses"
    role="status"
    :data-state="status"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Status icon -->
    <div :class="styles.icon()">
      <slot name="icon">
        <!-- Success -->
        <svg
          v-if="status === 'success'"
          class="h-16 w-16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>

        <!-- Error -->
        <svg
          v-else-if="status === 'error'"
          class="h-16 w-16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>

        <!-- Warning -->
        <svg
          v-else-if="status === 'warning'"
          class="h-16 w-16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        <!-- Info -->
        <svg
          v-else
          class="h-16 w-16"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </slot>
    </div>

    <!-- Title -->
    <h3 :class="styles.title()">
      {{ title }}
    </h3>

    <!-- Description -->
    <p v-if="description" :class="styles.description()">
      {{ description }}
    </p>

    <!-- Custom content -->
    <slot />

    <!-- Actions -->
    <div v-if="$slots.actions" :class="styles.actions()">
      <slot name="actions" />
    </div>
  </div>
</template>
