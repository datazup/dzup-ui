<script setup lang="ts">
import type { DzCheckboxGroupContext, DzCheckboxGroupEmits, DzCheckboxGroupProps, DzCheckboxGroupSlots } from './DzCheckboxGroup.types.ts'
/**
 * DzCheckboxGroup -- Groups DzCheckbox components with a shared string[] model.
 *
 * Provides context to child DzCheckbox components via inject (ADR-08).
 * v-model via defineModel<string[]>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzCheckboxGroup v-model="selectedFruits" orientation="vertical">
 *   <DzCheckbox value="apple">Apple</DzCheckbox>
 *   <DzCheckbox value="banana">Banana</DzCheckbox>
 *   <DzCheckbox value="cherry">Cherry</DzCheckbox>
 * </DzCheckboxGroup>
 * ```
 */
import { computed, provide, useAttrs, useId } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import {
  DZ_CHECKBOX_GROUP_KEY,

} from './DzCheckboxGroup.types.ts'

defineOptions({
  inheritAttrs: false,
})

/** Values of the options that are checked; the default empty array checks none. */
const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<DzCheckboxGroupProps>(), {
  orientation: 'vertical',
  disabled: false,
  size: 'md',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzCheckboxGroupEmits>()
defineSlots<DzCheckboxGroupSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

/** Disabled resolved from prop or an enclosing DzFormField */
const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

/** aria-describedby resolved from prop or an enclosing DzFormField */
const resolvedAriaDescribedby = computed(
  () => props.ariaDescribedby ?? fieldContext?.ariaDescribedby.value,
)

/** aria-invalid resolved from prop or an enclosing DzFormField */
const resolvedAriaInvalid = computed(
  () => props.ariaInvalid ?? (fieldContext?.isInvalid.value || undefined),
)

function toggle(value: string): void {
  const current = [...model.value]
  const index = current.indexOf(value)
  if (index === -1) {
    current.push(value)
  }
  else {
    current.splice(index, 1)
  }
  model.value = current
  emit('change', current)
}

const context: DzCheckboxGroupContext = {
  modelValue: model,
  disabled: resolvedDisabled,
  size: computed(() => props.size ?? 'md'),
  toggle,
}

provide(DZ_CHECKBOX_GROUP_KEY, context)

const classes = computed(() =>
  cn(
    'flex',
    props.orientation === 'vertical' ? 'flex-col gap-[var(--dz-spacing-3)]' : 'flex-row flex-wrap gap-[var(--dz-spacing-4)]',
    attrs.class as string | undefined,
  ),
)

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div
    :id="resolvedId"
    data-part="root"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="resolvedAriaDescribedby"
    :aria-invalid="resolvedAriaInvalid"
    :data-state="resolvedDisabled ? 'disabled' : 'ready'"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-orientation="orientation"
    role="group"
    style="contain: layout style"
    v-bind="{ ...dzTestId('dz-checkbox-group'), ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
