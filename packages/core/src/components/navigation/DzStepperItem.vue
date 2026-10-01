<script setup lang="ts">
import type { DzStepperItemEmits, DzStepperItemProps, DzStepperItemSlots } from './DzStepper.types.ts'
/**
 * DzStepperItem — A single step within DzStepper.
 */
import { computed, inject, useAttrs } from 'vue'
import { useDzTestIds } from '../../composables/provider/useDzEnvironment.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_STEPPER_KEY } from './DzStepper.types.ts'
import { stepperVariants } from './DzStepper.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<DzStepperItemProps>(), {
  optional: false,
  clickable: undefined,
})

const emit = defineEmits<DzStepperItemEmits>()
defineSlots<DzStepperItemSlots>()

const attrs = useAttrs()
const ctx = inject(DZ_STEPPER_KEY, null)

/**
 * This step's zero-based position, claimed from the parent's counter **during
 * `setup`** (RESIDUAL-11, `D-RES10-1`).
 *
 * It used to be claimed in `onMounted`, and `onMounted` never runs during SSR.
 * `stepIndex` therefore stayed `-1` on the server, `-1 < activeStep` is true for
 * every step of a stepper on step 0, and so **every** step server-rendered
 * `data-state="completed"` with the completed check-mark while **no** step
 * carried `aria-current="step"`. Measured: a three-step stepper emitted the same
 * 2,706 bytes for `modelValue` 0, 1 and 2 — the server HTML did not depend on the
 * model at all. Nothing warned, either: the client's *first* render agreed with
 * the server (both had `-1`), so Vue reported no hydration mismatch and the
 * correction arrived afterwards as an ordinary reactive patch that silently
 * rewrote three indicators.
 *
 * `setup` runs on the server and on the client, once per instance, in the order
 * the children are created — which is document order for a slot — so the index
 * is the same number in both passes and the server HTML is now the client's
 * first paint. It is a plain `const` rather than a `ref` on purpose: a step's
 * position is fixed for the life of the instance, and the reactivity `status`
 * needs is `ctx.activeStep`, not this.
 *
 * `registerStep`'s contract is unchanged (`() => number`, ADR-08 context in
 * `DzStepper.types.ts`); only the moment it is called moved.
 */
const stepIndex = ctx ? ctx.registerStep() : -1

/** Status of this step relative to the active step */
const status = computed(() => {
  if (!ctx)
    return 'upcoming' as const
  if (stepIndex < ctx.activeStep.value)
    return 'completed' as const
  if (stepIndex === ctx.activeStep.value)
    return 'active' as const
  return 'upcoming' as const
})

const orientation = computed(() => ctx?.orientation.value ?? 'horizontal')

const isReachable = computed(() => status.value !== 'upcoming')

const isClickable = computed(() => {
  if (!ctx)
    return false
  if (!isReachable.value)
    return false
  return props.clickable ?? ctx.clickable.value
})

const styles = computed(() =>
  stepperVariants({ orientation: orientation.value, status: status.value }),
)

const stepClasses = computed(() =>
  cn(
    styles.value.step(),
    isClickable.value && 'cursor-pointer',
    attrs.class as string | undefined,
  ),
)

function activate(): void {
  if (!isClickable.value || !ctx)
    return
  if (stepIndex < 0)
    return
  ctx.setActiveStep(stepIndex)
  emit('navigate', stepIndex)
}

function handleKeydown(event: KeyboardEvent): void {
  if (!isClickable.value)
    return
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    activate()
  }
}

// Stable test hooks, off unless a host enables them (ADR-20 §8, TASK-R5-O3).
const { testId: dzTestId } = useDzTestIds()
</script>

<template>
  <div
    data-part="root"
    :class="stepClasses"
    :data-state="status"
    :data-clickable="isClickable ? '' : undefined"
    :aria-current="status === 'active' ? 'step' : undefined"
    :role="isClickable ? 'button' : undefined"
    :tabindex="isClickable ? 0 : undefined"
    v-bind="{ ...dzTestId('dz-stepper-item'), ...$attrs, class: undefined }"
    @click="activate"
    @keydown="handleKeydown"
  >
    <!-- Step indicator -->
    <slot name="indicator" :step="stepIndex + 1" :status="status">
      <div data-part="indicator" :class="cn(styles.indicator(), ui?.indicator)">
        <!-- Completed check -->
        <svg
          v-if="status === 'completed'"
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
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <!-- Step number -->
        <span v-else>{{ stepIndex + 1 }}</span>
      </div>
    </slot>

    <!-- Step text -->
    <div>
      <div v-if="title" data-part="title" :class="cn(styles.title(), ui?.title)">
        {{ title }}
        <span v-if="optional" class="text-[var(--dz-muted-foreground)] font-normal">(optional)</span>
      </div>
      <div v-if="description" data-part="description" :class="cn(styles.description(), ui?.description)">
        {{ description }}
      </div>
    </div>
  </div>
</template>
