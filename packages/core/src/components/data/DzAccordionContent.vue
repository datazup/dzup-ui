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
import { useDzMotionAttribute } from '../../composables/provider/useDzMotion.ts'
import { cn } from '../../utilities/cn.ts'
import { DZ_ACCORDION_KEY } from './DzAccordion.types.ts'
import { accordionVariants } from './DzAccordion.variants.ts'

defineOptions({
  inheritAttrs: false,
})

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

// Reduced motion, as the APPLICATION asked for it (ADR-20 §7, TASK-R5-O3).
// The `prefers-reduced-motion` gate in the recipe answers for the OS; this
// answers for a host with its own accessibility setting, which the media
// query cannot see.
const dzMotionAttr = useDzMotionAttribute()
</script>

<template>
  <AccordionContent
    data-part="content"
    :class="classes"
    :data-dz-motion="dzMotionAttr"
    v-bind="{ ...$attrs, class: undefined }"
  >
    <slot />
  </AccordionContent>
</template>
