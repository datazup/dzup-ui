<script setup lang="ts">
import { DzButton, DzSwitch, DzText } from '@dzup-ui/core'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'
import Section from '../components/Section.vue'
import AnimationCard from '../gallery/AnimationCard.vue'
import { CATALOG, CATEGORIES } from '../gallery/catalog.ts'
import { provideMotionPreference } from '../motion/index.ts'
import { LINKS } from '../config.ts'

/**
 * /animations — the live motion gallery (docs/animations.md §4.3–4.4).
 *
 * Page hero + a global "Reduce motion" toggle wired to the motion preference
 * (provide/inject from Task 0): flipping it forces every descendant demo to its
 * reduced fallback live. Below the hero, a sticky category nav anchors to one
 * Section per populated category, each a responsive grid of AnimationCard.
 *
 * The page is data-driven by the catalog — Tasks 3–9 add effects by appending
 * to CATALOG, with no changes here or to AnimationCard.
 */

// Page-level reduced-motion override; bound to the hero DzSwitch.
const reduceMotion = provideMotionPreference()

// Only render nav chips + sections for categories that actually have effects,
// so there are no empty sections or dead anchors while the catalog fills in.
const populatedCategories = computed(() =>
  CATEGORIES.filter((cat) => CATALOG.some((entry) => entry.category === cat.id)),
)

function entriesFor(categoryId: string) {
  return CATALOG.filter((entry) => entry.category === categoryId)
}
</script>

<template>
  <div class="anim-page">
    <!-- Hero -->
    <Section
      eyebrow="Ecosystem · Animations"
      title="Motion, ready to drop in"
      lede="Scroll reveals, text and number transitions, hover micro-interactions and ambient backgrounds — each built from the same @dzup-ui/core components and design tokens, and each honouring prefers-reduced-motion out of the box."
      heading-id="animations-title"
    >
      <div class="hero-actions">
        <DzButton variant="solid" tone="primary" as="a" :href="LINKS.components">
          Browse components
          <template #suffix><ArrowRight :size="16" aria-hidden="true" /></template>
        </DzButton>
        <DzButton variant="outline" tone="neutral" :to="'/'">
          <template #prefix><ArrowLeft :size="16" aria-hidden="true" /></template>
          Back to home
        </DzButton>
      </div>

      <div class="reduce-toggle">
        <DzSwitch v-model="reduceMotion" aria-label="Reduce motion in all demos">
          <span class="reduce-copy">
            <DzText size="sm" weight="semibold" as="span">Reduce motion</DzText>
            <DzText size="xs" tone="muted" as="span">Preview every demo's accessible fallback</DzText>
          </span>
        </DzSwitch>
      </div>
    </Section>

    <!-- Sticky category nav -->
    <nav class="cat-nav" aria-label="Animation categories">
      <div class="cat-nav-inner">
        <a
          v-for="cat in populatedCategories"
          :key="cat.id"
          :href="`#${cat.id}`"
          class="cat-chip"
        >{{ cat.label }}</a>
      </div>
    </nav>

    <!-- One Section per populated category -->
    <div
      v-for="cat in populatedCategories"
      :id="cat.id"
      :key="cat.id"
      class="cat-anchor"
    >
      <Section :title="cat.label" :heading-id="`cat-${cat.id}`" align="left">
        <div class="card-grid">
          <AnimationCard
            v-for="entry in entriesFor(cat.id)"
            :key="entry.id"
            :entry="entry"
          />
        </div>
      </Section>
    </div>
  </div>
</template>

<style scoped>
.anim-page {
  padding-bottom: clamp(48px, 8vw, 96px);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.reduce-toggle {
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 12px;
  margin: 24px auto 0;
  padding: 12px 16px;
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-surface, #fff);
}

.reduce-copy {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

/* Sticky category nav — sits just below the 64px TopNav. */
.cat-nav {
  position: sticky;
  top: 64px;
  z-index: 40;
  background: color-mix(in oklch, var(--dz-background, #fff) 82%, transparent);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--lp-hairline);
  border-bottom: 1px solid var(--lp-hairline);
}

.cat-nav-inner {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
  padding: 10px 24px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-chip {
  padding: 6px 14px;
  border-radius: var(--dz-radius-full, 9999px);
  border: 1px solid var(--lp-hairline);
  background: var(--dz-surface, #fff);
  color: var(--dz-muted-foreground, #64748b);
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  text-decoration: none;
  transition:
    color var(--dz-duration-fast, 150ms),
    border-color var(--dz-duration-fast, 150ms),
    background var(--dz-duration-fast, 150ms);
}

.cat-chip:hover {
  color: var(--dz-primary, #4f46e5);
  border-color: color-mix(in oklch, var(--dz-primary, #6366f1) 40%, var(--lp-hairline));
  background: var(--dz-primary-muted, #eef2ff);
}

.cat-chip:focus-visible {
  outline: 2px solid var(--dz-ring, #6366f1);
  outline-offset: 2px;
}

/* Offset anchored sections for the sticky TopNav (64px) + category nav. */
.cat-anchor {
  scroll-margin-top: 128px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
