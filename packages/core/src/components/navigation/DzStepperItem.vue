<script setup lang="ts">
import type { DzStepperItemProps, DzStepperItemSlots } from './DzStepper.types.ts'
/**
 * DzStepperItem — A single step within DzStepper.
 */
import { computed, inject, onMounted, ref, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_STEPPER_KEY } from './DzStepper.types.ts'
import { stepperVariants } from './DzStepper.variants.ts'

withDefaults(defineProps<DzStepperItemProps>(), {
  optional: false,
})

defineSlots<DzStepperItemSlots>()

const attrs = useAttrs()
const ctx = inject(DZ_STEPPER_KEY, null)
const stepIndex = ref(-1)

onMounted(() => {
  if (ctx) {
    stepIndex.value = ctx.registerStep()
  }
})

/** Status of this step relative to the active step */
const status = computed(() => {
  if (!ctx)
    return 'upcoming' as const
  if (stepIndex.value < ctx.activeStep.value)
    return 'completed' as const
  if (stepIndex.value === ctx.activeStep.value)
    return 'active' as const
  return 'upcoming' as const
})

const orientation = computed(() => ctx?.orientation.value ?? 'horizontal')

const styles = computed(() =>
  stepperVariants({ orientation: orientation.value, status: status.value }),
)

const stepClasses = computed(() =>
  cn(styles.value.step(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :class="stepClasses"
    :data-state="status"
    :aria-current="status === 'active' ? 'step' : undefined"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <!-- Step indicator -->
    <slot name="indicator" :step="stepIndex + 1" :status="status">
      <div :class="styles.indicator()">
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
      <div v-if="title" :class="styles.title()">
        {{ title }}
        <span v-if="optional" class="text-[var(--dz-muted-foreground)] font-normal">(optional)</span>
      </div>
      <div v-if="description" :class="styles.description()">
        {{ description }}
      </div>
    </div>
  </div>
</template>
