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
import { computed, provide, ref, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_STEPPER_KEY } from './DzStepper.types.ts'
import { stepperVariants } from './DzStepper.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<number>({ default: 0 })

const props = withDefaults(defineProps<DzStepperProps>(), {
  orientation: 'horizontal',
  clickable: false,
})

const emit = defineEmits<DzStepperEmits>()
defineSlots<DzStepperSlots>()

const attrs = useAttrs()
const stepCounter = ref(0)

function setActiveStep(index: number): void {
  if (index === model.value)
    return
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
  setActiveStep,
}

provide(DZ_STEPPER_KEY, context)

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
    :aria-label="ariaLabel ?? 'Progress steps'"
    data-state="ready"
    role="group"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
