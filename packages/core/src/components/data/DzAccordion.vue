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
import { computed, nextTick, provide, toRef, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_ACCORDION_KEY } from './DzAccordion.types.ts'
import { accordionVariants } from './DzAccordion.variants.ts'

defineOptions({
  inheritAttrs: false,
})

const model = defineModel<string | string[]>({ default: '' })

const props = withDefaults(defineProps<DzAccordionProps>(), {
  type: 'single',
  variant: 'default',
  size: 'md',
  disabled: false,
})

const emit = defineEmits<DzAccordionEmits>()

defineSlots<DzAccordionSlots>()

/**
 * Collapsible is only valid for single mode. Defaults to `true` so that
 * clicking the already-open item closes it (zero items open) — without it,
 * Reka keeps one item open at all times, which surprises most users.
 */
const resolvedCollapsible = computed(() =>
  props.type === 'single' ? ((props as DzAccordionSingleProps).collapsible ?? true) : undefined,
)

const attrs = useAttrs()

const context: DzAccordionContext = {
  size: toRef(() => props.size),
  variant: toRef(() => props.variant),
}

provide(DZ_ACCORDION_KEY, context)

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
async function revealItem(id: string): Promise<void> {
  // Multiple mode adds to the open set rather than replacing it: revealing
  // one field's panel must not close another the user is already reading.
  if (Array.isArray(model.value)) {
    if (!model.value.includes(id))
      model.value = [...model.value, id]
  }
  else if (model.value !== id) {
    model.value = id
  }
  await nextTick()
  emit('revealed', id)
}

defineExpose({ revealItem })

const styles = computed(() =>
  accordionVariants({
    variant: props.variant,
    size: props.size,
  }),
)

const rootClasses = computed(() =>
  cn(styles.value.root(), attrs.class as string | undefined),
)

function handleValueChange(value: string | string[] | undefined): void {
  // Reka emits `undefined` when a collapsible single accordion closes its open
  // item (see useSingleOrMultipleValue). Normalize that to the empty value for
  // the current mode so the item actually collapses instead of staying open.
  const next = value ?? (props.type === 'multiple' ? [] : '')
  model.value = next
  emit('change', next)
}
</script>

<template>
  <AccordionRoot
    :id="id"
    :type="(type as 'single' | 'multiple')"
    :model-value="model"
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
