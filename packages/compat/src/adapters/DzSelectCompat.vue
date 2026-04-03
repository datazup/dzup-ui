<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import type { DzSelectItem } from '@dzup-ui/core'
import { DzSelect } from '@dzup-ui/core'
/**
 * DzSelectCompat — backward-compatible wrapper for DzSelect.
 *
 * Maps old dzup-ui select API to the new vNext API:
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `options` prop (old) -> `items` prop (new), with shape mapping
 * - `v-model` is forwarded directly (string-based)
 * - `placeholder` -> `placeholder` (same name)
 *
 * @deprecated Use DzSelect from @dzup-ui/core instead.
 */
import { computed, onMounted } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old dzup-ui option shape */
interface OldSelectOption {
  /** Display text — old API used both `label` and `text` */
  label?: string
  /** Alternative display text key from old API */
  text?: string
  /** Value used for selection */
  value: string
  /** Whether this option is disabled */
  disabled?: boolean
}

/** Old dzup-ui size values */
type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DzSelectCompatProps {
  /** Options list — accepts both old and new shapes */
  options?: OldSelectOption[]
  /** New-style items (forwarded directly if provided) */
  items?: DzSelectItem[]
  /** Placeholder text */
  placeholder?: string
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Form field name */
  name?: string
}

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<DzSelectCompatProps>(), {
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<{
  change: [value: string]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

onMounted(() => {
  warnDeprecated('DzSelectCompat', 'DzSelect')
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

/** Normalize options to new DzSelectItem shape */
const mappedItems = computed<DzSelectItem[]>(() => {
  // Prefer new-style `items` prop if provided
  if (props.items)
    return props.items

  // Map old-style `options` to new `items` shape
  if (props.options) {
    return props.options.map((opt): DzSelectItem => ({
      label: opt.label ?? opt.text ?? opt.value,
      value: opt.value,
      disabled: opt.disabled,
    }))
  }

  return []
})
</script>

<template>
  <DzSelect
    v-model="model"
    :items="mappedItems"
    :placeholder="placeholder"
    :size="mappedSize"
    :disabled="disabled"
    :name="name"
    @change="emit('change', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template v-if="$slots.trigger" #trigger="triggerProps">
      <slot name="trigger" v-bind="triggerProps" />
    </template>
    <template v-if="$slots.item" #item="itemProps">
      <slot name="item" v-bind="itemProps" />
    </template>
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </DzSelect>
</template>
