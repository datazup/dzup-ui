<script setup lang="ts">
import type {
  DzRadioGroupEmits,
  DzRadioGroupProps,
  DzRadioGroupSlots,
} from './DzRadioGroup.types.ts'
import { RadioGroupRoot } from 'reka-ui'
/**
 * DzRadioGroup -- Radio group using Reka UI RadioGroupRoot (ADR-07).
 *
 * v-model via defineModel<string>() (ADR-16).
 * Wraps Reka UI's RadioGroupRoot with dzup-ui styling.
 *
 * @example
 * ```vue
 * <DzRadioGroup v-model="color" orientation="horizontal">
 *   <DzRadio value="red">Red</DzRadio>
 *   <DzRadio value="green">Green</DzRadio>
 *   <DzRadio value="blue">Blue</DzRadio>
 * </DzRadioGroup>
 * ```
 */
import { computed, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzRadioGroupProps>(), {
  orientation: 'vertical',
  disabled: false,
  size: 'md',
  name: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzRadioGroupEmits>()
defineSlots<DzRadioGroupSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/**
 * `required` reached the Reka primitive (which renders `aria-required`) but
 * never reached the DOM as the presence-only attribute ADR-19 §4 lists, so no
 * stylesheet could show a required field as required (renderer contract C3).
 */
const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

/**
 * The group read the field context for required, describedby and invalid — but
 * not for disabled, so `<DzFormField disabled>` left every radio in the group
 * live (renderer contract C2). The other four axes were already merged; this
 * was the one that was not.
 */
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

/** Reka UI emits AcceptableValue; we narrow to string for our API */
function handleValueChange(value: unknown): void {
  const stringValue = String(value ?? '')
  model.value = stringValue
  emit('change', stringValue)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

const classes = computed(() =>
  cn(
    'flex',
    props.orientation === 'vertical' ? 'flex-col gap-[var(--dz-spacing-2)]' : 'flex-row flex-wrap gap-[var(--dz-spacing-4)]',
    attrs.class as string | undefined,
  ),
)
</script>

<template>
  <RadioGroupRoot
    :id="resolvedId"
    :model-value="model"
    :disabled="resolvedDisabled"
    :name="name"
    :required="resolvedRequired"
    :orientation="orientation"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
    :aria-invalid="ariaInvalid ?? (fieldContext?.isInvalid.value || undefined)"
    :class="classes"
    :data-state="resolvedDisabled ? 'disabled' : 'ready'"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    :data-orientation="orientation"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot />
  </RadioGroupRoot>
</template>
