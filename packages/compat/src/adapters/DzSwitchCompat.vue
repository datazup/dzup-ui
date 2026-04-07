<script setup lang="ts">
import type { CanonicalSize } from '@dzip-ui/contracts'
import type { DzSwitchCompatProps, OldSize } from '../adapter-types.ts'
import { DzSwitch } from '@dzip-ui/core'
/**
 * DzSwitchCompat — backward-compatible wrapper for DzSwitch.
 *
 * Maps old dzip-ui switch API to the new vNext API:
 * - `activeText` / `inactiveText` → rendered as label slot content
 * - `activeColor` / `inactiveColor` → dropped (use tokens), warned in dev
 * - `width` → dropped (CSS-controlled in vNext)
 * - `size` values: "small" -> "sm", "medium" -> "md", "large" -> "lg"
 * - `@input` → emits `change`
 *
 * @deprecated Use DzSwitch from @dzip-ui/core instead.
 */
import { computed, onMounted } from 'vue'
import { warnDeprecated } from '../utils/deprecation.ts'

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
        '[dzip-ui/compat] DzSwitchCompat: "activeColor" prop is dropped in vNext. Use design tokens instead.',
      )
    }
    if (props.inactiveColor) {
      console.warn(
        '[dzip-ui/compat] DzSwitchCompat: "inactiveColor" prop is dropped in vNext. Use design tokens instead.',
      )
    }
    if (props.width) {
      console.warn(
        '[dzip-ui/compat] DzSwitchCompat: "width" prop is dropped in vNext. Use CSS to control width.',
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
