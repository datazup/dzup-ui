<script setup lang="ts">
import type { DzResizableHandleProps, DzResizableHandleSlots } from './DzResizable.types.ts'
import { SplitterResizeHandle } from 'reka-ui'
/**
 * DzResizableHandle — Resize handle between panels, using Reka UI
 * SplitterResizeHandle (ADR-07).
 *
 * Inherits direction/size context from parent DzResizable via inject (ADR-08).
 *
 * ## The single-pointer, non-drag path (WCAG 2.2 SC 2.5.7)
 *
 * Owner decision **D117, option A**, taken 2026-09-19
 * (`docs/program-2026-09-04/reports/TASK-R2-O5-2-5-7-decision.md`). Until then
 * this handle could be moved by a keyboard (SC 2.1.1) or by a drag, and by
 * nothing else — which is a measured level-AA failure recorded in
 * `packages/core/docs/wcag-deviations.json` and confirmed in three engines by
 * `e2e/matrix/non-drag.spec.ts`.
 *
 * Two 24 × 24 px steppers now sit inside the gutter. They are absolutely
 * positioned at `opacity: 0`, so **the resting rendering is unchanged** — no
 * consuming layout moves — and they are revealed by hovering the gutter,
 * focusing the separator, or tapping it once on a device with no hover.
 *
 * **They do not re-implement the resize.** A press dispatches the very
 * `keydown` Reka's own `useWindowSplitterResizeHandlerBehavior` listens for, on
 * the handle element itself, so the pointer path and the keyboard path are the
 * same function and cannot drift apart: the step is `keyboardResizeBy` (10 % by
 * default), `Shift` still means the full sweep, and the RTL mirroring Reka
 * applies to a keyboard delta applies here too.
 *
 * There is deliberately **no opt-out prop**: `DzOrderList` is recorded as
 * meeting 2.5.7 only while `showControls` is true, which is a conformance claim
 * a consumer can switch off, and decision sheet §2.5 refused to repeat it.
 */
import { computed, inject, ref, useAttrs } from 'vue'
import { useDzDirection } from '../../composables/provider/useDzLocale.ts'
import { useComponentMessages } from '../../i18n/useComponentMessages.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_RESIZABLE_KEY } from './DzResizable.types.ts'
import { resizableVariants } from './DzResizable.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzResizableHandleProps>(), {
  withHandle: false,
  disabled: false,
})

defineSlots<DzResizableHandleSlots>()

const attrs = useAttrs()
const resizableContext = inject(DZ_RESIZABLE_KEY, null)

const direction = computed(() => resizableContext?.direction.value ?? 'horizontal')

/**
 * ARIA orientation for the separator handle.
 * A horizontal splitter group (panels side-by-side) has a vertical handle bar,
 * and a vertical splitter group (panels stacked top/bottom) has a horizontal handle bar.
 * Reka UI sets data-orientation but not aria-orientation, so we bind it explicitly.
 */
const ariaOrientation = computed<'horizontal' | 'vertical'>(() =>
  direction.value === 'vertical' ? 'horizontal' : 'vertical',
)

const styles = computed(() =>
  resizableVariants({
    direction: direction.value,
    size: resizableContext?.size.value ?? 'md',
  }),
)

const classes = computed(() => cn(styles.value.handle(), attrs.class as string | undefined))

/**
 * A handle is frozen by its own `disabled` OR by the group's (N1-O1 defect D2 —
 * `<DzResizable disabled>` was presentational only, because the prop never
 * reached this component).
 */
const isDisabled = computed(() =>
  props.disabled === true || resizableContext?.disabled.value === true,
)

// ── SC 2.5.7: the single-pointer, non-drag path (D117/A) ───────────────────

// ArrowLeft/ArrowRight follow the writing direction: Reka negates a keyboard
// delta for an RTL horizontal group, so the key that LOWERS the separator's
// `aria-valuenow` is not the same key in both directions (ADR-20 §4, R5-O3).
const dzDirection = useDzDirection()

/** User-visible strings, resolved against the application's catalog (ADR-20). */
const dzMessages = useComponentMessages('DzResizableHandle')

/**
 * Whether a pointer with no hover has asked for the controls.
 *
 * `:hover` covers a mouse and `:focus-within` covers a keyboard, but a touch
 * pointer has neither, so one tap on the gutter reveals the pair and a second
 * tap operates it — two single presses, no dragging, which is what the
 * criterion asks for. Only a non-mouse pointer makes it sticky: a mouse user
 * already sees them while the pointer is there, and leaving them painted after
 * every drag would change the resting rendering the decision sheet froze.
 */
const revealed = ref(false)
function onHandlePointerUp(event: PointerEvent): void {
  if (event.pointerType !== 'mouse')
    revealed.value = true
}

/** The keys that lower and raise the separator's value, in this direction. */
const stepKeys = computed<{ decrease: string, increase: string }>(() => {
  if (direction.value === 'vertical')
    return { decrease: 'ArrowUp', increase: 'ArrowDown' }
  return dzDirection.value === 'rtl'
    ? { decrease: 'ArrowRight', increase: 'ArrowLeft' }
    : { decrease: 'ArrowLeft', increase: 'ArrowRight' }
})

/** The zero-size box beside the separator that holds the stepper pair. */
const steppersEl = ref<HTMLElement | null>(null)

/**
 * Move the separator one step, by handing Reka the event it already handles.
 *
 * The handle is this element's **previous sibling** — the pair deliberately
 * sits outside the separator (see the template), so it cannot be reached with
 * `closest()`. `data-resize-handle` is Reka's own marker on that element and it
 * is where `useWindowSplitterResizeHandlerBehavior` attaches its `keydown`
 * listener; it is asserted here rather than assumed, so a future structural
 * change fails loudly instead of silently doing nothing.
 */
function step(event: MouseEvent, key: string): void {
  const handle = steppersEl.value?.previousElementSibling
  if (!(handle instanceof HTMLElement) || !handle.hasAttribute('data-resize-handle'))
    return
  handle.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    // `Shift` is the keyboard path's full-sweep modifier; a shift-click means
    // the same thing, so the two paths agree on every step size, not just one.
    shiftKey: event.shiftKey,
    bubbles: true,
    cancelable: true,
  }))
}

/** Chevron rotation, so one path serves all four directions. */
const stepIconClass = computed<{ decrease: string, increase: string }>(() =>
  direction.value === 'vertical'
    ? { decrease: '-rotate-90', increase: 'rotate-90' }
    : { decrease: 'rotate-180', increase: '' },
)
</script>

<template>
  <SplitterResizeHandle
    :disabled="isDisabled"
    data-part="separator"
    :class="classes"
    :aria-orientation="ariaOrientation"
    :data-direction="direction"
    :data-disabled="isDisabled ? '' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
    @pointerup="onHandlePointerUp"
  >
    <slot>
      <div v-if="withHandle" data-part="indicator" :class="styles.handleIndicator()">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="h-2.5 w-2.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </div>
    </slot>
  </SplitterResizeHandle>

  <!--
    WCAG 2.2 SC 2.5.7 — the single-pointer, non-drag path (D117/A).

    A SIBLING of the separator, never a child of it. The first implementation
    put the pair inside the Reka handle and axe's `nested-interactive` (WCAG
    4.1.2, serious) refused it: focusable content inside an interactive control,
    and `tabindex="-1"` does not exempt it because assistive technologies can
    still focus the element. This div is a zero-size flex item beside the
    handle, so it adds no layout, and the pair is positioned over the divider.

    Not rendered at all when the handle is frozen, because a control that cannot
    act is a target that fails SC 2.5.8 for nothing.

    `mousedown` and `touchstart` are stopped as well as `pointerdown`: Reka's
    drag registry listens for the MOUSE events on `document.body`, so stopping
    only `pointerdown` would leave a press on a stepper starting a zero-length
    drag and setting the global resize cursor.
  -->
  <div
    v-if="!isDisabled"
    ref="steppersEl"
    :class="styles.handleSteppers()"
    :data-steppers="revealed ? 'visible' : undefined"
  >
    <div :class="styles.handleStepperTrack()">
      <button
        type="button"
        tabindex="-1"
        data-part="step-decrease"
        data-dz-resize-step="decrease"
        :class="styles.handleStep()"
        :aria-label="dzMessages.shrinkPane"
        @pointerdown.stop
        @mousedown.stop
        @touchstart.stop
        @click="step($event, stepKeys.decrease)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          :class="stepIconClass.decrease"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <button
        type="button"
        tabindex="-1"
        data-part="step-increase"
        data-dz-resize-step="increase"
        :class="styles.handleStep()"
        :aria-label="dzMessages.growPane"
        @pointerdown.stop
        @mousedown.stop
        @touchstart.stop
        @click="step($event, stepKeys.increase)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-3 w-3"
          :class="stepIconClass.increase"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
</template>
