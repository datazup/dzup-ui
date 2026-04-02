<script setup lang="ts">
import type { DzNumberInputEmits, DzNumberInputProps, DzNumberInputSlots } from './DzNumberInput.types.ts'
/**
 * DzNumberInput — Numeric input with increment/decrement buttons.
 *
 * Supports min/max clamping, configurable step, keyboard arrow key
 * increment/decrement, and full form-control contract compliance.
 *
 * @example
 * ```vue
 * <DzNumberInput v-model="quantity" :min="0" :max="100" :step="1" />
 * <DzNumberInput v-model="price" :step="0.01" placeholder="0.00" />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { inputElementVariants, inputWrapperVariants } from './DzInput.variants.ts'

const model = defineModel<number | undefined>({ default: undefined })

const props = withDefaults(defineProps<DzNumberInputProps>(), {
  variant: 'outline',
  size: 'md',
  tone: undefined,
  step: 1,
  disabled: false,
  readonly: false,
  loading: false,
  invalid: false,
  required: false,
})

const emit = defineEmits<DzNumberInputEmits>()
defineSlots<DzNumberInputSlots>()

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()

/** Resolved element ID */
const resolvedId = computed(() => props.id ?? autoId)

/** Whether the invalid state should show */
const isInvalid = computed(() => props.invalid || !!props.error)

/** Whether interaction is blocked */
const isInert = computed(() => props.disabled || props.readonly)

/** Whether increment is allowed */
const canIncrement = computed(() => {
  if (isInert.value)
    return false
  if (model.value === undefined)
    return true
  return props.max === undefined || model.value < props.max
})

/** Whether decrement is allowed */
const canDecrement = computed(() => {
  if (isInert.value)
    return false
  if (model.value === undefined)
    return true
  return props.min === undefined || model.value > props.min
})

/** Wrapper classes */
const wrapperClasses = computed(() =>
  cn(
    inputWrapperVariants({
      variant: props.variant,
      size: props.size,
      invalid: isInvalid.value,
    }),
    attrs.class as string | undefined,
  ),
)

/** Inner input element classes */
const inputClasses = computed(() =>
  cn(inputElementVariants(), 'text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'),
)

/** ID for error element */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

/** Clamp value to min/max bounds */
function clamp(value: number): number {
  let clamped = value
  if (props.min !== undefined)
    clamped = Math.max(clamped, props.min)
  if (props.max !== undefined)
    clamped = Math.min(clamped, props.max)
  return clamped
}

/** Displayed string in the input element */
const displayValue = computed(() =>
  model.value !== undefined ? String(model.value) : '',
)

function handleInputChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const raw = target.value.trim()
  if (raw === '') {
    model.value = undefined
    emit('change', 0, { source: 'user' })
    return
  }
  const parsed = Number.parseFloat(raw)
  if (!Number.isNaN(parsed)) {
    const clamped = clamp(parsed)
    model.value = clamped
    emit('change', clamped, { source: 'user' })
  }
}

function handleIncrement(): void {
  if (!canIncrement.value)
    return
  const current = model.value ?? 0
  const next = clamp(current + props.step)
  model.value = next
  emit('increment')
  emit('change', next, { source: 'user' })
}

function handleDecrement(): void {
  if (!canDecrement.value)
    return
  const current = model.value ?? 0
  const next = clamp(current - props.step)
  model.value = next
  emit('decrement')
  emit('change', next, { source: 'user' })
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    handleIncrement()
  }
  else if (event.key === 'ArrowDown') {
    event.preventDefault()
    handleDecrement()
  }
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

/** Expose the native input ref for programmatic focus */
defineExpose({ inputRef })
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :data-state="disabled ? 'disabled' : readonly ? 'readonly' : undefined"
    :data-tone="tone"
    :data-loading="loading ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Input wrapper with variant styling -->
    <div :class="wrapperClasses">
      <!-- Prefix slot -->
      <span
        v-if="$slots.prefix"
        class="flex shrink-0 items-center text-[var(--dz-colors-neutral-400)]"
      >
        <slot name="prefix" />
      </span>

      <!-- Decrement button -->
      <button
        type="button"
        class="flex shrink-0 items-center justify-center text-[var(--dz-colors-neutral-500)] hover:text-[var(--dz-foreground)] disabled:opacity-[var(--dz-input-disabled-opacity)] disabled:cursor-not-allowed transition-colors"
        :disabled="!canDecrement"
        aria-label="Decrease value"
        tabindex="-1"
        @click="handleDecrement"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <!-- Native input element -->
      <input
        :id="resolvedId"
        ref="inputRef"
        type="text"
        inputmode="numeric"
        :value="displayValue"
        :class="inputClasses"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="isInvalid || undefined"
        :aria-required="required || undefined"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="model"
        role="spinbutton"
        @change="handleInputChange"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <!-- Increment button -->
      <button
        type="button"
        class="flex shrink-0 items-center justify-center text-[var(--dz-colors-neutral-500)] hover:text-[var(--dz-foreground)] disabled:opacity-[var(--dz-input-disabled-opacity)] disabled:cursor-not-allowed transition-colors"
        :disabled="!canIncrement"
        aria-label="Increase value"
        tabindex="-1"
        @click="handleIncrement"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
