<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { FACTS, LINKS } from '../config.ts'
import { useLiveStats } from '../composables/useLiveStats.ts'
import { DzCountUp } from '../motion'

// Hard breadth numbers (spec §4.7) sit alongside the two *live* metrics —
// GitHub stars and npm weekly downloads — baked in at build time and refreshed
// best-effort at runtime (see useLiveStats). Every figure counts up on scroll-in
// via DzCountUp, which honours prefers-reduced-motion. A live metric that is
// still unknown (its API was down at build time and hasn't refreshed) degrades to
// a plain call-to-action rather than a fabricated number — never hiding real
// numbers, never inventing missing ones.
const { githubStars, npmDownloads } = useLiveStats()
</script>

<template>
  <section class="proof" aria-label="Project stats">
    <div class="proof-inner">
      <a class="stat" :href="LINKS.components">
        <span class="stat-value">
          <DzCountUp :value="FACTS.freeComponents" :duration="1200" aria-label="Free components" />
        </span>
        <DzText size="sm" tone="muted">Free components</DzText>
      </a>
      <a class="stat" :href="LINKS.components">
        <span class="stat-value">
          <DzCountUp :value="FACTS.families" :duration="1000" aria-label="Component families" />
        </span>
        <DzText size="sm" tone="muted">Component families</DzText>
      </a>
      <a class="stat" :href="LINKS.pro">
        <span class="stat-value">
          <DzCountUp :value="FACTS.proComponents" :duration="1200" prefix="+" aria-label="Pro components coming soon" />
        </span>
        <DzText size="sm" tone="muted">Pro components soon</DzText>
      </a>
      <a class="stat" :href="LINKS.github" target="_blank" rel="noreferrer noopener">
        <span class="stat-value">
          <template v-if="githubStars !== null">
            <span class="stat-value--glyph" aria-hidden="true">★</span>
            <DzCountUp :value="githubStars" :duration="1400" aria-label="GitHub stars" />
          </template>
          <span v-else class="stat-value--glyph">★</span>
        </span>
        <DzText size="sm" tone="muted">{{ githubStars !== null ? 'GitHub stars' : 'Star on GitHub' }}</DzText>
      </a>
      <a class="stat" :href="LINKS.npm" target="_blank" rel="noreferrer noopener">
        <span class="stat-value">
          <DzCountUp
            v-if="npmDownloads !== null"
            :value="npmDownloads"
            :duration="1600"
            aria-label="npm downloads in the last week"
          />
          <span v-else class="stat-value--glyph">↓</span>
        </span>
        <DzText size="sm" tone="muted">{{ npmDownloads !== null ? 'npm downloads / week' : 'Install from npm' }}</DzText>
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
  grid-template-columns: repeat(5, 1fr);
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
  column-gap: 0.12em;
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
  /* Left column of each row resets the vertical hairline. */
  .stat:nth-child(odd) {
    border-left: none;
  }
}
</style>
