<script setup lang="ts">
import type { DzStepperContext, DzStepperEmits, DzStepperProps, DzStepperSlots } from './DzStepper.types.ts'
/**
 * DzStepper — Step-by-step progress indicator.
 *
 * v-model via defineModel<number>() (ADR-16) for active step index.
 * Provides context to DzStepperItem children via inject (ADR-08).
 *
 * @example
 * ```vue
 * <DzStepper v-model="step">
 *   <DzStepperItem title="Account">Step 1 content</DzStepperItem>
 *   <DzStepperItem title="Profile">Step 2 content</DzStepperItem>
 *   <DzStepperItem title="Review">Step 3 content</DzStepperItem>
 * </DzStepper>
 * ```
 */
import { computed, nextTick, provide, ref, toRef, useAttrs, watch } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { warnRemovedProps } from '../../utilities/warnRemovedProp.ts'
import { DZ_STEPPER_KEY } from './DzStepper.types.ts'
import { stepperVariants } from './DzStepper.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<DzStepperProps>(), {
  orientation: 'horizontal',
  clickable: false,
  beforeChange: undefined,
  linear: false,
})

const emit = defineEmits<DzStepperEmits>()
defineSlots<DzStepperSlots>()

const attrs = useAttrs()

// `ariaInvalid` was declared and never forwarded; ARIA 1.2 does not support
// aria-invalid on role="group", which the root is (VERSIONING.md §3).
warnRemovedProps('DzStepper', attrs, {
  ariaInvalid: 'A stepper is not invalid; a field inside a step is. Put aria-invalid on the field.',
})
const stepCounter = ref(0)

/**
 * The furthest step the user has reached.
 *
 * `linear` allows going back to anything already visited and forward only by
 * one. Tracking the high-water mark rather than just the current step is what
 * lets a user return to step 1 from step 3 and then jump straight back to 3 —
 * which is what "linear" means to a person filling in a form, as opposed to
 * "you may only ever move one step at a time in either direction".
 */
const furthestStep = ref(model.value)
watch(model, (step) => {
  if (step > furthestStep.value)
    furthestStep.value = step
})

async function setActiveStep(index: number): Promise<void> {
  if (index === model.value)
    return

  if (props.linear && index > furthestStep.value + 1) {
    emit('blocked', model.value, index, 'linear')
    return
  }

  if (props.beforeChange !== undefined) {
    // Awaited even when the guard is synchronous, so a host cannot tell the
    // difference and the stepper has one code path rather than two.
    const permitted = await props.beforeChange(model.value, index)
    if (permitted === false) {
      emit('blocked', model.value, index, 'guard')
      return
    }
  }

  model.value = index
  emit('change', index)
  emit('navigate', index)
}

const context: DzStepperContext = {
  activeStep: model,
  orientation: toRef(() => props.orientation),
  clickable: toRef(() => props.clickable),
  totalSteps: stepCounter,
  registerStep: () => {
    const index = stepCounter.value
    stepCounter.value++
    return index
  },
  setActiveStep: (index: number) => void setActiveStep(index),
}

provide(DZ_STEPPER_KEY, context)

/**
 * Open (or activate) the item holding `id`, then announce that it is rendered.
 *
 * The renderer contract's C-layouts case: a wizard or tabbed form validates on
 * submit, finds its first invalid field inside a panel that is not currently
 * shown, and calls `focus()` on an element the browser will not focus. This is
 * the half a container can own — the caller pairs it with `useRevealAndFocus`.
 *
 * `revealed` fires after the panel has rendered, not when the model changed.
 */
async function revealItem(id: number): Promise<void> {
  // Reveal bypasses `beforeChange`: it is how a form takes the user *to* the
  // problem, and a guard that blocked advance would otherwise trap them on a
  // step whose errors are somewhere else.
  if (model.value !== id) {
    model.value = id
    emit('change', id)
  }
  await nextTick()
  emit('revealed', id)
}

defineExpose({ revealItem })

const styles = computed(() =>
  stepperVariants({ orientation: props.orientation }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)
</script>

<template>
  <div
    :id="id"
    :class="rootClasses"
    :aria-label="ariaLabel ?? (ariaLabelledby ? undefined : 'Progress steps')"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    data-state="ready"
    role="group"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
