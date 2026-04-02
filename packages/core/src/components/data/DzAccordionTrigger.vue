<script setup lang="ts">
import type { DzAccordionTriggerSlots } from './DzAccordion.types.ts'
import { AccordionHeader, AccordionTrigger } from 'reka-ui'
/**
 * DzAccordionTrigger — Accordion trigger wrapping Reka UI
 * AccordionHeader + AccordionTrigger (ADR-07).
 *
 * Inherits variant/size context from parent DzAccordion via inject (ADR-08).
 */
import { computed, inject, useAttrs } from 'vue'
import { cn } from '../../utilities/cn.ts'
import { DZ_ACCORDION_KEY } from './DzAccordion.types.ts'
import { accordionVariants } from './DzAccordion.variants.ts'

defineSlots<DzAccordionTriggerSlots>()

const attrs = useAttrs()
const accordionContext = inject(DZ_ACCORDION_KEY, null)

const styles = computed(() =>
  accordionVariants({
    variant: accordionContext?.variant.value ?? 'default',
    size: accordionContext?.size.value ?? 'md',
  }),
)

const classes = computed(() =>
  cn(styles.value.trigger(), attrs.class as string | undefined),
)
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <AccordionHeader class="flex">
    <AccordionTrigger
      :class="classes"
      v-bind="{ ...$attrs, class: undefined }"
    >
      <slot />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="styles.chevron()"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </AccordionTrigger>
  </AccordionHeader>
</template>
