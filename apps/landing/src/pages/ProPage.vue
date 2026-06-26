<script setup lang="ts">
import { DzBadge, DzButton, DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { ArrowLeft, Sparkles } from 'lucide-vue-next'
import { PRO_COMPONENTS } from '../data.ts'
import { FACTS } from '../config.ts'

// Phase 1 (spec §3.5): the /pro route exists but renders a "coming soon" state.
// Phase 2 flips these CTAs to the published pro Storybook + pricing — no
// structural change, only link targets and badge state.
const families = [...new Set(PRO_COMPONENTS.map((c) => c.family))]
</script>

<template>
  <section class="pro-page">
    <div class="pro-inner">
      <DzBadge variant="subtle" tone="primary">
        <Sparkles :size="14" aria-hidden="true" />
        Pro · Coming soon
      </DzBadge>

      <DzHeading :level="1" size="3xl" weight="bold" class="pro-title">
        {{ FACTS.proComponents }} enterprise components, in the works
      </DzHeading>

      <DzText size="lg" tone="muted" class="pro-sub">
        dzup-ui Pro extends the free library with {{ FACTS.proComponents }} components across
        {{ FACTS.proFamilies }} families — the heavy, business-critical pieces most apps eventually
        need. It isn't published yet. Join the waitlist and we'll let you know the moment it ships.
      </DzText>

      <div class="pro-actions">
        <DzButton variant="solid" tone="primary" as="a" href="mailto:hello@dzup-ui.com?subject=dzup-ui%20Pro%20waitlist">
          Join the waitlist
        </DzButton>
        <DzButton variant="outline" tone="neutral" :to="'/'">
          <template #prefix><ArrowLeft :size="16" aria-hidden="true" /></template>
          Back to home
        </DzButton>
      </div>

      <DzCard variant="outlined" padding="lg" class="pro-list">
        <DzText size="sm" weight="semibold" class="pro-list-title">What's coming</DzText>
        <div class="pro-grid">
          <div v-for="family in families" :key="family" class="pro-family">
            <DzText size="xs" tone="muted" weight="semibold" as="div" class="pro-family-name">
              {{ family }}
            </DzText>
            <ul class="pro-items">
              <li v-for="c in PRO_COMPONENTS.filter((x) => x.family === family)" :key="c.label">
                <DzBadge variant="outline" tone="neutral" size="sm">{{ c.label }}</DzBadge>
              </li>
            </ul>
          </div>
        </div>
      </DzCard>
    </div>
  </section>
</template>

<style scoped>
.pro-page {
  display: flex;
  justify-content: center;
  padding: clamp(48px, 8vw, 112px) 24px;
}

.pro-inner {
  width: 100%;
  max-width: 880px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
}

.pro-title {
  margin: 4px 0 0;
}

.pro-sub {
  max-width: 60ch;
}

.pro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 4px 0 12px;
}

.pro-list {
  width: 100%;
}

.pro-list-title {
  display: block;
  margin-bottom: 16px;
}

.pro-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.pro-family-name {
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}

.pro-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
