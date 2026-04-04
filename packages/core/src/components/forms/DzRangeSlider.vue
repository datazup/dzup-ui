<script setup lang="ts">
import type { DzRangeSliderEmits, DzRangeSliderProps, DzRangeSliderSlots } from './DzRangeSlider.types.ts'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
/**
 * DzRangeSlider — Dual-thumb range slider using Reka UI Slider (ADR-07).
 *
 * v-model via defineModel<[number, number]>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzRangeSlider v-model="priceRange" :min="0" :max="1000" :step="10" />
 * <DzRangeSlider v-model="range" tone="success" size="lg" />
 * ```
 */
import { computed, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { rangeSliderVariants } from './DzRangeSlider.variants.ts'

const model = defineModel<[number, number]>({ default: () => [0, 100] as [number, number] })

const props = withDefaults(defineProps<DzRangeSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  size: 'md',
  tone: 'primary',
  orientation: 'horizontal',
  name: undefined,
  invalid: false,
  error: undefined,
  required: false,
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzRangeSliderEmits>()
defineSlots<DzRangeSliderSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const styles = computed(() =>
  rangeSliderVariants({
    size: props.size,
    tone: props.tone,
    orientation: props.orientation,
    disabled: resolvedDisabled.value || undefined,
  }),
)

/** Reka UI expects number[] for slider values */
const sliderValue = computed(() => [model.value[0], model.value[1]])

function handleValueChange(raw: unknown): void {
  const values = raw as number[]
  const value: [number, number] = [values[0] ?? 0, values[1] ?? 100]
  model.value = value
  emit('change', value)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <SliderRoot
    :id="resolvedId"
    :model-value="sliderValue"
    :min="min"
    :max="max"
    :step="step"
    :disabled="resolvedDisabled"
    :orientation="orientation"
    :name="name"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
    :aria-invalid="ariaInvalid ?? (fieldContext?.isInvalid.value || undefined)"
    :data-state="resolvedDisabled ? 'disabled' : 'idle'"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-tone="tone"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
  >
    <SliderTrack :class="styles.track()">
      <SliderRange :class="styles.range()" />
    </SliderTrack>
    <SliderThumb
      :class="styles.thumb()"
      :aria-label="ariaLabel ? `${ariaLabel} minimum` : 'Range minimum'"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <SliderThumb
      :class="styles.thumb()"
      :aria-label="ariaLabel ? `${ariaLabel} maximum` : 'Range maximum'"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </SliderRoot>
</template>
