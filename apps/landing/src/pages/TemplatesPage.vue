<script setup lang="ts">
import { DzBadge, DzButton, DzEmpty, DzSegmented, DzText } from '@dzup-ui/core'
import { ArrowUpRight, LayoutTemplate } from 'lucide-vue-next'
import type { Component } from 'vue'
import { computed, ref } from 'vue'
import Section from '../components/Section.vue'
import { ICONS } from '../icons.ts'
import { TEMPLATE_CATEGORIES, TEMPLATES } from '../templates/registry.ts'
import type { TemplateCategory, TemplateMeta } from '../templates/registry.ts'

/**
 * Templates gallery (/templates) — the marketing-grade index for the free,
 * full-page starters built from `@dzup-ui/core` (docs/templates.md §2.2, §5, §6).
 *
 * Mirrors `ComponentGallery.vue`: a `Section` shell, a staggered `lp-card` grid
 * with whole-card cover links, and token-only styling. Adds a `DzSegmented`
 * category filter that narrows the grid client-side over `TEMPLATES`. The count
 * in the title and every card is derived from the registry, so the page lights
 * up automatically as catalogue rows land (T3+).
 */

const count = TEMPLATES.length

/** 'all' plus one segment per registry category, in display order. */
const filterItems = [
  { value: 'all', label: 'All' },
  ...TEMPLATE_CATEGORIES.map((c) => ({ value: c.key, label: c.label })),
]

/** Category key → display label, for the per-card category caption. */
const categoryLabels = new Map<TemplateCategory, string>(
  TEMPLATE_CATEGORIES.map((c) => [c.key, c.label]),
)

/** Category key → decorative palette name, for the per-card accent tint. */
const categoryAccents = new Map<TemplateCategory, string>(
  TEMPLATE_CATEGORIES.map((c) => [c.key, c.accent]),
)

/**
 * Per-card CSS custom properties that paint a template's gallery card in its
 * accent hue. A template's own `accent` wins over its category default. We emit
 * a light/dark shade *pair* (600 reads on a light surface, 400 on a dark one)
 * plus a vivid 500 for the decorative preview wash, then let the stylesheet pick
 * the right foreground per theme — see the `--tile-accent` rules below. The
 * `--reveal-delay` keeps the existing staggered entrance.
 */
function tileStyle(template: TemplateMeta, index: number): Record<string, string> {
  const palette = template.accent ?? categoryAccents.get(template.category) ?? 'primary'
  return {
    '--reveal-delay': `${index * 45}ms`,
    '--tile-accent-light': `var(--dz-colors-${palette}-600)`,
    '--tile-accent-dark': `var(--dz-colors-${palette}-400)`,
    '--tile-accent-wash': `var(--dz-colors-${palette}-500)`,
  }
}

/** Active filter; 'all' shows the full catalogue. */
const activeCategory = ref<string>('all')

/** Featured templates first, then registry order; narrowed by the filter. */
const visibleTemplates = computed<TemplateMeta[]>(() => {
  const inCategory =
    activeCategory.value === 'all'
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory.value)

  return [...inCategory].sort(
    (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0),
  )
})

/** Resolve a registry icon key to its component, falling back to a generic one. */
function iconFor(key: string): Component {
  return ICONS[key] ?? LayoutTemplate
}
</script>

<template>
  <Section
    eyebrow="Templates"
    :title="count ? `${count} free templates, built from core` : 'Templates, built from core'"
    lede="Full-page and full-app starters composed entirely from the free @dzup-ui/core components — themed, accessible and responsive out of the box."
    surface
    bordered
    heading-id="templates-title"
  >
    <div class="templates-toolbar">
      <div class="templates-filter">
        <DzSegmented
          v-model="activeCategory"
          :items="filterItems"
          size="sm"
          aria-label="Filter templates by category"
        />
      </div>
      <DzText size="sm" tone="muted" class="templates-note">Free · MIT</DzText>
    </div>

    <ul v-if="visibleTemplates.length" class="gallery-grid">
      <li
        v-for="(template, i) in visibleTemplates"
        :key="template.slug"
        class="lp-card lp-card--hover tile"
        :style="tileStyle(template, i)"
      >
        <div class="tile-head">
          <DzText weight="semibold" as="span">{{ template.name }}</DzText>
          <DzBadge variant="solid" tone="success" size="sm">Free</DzBadge>
        </div>

        <span class="tile-category">{{ categoryLabels.get(template.category) }}</span>

        <div class="tile-preview" aria-hidden="true">
          <img
            v-if="template.thumbnail"
            class="tile-thumb"
            :src="template.thumbnail"
            alt=""
            loading="lazy"
          />
          <component :is="iconFor(template.icon)" v-else :size="40" class="tile-icon" />
        </div>

        <DzText size="xs" tone="muted" class="tile-stack" truncate>
          {{ template.stack.join(' · ') }}
        </DzText>

        <router-link class="tile-link" :to="`/templates/${template.slug}`">
          <span>View template</span>
          <ArrowUpRight :size="14" aria-hidden="true" />
          <span class="tile-link-cover" :aria-label="`View the ${template.name} template`" />
        </router-link>
      </li>
    </ul>

    <DzEmpty
      v-else
      class="templates-empty"
      :icon="LayoutTemplate"
      title="No templates here yet"
      description="Nothing matches this category right now — new starters are on the way."
    >
      <template v-if="activeCategory !== 'all'" #actions>
        <DzButton variant="outline" size="sm" @click="activeCategory = 'all'">
          Show all templates
        </DzButton>
      </template>
    </DzEmpty>
  </Section>
</template>

<style scoped>
.templates-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: -24px;
  margin-bottom: 28px;
}

/* Let the segmented control scroll horizontally rather than wrap at narrow widths. */
.templates-filter {
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}

.templates-filter::-webkit-scrollbar {
  display: none;
}

.templates-note {
  flex: none;
  font-weight: 600;
  white-space: nowrap;
}

.gallery-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  /* Allow the track to shrink below its content's max-content size so the
     nowrap/truncate stack text can't force the grid wider than its container. */
  min-width: 0;
  padding: 20px;
  /* The card's accent foreground, resolved per theme from the shade pair
     `tileStyle()` sets inline. The 600 shade carries enough contrast on the
     light surface; the fallback keeps the brand tint if no accent was emitted.
     (Inline props only set the *sources*, so the dark rule below can win.) */
  --tile-accent: var(--tile-accent-light, var(--dz-primary, #4f46e5));
}

/* Dark surfaces want the lighter 400 shade so the accent stays legible. */
[data-theme="dark"] .tile {
  --tile-accent: var(--tile-accent-dark, var(--dz-primary, #818cf8));
}

/* Tint the card's hover border with its own accent (overrides the global
   brand-tinted `.lp-card--hover:hover` border for these gallery tiles). */
.tile.lp-card--hover:hover {
  border-color: color-mix(in oklch, var(--tile-accent) 36%, var(--lp-hairline));
}

.tile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
}

.tile-category {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--tile-accent);
  margin-bottom: 16px;
}

.tile-preview {
  flex: 1;
  min-height: 96px;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid var(--lp-hairline);
  /* Decorative accent wash — a soft diagonal tint in the card's hue so the
     preview reads as colour-coded to its category, not a flat panel. */
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--tile-accent-wash, var(--dz-primary, #6366f1)) 12%, transparent), transparent 62%),
    radial-gradient(circle at 0% 100%, color-mix(in oklch, var(--tile-accent-wash, var(--dz-primary, #6366f1)) 7%, transparent), transparent 55%),
    var(--dz-background, #fff);
  /* Decorative only — the card cover link owns the interaction. */
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tile-icon {
  color: var(--tile-accent);
}

.tile-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--dz-radius-md, 0.5rem);
}

.tile-stack {
  margin-bottom: 16px;
  line-height: 1.5;
}

.tile-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--tile-accent);
  text-decoration: none;
}

/* Make the whole card activate the link without nesting the preview inside it. */
.tile-link-cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.tile-link:focus-visible .tile-link-cover {
  outline: 2px solid var(--tile-accent);
  outline-offset: -2px;
  border-radius: var(--dz-radius-xl, 0.875rem);
}

.templates-empty {
  padding: clamp(32px, 6vw, 64px) 24px;
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .gallery-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .templates-toolbar {
    margin-top: 0;
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
