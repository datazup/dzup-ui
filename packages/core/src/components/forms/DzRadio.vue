<script setup lang="ts">
import type { DzRadioProps, DzRadioSlots } from './DzRadio.types.ts'
import { RadioGroupIndicator, RadioGroupItem } from 'reka-ui'
/**
 * DzRadio -- Radio option using Reka UI (ADR-07).
 *
 * Must be used within a DzRadioGroup. Wraps Reka UI's RadioGroupItem
 * + RadioGroupIndicator with dzup-ui styling.
 *
 * @example
 * ```vue
 * <DzRadioGroup v-model="color">
 *   <DzRadio value="red">Red</DzRadio>
 *   <DzRadio value="blue">Blue</DzRadio>
 * </DzRadioGroup>
 * ```
 */
import { computed, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { radioVariants } from './DzRadio.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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
const autoId = useId()

/**
 * Optional DzFormField context (ADR-08).
 *
 * A radio normally takes its state from its `DzRadioGroup`, which is why this
 * component read no context at all. But `disabled` and `invalid` reach the
 * group from a surrounding `DzFormField`, and a radio rendered inside a field
 * without a group — which the type system permits — took neither. And
 * `ariaInvalid` was declared, defaulted, and read nowhere: passing it did
 * nothing at all (renderer contract C2).
 *
 * The group's own state still wins where Reka propagates it; this only fills in
 * what nothing else was providing.
 */
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop, then the field context's, then auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)
const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))
const resolvedInvalid = computed(() => fieldContext?.isInvalid.value ?? false)
const resolvedAriaDescribedby = computed(
  () => props.ariaDescribedby ?? fieldContext?.ariaDescribedby.value,
)

const styles = computed(() => radioVariants({ size: props.size }))
const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))
</script>

<template>
  <label
    :class="rootClasses"
    :data-state="resolvedDisabled ? 'disabled' : 'idle'"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <RadioGroupItem
      :id="resolvedId"
      :value="value"
      :disabled="resolvedDisabled"
      :aria-label="ariaLabel"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
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
