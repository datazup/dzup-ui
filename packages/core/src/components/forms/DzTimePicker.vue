<script setup lang="ts">
import type { TimeValue } from 'reka-ui'
import type { DzTimePickerEmits, DzTimePickerProps, DzTimePickerSlots } from './DzTimePicker.types.ts'
import { Time } from '@internationalized/date'
import { Clock } from 'lucide-vue-next'
import { TimeFieldInput, TimeFieldRoot } from 'reka-ui'
/**
 * DzTimePicker -- Time selection using Reka UI TimeFieldRoot (ADR-07).
 *
 * v-model via defineModel<string>() -- HH:mm format (ADR-16).
 *
 * @example
 * ```vue
 * <DzTimePicker v-model="time" placeholder="Select time" />
 * <DzTimePicker v-model="time" :step="15" :hour12="false" />
 * ```
 */
import { computed, useAttrs } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { timePickerVariants } from './DzTimePicker.variants.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzTimePickerProps>(), {
  placeholder: undefined,
  min: undefined,
  max: undefined,
  step: undefined,
  disabled: false,
  size: 'md',
  variant: 'outline',
  name: undefined,
  locale: undefined,
  hour12: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzTimePickerEmits>()
defineSlots<DzTimePickerSlots>()

const attrs = useAttrs()
const fieldContext = useFormFieldContext()

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const styles = computed(() =>
  timePickerVariants({
    variant: props.variant,
    size: props.size,
    disabled: resolvedDisabled.value || undefined,
    invalid: resolvedInvalid.value || undefined,
  }),
)

/** Parse HH:mm string into Time object */
function parseTimeString(value: string): TimeValue | undefined {
  if (!value)
    return undefined
  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match)
    return undefined
  return new Time(Number.parseInt(match[1]!, 10), Number.parseInt(match[2]!, 10))
}

/** Format Time object to HH:mm string */
function formatTime(time: TimeValue | undefined): string {
  if (!time)
    return ''
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
}

const timeValue = computed(() => parseTimeString(model.value))

function handleTimeChange(value: TimeValue | undefined): void {
  const formatted = formatTime(value)
  model.value = formatted
  emit('change', formatted)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

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
  <TimeFieldRoot
    :id="id ?? fieldContext?.fieldId"
    :model-value="timeValue"
    :locale="locale ?? 'en-US'"
    :hour-cycle="hour12 === true ? 12 : hour12 === false ? 24 : undefined"
    :disabled="resolvedDisabled"
    :name="name"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
    :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleTimeChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <TimeFieldInput part="hour" :class="styles.input()" />
    <span :class="styles.separator()">:</span>
    <TimeFieldInput part="minute" :class="styles.input()" />

    <Clock class="ml-auto" :class="[styles.icon()]" aria-hidden="true" />
  </TimeFieldRoot>
</template>
