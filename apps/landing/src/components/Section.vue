<script setup lang="ts">
import { DzHeading, DzText } from '@dzup-ui/core'

/**
 * Section — shared layout + heading rhythm for every landing block.
 * Enforces consistent whitespace, an eyebrow → title → lede stack, and an
 * optional surface/tinted background. Keeps the "elegant & refined" cadence
 * uniform across the page so nothing feels ad-hoc.
 */
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    lede?: string
    align?: 'left' | 'center'
    surface?: boolean
    bordered?: boolean
    /** Accessible id for the heading (links the section's aria-labelledby). */
    headingId?: string
    /**
     * Semantic heading level. Defaults to 2 (a section under the page's h1);
     * a page whose FIRST Section carries the page title passes 1 so every
     * route has exactly one h1 (WCAG heading structure). Visual size is
     * unchanged — only the semantics shift.
     */
    headingLevel?: 1 | 2
  }>(),
  { align: 'center', surface: false, bordered: false, headingLevel: 2 },
)
</script>

<template>
  <section
    class="section"
    :class="{ 'section--surface': surface, 'section--bordered': bordered }"
    :aria-labelledby="headingId"
  >
    <div class="section-inner">
      <header v-if="eyebrow || title || lede" class="section-head" :class="`is-${align}`">
        <span v-if="eyebrow" class="lp-eyebrow">{{ eyebrow }}</span>
        <DzHeading v-if="title" :id="headingId" :level="headingLevel" size="3xl" weight="semibold" class="section-title lp-balance">
          {{ title }}
        </DzHeading>
        <DzText v-if="lede" size="lg" tone="muted" class="section-lede lp-balance">
          {{ lede }}
        </DzText>
      </header>
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section {
  padding: var(--lp-section-pad) 24px;
  transition: var(--dz-landing-theme-transition);
}

.section--surface {
  background: var(--dz-surface, #fff);
}

.section--bordered {
  border-top: 1px solid var(--lp-hairline);
}

.section-inner {
  max-width: var(--lp-container, 1120px);
  margin: 0 auto;
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: clamp(40px, 6vw, 72px);
}

.section-head.is-center {
  align-items: center;
  text-align: center;
}

.section-head.is-center .section-lede {
  max-width: 60ch;
}

.section-head.is-left .section-lede {
  max-width: 56ch;
}

.section-title {
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.section-lede {
  margin: 0;
  line-height: 1.65;
}
</style>
