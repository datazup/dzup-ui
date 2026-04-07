<script setup lang="ts">
import type { CanonicalSize } from '@dzip-ui/contracts'
import type { DzCheckboxCompatProps, OldSize } from '../adapter-types.ts'
import { DzCheckbox } from '@dzip-ui/core'
/**
 * DzCheckboxCompat -- backward-compatible wrapper for DzCheckbox.
 *
 * Maps old dzip-ui checkbox API to the new vNext API:
 * - `label` prop -> rendered as default slot content
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `@input` -> emits `change`
 *
 * @deprecated Use DzCheckbox from @dzip-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

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
