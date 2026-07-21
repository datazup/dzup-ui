<script setup lang="ts">
import { DzText } from '@dzup-ui/core'
import { useLiveStats } from '../composables/useLiveStats.ts'
import { FACTS, LINKS } from '../config.ts'
import { PRO_FACTS } from '../data.ts'
import { DzCountUp } from '../motion'

// Hard breadth numbers (spec §4.7) sit alongside the two *live* metrics —
// GitHub stars and npm weekly downloads — baked in at build time and refreshed
// best-effort at runtime (see useLiveStats). Every figure counts up on scroll-in
// via DzCountUp, which honours prefers-reduced-motion. A live metric that is
// still unknown (its API was down at build time and hasn't refreshed) degrades to
// a plain call-to-action rather than a fabricated number — never hiding real
// numbers, never inventing missing ones.
const { githubStars, npmDownloads, asOf } = useLiveStats()

const numberFormat = new Intl.NumberFormat()

/**
 * Reserve the figure's final width *before* it counts up.
 *
 * `DzCountUp` tweens 0 → value, so the glyph count grows mid-animation (1 char
 * → 6). Combined with `font-variant-numeric: tabular-nums` — every digit the
 * same advance — reserving the formatted length in `ch` keeps the box a fixed
 * size for the whole tween, so nothing shifts. The landing-perf CI job budgets
 * CLS < 0.1; an unreserved count-up is the cheapest way to blow it.
 *
 * Separators (`,`) are narrower than a digit, so this over-reserves slightly —
 * the safe direction.
 */
function reserve(value: number | null): string {
  const glyphs = value === null ? 1 : numberFormat.format(value).length
  return `${glyphs}ch`
}

/** Full-sentence accessible name for a tile: "12,400 GitHub stars". */
function statLabel(value: number | null, noun: string, cta: string): string {
  return value === null ? cta : `${numberFormat.format(value)} ${noun}`
}

/** "Numbers as of 2 Jul 2026" — a static figure, honestly dated. */
const freshness = `As of the last site build, ${asOf}`
</script>

<template>
  <section class="proof" aria-label="Project stats">
    <div class="proof-inner">
      <a
        class="stat"
        :href="LINKS.components"
        :aria-label="statLabel(FACTS.freeComponents, 'free components', 'Browse components')"
      >
        <span class="stat-value" :style="{ '--reserve': reserve(FACTS.freeComponents) }">
          <DzCountUp :value="FACTS.freeComponents" :duration="1200" />
        </span>
        <DzText size="sm" tone="muted">Free components</DzText>
      </a>
      <a
        class="stat"
        :href="LINKS.components"
        :aria-label="statLabel(FACTS.families, 'component families', 'Browse components')"
      >
        <span class="stat-value" :style="{ '--reserve': reserve(FACTS.families) }">
          <DzCountUp :value="FACTS.families" :duration="1000" />
        </span>
        <DzText size="sm" tone="muted">Component families</DzText>
      </a>
      <!--
        The one forward-looking tile. `plannedComponents` is a roadmap target, not
        a shipped count, so the label says "planned" — the tiles either side of it
        are present-tense facts and a visitor must be able to tell which is which.
      -->
      <a
        class="stat"
        :href="LINKS.pro"
        :aria-label="`${PRO_FACTS.plannedComponents} Pro components planned`"
      >
        <span class="stat-value" :style="{ '--reserve': reserve(PRO_FACTS.plannedComponents) }">
          <DzCountUp :value="PRO_FACTS.plannedComponents" :duration="1200" prefix="+" />
        </span>
        <DzText size="sm" tone="muted">Pro components planned</DzText>
      </a>
      <a
        class="stat"
        :href="LINKS.github"
        target="_blank"
        rel="noreferrer noopener"
        :title="githubStars !== null ? freshness : undefined"
        :aria-label="statLabel(githubStars, 'GitHub stars', 'Star dzup-ui on GitHub')"
      >
        <span class="stat-value" :style="{ '--reserve': reserve(githubStars) }">
          <span class="stat-value--glyph" aria-hidden="true">★</span>
          <DzCountUp v-if="githubStars !== null" :value="githubStars" :duration="1400" />
        </span>
        <DzText size="sm" tone="muted">{{ githubStars !== null ? 'GitHub stars' : 'Star on GitHub' }}</DzText>
      </a>
      <!-- Until @dzup-ui/core is published, the npm package page 404s — the
           degraded "Install from npm" CTA points at the install guide instead
           (TASK-FREE-11). Flips to the real npm page once downloads resolve. -->
      <a
        class="stat"
        :href="npmDownloads !== null ? LINKS.npm : LINKS.gettingStarted"
        target="_blank"
        rel="noreferrer noopener"
        :title="npmDownloads !== null ? freshness : undefined"
        :aria-label="statLabel(npmDownloads, 'npm downloads in the last week', 'Install dzup-ui from npm')"
      >
        <span class="stat-value" :style="{ '--reserve': reserve(npmDownloads) }">
          <DzCountUp v-if="npmDownloads !== null" :value="npmDownloads" :duration="1600" />
          <span v-else class="stat-value--glyph" aria-hidden="true">↓</span>
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
  justify-content: center;
  column-gap: 0.12em;
  font-size: clamp(2.1rem, 4.6vw, 3.1rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--dz-foreground, #1a202c);
  /* Hold the figure's final width for the whole count-up so nothing reflows:
     `--reserve` is set inline from the formatted value's glyph count, and
     tabular figures give every digit the same advance. Guards the CLS < 0.1
     budget the landing-perf CI job asserts. */
  min-width: var(--reserve, 0);
  font-variant-numeric: tabular-nums;
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
