<script setup lang="ts">
import type { DzOtpInputEmits, DzOtpInputProps, DzOtpInputSlots } from './DzOtpInput.types.ts'
import { PinInputInput, PinInputRoot } from 'reka-ui'
/**
 * DzOtpInput — One-time password / PIN input using Reka UI PinInput (ADR-07).
 *
 * v-model via defineModel<string>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzOtpInput v-model="code" :length="6" @complete="handleComplete" />
 * <DzOtpInput v-model="pin" :length="4" type="number" mask />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { otpInputVariants } from './DzOtpInput.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzOtpInputProps>(), {
  length: 6,
  type: 'number',
  mask: false,
  disabled: false,
  size: 'md',
  invalid: false,
  error: undefined,
  required: false,
  name: undefined,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzOtpInputEmits>()
defineSlots<DzOtpInputSlots>()

const attrs = useAttrs()
const fieldContext = useFormFieldContext()

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const styles = computed(() =>
  otpInputVariants({
    size: props.size,
    invalid: isInvalid.value || undefined,
    disabled: resolvedDisabled.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/** Reka UI PinInput works with string arrays */
const pinValues = computed(() => model.value.split(''))

function handleValueChange(values: string[]): void {
  const joined = values.join('')
  model.value = joined
}

function handleComplete(values: string[]): void {
  emit('complete', values.join(''))
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

/** Array of indices for v-for rendering */
const inputIndices = computed(() =>
  Array.from({ length: props.length }, (_, i) => i),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    style="contain: layout style"
  >
    <PinInputRoot
      :id="id ?? fieldContext?.fieldId"
      :model-value="pinValues"
      :disabled="resolvedDisabled"
      :name="name"
      :type="type === 'number' ? 'number' : 'text'"
      :mask="mask"
      :class="rootClasses"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
      :aria-invalid="ariaInvalid ?? (isInvalid || undefined)"
      v-bind="{ ...$attrs, class: undefined }"
      @update:model-value="handleValueChange"
      @complete="handleComplete"
    >
      <PinInputInput
        v-for="idx in inputIndices"
        :key="idx"
        :index="idx"
        :class="styles.input()"
        :disabled="resolvedDisabled"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </PinInputRoot>

    <!-- Error message -->
    <p
      v-if="error"
      :id="id ? `${id}-error` : undefined"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
