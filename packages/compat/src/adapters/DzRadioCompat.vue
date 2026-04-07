<script setup lang="ts">
import type { CanonicalSize } from '@dzip-ui/contracts'
import type { DzRadioCompatProps, OldSize } from '../adapter-types.ts'
import { DzRadio, DzRadioGroup } from '@dzip-ui/core'
/**
 * DzRadioCompat -- backward-compatible wrapper for DzRadioGroup + DzRadio.
 *
 * Maps old dzip-ui single-component radio API to the new vNext compound API:
 * - `options` prop (array of radio items) -> DzRadioGroup with DzRadio children
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `@input` -> emits `change`
 *
 * @deprecated Use DzRadioGroup and DzRadio from @dzip-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzRadioCompatProps>(), {
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<{
  input: [value: string]
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const attrs = useAttrs()

onMounted(() => {
  warnDeprecated('DzRadioCompat', 'DzRadioGroup')
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

function handleChange(value: string): void {
  emit('change', value)
  emit('input', value)
}
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <DzRadioGroup
    v-model="model"
    :size="mappedSize"
    :disabled="disabled"
    :name="name"
    v-bind="attrs"
    @change="handleChange"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <DzRadio
      v-for="option in (options ?? [])"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      <slot name="option" :option="option">
        {{ option.label }}
      </slot>
    </DzRadio>
    <slot />
  </DzRadioGroup>
</template>
