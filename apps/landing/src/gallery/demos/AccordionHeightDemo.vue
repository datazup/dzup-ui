<script setup lang="ts">
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzText,
} from '@dzup-ui/core'
import { ref } from 'vue'
import { useReducedMotion } from '../../motion/index.ts'

/**
 * Accordion height demo (catalog `accordion-height`, effect 32) — smooth
 * expand/collapse with no layout thrash. Core's DzAccordionContent already
 * animates `height` from 0 → the measured `--reka-accordion-content-height`
 * (Reka sets it at runtime) via the shared `accordion-down`/`-up` keyframes, so
 * the height is never animated to `auto`. We reuse that directly — no fork.
 *
 * Reduced motion: the OS setting is handled globally (the tokens reduced-motion
 * rule zeroes every animation duration). The page-level toggle is JS-only, so we
 * mirror it here by collapsing the content animation to an instant open/close.
 */
const items = [
  {
    value: 'tokens',
    q: 'Is everything token-driven?',
    a: 'Yes — every effect references --dz-* tokens for colour, duration and easing, so it themes and adapts to light/dark automatically.',
  },
  {
    value: 'a11y',
    q: 'How is reduced motion handled?',
    a: 'Each effect honours prefers-reduced-motion centrally and degrades to a static or opacity-only fallback. This panel collapses instantly under the toggle.',
  },
  {
    value: 'install',
    q: 'How do I drop one in?',
    a: 'Copy the snippet from any card. The primitives live in the landing motion module today and are authored to be extractable later.',
  },
] as const

// First item open by default so the card lands with content visible; toggling
// (and Replay) then shows the height animate.
const open = ref<string>(items[0].value)
const reduced = useReducedMotion()
</script>

<template>
  <div class="stage" :class="{ 'stage--reduced': reduced }">
    <DzAccordion v-model="open" type="single" collapsible variant="separated" size="sm" class="acc">
      <DzAccordionItem v-for="item in items" :key="item.value" :value="item.value">
        <DzAccordionTrigger>{{ item.q }}</DzAccordionTrigger>
        <DzAccordionContent class="acc-content">
          <DzText size="sm" tone="muted" as="p" class="answer">{{ item.a }}</DzText>
        </DzAccordionContent>
      </DzAccordionItem>
    </DzAccordion>
  </div>
</template>

<style scoped>
.stage {
  width: min(360px, 100%);
}

.acc {
  width: 100%;
}

.answer {
  margin: 0;
  line-height: 1.6;
}

/* Page-level "Reduce motion" toggle (JS) → instant open/close, no height sweep
   (the OS setting is already zeroed globally by the tokens reduced-motion rule). */
.stage--reduced :deep(.acc-content) {
  animation-duration: 0.01ms !important;
}
</style>
