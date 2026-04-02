<script setup lang="ts">
import type { DzAccordionItemProps, DzAccordionItemSlots } from './DzAccordion.types.ts'
import { AccordionItem } from 'reka-ui'
/**
 * DzAccordionItem — Accordion item wrapping Reka UI AccordionItem (ADR-07).
 *
 * Inherits variant/size context from parent DzAccordion via inject (ADR-08).
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_ACCORDION_KEY } from './DzAccordion.types.ts'
import { accordionVariants } from './DzAccordion.variants.ts'

const props = defineProps<DzAccordionItemProps>()
defineSlots<DzAccordionItemSlots>()

const attrs = useAttrs()
const accordionContext = inject(DZ_ACCORDION_KEY, null)

const styles = computed(() =>
  accordionVariants({
    variant: accordionContext?.variant.value ?? 'default',
    size: accordionContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.item(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <AccordionItem
    :value="props.value"
    :disabled="props.disabled"
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </AccordionItem>
</template>
