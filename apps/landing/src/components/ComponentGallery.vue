<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { ArrowUpRight } from 'lucide-vue-next'
import { FACTS, LINKS } from '../config.ts'
import { FAMILIES } from '../data.ts'
import FamilyPreview from './FamilyPreview.vue'
import Section from './Section.vue'
</script>

<template>
  <Section
    eyebrow="The full set"
    :title="`${FACTS.freeComponents} components, ${FACTS.families} families`"
    lede="A live taste of each family. Open Storybook to browse every component, state and prop."
    surface
    bordered
    heading-id="gallery-title"
  >
    <template #default>
      <div class="gallery-actions">
        <a class="gallery-all" :href="LINKS.components">
          Open Storybook
          <ArrowUpRight :size="16" aria-hidden="true" />
        </a>
      </div>

      <ul class="gallery-grid">
        <li
          v-for="(family, i) in FAMILIES"
          :key="family.label"
          class="lp-card lp-card--hover tile"
          :style="{ '--reveal-delay': `${i * 45}ms` }"
        >
          <div class="tile-head">
            <DzText weight="semibold" as="span">
              {{ family.label }}
            </DzText>
            <span class="tile-count">{{ family.count }}</span>
          </div>

          <div class="tile-preview" aria-hidden="true">
            <FamilyPreview :name="family.label" />
          </div>

          <a class="tile-link" :href="family.href">
            <span>View stories</span>
            <ArrowUpRight :size="14" aria-hidden="true" />
            <span class="tile-link-cover" :aria-label="`View ${family.label} stories in Storybook`" />
          </a>
        </li>
      </ul>
    </template>
  </Section>
</template>

<style scoped>
.gallery-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: -32px;
  margin-bottom: 24px;
}

.gallery-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-primary, #0766ee);
  text-decoration: none;
}

.gallery-all:hover {
  text-decoration: underline;
}

.gallery-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.tile-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.tile-count {
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 700;
  padding: 2px 9px;
  border-radius: var(--dz-radius-full, 9999px);
  background: var(--dz-primary-muted, #d5e9ff);
  color: var(--dz-primary, #0766ee);
}

.tile-preview {
  flex: 1;
  min-height: 96px;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: var(--dz-radius-lg, 0.625rem);
  border: 1px solid var(--lp-hairline);
  background:
    radial-gradient(circle at 100% 0%, color-mix(in oklch, var(--dz-primary, #0766ee) 4%, transparent), transparent 60%),
    var(--dz-background, #e7e8e9);
  /* Decorative only — controls inside are not interactive. */
  pointer-events: none;
  display: flex;
}

.tile-preview :deep(*) {
  cursor: default;
}

.tile-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--dz-text-sm, 0.875rem);
  font-weight: 600;
  color: var(--dz-primary, #0766ee);
  text-decoration: none;
}

/* Make the whole card activate the link without nesting the preview inside it. */
.tile-link-cover {
  position: absolute;
  inset: 0;
  border-radius: inherit;
}

.tile-link:focus-visible .tile-link-cover {
  outline: 2px solid var(--dz-ring, #0766ee);
  outline-offset: -2px;
  border-radius: var(--dz-radius-xl, 0.875rem);
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  .gallery-actions {
    margin-top: 0;
  }
}
</style>
