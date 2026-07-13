<script setup lang="ts">
import { DzAvatar, DzCard, DzText } from '@dzup-ui/core'
import { TESTIMONIALS } from '../config.ts'
import Section from './Section.vue'

/**
 * The home page's trust section (TASK-DS-12).
 *
 * Scaffolded, and deliberately invisible: `TESTIMONIALS` is empty because
 * dzup-ui has no public users yet, and a fabricated quote is worse than an
 * absent one. The component renders `null` in that state, so nothing about the
 * page hints that a testimonial *should* be here. Fill `TESTIMONIALS` in
 * `config.ts` with real, permission-cleared entries and this section appears.
 *
 * Built from `@dzup-ui/core` (DzCard, DzAvatar, DzText) so it inherits theming
 * and a11y, and styled with `--dz-*` tokens only — never the landing's `--lp-*`
 * layer — per the block-authoring conventions.
 */
</script>

<template>
  <Section
    v-if="TESTIMONIALS.length > 0"
    eyebrow="Trusted by"
    title="What teams say"
    lede="Engineers shipping production Vue on top of dzup-ui."
    heading-id="testimonials-title"
  >
    <ul class="quotes">
      <li v-for="t in TESTIMONIALS" :key="t.name" class="quote-item">
        <DzCard variant="outlined" padding="md" class="quote-card">
          <blockquote class="quote-body">
            <DzText as="p" size="md">
              “{{ t.quote }}”
            </DzText>
          </blockquote>
          <footer class="quote-attr">
            <DzAvatar :src="t.avatar" :alt="t.name" :fallback="t.name.slice(0, 1)" size="sm" />
            <div class="quote-person">
              <DzText as="div" size="sm" weight="semibold">
                {{ t.name }}
              </DzText>
              <DzText as="div" size="xs" tone="muted">
                {{ t.title }}
              </DzText>
            </div>
            <a v-if="t.href" class="quote-source" :href="t.href" target="_blank" rel="noreferrer noopener">
              Source<span class="sr-only"> of {{ t.name }}’s quote</span>
            </a>
          </footer>
        </DzCard>
      </li>
    </ul>
  </Section>
</template>

<style scoped>
.quotes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.quote-item {
  min-width: 0;
}

.quote-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--dz-spacing-4, 16px);
}

.quote-body {
  margin: 0;
}

.quote-attr {
  display: flex;
  align-items: center;
  gap: var(--dz-spacing-3, 12px);
}

.quote-person {
  min-width: 0;
  line-height: 1.25;
}

.quote-source {
  margin-left: auto;
  font-size: var(--dz-text-xs, 0.75rem);
  font-weight: 600;
  color: var(--dz-primary-muted-foreground);
  text-decoration: none;
  border-radius: var(--dz-radius-sm, 4px);
}

.quote-source:hover {
  text-decoration: underline;
}

.quote-source:focus-visible {
  outline: 2px solid var(--dz-ring);
  outline-offset: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
