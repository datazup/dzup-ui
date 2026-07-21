# FAQ accordion

Six Q&A items in a separated collapsible accordion with a section header and a contact link.

- **Category:** Marketing
- **Components:** DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent, DzHeading, DzText
- **Preview:** /blocks/faq

```vue
<script setup lang="ts">
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzHeading,
  DzText,
} from '@dzup-ui/core'
import { ref } from 'vue'

/**
 * Faq — a "separated" DzAccordion with six common Q&A items about
 * dzup-ui, wired to a local v-model so one item is open at a time.
 *
 * DzAccordion compound structure (Reka UI based):
 *   DzAccordion (root, provides context via DZ_ACCORDION_KEY)
 *     └─ DzAccordionItem  value="…"   ← unique key per item
 *          ├─ DzAccordionTrigger       ← renders the button
 *          └─ DzAccordionContent       ← animated panel
 *
 * collapsible is set so users can collapse the open item back to
 * zero items open, which is the standard FAQ UX expectation.
 *
 * Heading level: section title at :level="4" (BlockPreview uses H3).
 * The accordion triggers are buttons (not headings), which is the
 * Reka UI / ARIA Accordion pattern — triggers must NOT be wrapped
 * in heading elements.
 */

const openItem = ref<string>('')

interface FaqItem {
  value: string
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    value: 'faq-what',
    question: 'What is dzup-ui?',
    answer:
      'dzup-ui is a Vue 3 component library built with TypeScript, Tailwind CSS 4, and Reka UI headless primitives. It ships a fully themed, WCAG AA–compliant component set with light/dark mode, design tokens, and a growing catalog of ready-made page blocks.',
  },
  {
    value: 'faq-install',
    question: 'How do I install and set it up?',
    answer:
      'Add the package with your package manager: `npm install @dzup-ui/core`. Then wrap your app root with `DzThemeProvider`, import the global CSS, and start using components. A Nuxt module is also available for first-class SSR support with automatic FOUC prevention.',
  },
  {
    value: 'faq-themes',
    question: 'Can I customise the visual theme?',
    answer:
      'Yes — every colour, radius, shadow, and spacing value is a CSS custom property (`--dz-*`). Override them on `:root` or scoped to a container to create your brand theme without touching component source code. Pro tiers can also use the visual Token Studio integration.',
  },
  {
    value: 'faq-accessibility',
    question: 'How is accessibility handled?',
    answer:
      'All components target WCAG 2.1 AA compliance. Interactive primitives are built on Reka UI which handles ARIA roles, states, and keyboard navigation patterns (accordion, dialog, combobox, etc.) in line with WAI-ARIA Authoring Practices. Automated contract tests assert compliance on every PR.',
  },
  {
    value: 'faq-frameworks',
    question: 'Which frameworks and build tools are supported?',
    answer:
      'dzup-ui targets Vue 3 with `<script setup>` and Vite. The Nuxt module provides SSR integration. React and Angular adapters are on the roadmap. Storybook 10 is used for component development and interactive documentation.',
  },
  {
    value: 'faq-pro',
    question: 'What is the difference between the free tier and Pro?',
    answer:
      'The free Core package contains all foundational components and is MIT-licensed. The Pro package adds advanced data-intensive components (DataGrid, Charts, Kanban, etc.), the token customisation studio, priority support, and a commercial licence for closed-source products.',
  },
]
</script>

<template>
  <section class="faq-section" aria-labelledby="faq-title">
    <!-- Section header ----------------------------------------------------->
    <div class="faq-header">
      <DzHeading id="faq-title" :level="4" size="2xl" weight="bold" align="center" class="faq-title">
        Frequently asked questions
      </DzHeading>
      <DzText size="md" tone="muted" align="center" class="faq-subtitle">
        Can't find what you're looking for?
        <a href="#" class="faq-contact-link">Contact our team</a>.
      </DzText>
    </div>

    <!-- Accordion ------------------------------------------------------------>
    <DzAccordion
      v-model="openItem"
      type="single"
      variant="separated"
      collapsible
      class="faq-accordion"
      aria-label="Frequently asked questions"
    >
      <DzAccordionItem
        v-for="item in faqs"
        :key="item.value"
        :value="item.value"
      >
        <DzAccordionTrigger>{{ item.question }}</DzAccordionTrigger>
        <DzAccordionContent>
          <DzText size="sm" tone="muted" class="faq-answer">
            {{ item.answer }}
          </DzText>
        </DzAccordionContent>
      </DzAccordionItem>
    </DzAccordion>
  </section>
</template>

<style scoped>
.faq-section {
  padding: clamp(2.5rem, 6vw, 4rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

/* Section header ---------------------------------------------------------*/
.faq-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
  margin-bottom: clamp(2rem, 4vw, 3rem);
  text-align: center;
}

.faq-title,
.faq-subtitle {
  margin: 0;
}

.faq-contact-link {
  color: var(--dz-primary, #6366f1);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.faq-contact-link:hover,
.faq-contact-link:focus-visible {
  color: var(--dz-primary-hover, #4f46e5);
  outline: none;
}

.faq-contact-link:focus-visible {
  outline: 2px solid var(--dz-primary, #6366f1);
  outline-offset: 2px;
  border-radius: var(--dz-radius-sm, 0.125rem);
}

/* Accordion container ----------------------------------------------------*/
.faq-accordion {
  max-width: 48rem;
  margin: 0 auto;
}

/* Answer text inside panel -----------------------------------------------*/
.faq-answer {
  margin: 0;
  line-height: 1.7;
  padding-bottom: var(--dz-space-1, 0.25rem);
}
</style>
```
