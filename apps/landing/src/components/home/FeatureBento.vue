<script setup lang="ts">
import { DzBadge, DzButton, DzProgress, DzSwitch, DzText } from '@dzup-ui/core'
import { computed, ref } from 'vue'
import { FEATURES } from '../../data.ts'
import { ICONS } from '../../icons.ts'
import { DzBentoReveal, DzSuccessCheck, useReducedMotion, vTilt } from '../../motion/index.ts'
import Section from '../Section.vue'

/**
 * FeatureBento — the "Why dzup-ui" grid with physicality
 * (docs/landing-v2.md TASK-LV2-05). Forks the v1 `FeatureGrid` composition
 * (which `/classic` keeps rendering) with the same `FEATURES` data and copy,
 * and three motion upgrades:
 *
 *  - `DzBentoReveal` owns the entrance: cells cascade in with the shared
 *    pointer-tracked spotlight (native `view()` timeline where supported, JS
 *    floor elsewhere, everything visible under reduced motion). The v1
 *    per-tile `--reveal-delay` inline stagger is gone — one owner per effect.
 *  - Every tile tilts subtly toward a fine pointer (`v-tilt`, 6°, with glare);
 *    touch and reduced-motion users get the resting card.
 *  - The featured tile carries the `.dz-border-beam` ring (the same utility
 *    `DzBorderBeam` wraps — applied as a class here so the `<ul>`/`<li>`
 *    structure stays intact) and its live demo cluster now *responds*: the
 *    notifications switch drives the progress bar to full and draws a success
 *    check — a real, working control rewarding interaction, not a claim.
 */

const featured = FEATURES[0]!
const rest = FEATURES.slice(1)
const reduced = useReducedMotion()

const demoSwitch = ref(true)
const demoProgress = computed(() => (demoSwitch.value ? 88 : 36))
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
    <DzBentoReveal as="ul" class="bento" :step="70">
      <li
        v-tilt="{ max: 6, perspective: 1200, glare: true }"
        class="lp-card lp-card--hover tile tile--featured dz-border-beam"
        :class="{ 'dz-border-beam--reduced': reduced }"
      >
        <div class="tile-body">
          <span class="tile-icon" aria-hidden="true">
            <component :is="ICONS[featured.icon]" :size="22" />
          </span>
          <DzText weight="semibold" as="div" class="tile-title">
            {{ featured.title }}
          </DzText>
          <DzText size="sm" tone="muted" as="div">
            {{ featured.body }}
          </DzText>
        </div>
        <div class="tile-demo">
          <div class="demo-row" aria-hidden="true">
            <DzButton size="sm" variant="solid" tone="primary">
              Primary
            </DzButton>
            <DzButton size="sm" variant="outline" tone="neutral">
              Outline
            </DzButton>
            <DzBadge variant="subtle" tone="success" size="sm">
              Stable
            </DzBadge>
          </div>
          <div class="demo-row demo-row--between">
            <DzText size="sm" tone="muted">
              Notifications
            </DzText>
            <span class="demo-feedback">
              <DzSuccessCheck :active="demoSwitch" :size="18" label="Notifications on" />
              <DzSwitch v-model="demoSwitch" size="sm" aria-label="Demo toggle" />
            </span>
          </div>
          <DzProgress :value="demoProgress" size="sm" tone="primary" aria-hidden="true" />
        </div>
      </li>

      <li
        v-for="f in rest"
        :key="f.title"
        v-tilt="{ max: 6, perspective: 1200, glare: true }"
        class="lp-card lp-card--hover tile"
      >
        <span class="tile-icon" aria-hidden="true">
          <component :is="ICONS[f.icon]" :size="20" />
        </span>
        <DzText weight="semibold" as="div" class="tile-title">
          {{ f.title }}
        </DzText>
        <DzText size="sm" tone="muted" as="div">
          {{ f.body }}
        </DzText>
      </li>
    </DzBentoReveal>
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
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary, #0766ee) 7%, transparent), transparent 55%),
    var(--dz-surface, #ffffff);
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
  background: var(--dz-primary-muted, #d5e9ff);
  color: var(--dz-primary, #0766ee);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #0766ee) 14%, transparent);
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
  background: var(--dz-background, #e7e8e9);
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

/* The switch and its check share a slot so the mark draws in next to the
   control it confirms. */
.demo-feedback {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
