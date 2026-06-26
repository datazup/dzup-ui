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
import { computed, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { rangeSliderVariants } from './DzRangeSlider.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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

/** Template ref for the lower (minimum) thumb — exposed for programmatic focus. */
const thumbRef = ref<{ $el?: HTMLElement } | HTMLElement | null>(null)

/** Resolved element ID — prop overrides field context, falls back to auto-generated */
const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(
  () => props.disabled || (fieldContext?.isDisabled.value ?? false),
)

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const resolvedRequired = computed(
  () => props.required || (fieldContext?.isRequired.value ?? false),
)

/** ID for the error message element (for aria-describedby) */
const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby)
    parts.push(props.ariaDescribedby)
  if (errorId.value)
    parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value)
    parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

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

/** Expose programmatic focus (focuses the lower thumb) for parity with DzSlider. */
defineExpose({
  focus: (): void => {
    const ref = thumbRef.value
    if (!ref)
      return
    const el = (ref as { $el?: HTMLElement }).$el ?? (ref as HTMLElement)
    el?.focus?.()
  },
})
</script>

<template>
  <div>
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
      :aria-describedby="resolvedAriaDescribedby"
      :data-state="resolvedDisabled ? 'disabled' : 'idle'"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      :data-tone="tone"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @update:model-value="handleValueChange"
    >
      <span v-if="$slots.default" :class="styles.label()">
        <slot />
      </span>
      <SliderTrack :class="styles.track()">
        <SliderRange :class="styles.range()" />
      </SliderTrack>
      <SliderThumb
        ref="thumbRef"
        :class="cn(styles.thumb(), resolvedInvalid && 'ring-2 ring-[var(--dz-danger)] border-[var(--dz-danger)]')"
        :aria-label="ariaLabel ? `${ariaLabel} minimum` : 'Range minimum'"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        :aria-required="resolvedRequired || undefined"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <SliderThumb
        :class="cn(styles.thumb(), resolvedInvalid && 'ring-2 ring-[var(--dz-danger)] border-[var(--dz-danger)]')"
        :aria-label="ariaLabel ? `${ariaLabel} maximum` : 'Range maximum'"
        :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
        :aria-required="resolvedRequired || undefined"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </SliderRoot>

    <!-- Error message -->
    <p
      v-if="error"
      :id="errorId"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
