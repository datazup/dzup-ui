<script setup lang="ts">
import type { ButtonVariant, CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
import { DzButton } from '@dzup-ui/core'
/**
 * DzButtonCompat — backward-compatible wrapper for DzButton.
 *
 * Maps old dzup-ui button API to the new vNext API:
 * - `type` prop (old: "primary" | "success" | "warning" | "danger" | "info" | "default")
 *   maps to `tone` + `variant="solid"` in the new API.
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 *
 * @deprecated Use DzButton from @dzup-ui/core instead.
 */
import { computed, onMounted, useAttrs } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old dzup-ui button type prop values */
type OldButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | 'text' | 'link'

/** Old dzup-ui size values */
type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DzButtonCompatProps {
  /** Old `type` prop — maps to variant + tone in vNext */
  type?: OldButtonType
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Loading state */
  loading?: boolean
}

const props = withDefaults(defineProps<DzButtonCompatProps>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const attrs = useAttrs()

onMounted(() => {
  warnDeprecated('DzButtonCompat', 'DzButton')
})

/** Map old type to new tone */
const mappedTone = computed<CanonicalTone>(() => {
  const typeToTone: Record<OldButtonType, CanonicalTone> = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    default: 'neutral',
    text: 'neutral',
    link: 'neutral',
  }
  return typeToTone[props.type ?? 'default']
})

/** Map old type to new variant */
const mappedVariant = computed<ButtonVariant>(() => {
  if (props.type === 'text')
    return 'text'
  if (props.type === 'link')
    return 'link'
  return 'solid'
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

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <DzButton
    :variant="mappedVariant"
    :tone="mappedTone"
    :size="mappedSize"
    :disabled="disabled"
    :loading="loading"
    v-bind="attrs"
    @click="emit('click', $event)"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <slot />
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix" />
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix" />
    </template>
  </DzButton>
</template>
