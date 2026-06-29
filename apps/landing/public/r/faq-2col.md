# Two-column FAQ

Questions grouped into two labelled DzAccordion columns (separated, single + collapsible) under a centered heading, so one answer is open per column at a time; stacks to one column on mobile.

- **Category:** Content
- **Components:** DzAccordion, DzAccordionItem, DzAccordionTrigger, DzAccordionContent, DzHeading, DzText
- **Preview:** /blocks#faq-2col

```vue
<script setup lang="ts">
/**
 * Two-column FAQ — questions grouped into themed columns.
 *
 * A centered DzHeading/DzText intro over two columns, each a labelled
 * DzAccordion group (separated variant, single + collapsible) so one answer is
 * open per column at a time. The triggers are buttons per the ARIA Accordion
 * pattern; the two columns stack into one on narrow viewports.
 *
 * Self-contained: static content, no props, no network. Composed only from
 * free @dzup-ui/core components and `--dz-*` tokens (docs/blocks.md §3.6).
 */
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzHeading,
  DzText,
} from '@dzup-ui/core'
import { ref } from 'vue'

interface FaqItem {
  value: string
  question: string
  answer: string
}

interface FaqGroup {
  id: string
  title: string
  items: FaqItem[]
}

const groups: FaqGroup[] = [
  {
    id: 'getting-started',
    title: 'Getting started',
    items: [
      {
        value: 'gs-install',
        question: 'How do I install dzup-ui?',
        answer: 'Add @dzup-ui/core with your package manager, import the theme stylesheet once at your entry point, and start using components. A Nuxt module is available for SSR.',
      },
      {
        value: 'gs-frameworks',
        question: 'Which frameworks are supported?',
        answer: 'The library targets Vue 3 with <script setup> and Vite. Nuxt is supported through a dedicated module; React and Angular adapters are on the roadmap.',
      },
      {
        value: 'gs-ssr',
        question: 'Does it work with server-side rendering?',
        answer: 'Yes. Components are SSR-safe and the Nuxt module adds first-class hydration with built-in FOUC prevention so themes apply before first paint.',
      },
      {
        value: 'gs-typescript',
        question: 'Are TypeScript types included?',
        answer: 'Every component ships fully typed props, emits and slots. No separate @types package is needed — the declarations come with the library.',
      },
    ],
  },
  {
    id: 'billing',
    title: 'Plans & billing',
    items: [
      {
        value: 'bl-free',
        question: 'What is included in the free tier?',
        answer: 'The Core package is MIT-licensed and contains every foundational component, the design tokens and the full block catalog — free for personal and commercial use.',
      },
      {
        value: 'bl-pro',
        question: 'What does Pro add?',
        answer: 'Pro adds data-intensive components like DataGrid and Charts, the visual token studio, premium blocks, and priority support under a commercial licence.',
      },
      {
        value: 'bl-team',
        question: 'Can I share a licence across my team?',
        answer: 'Team and organisation plans cover every developer under your account, with centralised billing and seat management from the dashboard.',
      },
      {
        value: 'bl-cancel',
        question: 'Can I cancel anytime?',
        answer: 'Yes. Subscriptions are month-to-month or annual and can be cancelled at any time; you keep access through the end of the current billing period.',
      },
    ],
  },
]

/** One open item per column, keyed by group id (empty = all collapsed). */
const open = ref<Record<string, string>>(
  Object.fromEntries(groups.map((group) => [group.id, ''])),
)
</script>

<template>
  <section class="fq-wrap" aria-labelledby="fq-title">
    <header class="fq-head">
      <DzHeading id="fq-title" :level="4" size="2xl" weight="bold" align="center" class="fq-title">
        Frequently asked questions
      </DzHeading>
      <DzText size="md" tone="muted" align="center" as="p" class="fq-sub">
        Everything you need to know about getting set up and billed.
      </DzText>
    </header>

    <div class="fq-cols">
      <div v-for="group in groups" :key="group.id" class="fq-col">
        <DzHeading :level="5" size="md" weight="semibold" class="fq-col-title">
          {{ group.title }}
        </DzHeading>
        <DzAccordion
          v-model="open[group.id]"
          type="single"
          variant="separated"
          collapsible
          :aria-label="group.title"
        >
          <DzAccordionItem
            v-for="item in group.items"
            :key="item.value"
            :value="item.value"
          >
            <DzAccordionTrigger>{{ item.question }}</DzAccordionTrigger>
            <DzAccordionContent>
              <DzText size="sm" tone="muted" class="fq-answer">{{ item.answer }}</DzText>
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fq-wrap {
  padding: clamp(2rem, 5vw, 3.5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

.fq-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-2, 0.5rem);
  margin-bottom: clamp(1.5rem, 4vw, 2.5rem);
  text-align: center;
}

.fq-title,
.fq-sub {
  margin: 0;
}

.fq-cols {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(1.5rem, 4vw, 2.5rem);
  max-width: 60rem;
  margin: 0 auto;
  align-items: start;
}

.fq-col {
  min-width: 0;
}

.fq-col-title {
  margin: 0 0 var(--dz-space-3, 0.75rem);
}

.fq-answer {
  margin: 0;
  line-height: 1.7;
  padding-bottom: var(--dz-space-1, 0.25rem);
}

@media (max-width: 900px) {
  .fq-cols {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
```
