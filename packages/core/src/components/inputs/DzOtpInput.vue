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
import { computed, nextTick, onMounted, ref, useAttrs, useId, watch } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { otpInputVariants } from './DzOtpInput.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const isInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

/** ID for the error message element (for aria-describedby) */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

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

/** Root wrapper — used to normalise Reka's aggregate input */
const rootRef = ref<HTMLElement | null>(null)

/**
 * Reka's PinInputRoot always appends a visually-hidden aggregate `<input>` for
 * native form submission. Out of the box it renders as a ~1px-wide text input,
 * which leaks an extra `<input>` into the DOM and breaks cell-count semantics.
 *
 * We coerce it to `type="hidden"`: that keeps its `name`/`value` for form
 * submission while guaranteeing it is never focusable (no stray Tab stop) and
 * is excluded by the canonical `type !== 'hidden'` cell filter, so it is never
 * counted as an OTP cell. It is already `aria-hidden` + `tabindex="-1"` upstream.
 */
function normalizeAggregateInput(): void {
  const aggregate = rootRef.value?.querySelector<HTMLInputElement>(
    'input[aria-hidden="true"]',
  )
  if (aggregate && aggregate.type !== 'hidden')
    aggregate.type = 'hidden'
}

onMounted(normalizeAggregateInput)
watch(() => props.length, () => void nextTick(normalizeAggregateInput))
</script>

<template>
  <div
    ref="rootRef"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="resolvedDisabled ? 'disabled' : undefined"
    style="contain: layout style"
  >
    <PinInputRoot
      :id="resolvedId"
      :model-value="pinValues"
      :disabled="resolvedDisabled"
      :name="name"
      :type="type === 'number' ? 'number' : 'text'"
      :mask="mask"
      :class="rootClasses"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
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
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
