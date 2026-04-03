<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import { DzRadio, DzRadioGroup } from '@dzup-ui/core'
/**
 * DzRadioCompat -- backward-compatible wrapper for DzRadioGroup + DzRadio.
 *
 * Maps old dzup-ui single-component radio API to the new vNext compound API:
 * - `options` prop (array of radio items) -> DzRadioGroup with DzRadio children
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `@input` -> emits `change`
 *
 * @deprecated Use DzRadioGroup and DzRadio from @dzup-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old dzup-ui radio option shape */
interface RadioOption {
  /** Display label for the radio */
  label: string
  /** Value used for selection */
  value: string
  /** Whether this option is disabled */
  disabled?: boolean
}

/** Old dzup-ui size values */
type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DzRadioCompatProps {
  /** Radio options — each rendered as a DzRadio child */
  options?: RadioOption[]
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state propagated to all child radios */
  disabled?: boolean
  /** Form field name */
  name?: string
}

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
