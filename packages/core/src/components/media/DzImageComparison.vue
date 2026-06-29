<script setup lang="ts">
import type {
  DzImageComparisonEmits,
  DzImageComparisonProps,
  DzImageComparisonSlots,
} from './DzImageComparison.types.ts'
/**
 * DzImageComparison — draggable before/after image reveal slider (ADR-16 defineModel).
 *
 * A base ("before") image fills the frame; a clipped ("after") image is revealed
 * up to a draggable divider. The divider grip is a single `role="slider"` widget:
 * focusable, keyboard-operable, pointer-draggable, and the whole track is
 * click-to-set. `aria-valuenow` reports the percentage of the after image shown.
 *
 * @example
 * ```vue
 * <DzImageComparison
 *   before-src="/raw.jpg" after-src="/edited.jpg"
 *   before-alt="Original" after-alt="Edited"
 *   v-model:position="pos"
 * />
 * ```
 */
import { computed, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { imageComparisonVariants } from './DzImageComparison.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const position = defineModel<number>('position', { default: 50 })

const props = withDefaults(defineProps<DzImageComparisonProps>(), {
  orientation: 'horizontal',
  step: 1,
  disabled: false,
})

const emit = defineEmits<DzImageComparisonEmits>()
defineSlots<DzImageComparisonSlots>()

const attrs = useAttrs()

/** Root track ref — geometry source for pointer mapping and capture. */
const rootRef = ref<HTMLElement | null>(null)
/** Grip ref — exposed for programmatic focus. */
const handleRef = ref<HTMLElement | null>(null)
/** Whether a pointer drag is in progress. */
const dragging = ref(false)

/** Larger keyboard jump for Shift+Arrow. */
const SHIFT_STEP = 10

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value))
}

/** Committed position, clamped into range for safe rendering. */
const normalizedPosition = computed(() => clamp(position.value))

const styles = computed(() =>
  imageComparisonVariants({
    orientation: props.orientation,
    disabled: props.disabled || undefined,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

/**
 * Clip the after layer so only the revealed portion shows. `inset()` trims the
 * far edge (right for horizontal, bottom for vertical) by the hidden remainder.
 */
const afterClip = computed(() => {
  const hidden = 100 - normalizedPosition.value
  return props.orientation === 'vertical'
    ? `inset(0 0 ${hidden}% 0)`
    : `inset(0 ${hidden}% 0 0)`
})

/** Inline position of the divider/handle along the active axis. */
const dividerStyle = computed(() =>
  props.orientation === 'vertical'
    ? { top: `${normalizedPosition.value}%` }
    : { left: `${normalizedPosition.value}%` },
)

/** Transition the reveal/divider when not actively dragging; honor reduced motion. */
const motionClass = computed(() =>
  dragging.value
    ? ''
    : 'transition-[clip-path,left,top] duration-150 motion-reduce:transition-none',
)

function commit(next: number): void {
  const clamped = clamp(next)
  if (clamped === position.value)
    return
  position.value = clamped
  emit('change', clamped)
}

/** Map a pointer position to a 0–100 value along the active axis. */
function positionFromPointer(event: PointerEvent): number | null {
  const root = rootRef.value
  if (!root)
    return null
  const rect = root.getBoundingClientRect()
  if (props.orientation === 'vertical') {
    if (rect.height === 0)
      return null
    return ((event.clientY - rect.top) / rect.height) * 100
  }
  if (rect.width === 0)
    return null
  return ((event.clientX - rect.left) / rect.width) * 100
}

function updateFromPointer(event: PointerEvent): void {
  const next = positionFromPointer(event)
  if (next !== null)
    commit(next)
}

function handlePointerDown(event: PointerEvent): void {
  if (props.disabled)
    return
  event.preventDefault()
  dragging.value = true
  rootRef.value?.setPointerCapture?.(event.pointerId)
  // Move keyboard focus to the grip so arrow keys continue the interaction.
  handleRef.value?.focus()
  updateFromPointer(event)
}

function handlePointerMove(event: PointerEvent): void {
  if (!dragging.value)
    return
  updateFromPointer(event)
}

function handlePointerUp(event: PointerEvent): void {
  if (!dragging.value)
    return
  dragging.value = false
  rootRef.value?.releasePointerCapture?.(event.pointerId)
}

function handleKeydown(event: KeyboardEvent): void {
  if (props.disabled)
    return

  const delta = event.shiftKey ? SHIFT_STEP : props.step
  let next: number | null = null
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      next = normalizedPosition.value + delta
      break
    case 'ArrowLeft':
    case 'ArrowDown':
      next = normalizedPosition.value - delta
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = 100
      break
    default:
      break
  }

  if (next === null)
    return
  event.preventDefault()
  commit(next)
}

/** Expose programmatic focus for parity with other interactive components. */
defineExpose({
  focus: (): void => handleRef.value?.focus(),
})
</script>

<template>
  <div
    :id="id"
    ref="rootRef"
    :class="rootClasses"
    :data-orientation="orientation"
    :data-disabled="disabled ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
    <!-- Base (before) layer -- establishes the component height -->
    <div :class="styles.before()">
      <slot name="before">
        <img v-if="beforeSrc" :src="beforeSrc" :alt="beforeAlt ?? ''" class="block h-full w-full object-cover">
      </slot>
    </div>

    <!-- Revealed (after) layer -- clipped to the divider position -->
    <div
      :class="[styles.after(), motionClass]"
      :style="{ clipPath: afterClip }"
    >
      <slot name="after">
        <img v-if="afterSrc" :src="afterSrc" :alt="afterAlt ?? ''" class="block h-full w-full object-cover">
      </slot>
    </div>

    <!-- Caption chips -->
    <span v-if="beforeLabel" :class="styles.label()" class="bottom-[var(--dz-spacing-2)] left-[var(--dz-spacing-2)]">
      {{ beforeLabel }}
    </span>
    <span v-if="afterLabel" :class="styles.label()" class="bottom-[var(--dz-spacing-2)] right-[var(--dz-spacing-2)]">
      {{ afterLabel }}
    </span>

    <!-- Divider line + draggable grip -->
    <div :class="[styles.divider(), motionClass]" :style="dividerStyle">
      <div
        ref="handleRef"
        role="slider"
        :class="styles.handle()"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="normalizedPosition"
        :aria-valuetext="`${Math.round(normalizedPosition)}% of the after image revealed`"
        :aria-label="ariaLabel ?? 'Before and after comparison. Drag to reveal the after image.'"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :aria-orientation="orientation"
        :aria-disabled="disabled || undefined"
        @keydown="handleKeydown"
      >
        <slot name="handle" :position="normalizedPosition" :orientation="orientation">
          <svg
            v-if="orientation === 'horizontal'"
            class="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 6 3 12 9 18" />
            <polyline points="15 6 21 12 15 18" />
          </svg>
          <svg
            v-else
            class="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 3 18 9" />
            <polyline points="6 15 12 21 18 15" />
          </svg>
        </slot>
      </div>
    </div>
  </div>
</template>
