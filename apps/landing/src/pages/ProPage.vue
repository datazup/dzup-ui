<script setup lang="ts">
import { DzBadge, DzButton, DzCard, DzHeading, DzText } from '@dzup-ui/core'
import { ArrowLeft, BookOpen, Boxes, Sparkles } from 'lucide-vue-next'
import { PRO_FACTS, PRO_FAMILIES } from '../data.ts'
</script>

<template>
  <section class="pro-page">
    <div class="pro-inner">
      <DzBadge variant="subtle" tone="primary">
        <Sparkles :size="14" aria-hidden="true" />
        Pro · Published
      </DzBadge>

      <DzHeading :level="1" size="3xl" weight="bold" class="pro-title">
        {{ PRO_FACTS.published }} enterprise components, ready for integrated workflows
      </DzHeading>

      <DzText size="lg" tone="muted" class="pro-sub">
        dzup-ui Pro extends Core with advanced builders, data tools, editors, planning,
        visualization, communication, and workflow components. The figures below come from the
        Pro export inventory and built Storybook, not a manually maintained roadmap.
      </DzText>

      <div class="pro-actions">
        <DzButton variant="solid" tone="primary" as="a" href="#pro-catalog">
          Explore shipped families
        </DzButton>
        <DzButton variant="outline" tone="primary" as="a" href="mailto:hello@dzup-ui.com?subject=dzup-ui%20Pro%20access">
          Request Pro access
        </DzButton>
        <DzButton variant="outline" tone="neutral" to="/">
          <template #prefix>
            <ArrowLeft :size="16" aria-hidden="true" />
          </template>
          Back to home
        </DzButton>
      </div>

      <div class="pro-proof" aria-label="Generated Pro inventory summary">
        <div>
          <Boxes :size="18" aria-hidden="true" />
          <strong>{{ PRO_FACTS.published }}</strong>
          <span>public exports</span>
        </div>
        <div>
          <BookOpen :size="18" aria-hidden="true" />
          <strong>{{ PRO_FACTS.stories }}</strong>
          <span>Storybook stories</span>
        </div>
        <div>
          <Sparkles :size="18" aria-hidden="true" />
          <strong>{{ PRO_FACTS.families }}</strong>
          <span>enterprise families</span>
        </div>
      </div>

      <DzCard id="pro-catalog" variant="outlined" padding="lg" class="pro-list">
        <DzText size="sm" weight="semibold" class="pro-list-title">
          Published component catalog
        </DzText>
        <div class="pro-grid">
          <div v-for="family in PRO_FAMILIES" :key="family.id" class="pro-family">
            <DzText size="xs" tone="muted" weight="semibold" as="div" class="pro-family-name">
              {{ family.label }} · {{ family.publishedComponents }}
            </DzText>
            <ul class="pro-items">
              <li v-for="component in family.components" :key="component.name">
                <DzBadge variant="outline" tone="neutral" size="sm">
                  {{ component.name }}
                </DzBadge>
              </li>
            </ul>
          </div>
        </div>
      </DzCard>

      <div id="pro-storybook" class="pro-evidence">
        <DzHeading :level="2" size="xl" weight="semibold">
          Product proof and API reference stay separate
        </DzHeading>
        <DzText size="md" tone="muted">
          The Pro Showcase demonstrates Core and Pro in coordinated workflows. Pro Storybook
          remains the raw catalog for props, variants, states, accessibility, and edge cases.
        </DzText>
        <div class="pro-actions">
          <DzButton variant="outline" tone="primary" as="a" href="mailto:hello@dzup-ui.com?subject=dzup-ui%20Pro%20Showcase%20access">
            Request Showcase access
          </DzButton>
          <DzButton variant="outline" tone="neutral" as="a" href="mailto:hello@dzup-ui.com?subject=dzup-ui%20Pro%20Storybook%20access">
            Request Storybook access
          </DzButton>
        </div>
      </div>
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

.pro-proof {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-block: 1px solid var(--lp-hairline);
}

.pro-proof > div {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 4px 10px;
  padding: 20px 16px;
  border-inline-start: 1px solid var(--lp-hairline);
}

.pro-proof > div:first-child {
  border-inline-start: 0;
}

.pro-proof svg {
  grid-row: span 2;
  color: var(--dz-primary);
}

.pro-proof strong {
  font-size: var(--dz-text-xl);
  color: var(--dz-foreground);
}

.pro-proof span {
  font-size: var(--dz-text-xs);
  color: var(--dz-muted-foreground);
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

.pro-evidence {
  display: grid;
  gap: 12px;
  max-width: 62ch;
  padding-block: 16px;
}

@media (max-width: 640px) {
  .pro-proof {
    grid-template-columns: 1fr;
  }

  .pro-proof > div {
    border-inline-start: 0;
    border-block-start: 1px solid var(--lp-hairline);
  }

  .pro-proof > div:first-child {
    border-block-start: 0;
  }
}
</style>
