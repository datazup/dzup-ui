<script setup lang="ts">
import type { DzRadioProps, DzRadioSlots } from './DzRadio.types.ts'
import { RadioGroupIndicator, RadioGroupItem } from 'reka-ui'
/**
 * DzRadio -- Radio option using Reka UI (ADR-07).
 *
 * Must be used within a DzRadioGroup. Wraps Reka UI's RadioGroupItem
 * + RadioGroupIndicator with dzip-ui styling.
 *
 * @example
 * ```vue
 * <DzRadioGroup v-model="color">
 *   <DzRadio value="red">Red</DzRadio>
 *   <DzRadio value="blue">Blue</DzRadio>
 * </DzRadioGroup>
 * ```
 */
import { computed, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { radioVariants } from './DzRadio.variants.ts'

const props = withDefaults(defineProps<DzRadioProps>(), {
  disabled: false,
  size: 'md',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

defineSlots<DzRadioSlots>()

const attrs = useAttrs()
const styles = computed(() => radioVariants({ size: props.size }))
const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <label
    :class="rootClasses"
    :data-disabled="disabled ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <RadioGroupItem
      :id="id"
      :value="value"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="ariaDescribedby"
      :class="styles.indicator()"
    >
      <RadioGroupIndicator class="flex items-center justify-center">
        <span :class="styles.dot()" aria-hidden="true" />
      </RadioGroupIndicator>
    </RadioGroupItem>
    <span v-if="$slots.default" :class="styles.label()">
      <slot />
    </span>
  </label>
</template>
