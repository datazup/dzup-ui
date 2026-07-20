<script setup lang="ts">
import type { Component } from 'vue'
import { DzCard, DzCardBody, DzHeading, DzIcon, DzText } from '@dzup-ui/core'
import {
  BarChart3,
  Bell,
  Globe,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-vue-next'

/**
 * Feature grid — six feature cards, each with an icon, title, and short blurb.
 *
 * Self-contained: no props, no external data. Composed only from free
 * @dzup-ui/core components and `--dz-*` tokens (no landing-only `--lp-*` props),
 * so it drops into any app already themed, accessible, and light/dark-ready
 * (docs/blocks.md §3.6).
 *
 * Heading level: section heading uses level 4; card titles use level 5, both
 * within the BlockPreview's H3 shell (DzHeading decouples level from size).
 * Raise the levels appropriately when embedding in your own page.
 *
 * Responsive: three columns on wide screens, two on medium, one on narrow.
 */

interface Feature {
  icon: Component
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Instant setup',
    description: 'Connect your first data source in under two minutes — no scripts, no DevOps.',
  },
  {
    icon: BarChart3,
    title: 'Live dashboards',
    description: 'Charts refresh in real time as your data changes, with zero manual refresh.',
  },
  {
    icon: Globe,
    title: 'Any source',
    description: 'Postgres, MySQL, REST APIs, CSV uploads — one unified query surface.',
  },
  {
    icon: Lock,
    title: 'Row-level security',
    description: 'Define who sees which rows with policy rules that travel with your data.',
  },
  {
    icon: Bell,
    title: 'Smart alerts',
    description: 'Get notified via Slack or email when a metric crosses a threshold you set.',
  },
  {
    icon: Sparkles,
    title: 'AI-assisted queries',
    description: 'Describe what you want in plain language; the AI translates it to SQL for you.',
  },
]
</script>

<template>
  <section class="feature-grid" aria-labelledby="fg-heading">
    <div class="fg-inner">
      <!-- Section header -->
      <header class="fg-header">
        <DzHeading id="fg-heading" :level="4" size="2xl" weight="bold" align="center">
          Everything you need to go fast
        </DzHeading>
        <DzText size="lg" tone="muted" align="center" class="fg-sub">
          A complete toolbox — from ingestion to presentation — so your team ships
          insights instead of plumbing.
        </DzText>
      </header>

      <!-- Six feature cards -->
      <ul class="fg-grid" role="list" aria-label="Features">
        <li v-for="feature in features" :key="feature.title" class="fg-item">
          <DzCard variant="outlined" padding="lg" hoverable class="fg-card">
            <DzCardBody>
              <div class="fg-card-icon" aria-hidden="true">
                <DzIcon :icon="feature.icon" size="md" />
              </div>
              <DzHeading :level="5" size="sm" weight="semibold" class="fg-card-title">
                {{ feature.title }}
              </DzHeading>
              <DzText size="sm" tone="muted" class="fg-card-desc">
                {{ feature.description }}
              </DzText>
            </DzCardBody>
          </DzCard>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.feature-grid {
  padding: clamp(2.5rem, 8vw, 5rem) var(--dz-space-6, 1.5rem);
  background: var(--dz-background, #fff);
}

.fg-inner {
  display: flex;
  flex-direction: column;
  gap: var(--dz-space-10, 2.5rem);
  max-width: 68rem;
  margin: 0 auto;
}

/* Section header */
.fg-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dz-space-3, 0.75rem);
}

.fg-sub {
  max-width: 38rem;
  margin: 0;
  line-height: 1.6;
}

/* Grid — resets list semantics while keeping accessible role="list" */
.fg-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--dz-space-5, 1.25rem);
}

.fg-item {
  display: flex;
}

.fg-card {
  width: 100%;
}

/* Icon wrapper — brand-tinted pill, re-themes with the design token. */
.fg-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--dz-radius-md, 0.5rem);
  background: color-mix(in oklch, var(--dz-primary, #6366f1) 12%, transparent);
  color: var(--dz-primary, #6366f1);
  margin-bottom: var(--dz-space-3, 0.75rem);
}

.fg-card-title {
  margin: 0 0 var(--dz-space-2, 0.5rem);
}

.fg-card-desc {
  margin: 0;
  line-height: 1.6;
}

/* Responsive grid: 3 → 2 → 1 columns */
@media (max-width: 900px) {
  .fg-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .fg-grid {
    grid-template-columns: 1fr;
  }
}
</style>
