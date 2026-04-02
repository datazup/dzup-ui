<script setup lang="ts">
import type { DzAccordionContentSlots } from './DzAccordion.types.ts'
import { AccordionContent } from 'reka-ui'
/**
 * DzAccordionContent — Accordion content wrapping Reka UI
 * AccordionContent (ADR-07).
 *
 * Inherits variant/size context from parent DzAccordion via inject (ADR-08).
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_ACCORDION_KEY } from './DzAccordion.types.ts'
import { accordionVariants } from './DzAccordion.variants.ts'

defineSlots<DzAccordionContentSlots>()

const attrs = useAttrs()
const accordionContext = inject(DZ_ACCORDION_KEY, null)

const styles = computed(() =>
  accordionVariants({
    variant: accordionContext?.variant.value ?? 'default',
    size: accordionContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.content(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <AccordionContent
    :class="classes"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </AccordionContent>
</template>
