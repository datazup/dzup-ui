<script setup lang="ts">
import { DzBadge, DzButton, DzHeading, DzText } from '@dzup-ui/core'
import { Check, Sparkles } from 'lucide-vue-next'
import Section from './Section.vue'
import { PRO_COMPONENTS } from '../data.ts'
import { FACTS, LINKS } from '../config.ts'

// The ambient upsell fork (spec §4.8). Count contrast + a clear visual
// distinction; the word "Pro" is reserved strictly for the paid tier.
const freePoints = [
  `${FACTS.freeComponents} MIT-licensed components`,
  'Full Storybook documentation',
  'OKLCH theming + dark mode',
  'WCAG AA accessibility',
]
const proPoints = [
  `${FACTS.proComponents} enterprise components`,
  `${FACTS.proFamilies} advanced families`,
  'Priority support',
  'Commercial license',
]
const proPreview = PRO_COMPONENTS.slice(0, 8)
</script>

<template>
  <Section
    eyebrow="Free & Pro"
    title="Start free. Go Pro when you need more."
    heading-id="fork-title"
  >
    <template #default>
      <p class="contrast lp-balance">
        <strong>{{ FACTS.freeComponents }}</strong> free
        <span class="contrast-sep">·</span>
        <strong class="contrast-pro">{{ FACTS.proComponents }}</strong> pro —
        the open library covers the essentials; Pro adds the enterprise-grade pieces.
      </p>

      <div class="fork-grid">
        <article class="lp-card plan">
          <DzBadge variant="subtle" tone="neutral">Open source</DzBadge>
          <DzHeading :level="3" size="lg" weight="semibold" class="plan-title">Start free</DzHeading>
          <DzText size="sm" tone="muted">Everything you need to ship a polished product today.</DzText>
          <ul class="plan-points">
            <li v-for="p in freePoints" :key="p">
              <Check :size="16" aria-hidden="true" />
              <span>{{ p }}</span>
            </li>
          </ul>
          <DzButton variant="outline" tone="neutral" as="a" :href="LINKS.components" class="plan-cta">
            Browse components
          </DzButton>
        </article>

        <article class="lp-card plan plan--pro">
          <span class="plan-ring" aria-hidden="true" />
          <DzBadge variant="solid" tone="primary">
            <Sparkles :size="13" aria-hidden="true" />
            Pro · Coming soon
          </DzBadge>
          <DzHeading :level="3" size="lg" weight="semibold" class="plan-title">Go Pro</DzHeading>
          <DzText size="sm" tone="muted">
            The heavy, business-critical components — built on the same tokens and a11y bar.
          </DzText>
          <ul class="plan-points">
            <li v-for="p in proPoints" :key="p">
              <Check :size="16" aria-hidden="true" />
              <span>{{ p }}</span>
            </li>
          </ul>
          <ul class="plan-chips">
            <li v-for="c in proPreview" :key="c.label">
              <DzBadge variant="outline" tone="primary" size="sm">{{ c.label }}</DzBadge>
            </li>
            <li><DzBadge variant="subtle" tone="primary" size="sm">+{{ FACTS.proComponents - proPreview.length }} more</DzBadge></li>
          </ul>
          <DzButton variant="solid" tone="primary" :to="LINKS.pro" class="plan-cta">
            Join the waitlist
          </DzButton>
        </article>
      </div>
    </template>
  </Section>
</template>

<style scoped>
.contrast {
  margin: clamp(-32px, -3vw, -12px) auto clamp(32px, 5vw, 56px);
  max-width: 56ch;
  text-align: center;
  font-size: var(--dz-text-lg, 1.125rem);
  line-height: 1.6;
  color: var(--dz-muted-foreground, #64748b);
}

.contrast strong {
  color: var(--dz-foreground, #1a202c);
}

.contrast-pro {
  color: var(--dz-primary, #4f46e5) !important;
}

.contrast-sep {
  margin: 0 8px;
  opacity: 0.5;
}

.fork-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 920px;
  margin: 0 auto;
}

.plan {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: 32px;
}

.plan--pro {
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 9%, transparent), transparent 55%),
    var(--dz-surface, #fff);
  border-color: color-mix(in oklch, var(--dz-primary, #6366f1) 32%, var(--lp-hairline));
}

/* Subtle gradient ring on the Pro card top edge. */
.plan-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(180deg,
    color-mix(in oklch, var(--dz-primary, #6366f1) 45%, transparent), transparent 40%);
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.plan-title {
  margin: 2px 0 0;
}

.plan-points {
  list-style: none;
  margin: 6px 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 11px;
  width: 100%;
}

.plan-points li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-sm, 0.875rem);
  color: var(--dz-foreground, #1a202c);
}

.plan-points svg {
  color: var(--dz-success, #22c55e);
  flex-shrink: 0;
}

.plan--pro .plan-points svg {
  color: var(--dz-primary, #4f46e5);
}

.plan-chips {
  list-style: none;
  margin: 4px 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.plan-cta {
  margin-top: auto;
  align-self: stretch;
}

@media (max-width: 720px) {
  .fork-grid {
    grid-template-columns: 1fr;
  }
}
</style>
