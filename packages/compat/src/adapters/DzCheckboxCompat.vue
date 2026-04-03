<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import { DzCheckbox } from '@dzup-ui/core'
/**
 * DzCheckboxCompat -- backward-compatible wrapper for DzCheckbox.
 *
 * Maps old dzup-ui checkbox API to the new vNext API:
 * - `label` prop -> rendered as default slot content
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `@input` -> emits `change`
 *
 * @deprecated Use DzCheckbox from @dzup-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old dzup-ui size values */
type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DzCheckboxCompatProps {
  /** Label text — rendered as slot content in the new API */
  label?: string
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Indeterminate (mixed) state */
  indeterminate?: boolean
  /** Form field name */
  name?: string
  /** Value for checkbox groups */
  value?: string
}

const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzCheckboxCompatProps>(), {
  size: 'medium',
  disabled: false,
  indeterminate: false,
})

const emit = defineEmits<{
  input: [checked: boolean]
  change: [checked: boolean]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const attrs = useAttrs()

onMounted(() => {
  warnDeprecated('DzCheckboxCompat', 'DzCheckbox')
})

/** Map old size values to canonical sizes */
const mappedSize = computed<CanonicalSize>(() => {
  const sizeMap: Record<OldSize, CanonicalSize> = {
    small: 'sm',
    medium: 'md',
    large: 'lg',
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  }
  return sizeMap[props.size ?? 'medium']
})

function handleChange(checked: boolean): void {
  emit('change', checked)
  emit('input', checked)
}
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <DzCheckbox
    v-model="model"
    :size="mappedSize"
    :disabled="disabled"
    :indeterminate="indeterminate"
    :name="name"
    :value="value"
    v-bind="attrs"
    @change="handleChange"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <slot>{{ label }}</slot>
  </DzCheckbox>
</template>
