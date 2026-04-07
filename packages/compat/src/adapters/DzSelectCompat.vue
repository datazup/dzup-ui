<script setup lang="ts">
import type { CanonicalSize } from '@dzip-ui/contracts'
import type { DzSelectItem } from '@dzip-ui/core'
import type { DzSelectCompatProps, OldSize } from '../adapter-types.ts'
import { DzSelect } from '@dzip-ui/core'
/**
 * DzSelectCompat — backward-compatible wrapper for DzSelect.
 *
 * Maps old dzip-ui select API to the new vNext API:
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `options` prop (old) -> `items` prop (new), with shape mapping
 * - `v-model` is forwarded directly (string-based)
 * - `placeholder` -> `placeholder` (same name)
 *
 * @deprecated Use DzSelect from @dzip-ui/core instead.
 */
import { computed, onMounted } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

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
