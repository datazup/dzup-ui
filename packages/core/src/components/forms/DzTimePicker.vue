<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

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
import { computed, useAttrs, useId } from 'vue'
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
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const resolvedRequired = computed(
  () => props.required || (fieldContext?.isRequired.value ?? false),
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
  timePickerVariants({
    variant: props.variant,
    size: props.size,
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

/** Parsed min/max bounds passed to Reka's TimeFieldRoot */
const minTimeValue = computed(() => parseTimeString(props.min ?? ''))
const maxTimeValue = computed(() => parseTimeString(props.max ?? ''))

/** Reka expects the step interval as a DateStep object keyed by segment */
const resolvedStep = computed(() =>
  props.step !== undefined ? { minute: props.step } : undefined,
)

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


<template>
  <div>
    <TimeFieldRoot
    :id="resolvedId"
    v-slot="{ segments }"
    :model-value="timeValue"
    :locale="locale ?? 'en-US'"
    :hour-cycle="hour12 === true ? 12 : hour12 === false ? 24 : undefined"
    :min-value="minTimeValue"
    :max-value="maxTimeValue"
    :step="resolvedStep"
    :disabled="resolvedDisabled"
    :required="resolvedRequired"
    :name="name"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="resolvedAriaDescribedby"
    :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
    :aria-required="resolvedRequired || undefined"
    :data-state="resolvedDisabled ? 'disabled' : 'idle'"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleTimeChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!--
      Placeholder text shown only while empty. The segment inputs stay mounted
      (v-show, not v-if) so a programmatic selection is reflected immediately
      instead of mounting fresh, unpopulated segments. Each TimeFieldInput
      renders only its default slot, so the segment value must be passed
      explicitly — otherwise only the literal ":" separators show.
    -->
    <span
      v-show="!model && placeholder"
      :class="styles.separator()"
    >{{ placeholder }}</span>
    <span
      v-show="!(!model && placeholder)"
      class="inline-flex items-center"
    >
      <TimeFieldInput
        v-for="(item, index) in segments"
        :key="`${item.part}-${index}`"
        :part="item.part"
        :class="item.part === 'literal' ? styles.separator() : styles.input()"
      >
        {{ item.value }}
      </TimeFieldInput>
    </span>

    <Clock class="ml-auto" :class="[styles.icon()]" aria-hidden="true" />
    </TimeFieldRoot>

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
