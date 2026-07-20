<script setup lang="ts">
/**
 * /compare — an honest, neutral feature matrix of dzup-ui alongside other
 * popular Vue 3 component libraries (docs/landing.md — "help evaluators decide").
 *
 * The data lives in ../data/compare.ts, sourced from each library's public docs
 * and dated. The table is built from the DzTable primitives; dzup-ui is the first
 * (emphasised) column. Copy is factual — no superlatives, no ranking.
 */
import { DzButton, DzCard, DzHeading, DzTable, DzTableBody, DzTableCell, DzTableHeader, DzTableRow, DzText } from '@dzup-ui/core'
import { ArrowRight, ExternalLink } from 'lucide-vue-next'
import Section from '../components/Section.vue'
import { LINKS } from '../config.ts'
import { COMPARE_UPDATED, LIBRARIES, ROWS } from '../data/compare.ts'
</script>

<template>
  <div class="compare-page">
    <Section
      eyebrow="Compare"
      title="dzup-ui vs. the Vue ecosystem"
      lede="A neutral, sourced summary of how dzup-ui lines up against other popular Vue 3 component libraries. Every project here is capable and actively maintained — use this to find the right fit, not a ranking."
      heading-id="compare-title"
      align="center"
      :heading-level="1"
    >
      <p class="compare-meta">
        Figures verified against each library's official documentation · Last updated {{ COMPARE_UPDATED }}
      </p>

      <DzCard variant="outlined" padding="none" class="compare-card">
        <div class="compare-scroll" role="region" aria-labelledby="compare-title" tabindex="0">
          <DzTable size="sm" hoverable aria-label="Feature comparison of dzup-ui and other Vue 3 component libraries">
            <DzTableHeader>
              <DzTableRow>
                <DzTableCell header scope="col" class="feature-col">
                  Feature
                </DzTableCell>
                <DzTableCell
                  v-for="lib in LIBRARIES"
                  :key="lib.key"
                  header
                  scope="col"
                  :class="lib.self ? 'col-self' : undefined"
                >
                  <a :href="lib.href" target="_blank" rel="noreferrer noopener" class="lib-head">
                    {{ lib.name }}
                    <ExternalLink :size="12" aria-hidden="true" />
                  </a>
                </DzTableCell>
              </DzTableRow>
            </DzTableHeader>
            <DzTableBody>
              <DzTableRow v-for="row in ROWS" :key="row.feature">
                <DzTableCell header scope="row" class="feature-col">
                  <span class="feature-label">{{ row.feature }}</span>
                  <span v-if="row.note" class="feature-note">{{ row.note }}</span>
                </DzTableCell>
                <DzTableCell
                  v-for="lib in LIBRARIES"
                  :key="lib.key"
                  :class="lib.self ? 'col-self' : undefined"
                >
                  <DzText size="sm" :tone="lib.self ? 'default' : 'muted'" :weight="lib.self ? 'medium' : 'normal'" as="span">
                    {{ row.values[lib.key] ?? '—' }}
                  </DzText>
                </DzTableCell>
              </DzTableRow>
            </DzTableBody>
          </DzTable>
        </div>
      </DzCard>

      <div class="compare-actions">
        <DzButton variant="solid" tone="primary" as="a" :href="LINKS.components">
          Browse dzup-ui components
          <template #suffix>
            <ArrowRight :size="16" aria-hidden="true" />
          </template>
        </DzButton>
        <DzButton variant="outline" tone="neutral" to="/themes">
          Try the theme designer
        </DzButton>
      </div>
    </Section>

    <Section surface bordered align="left" heading-id="compare-sources-title">
      <DzHeading id="compare-sources-title" :level="2" size="xl" weight="semibold" class="sources-title">
        Sources & method
      </DzHeading>
      <DzText tone="muted" class="sources-lede">
        Each column's facts come from that library's official documentation, checked in {{ COMPARE_UPDATED }}.
        Component counts are approximate — libraries count sub-components differently — so read them as orders
        of magnitude. Where a library supports a spectrum (e.g. styled and unstyled), the table says so rather
        than picking a side. Spot something out of date?
        <a :href="LINKS.issues" target="_blank" rel="noreferrer noopener">Open an issue</a>
        and we'll correct it.
      </DzText>
      <ul class="sources-list">
        <li v-for="lib in LIBRARIES" :key="lib.key">
          <DzText size="sm" weight="medium" as="span">
            {{ lib.name }}
          </DzText>
          <a :href="lib.href" target="_blank" rel="noreferrer noopener" class="source-link">
            {{ lib.source }}
            <ExternalLink :size="12" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </Section>
  </div>
</template>

<style scoped>
.compare-meta {
  margin: -24px 0 28px;
  text-align: center;
  font-size: var(--dz-text-xs, 0.75rem);
  color: var(--dz-muted-foreground, #585b60);
}

.compare-card {
  overflow: hidden;
}

/* Horizontal scroll for the matrix on narrow viewports (mirrors TableCard). The
   region is focusable so keyboard users can scroll it; aria-labelledby names it. */
.compare-scroll {
  overflow-x: auto;
}

.compare-scroll:focus-visible {
  outline: 2px solid var(--dz-primary, #0766ee);
  outline-offset: -2px;
}

.feature-col {
  white-space: nowrap;
}

.feature-label {
  display: block;
  font-weight: 600;
  color: var(--dz-foreground, #1b1d1f);
}

.feature-note {
  display: block;
  margin-top: 2px;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 400;
  color: var(--dz-muted-foreground, #585b60);
  white-space: normal;
  max-width: 22ch;
}

/* The dzup-ui column, gently tinted so the reader's own library stands out
   without disparaging the rest. Tokens only — correct in light + dark. */
.col-self {
  background: color-mix(in oklch, var(--dz-primary, #0766ee) 7%, transparent);
}

.lib-head {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--dz-foreground, #1b1d1f);
  text-decoration: none;
  font-weight: 700;
}

.lib-head:hover {
  color: var(--dz-primary, #0766ee);
}

.compare-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}

.sources-title {
  margin: 0 0 12px;
}

.sources-lede {
  display: block;
  max-width: 68ch;
  line-height: 1.65;
}

.sources-lede a,
.source-link {
  color: var(--dz-primary, #0766ee);
  text-decoration: none;
}

.sources-lede a:hover,
.source-link:hover {
  text-decoration: underline;
}

.sources-list {
  list-style: none;
  margin: 20px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px 24px;
}

.sources-list li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--lp-hairline);
}

.source-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--dz-text-sm, 0.875rem);
}
</style>
