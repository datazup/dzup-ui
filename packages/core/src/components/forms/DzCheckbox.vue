<script setup lang="ts">
import type { DzCheckboxEmits, DzCheckboxProps, DzCheckboxSlots } from './DzCheckbox.types.ts'
import { Check, Minus } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
/**
 * DzCheckbox -- Checkbox component using Reka UI (ADR-07).
 *
 * Wraps Reka UI's CheckboxRoot + CheckboxIndicator with dzip-ui
 * styling via tailwind-variants. v-model via defineModel<boolean>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzCheckbox v-model="agreed">I agree to the terms</DzCheckbox>
 * <DzCheckbox v-model="partial" indeterminate>Select all</DzCheckbox>
 * ```
 */
import { computed, inject, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { checkboxVariants } from './DzCheckbox.variants.ts'
import { DZ_CHECKBOX_GROUP_KEY } from './DzCheckboxGroup.types.ts'

const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzCheckboxProps>(), {
  value: undefined,
  disabled: false,
  size: undefined,
  indeterminate: false,
  name: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzCheckboxEmits>()
defineSlots<DzCheckboxSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()
const groupContext = inject(DZ_CHECKBOX_GROUP_KEY, null)

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

/** Resolved size from prop, group, or default */
const resolvedSize = computed(() => props.size ?? groupContext?.size.value ?? 'md')

/** Resolved disabled from prop, group, or field context */
const resolvedDisabled = computed(
  () => props.disabled || (groupContext?.disabled.value ?? false) || (fieldContext?.isDisabled.value ?? false),
)

/** Computed checked state for group mode */
const checkedState = computed<boolean | 'indeterminate'>(() => {
  if (props.indeterminate)
    return 'indeterminate'
  if (groupContext && props.value !== undefined) {
    return groupContext.modelValue.value.includes(props.value)
  }
  return model.value
})

const styles = computed(() => checkboxVariants({ size: resolvedSize.value }))
const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))

function handleCheckedChange(checked: boolean | 'indeterminate'): void {
  const isChecked = checked === true
  if (groupContext && props.value !== undefined) {
    groupContext.toggle(props.value)
  }
  else {
    model.value = isChecked
  }
  emit('change', isChecked)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

/** Icon size class based on resolved size */
const iconSizeClass = computed(() => {
  const map: Record<string, string> = {
    xs: 'h-2.5 w-2.5',
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
    xl: 'h-5 w-5',
  }
  return map[resolvedSize.value] ?? map.md
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <label
    :class="rootClasses"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-state="checkedState === 'indeterminate' ? 'indeterminate' : checkedState ? 'checked' : 'unchecked'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <CheckboxRoot
      :id="resolvedId"
      :checked="checkedState"
      :disabled="resolvedDisabled"
      :name="name"
      :required="required"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
      :aria-invalid="ariaInvalid ?? (fieldContext?.isInvalid.value || undefined)"
      :class="styles.indicator()"
      @update:checked="handleCheckedChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <CheckboxIndicator class="flex items-center justify-center">
        <Minus
          v-if="checkedState === 'indeterminate'"
          :class="iconSizeClass"
          aria-hidden="true"
        />
        <Check
          v-else
          :class="iconSizeClass"
          aria-hidden="true"
        />
      </CheckboxIndicator>
    </CheckboxRoot>
    <span v-if="$slots.default" :class="styles.label()">
      <slot />
    </span>
  </label>
</template>
