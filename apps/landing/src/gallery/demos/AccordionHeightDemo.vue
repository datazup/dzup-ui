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
 *
 * Native path (docs/animations.md §3.1, §4): where `interpolate-size:
 * allow-keywords` is supported (Chromium), the scoped style below upgrades the
 * panel to a TRUE `height: 0 → auto` animation — no measured `--reka-*` var, no
 * JS `scrollHeight`. Reka still drives mount/unmount off `animationend`, so the
 * swap to native keyframes is transparent. Everywhere else the core
 * accordion-down/up keyframes (the measured-height workaround) remain the floor.
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
          <DzText size="sm" tone="muted" as="p" class="answer">
            {{ item.a }}
          </DzText>
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
   (the OS setting is already zeroed globally by the tokens reduced-motion rule).
   The `animation-duration` override is `!important`, so it also wins over the
   native-path animation set in the @supports block below — keeping the page
   toggle instant even where interpolate-size is supported. */
.stage--reduced :deep(.acc-content) {
  animation-duration: 0.01ms !important;
}

/* Native height:auto path — only when motion is allowed (so OS reduced motion
   keeps the prior, already-instant behaviour) AND interpolate-size is supported.
   Swaps core's measured-var keyframes for true height: 0 → auto animation. */
@media (prefers-reduced-motion: no-preference) {
  @supports (interpolate-size: allow-keywords) {
    .stage {
      interpolate-size: allow-keywords;
    }
    .stage :deep(.acc-content[data-state='open']) {
      animation: dz-accordion-open-auto var(--dz-duration-normal, 200ms)
        var(--dz-ease-out, ease-out);
    }
    .stage :deep(.acc-content[data-state='closed']) {
      animation: dz-accordion-close-auto var(--dz-duration-normal, 200ms)
        var(--dz-ease-out, ease-out);
    }
  }
}

@keyframes dz-accordion-open-auto {
  from {
    height: 0;
  }
  to {
    height: auto;
  }
}
@keyframes dz-accordion-close-auto {
  from {
    height: auto;
  }
  to {
    height: 0;
  }
}
</style>
