<script setup lang="ts">
import type { DzRatingEmits, DzRatingProps, DzRatingSlots } from './DzRating.types.ts'
import { Star } from 'lucide-vue-next'
/**
 * DzRating -- star/icon rating input (ADR-16 defineModel).
 *
 * Rendered as a single `role="slider"` widget: focusable, keyboard-operable,
 * and form-integrated via DzFormField. Each item layers a filled icon clipped
 * to a fill percentage over an empty icon, so full, half, and empty states
 * (and `allowHalf`) share one rendering mechanism.
 *
 * @example
 * ```vue
 * <DzRating v-model:value="score" :count="5" allow-half tone="warning" />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useDualModel } from '../../composables/useDualModel/index.ts'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { useComponentMessageFormat } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import DzIcon from '../media/DzIcon.vue'
import { ratingVariants } from './DzRating.variants.ts'

defineOptions({
  inheritAttrs: false,
})

/**
 * Both `v-model` and `v-model:value` (renderer contract C1).
 *
 * `v-model:value` keeps working unchanged; `v-model` is the binding every other
 * control in the catalog takes, and until now it silently did nothing here.
 */
const legacyValueModel = defineModel<number>('value', { default: 0 })

/** The rating, in icons, bound with the contract-conforming default `v-model`. Left `undefined` the component reads the legacy `v-model:value` instead; writes go to both (ADR-16, `useDualModel`). */
const primaryModel = defineModel<number | undefined>({ default: undefined })

const props = withDefaults(defineProps<DzRatingProps>(), {
  count: 5,
  allowHalf: false,
  allowClear: false,
  disabled: false,
  readonly: false,
  size: 'md',
  tone: 'warning',
  icon: undefined,
  emptyIcon: undefined,
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

const emit = defineEmits<DzRatingEmits>()

defineSlots<DzRatingSlots>()

// ArrowLeft and ArrowRight follow the writing direction (ADR-20 §4,
// TASK-R5-O3). This component declares `rtl: { keyboard: 'swap-horizontal' }`
// in its anatomy; until now nothing read the context that makes it true.
const dzDirection = useDzDirection()

const model = useDualModel(primaryModel, legacyValueModel)

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

/** Root template ref -- exposed for programmatic focus. */
const rootRef = ref<HTMLElement | null>(null)

/** Hover preview value; null when not hovering (commits only on click). */
const hoverValue = ref<number | null>(null)

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

/** Interactive = neither disabled nor readonly (readonly is display-only). */
const isInteractive = computed(() => !resolvedDisabled.value && !props.readonly)

/** Keyboard/half granularity. */
const step = computed(() => (props.allowHalf ? 0.5 : 1))

/** Value currently shown -- hover preview overrides the committed model. */
const displayValue = computed(() => hoverValue.value ?? model.value)

const resolvedFilledIcon = computed(() => props.icon ?? Star)
const resolvedEmptyIcon = computed(() => props.emptyIcon ?? props.icon ?? Star)

/** DzIcon has no 'icon' size token — fall back to 'md' for that case. */
const iconSize = computed(() => (props.size === 'icon' ? 'md' : props.size))

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context. */
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

/** Spoken value, e.g. "3 of 5". */
const valueText = computed(() => `${model.value} of ${props.count}`)

// Each star's tooltip is count-bearing — "1 star", "2 stars" — so it is a
// catalog message on Intl.PluralRules rather than a concatenation (TASK-R5-O4).
const dzFormat = useComponentMessageFormat('DzRating')

const styles = computed(() =>
  ratingVariants({
    size: props.size,
    tone: props.tone,
    disabled: resolvedDisabled.value || undefined,
    readonly: props.readonly || undefined,
    invalid: resolvedInvalid.value || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/** Percentage (0-100) of star `index` (1-based) that should appear filled. */
function fillPercent(index: number): number {
  const v = displayValue.value - (index - 1)
  if (v <= 0)
    return 0
  if (v >= 1)
    return 100
  return v * 100
}

function clamp(value: number): number {
  return Math.min(props.count, Math.max(0, value))
}

/** Snap to the active step granularity. */
function snap(value: number): number {
  const s = step.value
  return Math.round(value / s) * s
}

function commit(value: number): void {
  const next = clamp(value)
  if (next === model.value)
    return
  model.value = next
  emit('change', next, { source: 'user' })
}

/** Rating value implied by a pointer event over star `index`. */
function valueFromPointer(event: MouseEvent, index: number): number {
  if (!props.allowHalf)
    return index
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const isLeftHalf = event.clientX - rect.left < rect.width / 2
  return isLeftHalf ? index - 0.5 : index
}

function handlePointerMove(event: MouseEvent, index: number): void {
  if (!isInteractive.value)
    return
  hoverValue.value = valueFromPointer(event, index)
}

function handlePointerLeave(): void {
  hoverValue.value = null
}

function handleClick(event: MouseEvent, index: number): void {
  if (!isInteractive.value)
    return
  const value = valueFromPointer(event, index)
  if (props.allowClear && value === model.value) {
    hoverValue.value = null
    commit(0)
    return
  }
  commit(value)
}

function handleKeydown(event: KeyboardEvent): void {
  if (!isInteractive.value)
    return

  const increaseKey = dzDirection.value === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
  const decreaseKey = dzDirection.value === 'rtl' ? 'ArrowRight' : 'ArrowLeft'

  let next: number | null = null
  switch (event.key) {
    case increaseKey:
    case 'ArrowUp':
      next = clamp(snap(model.value) + step.value)
      break
    case decreaseKey:
    case 'ArrowDown':
      next = clamp(snap(model.value) - step.value)
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = props.count
      break
    default:
      if (/^[1-9]$/.test(event.key))
        next = clamp(Number(event.key))
      break
  }

  if (next === null)
    return
  event.preventDefault()
  hoverValue.value = null
  commit(next)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  hoverValue.value = null
  emit('blur', event)
}

/** Expose programmatic focus for parity with other form controls. */
defineExpose({
  /** Move keyboard focus to the rating control. */
  focus: (): void => rootRef.value?.focus(),
})

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div data-part="root" :class="[ui?.root]" v-bind="dzTestId('dz-rating')">
    <div
      :id="resolvedId"
      ref="rootRef"
      role="slider"
      data-part="control"
      :class="[rootClasses, ui?.control]"
      :tabindex="resolvedDisabled ? -1 : 0"
      :aria-valuemin="0"
      :aria-valuemax="count"
      :aria-valuenow="model"
      :aria-valuetext="valueText"
      :aria-label="ariaLabel ?? 'Rating'"
      :aria-labelledby="ariaLabelledby"
      :aria-describedby="resolvedAriaDescribedby"
      aria-orientation="horizontal"
      :aria-disabled="resolvedDisabled || undefined"
      :aria-readonly="readonly || undefined"
      :aria-required="resolvedRequired || undefined"
      :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
      :data-disabled="resolvedDisabled ? '' : undefined"
      :data-required="resolvedRequired ? '' : undefined"
      :data-readonly="readonly ? '' : undefined"
      :data-loading="loading ? '' : undefined"
      :aria-busy="loading || undefined"
      :data-invalid="resolvedInvalid ? '' : undefined"
      :data-tone="tone"
      v-bind="{ ...$attrs, class: undefined }"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
      @mouseleave="handlePointerLeave"
    >
      <span
        v-for="index in count"
        :key="index"
        data-part="item"
        :class="[styles.item(), ui?.item]"
        :title="dzFormat('starTitle', { count: index })"
        aria-hidden="true"
        @mousemove="handlePointerMove($event, index)"
        @click="handleClick($event, index)"
      >
        <span :class="styles.empty()">
          <slot name="emptyIcon" :index="index">
            <DzIcon :icon="resolvedEmptyIcon" :size="iconSize" />
          </slot>
        </span>
        <span data-part="item-indicator" :class="[styles.overlay(), ui?.['item-indicator']]" :style="{ width: `${fillPercent(index)}%` }">
          <span :class="styles.filled()">
            <slot name="icon" :index="index">
              <DzIcon :icon="resolvedFilledIcon" :size="iconSize" />
            </slot>
          </span>
        </span>
      </span>

      <!-- Hidden input for native form participation -->
      <input v-if="name" type="hidden" :name="name" :value="model">
    </div>

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
