<script setup lang="ts">
import type { CanonicalSize, CanonicalTone } from '@dzup-ui/contracts'
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
import { useDzDefaults, useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { sliderVariants } from './DzSlider.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/** The value the thumb sits at; defaults to `0`. */
const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<DzSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  size: undefined,
  tone: undefined,
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

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

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

/**
 * Application-wide defaults (ADR-20 §6, adopted in TASK-R5-O3).
 *
 * Each axis keeps the literal it carried in `withDefaults` as `resolve`'s last
 * link, so an unprovided tree renders exactly what it rendered before.
 */
const { resolve } = useDzDefaults()

/** Resolved size: prop, then provider, then default */
const resolvedSize = computed(
  () => resolve<CanonicalSize>('DzSlider', 'size', [props.size]) ?? 'md',
)

/** Resolved tone: prop, then provider, then default */
const resolvedTone = computed(
  () => resolve<CanonicalTone>('DzSlider', 'tone', [props.tone]) ?? 'primary',
)

const styles = computed(() =>
  sliderVariants({
    size: resolvedSize.value,
    tone: resolvedTone.value,
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
  /** Move keyboard focus to the thumb. */
  focus: (): void => {
    const ref = thumbRef.value
    if (!ref)
      return
    const el = (ref as { $el?: HTMLElement }).$el ?? (ref as HTMLElement)
    el?.focus?.()
  },
})

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div data-part="root" :class="[ui?.root]" v-bind="dzTestId('dz-slider')">
    <SliderRoot
      :id="resolvedId"
      :dir="dzDirection"
      data-part="control"
      :model-value="sliderValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="resolvedDisabled"
      :orientation="orientation"
      :name="name"
      :class="[rootClasses, ui?.control]"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      :data-state="resolvedDisabled ? 'disabled' : 'idle'"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-required="resolvedRequired ? '' : undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      :data-tone="resolvedTone"
      style="contain: layout style"
      v-bind="{ ...$attrs, class: undefined }"
      @update:model-value="handleValueChange"
    >
      <span v-if="$slots.default" data-part="label" :class="[styles.label(), ui?.label]">
        <slot />
      </span>
      <SliderTrack :class="styles.track()">
        <SliderRange :class="styles.range()" />
      </SliderTrack>
      <!--
        The thumb is deferred to the client, and that is Reka's design.

        On the server it renders `display: none`, at `left: 0%`, with
        `aria-valuemin`/`aria-valuemax` and no `aria-valuenow` — the value comes
        from a collection that registers on mount. Setting `aria-valuenow` here
        does not help: the primitive binds the attribute itself and its binding
        wins over a fallthrough, and a hidden node announces nothing to
        assistive technology either way. Recorded rather than worked around, and
        `form-controls-ssr.spec.ts` asserts the deferral so a future Reka that
        changes it is noticed rather than assumed.
      -->
      <SliderThumb
        ref="thumbRef"
        data-part="indicator"
        :class="[cn(styles.thumb(), resolvedInvalid && 'ring-2 ring-[var(--dz-danger)] border-[var(--dz-danger)]'), ui?.indicator]"
        :aria-label="ariaLabel ?? 'Slider thumb'"
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
      data-part="error"
      class="mt-[var(--dz-spacing-1)] text-[length:var(--dz-text-xs)] text-[var(--dz-danger)]"
      :class="[ui?.error]"
      role="alert"
    >
      {{ error }}
    </p>
  </div>
</template>
