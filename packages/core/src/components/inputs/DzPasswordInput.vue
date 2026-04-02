<script setup lang="ts">
import type {
  DzPasswordInputEmits,
  DzPasswordInputProps,
  DzPasswordInputSlots,
} from './DzPasswordInput.types.ts'
/**
 * DzPasswordInput — Password input with visibility toggle.
 *
 * Wraps DzInput with a show/hide toggle button that switches
 * between password and text input types.
 *
 * @example
 * ```vue
 * <DzPasswordInput v-model="password" placeholder="Enter password" />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { inputElementVariants, inputWrapperVariants } from './DzInput.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzPasswordInputProps>(), {
  variant: 'outline',
  size: 'md',
  tone: undefined,
  disabled: false,
  readonly: false,
  loading: false,
  invalid: false,
  required: false,
})

const emit = defineEmits<DzPasswordInputEmits>()
defineSlots<DzPasswordInputSlots>()

const attrs = useAttrs()
const inputRef = ref<HTMLInputElement | null>(null)
const autoId = useId()
const showPassword = ref(false)

const resolvedId = computed(() => props.id ?? autoId)
const isInvalid = computed(() => props.invalid || !!props.error)

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

const inputClasses = computed(() => inputElementVariants())

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

function toggleVisibility(): void {
  showPassword.value = !showPassword.value
}

function handleChange(): void {
  emit('change', model.value, { source: 'user' })
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

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
    <div :class="wrapperClasses">
      <!-- Prefix slot -->
      <span
        v-if="$slots.prefix"
        class="flex shrink-0 items-center text-[var(--dz-colors-neutral-400)]"
      >
        <slot name="prefix" />
      </span>

      <!-- Password input -->
      <input
        :id="resolvedId"
        ref="inputRef"
        v-model="model"
        :type="showPassword ? 'text' : 'password'"
        :class="inputClasses"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxlength"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="resolvedAriaDescribedby"
        :aria-invalid="isInvalid || undefined"
        :aria-required="required || undefined"
        autocomplete="current-password"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      >

      <!-- Toggle visibility button -->
      <button
        type="button"
        class="flex shrink-0 items-center justify-center text-[var(--dz-colors-neutral-400)] hover:text-[var(--dz-foreground)] transition-colors"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
        :disabled="disabled"
        tabindex="-1"
        @click="toggleVisibility"
      >
        <!-- Eye icon (show password) -->
        <svg
          v-if="!showPassword"
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
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <!-- Eye-off icon (hide password) -->
        <svg
          v-else
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
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
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
