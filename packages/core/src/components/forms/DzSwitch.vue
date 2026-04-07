<script setup lang="ts">
import type { DzSwitchEmits, DzSwitchProps, DzSwitchSlots } from './DzSwitch.types.ts'
import { SwitchRoot, SwitchThumb } from 'reka-ui'
/**
 * DzSwitch -- Toggle switch using Reka UI (ADR-07).
 *
 * Wraps Reka UI's SwitchRoot + SwitchThumb with dzup-ui styling.
 * v-model via defineModel<boolean>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzSwitch v-model="notifications">Enable notifications</DzSwitch>
 * ```
 */
import { computed, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { switchVariants } from './DzSwitch.variants.ts'

const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzSwitchProps>(), {
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

const emit = defineEmits<DzSwitchEmits>()
defineSlots<DzSwitchSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const styles = computed(() => switchVariants({ size: props.size }))
const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))

function handleCheckedChange(checked: boolean): void {
  model.value = checked
  emit('change', checked)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}
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
    :data-state="model ? 'checked' : 'unchecked'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <SwitchRoot
      :id="resolvedId"
      :checked="model"
      :disabled="resolvedDisabled"
      :name="name"
      :required="required || fieldContext?.isRequired.value"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
      :aria-invalid="ariaInvalid ?? (fieldContext?.isInvalid.value || undefined)"
      :class="styles.track()"
      @update:checked="handleCheckedChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <SwitchThumb :class="styles.thumb()" />
    </SwitchRoot>
    <span v-if="$slots.default" :class="styles.label()">
      <slot />
    </span>
  </label>
</template>
