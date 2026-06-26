<script setup lang="ts">
import { DzAnimatedNumber, DzText } from '@dzup-ui/core'
import { FACTS, LINKS } from '../config.ts'

// Hard numbers (spec §4.7). Counts animate up on view; live metrics
// (stars/downloads) are labelled as such until a data source is wired — never
// hiding the numbers (the CoreUI/Bootstrap anti-pattern).
</script>

<template>
  <section class="proof" aria-label="Project stats">
    <div class="proof-inner">
      <a class="stat" :href="LINKS.components">
        <span class="stat-value">
          <DzAnimatedNumber :value="FACTS.freeComponents" :duration="1200" start-on-view />
        </span>
        <DzText size="sm" tone="muted">Free components</DzText>
      </a>
      <a class="stat" :href="LINKS.components">
        <span class="stat-value">
          <DzAnimatedNumber :value="FACTS.families" :duration="1000" start-on-view />
        </span>
        <DzText size="sm" tone="muted">Component families</DzText>
      </a>
      <a class="stat" :href="LINKS.pro">
        <span class="stat-value">
          +<DzAnimatedNumber :value="FACTS.proComponents" :duration="1200" start-on-view />
        </span>
        <DzText size="sm" tone="muted">Pro components soon</DzText>
      </a>
      <a class="stat" :href="LINKS.github" target="_blank" rel="noreferrer noopener">
        <span class="stat-value stat-value--glyph">★</span>
        <DzText size="sm" tone="muted">Star on GitHub</DzText>
      </a>
    </div>
  </section>
</template>

<style scoped>
.proof {
  padding: 0 24px;
}

.proof-inner {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  max-width: 980px;
  margin: 0 auto;
  padding: clamp(40px, 5vw, 60px) clamp(16px, 3vw, 40px);
  border: 1px solid var(--lp-hairline);
  border-radius: var(--dz-radius-2xl, 1.25rem);
  background:
    radial-gradient(ellipse 70% 140% at 50% 0%, color-mix(in oklch, var(--dz-primary, #6366f1) 7%, transparent), transparent 70%),
    var(--dz-surface, #fff);
  box-shadow: var(--lp-shadow), var(--lp-highlight);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  text-decoration: none;
  color: inherit;
  border-left: 1px solid var(--lp-hairline);
  transition: opacity var(--dz-duration-fast, 150ms);
}

.stat:first-child {
  border-left: none;
}

.stat:hover {
  opacity: 0.7;
}

.stat-value {
  display: inline-flex;
  align-items: baseline;
  font-size: clamp(2.1rem, 4.6vw, 3.1rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--dz-foreground, #1a202c);
}

.stat-value :deep(*) {
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  color: inherit;
}

/* The Pro "+" prefix and GitHub star keep the brand gradient (direct text). */
.stat-value--glyph {
  background: linear-gradient(135deg, var(--lp-brand), var(--lp-brand-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@media (max-width: 640px) {
  .proof-inner {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 0;
  }
  .stat:nth-child(3) {
    border-left: none;
  }
}
</style>
