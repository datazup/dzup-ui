<script setup lang="ts">
import type { CanonicalSize } from '@dzup-ui/contracts'
import { DzSwitch } from '@dzup-ui/core'
/**
 * DzSwitchCompat — backward-compatible wrapper for DzSwitch.
 *
 * Maps old dzup-ui switch API to the new vNext API:
 * - `activeText` / `inactiveText` → rendered as label slot content
 * - `activeColor` / `inactiveColor` → dropped (use tokens), warned in dev
 * - `width` → dropped (CSS-controlled in vNext)
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `@input` → emits `change`
 *
 * @deprecated Use DzSwitch from @dzup-ui/core instead.
 */
import { computed, onMounted } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

/** Old dzup-ui size values */
type OldSize = 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface DzSwitchCompatProps {
  /** Old `size` prop — accepts both old and new values */
  size?: OldSize
  /** Disabled state */
  disabled?: boolean
  /** Form field name */
  name?: string
  /** Text displayed when switch is active (old API) */
  activeText?: string
  /** Text displayed when switch is inactive (old API) */
  inactiveText?: string
  /** Active color — dropped in vNext (use tokens) */
  activeColor?: string
  /** Inactive color — dropped in vNext (use tokens) */
  inactiveColor?: string
  /** Width — dropped in vNext (CSS-controlled) */
  width?: number
}

const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<DzSwitchCompatProps>(), {
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<{
  change: [checked: boolean]
  input: [checked: boolean]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

onMounted(() => {
  warnDeprecated('DzSwitchCompat', 'DzSwitch')

  if (import.meta.env?.DEV) {
    if (props.activeColor) {
      console.warn(
        '[dzup-ui/compat] DzSwitchCompat: "activeColor" prop is dropped in vNext. Use design tokens instead.',
      )
    }
    if (props.inactiveColor) {
      console.warn(
        '[dzup-ui/compat] DzSwitchCompat: "inactiveColor" prop is dropped in vNext. Use design tokens instead.',
      )
    }
    if (props.width) {
      console.warn(
        '[dzup-ui/compat] DzSwitchCompat: "width" prop is dropped in vNext. Use CSS to control width.',
      )
    }
  }
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

/** Label text based on current state */
const labelText = computed(() => {
  if (model.value) {
    return props.activeText
  }
  return props.inactiveText
})

function handleChange(checked: boolean): void {
  emit('change', checked)
  emit('input', checked)
}
</script>

<template>
  <DzSwitch
    v-model="model"
    :size="mappedSize"
    :disabled="disabled"
    :name="name"
    @change="handleChange"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
  >
    <template v-if="labelText">
      {{ labelText }}
    </template>
    <template v-else>
      <slot />
    </template>
  </DzSwitch>
</template>
