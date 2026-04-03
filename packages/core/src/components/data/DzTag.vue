<script setup lang="ts">
import type { DzTagEmits, DzTagProps, DzTagSlots } from './DzTag.types.ts'
/**
 * DzTag — Categorization tag component with tone/variant styling.
 *
 * Used for labeling, categorization, and filtering. Similar to DzChip
 * but semantically represents a category or classification.
 *
 * @example
 * ```vue
 * <DzTag tone="primary">Frontend</DzTag>
 * <DzTag variant="outline" tone="danger" closable @close="remove">Bug</DzTag>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { tagVariants } from './DzTag.variants.ts'

const props = withDefaults(defineProps<DzTagProps>(), {
  variant: 'subtle',
  tone: 'neutral',
  size: 'md',
  closable: false,
  disabled: false,
})

const emit = defineEmits<DzTagEmits>()
defineSlots<DzTagSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    tagVariants({
      variant: props.variant,
      size: props.size,
      tone: props.tone,
    }),
    attrs.class as string | undefined,
  ),
)

function handleClose(): void {
  if (props.disabled)
    return
  emit('close')
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleKeyDown(event: KeyboardEvent): void {
  if (props.closable && !props.disabled && (event.key === 'Delete' || event.key === 'Backspace')) {
    emit('close')
  }
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <span
    :id="id"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : 'idle'"
    :data-tone="tone"
    :data-disabled="disabled ? '' : undefined"
    :tabindex="closable ? 0 : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
  >
    <!-- Prefix slot (icon, etc.) -->
    <slot name="prefix" />

    <!-- Default content (label) -->
    <slot />

    <!-- Close button -->
    <button
      v-if="closable"
      type="button"
      :disabled="disabled || undefined"
      :aria-label="`Remove ${ariaLabel ?? ''}`"
      class="inline-flex items-center justify-center rounded-full hover:bg-[var(--dz-foreground)]/10 focus-visible:outline-none"
      :class="[
        size === 'sm' ? 'h-3 w-3' : '',
        size === 'md' ? 'h-3.5 w-3.5' : '',
        size === 'lg' ? 'h-4 w-4' : '',
      ]"
      @click.stop="handleClose"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="h-full w-full"
        aria-hidden="true"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </span>
</template>
