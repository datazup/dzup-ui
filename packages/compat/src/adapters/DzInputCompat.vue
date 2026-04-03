<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import { DzInput } from '@dzup-ui/core'
/**
 * DzInputCompat — backward-compatible wrapper for DzInput.
 *
 * Maps old dzup-ui input API to the new vNext API:
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `v-model` is forwarded directly (same behavior)
 * - `clearable` is forwarded directly (same prop name)
 *
 * @deprecated Use DzInput from @dzup-ui/core instead.
 */
import { computed, onMounted } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old dzup-ui size values */
type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DzInputCompatProps {
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Placeholder text */
  placeholder?: string
  /** Whether the input shows a clear button */
  clearable?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Read-only state */
  readonly?: boolean
  /** HTML input type */
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'search'
  /** Maximum character length */
  maxlength?: number
}

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzInputCompatProps>(), {
  size: 'medium',
  clearable: false,
  disabled: false,
  readonly: false,
  type: 'text',
})

const emit = defineEmits<{
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}>()

onMounted(() => {
  warnDeprecated('DzInputCompat', 'DzInput')
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
</script>

<template>
  <DzInput
    v-model="model"
    :size="mappedSize"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    :readonly="readonly"
    :type="type"
    :maxlength="maxlength"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @clear="emit('clear')"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </DzInput>
</template>
