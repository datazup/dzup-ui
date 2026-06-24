<script setup lang="ts">
import { DzBadge, DzButton, DzProgress, DzSwitch, DzText } from '@dzup-ui/core'
import { ref } from 'vue'
import Section from './Section.vue'
import { FEATURES } from '../data.ts'
import { ICONS } from '../icons.ts'

// First feature is the "hero" tile (spans wide, carries a live mini cluster);
// the rest are uniform. Quiet bento rhythm rather than a flat 4×2 grid.
const featured = FEATURES[0]!
const rest = FEATURES.slice(1)
const demoSwitch = ref(true)
</script>

<template>
  <Section
    eyebrow="Why dzup-ui"
    title="Everything you need, nothing you don't"
    lede="A complete, opinionated foundation — accessible, typed, and themeable to the core."
    surface
    bordered
    heading-id="features-title"
  >
    <ul class="bento">
      <li class="lp-card lp-card--hover tile tile--featured" :style="{ '--reveal-delay': '0ms' }">
        <div class="tile-body">
          <span class="tile-icon" aria-hidden="true">
            <component :is="ICONS[featured.icon]" :size="22" />
          </span>
          <DzText weight="semibold" as="div" class="tile-title">{{ featured.title }}</DzText>
          <DzText size="sm" tone="muted" as="div">{{ featured.body }}</DzText>
        </div>
        <div class="tile-demo" aria-hidden="true">
          <div class="demo-row">
            <DzButton size="sm" variant="solid" tone="primary">Primary</DzButton>
            <DzButton size="sm" variant="outline" tone="neutral">Outline</DzButton>
            <DzBadge variant="subtle" tone="success" size="sm">Stable</DzBadge>
          </div>
          <div class="demo-row demo-row--between">
            <DzText size="sm" tone="muted">Notifications</DzText>
            <DzSwitch v-model="demoSwitch" size="sm" aria-label="Demo toggle" />
          </div>
          <DzProgress :value="72" size="sm" tone="primary" />
        </div>
      </li>

      <li
        v-for="(f, i) in rest"
        :key="f.title"
        class="lp-card lp-card--hover tile"
        :style="{ '--reveal-delay': `${(i + 1) * 50}ms` }"
      >
        <span class="tile-icon" aria-hidden="true">
          <component :is="ICONS[f.icon]" :size="20" />
        </span>
        <DzText weight="semibold" as="div" class="tile-title">{{ f.title }}</DzText>
        <DzText size="sm" tone="muted" as="div">{{ f.body }}</DzText>
      </li>
    </ul>
  </Section>
</template>

<style scoped>
.bento {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.tile {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.tile--featured {
  grid-column: span 2;
  grid-row: span 2;
  justify-content: space-between;
  gap: 24px;
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 7%, transparent), transparent 55%),
    var(--dz-surface, #fff);
}

.tile-body {
  display: flex;
  flex-direction: column;
}

.tile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 16px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-primary-muted, #eef2ff);
  color: var(--dz-primary, #4f46e5);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #6366f1) 14%, transparent);
}

.tile--featured .tile-icon {
  width: 48px;
  height: 48px;
}

.tile-title {
  margin-bottom: 6px;
  font-size: var(--dz-text-base, 1rem);
}

.tile--featured .tile-title {
  font-size: var(--dz-text-lg, 1.125rem);
}

.tile-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid var(--lp-hairline);
  background: var(--dz-background, #fff);
}

.demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.demo-row--between {
  justify-content: space-between;
}

@media (max-width: 1000px) {
  .bento {
    grid-template-columns: repeat(2, 1fr);
  }
  .tile--featured {
    grid-column: span 2;
    grid-row: auto;
  }
}

@media (max-width: 560px) {
  .bento {
    grid-template-columns: 1fr;
  }
  .tile--featured {
    grid-column: span 1;
  }
}
</style>
