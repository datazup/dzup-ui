<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzSliderEmits, DzSliderProps, DzSliderSlots } from './DzSlider.types.ts'
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
/**
 * DzSlider -- Range slider using Reka UI Slider (ADR-07).
 *
 * v-model via defineModel<number>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzSlider v-model="volume" :min="0" :max="100" :step="1" />
 * <DzSlider v-model="progress" tone="success" size="lg" />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { sliderVariants } from './DzSlider.variants.ts'

const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<DzSliderProps>(), {
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

const emit = defineEmits<DzSliderEmits>()
defineSlots<DzSliderSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Template ref for the slider thumb — exposed for programmatic focus. */
const thumbRef = ref<{ $el?: HTMLElement } | HTMLElement | null>(null)

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const styles = computed(() =>
  sliderVariants({
    size: props.size,
    tone: props.tone,
    orientation: props.orientation,
    disabled: resolvedDisabled.value || undefined,
  }),
)

/** Reka UI expects number[] for slider values */
const sliderValue = computed(() => [model.value])

function handleValueChange(raw: unknown): void {
  const values = raw as number[]
  const value = values[0] ?? 0
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

/** Expose programmatic focus for parity with DzInput. */
defineExpose({
  focus: (): void => {
    const ref = thumbRef.value
    if (!ref) return
    const el = (ref as { $el?: HTMLElement }).$el ?? (ref as HTMLElement)
    el?.focus?.()
  },
})
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
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby ?? fieldContext?.ariaDescribedby.value"
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
      ref="thumbRef"
      :class="styles.thumb()"
      :aria-label="ariaLabel ?? 'Slider thumb'"
      :aria-invalid="ariaInvalid ?? (fieldContext?.isInvalid.value || undefined)"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </SliderRoot>
</template>
