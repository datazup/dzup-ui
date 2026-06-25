<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

import type { DzKnobEmits, DzKnobProps, DzKnobSlots } from './DzKnob.types.ts'
/**
 * DzKnob -- rotary numeric input rendered as an SVG circular dial (ADR-16 defineModel).
 *
 * Rendered as a single `role="slider"` widget: focusable, keyboard-operable,
 * pointer-draggable, and form-integrated via DzFormField. A muted range arc
 * spans a 270° gauge; a tone-colored value arc fills it in proportion to the
 * value.
 *
 * @example
 * ```vue
 * <DzKnob v-model:value="level" :min="0" :max="100" value-template="{value}%" show-value />
 * ```
 */
import { computed, ref, useAttrs, useId } from 'vue'
import { useFormFieldContext } from '../../composables/useFormField/index.ts'
import { cn } from '../../utilities/cn.ts'
import { knobTokens } from './DzKnob.tokens.ts'
import { knobVariants } from './DzKnob.variants.ts'

const model = defineModel<number>('value', { default: 0 })

const props = withDefaults(defineProps<DzKnobProps>(), {
  min: 0,
  max: 100,
  step: 1,
  valueTemplate: '{value}',
  strokeWidth: 8,
  showValue: true,
  disabled: false,
  readonly: false,
  size: 'md',
  tone: 'primary',
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

const emit = defineEmits<DzKnobEmits>()
defineSlots<DzKnobSlots>()

const attrs = useAttrs()
const autoId = useId()
const fieldContext = useFormFieldContext()

// ---------------------------------------------------------------------------
// Geometry constants -- a 270° gauge with a 90° gap at the bottom.
// Angles are SVG-convention degrees (0 = 3 o'clock, increasing clockwise).
// ---------------------------------------------------------------------------
const VIEWBOX = 100
const CENTER = VIEWBOX / 2
const START_ANGLE = 135
const SWEEP = 270

/** Root template ref -- exposed for programmatic focus. */
const rootRef = ref<HTMLElement | null>(null)
/** SVG template ref -- used to resolve pointer geometry. */
const svgRef = ref<SVGSVGElement | null>(null)
/** Whether a pointer drag is in progress. */
const dragging = ref(false)

const resolvedId = computed(() => props.id ?? fieldContext?.fieldId ?? autoId)

const resolvedDisabled = computed(() => props.disabled || (fieldContext?.isDisabled.value ?? false))

const resolvedInvalid = computed(
  () => props.invalid || !!props.error || (fieldContext?.isInvalid.value ?? false),
)

const resolvedRequired = computed(() => props.required || (fieldContext?.isRequired.value ?? false))

/** Interactive = neither disabled nor readonly (readonly is display-only). */
const isInteractive = computed(() => !resolvedDisabled.value && !props.readonly)

const errorId = computed(() => (props.error ? `${resolvedId.value}-error` : undefined))

/** Combined aria-describedby from prop + own error element + field context. */
const resolvedAriaDescribedby = computed(() => {
  const parts: string[] = []
  if (props.ariaDescribedby) parts.push(props.ariaDescribedby)
  if (errorId.value) parts.push(errorId.value)
  if (fieldContext?.ariaDescribedby.value) parts.push(fieldContext.ariaDescribedby.value)
  return parts.length > 0 ? parts.join(' ') : undefined
})

/** Rendered dial diameter in px, derived from size (icon falls back to md). */
const diameter = computed(() => {
  const map = knobTokens.size
  const key = props.size === 'icon' ? 'md' : props.size
  return map[key as keyof typeof map] ?? map.md
})

/** Arc radius in viewBox units, inset by half the stroke so it stays painted. */
const radius = computed(() => (VIEWBOX - props.strokeWidth) / 2)

/** Larger keyboard jump for PageUp/PageDown -- one tenth of the range. */
const pageStep = computed(() => {
  const span = props.max - props.min
  return Math.max(props.step, Math.round(span / 10))
})

function clamp(value: number): number {
  return Math.min(props.max, Math.max(props.min, value))
}

/** Snap to the active step granularity, anchored at `min`. */
function snap(value: number): number {
  const snapped = props.min + Math.round((value - props.min) / props.step) * props.step
  // Guard against floating-point drift from fractional steps.
  return Math.round(snapped * 1e6) / 1e6
}

/** Committed value, clamped into range for safe rendering. */
const normalizedValue = computed(() => clamp(model.value))

/** Fill fraction (0–1) of the value arc. */
const fraction = computed(() => {
  const span = props.max - props.min
  if (span <= 0) return 0
  return (normalizedValue.value - props.min) / span
})

/** Formatted value text for the label and `aria-valuetext`. */
const valueText = computed(() =>
  props.valueTemplate.replace('{value}', String(normalizedValue.value)),
)

const styles = computed(() =>
  knobVariants({
    size: props.size,
    tone: props.tone,
    disabled: resolvedDisabled.value || undefined,
    readonly: props.readonly || undefined,
    invalid: resolvedInvalid.value || undefined,
  }),
)

const rootClasses = computed(() => cn(styles.value.root(), attrs.class as string | undefined))

/** Cartesian point on the gauge circle for an SVG-convention angle (deg). */
function polar(angleDeg: number, r: number): { x: number; y: number } {
  const a = (angleDeg * Math.PI) / 180
  return { x: CENTER + r * Math.cos(a), y: CENTER + r * Math.sin(a) }
}

/** SVG arc `d` from one angle to another (always clockwise). */
function arcPath(fromAngle: number, toAngle: number, r: number): string {
  const start = polar(fromAngle, r)
  const end = polar(toAngle, r)
  const largeArc = toAngle - fromAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

const rangePath = computed(() => arcPath(START_ANGLE, START_ANGLE + SWEEP, radius.value))

const valuePath = computed(() =>
  arcPath(START_ANGLE, START_ANGLE + SWEEP * fraction.value, radius.value),
)

function commit(value: number): void {
  const next = snap(clamp(value))
  if (next === model.value) return
  model.value = next
  emit('change', next, { source: 'user' })
}

/** Map a pointer position to a value via its angle from the dial center. */
function valueFromPointer(event: PointerEvent): number | null {
  const svg = svgRef.value
  if (!svg) return null
  const rect = svg.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  let deg = (Math.atan2(event.clientY - cy, event.clientX - cx) * 180) / Math.PI
  if (deg < 0) deg += 360
  // Angle measured clockwise from the gauge start (0..360).
  let rel = deg - START_ANGLE
  if (rel < 0) rel += 360
  // Pointer fell in the bottom gap -> snap to whichever end is nearer.
  if (rel > SWEEP) rel = rel > (SWEEP + 360) / 2 ? 0 : SWEEP
  return props.min + (rel / SWEEP) * (props.max - props.min)
}

function updateFromPointer(event: PointerEvent): void {
  const value = valueFromPointer(event)
  if (value !== null) commit(value)
}

function handlePointerDown(event: PointerEvent): void {
  if (!isInteractive.value) return
  event.preventDefault()
  dragging.value = true
  ;(event.currentTarget as Element).setPointerCapture?.(event.pointerId)
  updateFromPointer(event)
}

function handlePointerMove(event: PointerEvent): void {
  if (!dragging.value) return
  updateFromPointer(event)
}

function handlePointerUp(event: PointerEvent): void {
  if (!dragging.value) return
  dragging.value = false
  ;(event.currentTarget as Element).releasePointerCapture?.(event.pointerId)
}

function handleKeydown(event: KeyboardEvent): void {
  if (!isInteractive.value) return

  let next: number | null = null
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = clamp(snap(model.value) + props.step)
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      next = clamp(snap(model.value) - props.step)
      break
    case 'PageUp':
      next = clamp(snap(model.value) + pageStep.value)
      break
    case 'PageDown':
      next = clamp(snap(model.value) - pageStep.value)
      break
    case 'Home':
      next = props.min
      break
    case 'End':
      next = props.max
      break
    default:
      break
  }

  if (next === null) return
  event.preventDefault()
  commit(next)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

/** Expose programmatic focus for parity with other form controls. */
defineExpose({
  focus: (): void => rootRef.value?.focus(),
})
</script>

<template>
  <div
    :id="resolvedId"
    ref="rootRef"
    role="slider"
    :class="rootClasses"
    :style="{ width: `${diameter}px`, height: `${diameter}px` }"
    :tabindex="resolvedDisabled ? -1 : 0"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="normalizedValue"
    :aria-valuetext="valueText"
    :aria-label="ariaLabel ?? 'Knob'"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="resolvedAriaDescribedby"
    :aria-disabled="resolvedDisabled || undefined"
    :aria-readonly="readonly || undefined"
    :aria-required="resolvedRequired || undefined"
    :aria-invalid="ariaInvalid ?? (resolvedInvalid || undefined)"
    :data-disabled="resolvedDisabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-invalid="resolvedInvalid ? '' : undefined"
    :data-tone="tone"
    @keydown="handleKeydown"
    @focus="handleFocus"
    @blur="handleBlur"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <svg
      ref="svgRef"
      :class="styles.svg()"
      :viewBox="`0 0 ${VIEWBOX} ${VIEWBOX}`"
      :width="diameter"
      :height="diameter"
      aria-hidden="true"
      @pointerdown="handlePointerDown"
      @pointermove="handlePointerMove"
      @pointerup="handlePointerUp"
      @pointercancel="handlePointerUp"
    >
      <path
        :class="styles.rangeArc()"
        :d="rangePath"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
      <path
        v-if="fraction > 0"
        :class="styles.valueArc()"
        :d="valuePath"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
      />
    </svg>

    <span v-if="showValue" :class="styles.label()">
      <slot name="value" :value="normalizedValue" :text="valueText">
        {{ valueText }}
      </slot>
    </span>

    <!-- Hidden input for native form participation -->
    <input v-if="name" type="hidden" :name="name" :value="normalizedValue" />
  </div>

  <!-- Error message -->
  <p v-if="error" :id="errorId" :class="styles.error()" role="alert">
    {{ error }}
  </p>
</template>
