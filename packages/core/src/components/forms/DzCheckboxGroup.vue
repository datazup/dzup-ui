<script setup lang="ts">
import type { DzCheckboxGroupContext, DzCheckboxGroupEmits, DzCheckboxGroupProps, DzCheckboxGroupSlots } from './DzCheckboxGroup.types.ts'
/**
 * DzCheckboxGroup -- Groups DzCheckbox components with a shared string[] model.
 *
 * Provides context to child DzCheckbox components via inject (ADR-08).
 * v-model via defineModel<string[]>() (ADR-16).
 *
 * @example
 * ```vue
 * <DzCheckboxGroup v-model="selectedFruits" orientation="vertical">
 *   <DzCheckbox value="apple">Apple</DzCheckbox>
 *   <DzCheckbox value="banana">Banana</DzCheckbox>
 *   <DzCheckbox value="cherry">Cherry</DzCheckbox>
 * </DzCheckboxGroup>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import {
  DZ_CHECKBOX_GROUP_KEY,

} from './DzCheckboxGroup.types.ts'

const model = defineModel<string[]>({ default: () => [] })

const props = withDefaults(defineProps<DzCheckboxGroupProps>(), {
  orientation: 'vertical',
  disabled: false,
  size: 'md',
  id: undefined,
  ariaLabel: undefined,
  ariaLabelledby: undefined,
  ariaDescribedby: undefined,
  ariaInvalid: undefined,
})

const emit = defineEmits<DzCheckboxGroupEmits>()
defineSlots<DzCheckboxGroupSlots>()

const attrs = useAttrs()

function toggle(value: string): void {
  const current = [...model.value]
  const index = current.indexOf(value)
  if (index === -1) {
    current.push(value)
  }
  else {
    current.splice(index, 1)
  }
  model.value = current
  emit('change', current)
}

const context: DzCheckboxGroupContext = {
  modelValue: model,
  disabled: toRef(() => props.disabled),
  size: toRef(() => props.size ?? 'md'),
  toggle,
}

provide(DZ_CHECKBOX_GROUP_KEY, context)

const classes = computed(() =>
  cn(
    'flex',
    props.orientation === 'vertical' ? 'flex-col gap-[var(--dz-spacing-2)]' : 'flex-row flex-wrap gap-[var(--dz-spacing-4)]',
    attrs.class as string | undefined,
  ),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    :id="id"
    :class="classes"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : 'ready'"
    :data-disabled="disabled ? '' : undefined"
    :data-orientation="orientation"
    role="group"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </div>
</template>
