<script setup lang="ts">
import type { ShotPalette, ShotVariant } from './data.ts'
/**
 * Feature / Product — Marketing deep-dive template (docs/templates.md §6.2).
 *
 * A chromeless product page: a sticky nav, a hero with a token-painted product
 * mock and spec DzBadges, alternating feature rows pairing copy with a DzImage,
 * a DzTabs feature explorer, a before/after DzImageComparison reveal, a "by the
 * numbers" strip and a closing CTA. Built only from free `@dzup-ui/core`
 * components, token-styled (no `lp-*`) and correct in light + dark from 390px up.
 *
 * Every screenshot is painted from resolved `--dz-*` tokens (see `buildShot`),
 * so the page ships no image assets and re-themes with the page. DzButton and
 * DzDivider support the listed stack for CTAs and section rules (both real core
 * exports) — noted as the only additions beyond the §6.2 headline components.
 */
import {
  DzBadge,
  DzButton,
  DzCard,
  DzDivider,
  DzHeading,
  DzImage,
  DzImageComparison,
  DzTabContent,
  DzTabList,
  DzTabs,
  DzTabTrigger,
  DzText,
} from '@dzup-ui/core'
import { ArrowRight, Boxes, Check, Sparkles } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  buildShot,
  FEATURE_ROWS,
  FEATURE_TABS,
  HERO_SPECS,

  STATS,
} from './data.ts'

/** Resolve a `--dz-*` token to its computed value, with a neutral fallback. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined')
    return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const tab = ref(FEATURE_TABS[0]!.value)
const comparePos = ref(50)

// Bumped whenever the theme flips so every painted shot recomputes (the preview
// detail page toggles `data-theme` on the iframe document).
const tick = ref(0)
let observer: MutationObserver | null = null
onMounted(() => {
  observer = new MutationObserver(() => (tick.value += 1))
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => observer?.disconnect())

/** Live token palette for the mocks; recomputes on theme flip. */
const palette = computed<ShotPalette>(() => {
  void tick.value
  return {
    surface: token('--dz-muted', '#f1f5f9'),
    panel: token('--dz-background', '#ffffff'),
    panelAlt: token('--dz-muted', '#e2e8f0'),
    line: token('--dz-border', '#e2e8f0'),
    accent: token('--dz-primary', '#6366f1'),
    accentSoft: token('--dz-primary-muted', '#e0e7ff'),
    ink: token('--dz-foreground', '#0f172a'),
  }
})

function shot(variant: ShotVariant): string {
  return buildShot(palette.value, variant)
}

const heroSrc = computed(() => shot('analyze'))
const activeTab = computed(() => FEATURE_TABS.find(t => t.value === tab.value) ?? FEATURE_TABS[0]!)
</script>

<template>
  <div class="fp">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>
        <nav class="nav-links" aria-label="Primary">
          <a href="#features">Features</a>
          <a href="#explore">Explore</a>
          <a href="#compare">Compare</a>
        </nav>
        <div class="nav-cta">
          <DzButton variant="ghost" tone="neutral" size="sm">
            Sign in
          </DzButton>
          <DzButton variant="solid" tone="primary" size="sm">
            Get started
          </DzButton>
        </div>
      </div>
    </header>

    <main>
      <!-- ── Hero ─────────────────────────────────────────────── -->
      <section class="hero">
        <div class="hero-copy">
          <DzBadge variant="subtle" tone="primary" size="sm">
            Platform · v4
          </DzBadge>
          <h1 class="hero-title">
            One workspace for data, work and automation
          </h1>
          <DzText size="lg" tone="muted" as="p" class="hero-lede">
            Northwind brings your dashboards, boards and flows under one roof — so
            insight, action and follow-through never leave the same tab.
          </DzText>
          <div class="hero-actions">
            <DzButton variant="solid" tone="primary" size="lg">
              Start free
              <template #suffix>
                <ArrowRight :size="18" aria-hidden="true" />
              </template>
            </DzButton>
            <DzButton variant="outline" tone="neutral" size="lg">
              Watch the tour
            </DzButton>
          </div>
          <ul class="hero-specs">
            <li v-for="s in HERO_SPECS" :key="s">
              <DzBadge variant="outline" tone="neutral" size="sm">
                <span class="badge-row"><Check :size="13" aria-hidden="true" />{{ s }}</span>
              </DzBadge>
            </li>
          </ul>
        </div>
        <div class="hero-media">
          <div class="hero-glow" aria-hidden="true" />
          <DzImage
            :src="heroSrc"
            alt="Northwind platform dashboard with live KPI cards and a revenue chart"
            fit="contain"
            aspect-ratio="8 / 5"
            class="hero-shot"
          />
        </div>
      </section>

      <!-- ── Alternating feature rows ─────────────────────────── -->
      <section id="features" class="features">
        <article
          v-for="(row, i) in FEATURE_ROWS"
          :key="row.id"
          class="feature-row"
          :class="{ 'feature-row--rev': i % 2 === 1 }"
        >
          <div class="feature-copy">
            <span class="feature-eyebrow">
              <span class="feature-eyebrow-icon" aria-hidden="true">
                <component :is="row.icon" :size="16" />
              </span>
              {{ row.eyebrow }}
            </span>
            <DzHeading :level="2" size="xl" weight="semibold" class="feature-title">
              {{ row.title }}
            </DzHeading>
            <DzText size="lg" tone="muted" as="p" class="feature-body">
              {{ row.body }}
            </DzText>
            <ul class="feature-specs">
              <li v-for="spec in row.specs" :key="spec">
                <DzBadge variant="subtle" tone="primary" size="sm">
                  {{ spec }}
                </DzBadge>
              </li>
            </ul>
          </div>
          <div class="feature-media">
            <DzImage
              :src="shot(row.shot)"
              :alt="`${row.title} — product screenshot`"
              fit="contain"
              aspect-ratio="8 / 5"
              class="feature-shot"
            />
          </div>
        </article>
      </section>

      <!-- ── Feature explorer (tabs) ──────────────────────────── -->
      <section id="explore" class="explore">
        <div class="section-head">
          <DzBadge variant="subtle" tone="primary" size="sm">
            Explore
          </DzBadge>
          <h2 class="section-title">
            Three surfaces, one platform
          </h2>
        </div>
        <DzTabs v-model="tab" variant="pills" aria-label="Feature explorer" class="explore-tabs">
          <DzTabList class="explore-tablist">
            <DzTabTrigger v-for="t in FEATURE_TABS" :key="t.value" :value="t.value">
              {{ t.label }}
            </DzTabTrigger>
          </DzTabList>
          <DzTabContent v-for="t in FEATURE_TABS" :key="t.value" :value="t.value" class="explore-pane">
            <DzCard variant="outlined" padding="lg" class="explore-card">
              <div class="explore-grid">
                <div class="explore-text">
                  <DzHeading :level="3" size="lg" weight="semibold">
                    {{ activeTab.title }}
                  </DzHeading>
                  <DzText tone="muted" as="p">
                    {{ activeTab.body }}
                  </DzText>
                  <DzButton variant="text" tone="primary" class="explore-link">
                    Learn more
                    <template #suffix>
                      <ArrowRight :size="16" aria-hidden="true" />
                    </template>
                  </DzButton>
                </div>
                <div class="explore-media">
                  <DzImage
                    :src="shot(t.shot)"
                    :alt="`${t.title} — preview`"
                    fit="contain"
                    aspect-ratio="8 / 5"
                    class="explore-shot"
                  />
                </div>
              </div>
            </DzCard>
          </DzTabContent>
        </DzTabs>
      </section>

      <!-- ── Before / after ───────────────────────────────────── -->
      <section id="compare" class="compare">
        <div class="section-head">
          <DzBadge variant="subtle" tone="primary" size="sm">
            <span class="badge-row"><Sparkles :size="13" aria-hidden="true" />The redesign</span>
          </DzBadge>
          <h2 class="section-title">
            From cluttered to clear
          </h2>
          <DzText size="lg" tone="muted" as="p">
            Drag the handle to see what v4 did to the old reporting view.
          </DzText>
        </div>
        <div class="compare-frame">
          <DzImageComparison
            v-model:position="comparePos"
            :before-src="shot('before')"
            :after-src="shot('after')"
            before-alt="The legacy reporting view — dense, low-contrast panels"
            after-alt="The Northwind v4 reporting view — spacious and focused"
            before-label="Before"
            after-label="After"
            aria-label="Before and after the v4 redesign"
            class="compare-img"
          />
        </div>
      </section>

      <!-- ── By the numbers ───────────────────────────────────── -->
      <section class="stats">
        <DzDivider class="stats-rule" />
        <ul class="stats-grid">
          <li v-for="s in STATS" :key="s.label">
            <span class="stat-value">{{ s.value }}</span>
            <DzText size="sm" tone="muted" as="span">
              {{ s.label }}
            </DzText>
          </li>
        </ul>
        <DzDivider class="stats-rule" />
      </section>

      <!-- ── Closing CTA ──────────────────────────────────────── -->
      <section class="cta">
        <div class="cta-inner">
          <h2 class="cta-title">
            Bring it all together
          </h2>
          <DzText size="lg" as="p" class="cta-lede">
            Spin up your workspace in minutes. Free to start, no credit card required.
          </DzText>
          <div class="cta-actions">
            <DzButton variant="solid" tone="neutral" size="lg">
              Start free
            </DzButton>
            <DzButton variant="outline" tone="neutral" size="lg">
              Book a demo
            </DzButton>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="16" /></span>
        <span class="brand-name">Northwind</span>
      </span>
      <DzText size="sm" tone="muted">
        © 2026 Northwind, Inc. All rights reserved.
      </DzText>
    </footer>
  </div>
</template>

<style scoped>
.fp {
  background: var(--dz-background);
  color: var(--dz-foreground);
  font-family: var(--dz-font-sans);
  min-height: 100vh;
}

/* ── Nav ──────────────────────────────────────────────────────── */
.nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in oklch, var(--dz-background) 86%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--dz-border);
}

.nav-inner,
.hero,
.features,
.explore,
.compare,
.stats,
.cta-inner,
.footer {
  max-width: 1080px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 64px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: var(--dz-font-semibold);
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.nav-links {
  display: flex;
  gap: 28px;
}

.nav-links a {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  color: var(--dz-muted-foreground);
  text-decoration: none;
}

.nav-links a:hover {
  color: var(--dz-foreground);
}

.nav-cta {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Inline icon + label inside a DzBadge (badge exposes only a default slot). */
.badge-row {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

/* ── Hero ─────────────────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: center;
  padding-top: clamp(44px, 6vw, 88px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 4.4vw, 3.1rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
  font-weight: var(--dz-font-bold);
}

.hero-lede {
  margin: 0;
  line-height: 1.6;
  max-width: 46ch;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 4px;
}

.hero-specs {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.hero-media {
  position: relative;
}

.hero-glow {
  position: absolute;
  inset: 6% 2% -10%;
  z-index: 0;
  background: radial-gradient(
    ellipse 60% 60% at 60% 40%,
    color-mix(in oklch, var(--dz-primary) 26%, transparent),
    transparent 70%
  );
  filter: blur(54px);
}

.hero-shot {
  position: relative;
  z-index: 1;
  width: 100%;
  border-radius: var(--dz-radius-xl);
  border: 1px solid var(--dz-border);
  box-shadow: var(--dz-shadow-xl);
  overflow: hidden;
}

/* ── Feature rows ─────────────────────────────────────────────── */
.features {
  display: flex;
  flex-direction: column;
  gap: clamp(48px, 7vw, 96px);
  padding-top: clamp(32px, 5vw, 56px);
  padding-bottom: clamp(48px, 7vw, 88px);
}

.feature-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: center;
}

.feature-row--rev .feature-media {
  order: -1;
}

.feature-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.feature-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--dz-primary);
}

.feature-eyebrow-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--dz-radius-md);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.feature-title {
  margin: 0;
  letter-spacing: -0.02em;
}

.feature-body {
  margin: 0;
  line-height: 1.6;
  max-width: 48ch;
}

.feature-specs {
  list-style: none;
  margin: 6px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-media {
  position: relative;
}

.feature-shot {
  width: 100%;
  border-radius: var(--dz-radius-xl);
  border: 1px solid var(--dz-border);
  box-shadow: var(--dz-shadow-lg);
  overflow: hidden;
  background: var(--dz-muted);
}

/* ── Shared section heads ─────────────────────────────────────── */
.section-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  margin-bottom: 36px;
}

.section-title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: var(--dz-font-semibold);
}

/* ── Explorer ─────────────────────────────────────────────────── */
.explore {
  padding-top: clamp(24px, 4vw, 48px);
  padding-bottom: clamp(48px, 7vw, 88px);
}

.explore-tablist {
  justify-content: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.explore-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(20px, 3vw, 44px);
  align-items: center;
}

.explore-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.explore-text :deep(p) {
  line-height: 1.6;
}

.explore-link {
  margin-top: 2px;
}

.explore-shot {
  width: 100%;
  border-radius: var(--dz-radius-lg);
  border: 1px solid var(--dz-border);
  overflow: hidden;
  background: var(--dz-muted);
}

/* ── Before / after ───────────────────────────────────────────── */
.compare {
  padding-top: clamp(24px, 4vw, 48px);
  padding-bottom: clamp(48px, 7vw, 88px);
}

.compare-frame {
  max-width: 880px;
  margin: 0 auto;
  border-radius: var(--dz-radius-2xl);
  border: 1px solid var(--dz-border);
  box-shadow: var(--dz-shadow-xl);
  overflow: hidden;
}

.compare-img {
  width: 100%;
  aspect-ratio: 8 / 5;
}

/* ── Stats ────────────────────────────────────────────────────── */
.stats {
  padding-top: clamp(8px, 2vw, 24px);
  padding-bottom: clamp(8px, 2vw, 24px);
}

.stats-rule {
  margin: 0;
}

.stats-grid {
  list-style: none;
  margin: 0;
  padding: clamp(28px, 5vw, 48px) 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stats-grid li {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.stat-value {
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  font-weight: var(--dz-font-bold);
  letter-spacing: -0.02em;
  color: var(--dz-primary);
  line-height: 1;
}

/* ── CTA ──────────────────────────────────────────────────────── */
.cta {
  padding: clamp(24px, 4vw, 48px) 24px;
}

.cta-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: clamp(40px, 6vw, 72px) clamp(24px, 5vw, 56px);
  border-radius: var(--dz-radius-2xl);
  background:
    radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--dz-primary) 36%, transparent), transparent 60%),
    var(--dz-primary);
  color: var(--dz-primary-foreground);
}

.cta-title {
  margin: 0;
  font-size: clamp(1.6rem, 3.2vw, 2.4rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: var(--dz-font-bold);
}

.cta-lede {
  margin: 0;
  max-width: 48ch;
  opacity: 0.92;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 6px;
}

/* ── Footer ───────────────────────────────────────────────────── */
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 28px;
  padding-bottom: 28px;
  border-top: 1px solid var(--dz-border);
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 860px) {
  .hero,
  .feature-row {
    grid-template-columns: 1fr;
  }
  .hero-media {
    order: -1;
  }
  .feature-row--rev .feature-media {
    order: 0;
  }
  .explore-grid {
    grid-template-columns: 1fr;
  }
  .nav-links {
    display: none;
  }
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-shot,
  .feature-shot {
    transition: none;
  }
}
</style>
