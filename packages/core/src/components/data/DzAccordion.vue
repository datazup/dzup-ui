<script setup lang="ts">
import type {
  DzAccordionContext,
  DzAccordionEmits,
  DzAccordionProps,
  DzAccordionSingleProps,
  DzAccordionSlots,
} from './DzAccordion.types.ts'
import { AccordionRoot } from 'reka-ui'
/**
 * DzAccordion — Compound accordion root using Reka UI (ADR-07).
 *
 * Wraps Reka UI AccordionRoot with styled variant support.
 * Provides context to DzAccordionItem children via inject (ADR-08).
 * v-model via defineModel (ADR-16).
 *
 * @example
 * ```vue
 * <DzAccordion v-model="activeItem" type="single" collapsible>
 *   <DzAccordionItem value="item-1">
 *     <DzAccordionTrigger>Section 1</DzAccordionTrigger>
 *     <DzAccordionContent>Content 1</DzAccordionContent>
 *   </DzAccordionItem>
 * </DzAccordion>
 * ```
 */
import { computed, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_ACCORDION_KEY } from './DzAccordion.types.ts'
import { accordionVariants } from './DzAccordion.variants.ts'

const model = defineModel<string | string[]>({ default: '' })

const props = withDefaults(defineProps<DzAccordionProps>(), {
  type: 'single',
  variant: 'default',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<DzAccordionEmits>()

defineSlots<DzAccordionSlots>()

/** Collapsible is only valid for single mode */
const resolvedCollapsible = computed(() =>
  props.type === 'single' ? (props as DzAccordionSingleProps).collapsible : undefined,
)

const attrs = useAttrs()

const context: DzAccordionContext = {
  size: toRef(() => props.size),
  variant: toRef(() => props.variant),
}

provide(DZ_ACCORDION_KEY, context)

const styles = computed(() =>
  accordionVariants({
    variant: props.variant,
    size: props.size,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

function handleValueChange(value: string | string[]): void {
  model.value = value
  emit('change', value)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <AccordionRoot
    :id="id"
    :type="(type as 'single' | 'multiple')"
    :model-value="(model as string)"
    :collapsible="resolvedCollapsible"
    :disabled="disabled"
    :class="rootClasses"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :aria-describedby="ariaDescribedby"
    :data-state="disabled ? 'disabled' : 'ready'"
    style="contain: layout style"
    v-bind="{ ...$attrs, class: undefined }"
    @update:model-value="handleValueChange"
  >
    <slot />
  </AccordionRoot>
</template>
