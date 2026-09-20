<script setup lang="ts">
import type { DzSplitterHandleProps, DzSplitterHandleSlots } from './DzSplitter.types.ts'
import { SplitterResizeHandle } from 'reka-ui'
/**
 * DzSplitterHandle — Naming alias for DzResizableHandle.
 *
 * Identical to DzResizableHandle; uses the same Reka UI SplitterResizeHandle
 * and the same DZ_RESIZABLE_KEY injection context.
 *
 * That includes the WCAG 2.2 SC 2.5.7 stepper pair (owner decision **D117,
 * option A**, 2026-09-19): one affordance closes both surfaces because there is
 * only ever one Reka handle underneath. The reasoning, the RTL key mapping and
 * the reason `mousedown` is stopped as well as `pointerdown` are all written
 * once, in `DzResizableHandle.vue`; this file is its alias and repeats the
 * block rather than importing it, exactly as it already repeats the context,
 * the variants call and the disabled rule.
 *
 * The message ids are `DzResizableHandle.*` for the same reason: the two
 * components render one control, and shipping two catalog keys for one string
 * would make a translator translate the same sentence twice.
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

const props = withDefaults(defineProps<DzSplitterHandleProps>(), {
  withHandle: false,
  disabled: false,
})

defineSlots<DzSplitterHandleSlots>()

const attrs = useAttrs()
const resizableContext = inject(DZ_RESIZABLE_KEY, null)

const direction = computed(() => resizableContext?.direction.value ?? 'horizontal')

const styles = computed(() =>
  resizableVariants({
    direction: direction.value,
    size: resizableContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.handle(), attrs.class as string | undefined),
)

/**
 * A handle is frozen by its own `disabled` OR by the group's (N1-O1 defect D2 --
 * `DzSplitter` carries the same defect as `DzResizable`, through the same
 * shared context).
 */
const isDisabled = computed(() =>
  props.disabled === true || resizableContext?.disabled.value === true,
)

// ── SC 2.5.7: the single-pointer, non-drag path (D117/A) ───────────────────

const dzDirection = useDzDirection()
const dzMessages = useComponentMessages('DzResizableHandle')

const revealed = ref(false)
function onHandlePointerUp(event: PointerEvent): void {
  if (event.pointerType !== 'mouse')
    revealed.value = true
}

const stepKeys = computed<{ decrease: string, increase: string }>(() => {
  if (direction.value === 'vertical')
    return { decrease: 'ArrowUp', increase: 'ArrowDown' }
  return dzDirection.value === 'rtl'
    ? { decrease: 'ArrowRight', increase: 'ArrowLeft' }
    : { decrease: 'ArrowLeft', increase: 'ArrowRight' }
})

/** The zero-size box beside the separator that holds the stepper pair. */
const steppersEl = ref<HTMLElement | null>(null)

function step(event: MouseEvent, key: string): void {
  const handle = steppersEl.value?.previousElementSibling
  if (!(handle instanceof HTMLElement) || !handle.hasAttribute('data-resize-handle'))
    return
  handle.dispatchEvent(new KeyboardEvent('keydown', {
    key,
    shiftKey: event.shiftKey,
    bubbles: true,
    cancelable: true,
  }))
}

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
    WCAG 2.2 SC 2.5.7 — see DzResizableHandle.vue for the whole reasoning,
    including why the pair is a SIBLING of the separator rather than a child of
    it (axe `nested-interactive`, WCAG 4.1.2).
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
