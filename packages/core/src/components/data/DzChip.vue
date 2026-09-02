<script setup lang="ts">
import type { DzChipEmits, DzChipProps, DzChipSlots } from './DzChip.types.ts'
/**
 * DzChip — Closable chip component with tone/variant styling.
 *
 * Used for displaying compact information such as filters, selections,
 * or attributes. Supports a close button for dismissal.
 *
 * @example
 * ```vue
 * <DzChip tone="primary" closable @close="handleRemove">Vue 3</DzChip>
 * <DzChip variant="outline" tone="success">Active</DzChip>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { chipVariants } from './DzChip.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzChipProps>(), {
  variant: 'subtle',
  tone: 'neutral',
  size: 'md',
  closable: false,
  disabled: false,
})

const emit = defineEmits<DzChipEmits>()
defineSlots<DzChipSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    chipVariants({
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
    role="status"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
  >
    <!-- Prefix slot (icon, avatar, etc.) -->
    <slot name="prefix" />

    <!-- Default content (label) -->
    <slot />

    <!-- Close button -->
    <!--
      TASK-N1-O3 / WCAG 2.2 SC 2.5.8 Target Size (Minimum) — same treatment as
      DzTag: the button's box reaches the 24px floor, the growth is returned to
      the layout, and the hover pill paints at `--dz-control-visual-size`.
    -->
    <button
      v-if="closable"
      type="button"
      :disabled="disabled || undefined"
      :aria-label="`Remove ${ariaLabel ?? ''}`"
      class="dz-focus-ring-button dz-disabled-button dz-target-min-tight relative inline-flex items-center justify-center before:absolute before:inset-0 before:m-auto before:-z-10 before:size-[var(--dz-control-visual-size)] before:rounded-full hover:before:bg-[var(--dz-foreground)]/10"
      :class="[
        size === 'sm' ? 'h-3.5 w-3.5 [--dz-control-visual-size:0.875rem]' : '',
        size === 'md' ? 'h-4 w-4 [--dz-control-visual-size:1rem]' : '',
        size === 'lg' ? 'h-5 w-5 [--dz-control-visual-size:1.25rem]' : '',
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
