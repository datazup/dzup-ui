<script setup lang="ts">
import { DzBadge, DzText } from '@dzup-ui/core'
import { ArrowRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import Section from './Section.vue'
import { ECOSYSTEM } from '../data.ts'
import { ICONS } from '../icons.ts'

/**
 * Ecosystem grid — "beyond components". Showcases the offerings that complement
 * the library (Blocks, Templates, Animations + Icons, Themes, Figma kit), each
 * built on the same tokens and a11y bar as `@dzup-ui/core`.
 *
 * Tiles are non-interactive "Planned" placeholders until an offering ships. A
 * shipped offering (`status: 'available'`) renders as a whole-tile router-link
 * carrying a "Free" badge and an "Explore" affordance — Blocks, Templates and
 * Animations are the first.
 *
 * Mirrors the ComponentGallery / FeatureGrid patterns (Section + lp-card tiles,
 * staggered scroll-reveal, token-only styling) so it reads as one family.
 */
</script>

<template>
  <Section
    eyebrow="Ecosystem"
    title="Beyond components"
    lede="The pieces that build on the library — blocks, templates, animations and more. Same tokens, same accessibility bar, same design language. Coming soon."
    heading-id="ecosystem-title"
  >
    <ul class="eco-grid">
      <li
        v-for="(item, i) in ECOSYSTEM"
        :key="item.title"
        class="eco-cell"
        :style="{ '--reveal-delay': `${i * 45}ms` }"
      >
        <component
          :is="item.status === 'available' ? RouterLink : 'div'"
          class="lp-card tile"
          :class="{ 'lp-card--hover': item.status === 'available', 'tile--link': item.status === 'available' }"
          v-bind="item.status === 'available'
            ? { to: item.href, 'aria-label': `Explore ${item.title}` }
            : {}"
        >
          <div class="tile-top">
            <span class="tile-icon" aria-hidden="true">
              <component :is="ICONS[item.icon]" :size="20" />
            </span>
            <DzBadge v-if="item.status === 'available'" variant="solid" tone="success" size="sm">Free</DzBadge>
            <DzBadge v-else variant="subtle" tone="neutral" size="sm">Planned</DzBadge>
          </div>

          <DzText weight="semibold" as="div" class="tile-title">{{ item.title }}</DzText>
          <DzText size="sm" tone="muted" as="div" class="tile-blurb">{{ item.blurb }}</DzText>

          <DzText size="xs" tone="muted" as="div" class="tile-meta">{{ item.meta }}</DzText>

          <span v-if="item.status === 'available'" class="tile-explore">
            Explore
            <ArrowRight :size="14" aria-hidden="true" />
          </span>
        </component>
      </li>
    </ul>
  </Section>
</template>

<style scoped>
.eco-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.eco-cell {
  display: flex;
}

.tile {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 24px;
}

/* Available tiles are whole-tile links — strip link chrome, keep card looks. */
.tile--link {
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.tile--link:focus-visible {
  outline: 2px solid var(--dz-ring, #6366f1);
  outline-offset: 2px;
}

.tile-explore {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 16px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-primary, #4f46e5);
}

/* Arrow slides forward on hover/focus as the navigational affordance. */
.tile-explore svg {
  transition: transform var(--dz-duration-fast, 150ms) var(--dz-ease-default, ease);
}

.tile--link:hover .tile-explore svg,
.tile--link:focus-visible .tile-explore svg {
  transform: translateX(3px);
}

@media (prefers-reduced-motion: reduce) {
  .tile-explore svg {
    transition: none;
  }
}

.tile-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  background: var(--dz-primary-muted, #eef2ff);
  color: var(--dz-primary, #4f46e5);
  border: 1px solid color-mix(in oklch, var(--dz-primary, #6366f1) 14%, transparent);
}

.tile-title {
  margin-bottom: 6px;
  font-size: var(--dz-text-base, 1rem);
}

.tile-blurb {
  line-height: 1.6;
}

.tile-meta {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--lp-hairline);
  font-weight: 600;
  letter-spacing: 0.01em;
}

@media (max-width: 900px) {
  .eco-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .eco-grid {
    grid-template-columns: 1fr;
  }
}
</style>
