<script setup lang="ts">
import type {
  DzToggleButtonEmits,
  DzToggleButtonProps,
  DzToggleButtonSlots,
} from './DzToggleButton.types.ts'
/**
 * DzToggleButton — Toggleable button with pressed state.
 *
 * Uses v-model via defineModel<boolean>() (ADR-16) to track pressed state.
 * Supports aria-pressed for accessibility.
 *
 * @example
 * ```vue
 * <DzToggleButton v-model="isBold">
 *   <BoldIcon />
 *   Bold
 * </DzToggleButton>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { toggleButtonVariants } from './DzToggleButton.variants.ts'

const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzToggleButtonProps>(), {
  variant: 'outline',
  size: 'md',
  tone: undefined,
  disabled: false,
})

const emit = defineEmits<DzToggleButtonEmits>()
defineSlots<DzToggleButtonSlots>()

const attrs = useAttrs()

const classes = computed(() =>
  cn(
    toggleButtonVariants({
      variant: props.variant,
      size: props.size,
      pressed: model.value,
    }),
    attrs.class as string | undefined,
  ),
)

function handleClick(): void {
  if (props.disabled)
    return
  model.value = !model.value
  emit('change', model.value)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <button
    :id="id"
    type="button"
    :class="classes"
    :disabled="disabled || undefined"
    :aria-pressed="model"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : model ? 'pressed' : 'idle'"
    :data-tone="tone"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot name="prefix" />
    <slot />
    <slot name="suffix" />
  </button>
</template>
