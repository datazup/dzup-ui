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
import { computed, useAttrs } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useFormControl } from '../../composables/useFormField/useFormControl.ts'
import { cn } from '../../utilities/cn.ts'

defineOptions({
  inheritAttrs: false,
})

/** Value of the selected radio; the default empty string selects none. */
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

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

const attrs = useAttrs()
const {
  fieldContext,
  resolvedId,
  resolvedDisabled,
  resolvedRequired,
  resolvedAriaDescribedby,
} = useFormControl(props)

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

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <RadioGroupRoot
    :id="resolvedId"
    :dir="dzDirection"
    data-part="root"
    :model-value="model"
    :disabled="resolvedDisabled"
    :name="name"
    :required="resolvedRequired"
    :orientation="orientation"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="resolvedAriaDescribedby"
    :aria-invalid="ariaInvalid ?? (fieldContext?.isInvalid.value || undefined)"
    :class="classes"
    :data-state="resolvedDisabled ? 'disabled' : 'ready'"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-required="resolvedRequired ? '' : undefined"
    :data-orientation="orientation"
    class="[contain:layout_style]"
    v-bind="{ ...dzTestId('dz-radio-group'), ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <slot />
  </RadioGroupRoot>
</template>
