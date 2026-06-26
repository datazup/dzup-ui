<script setup lang="ts">
/**
 * SaaS Landing — featured reference template (docs/templates.md §6.3).
 *
 * A chromeless marketing page: sticky nav, a hero with a live <DzImage> product
 * mockup, a logo strip, a feature grid (DzCard), a testimonials DzCarousel with
 * DzAvatar attribution, a pricing teaser, an FAQ DzAccordion and a closing CTA.
 * Built only from free `@dzup-ui/core` components, token-styled (no `lp-*`), and
 * correct in light + dark from 390px upward. The hero mockup is painted from
 * resolved `--dz-*` tokens so it re-themes with the page and ships no assets.
 */
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzCarousel,
  DzCarouselDots,
  DzCarouselSlide,
  DzHeading,
  DzImage,
  DzText,
} from '@dzup-ui/core'
import { ArrowRight, Boxes, Check, Github, Star } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { buildHeroShot, FAQS, FEATURES, LOGOS, NAV_LINKS, TESTIMONIALS } from './data.ts'

/** Resolve a `--dz-*` token to its computed value, with a neutral fallback. */
function token(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const heroSrc = ref('')

function paintHero(): void {
  heroSrc.value = buildHeroShot({
    surface: token('--dz-surface', '#ffffff'),
    panel: token('--dz-background', '#ffffff'),
    panelAlt: token('--dz-muted', '#f1f5f9'),
    bar: token('--dz-primary', '#6366f1'),
    accent: token('--dz-primary', '#6366f1'),
    line: token('--dz-border', '#e2e8f0'),
    ink: token('--dz-foreground', '#0f172a'),
  })
}

// Repaint the mockup whenever the theme attribute flips so it tracks the page
// (the preview detail page toggles `data-theme` on the iframe document).
let observer: MutationObserver | null = null
onMounted(() => {
  paintHero()
  observer = new MutationObserver(paintHero)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
})
onBeforeUnmount(() => observer?.disconnect())

const planFeatures = [
  '5 workspaces',
  'Unlimited dashboards',
  'Automated digests',
  'SSO & SAML',
  'Priority support',
]
</script>

<template>
  <div class="lp">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>
        <nav class="nav-links" aria-label="Primary">
          <a v-for="link in NAV_LINKS" :key="link.href" :href="link.href">{{ link.label }}</a>
        </nav>
        <div class="nav-cta">
          <DzButton variant="ghost" tone="neutral" size="sm">Sign in</DzButton>
          <DzButton variant="solid" tone="primary" size="sm">Start free</DzButton>
        </div>
      </div>
    </header>

    <main>
      <!-- ── Hero ─────────────────────────────────────────────── -->
      <section class="hero">
        <div class="hero-copy">
          <DzBadge variant="subtle" tone="primary" size="sm">New · Automated insights</DzBadge>
          <h1 class="hero-title">Analytics your whole team will actually use</h1>
          <DzText size="lg" tone="muted" as="p" class="hero-lede">
            Connect a source and ship a live dashboard in minutes. Northwind turns
            raw data into decisions — no pipelines, no analysts in the loop.
          </DzText>
          <div class="hero-actions">
            <DzButton variant="solid" tone="primary" size="lg">
              Start free
              <template #suffix><ArrowRight :size="18" aria-hidden="true" /></template>
            </DzButton>
            <DzButton variant="outline" tone="neutral" size="lg">
              <template #prefix><Github :size="18" aria-hidden="true" /></template>
              View on GitHub
            </DzButton>
          </div>
          <DzText size="sm" tone="muted" as="p" class="hero-note">
            14-day free trial · No credit card required
          </DzText>
        </div>

        <div class="hero-media">
          <div class="hero-glow" aria-hidden="true" />
          <DzImage
            v-if="heroSrc"
            :src="heroSrc"
            alt="Northwind analytics dashboard with KPI cards and a revenue chart"
            fit="contain"
            aspect-ratio="8 / 5"
            class="hero-shot"
          />
        </div>
      </section>

      <!-- ── Logo strip ───────────────────────────────────────── -->
      <section class="logos" aria-label="Trusted by">
        <DzText size="sm" tone="muted" class="logos-label">Trusted by fast-moving teams</DzText>
        <ul class="logos-row">
          <li v-for="logo in LOGOS" :key="logo">{{ logo }}</li>
        </ul>
      </section>

      <!-- ── Features ─────────────────────────────────────────── -->
      <section id="features" class="features">
        <div class="section-head">
          <DzBadge variant="subtle" tone="primary" size="sm">Features</DzBadge>
          <h2 class="section-title">Everything you need to ship insight</h2>
          <DzText size="lg" tone="muted" as="p" class="section-lede">
            Built for the whole company — not just the data team.
          </DzText>
        </div>
        <ul class="feature-grid">
          <li v-for="feature in FEATURES" :key="feature.title">
            <DzCard variant="outlined" padding="lg" class="feature-card">
              <span class="feature-icon" aria-hidden="true">
                <component :is="feature.icon" :size="20" />
              </span>
              <DzHeading :level="3" size="md" weight="semibold" class="feature-title">
                {{ feature.title }}
              </DzHeading>
              <DzText size="sm" tone="muted" as="p">{{ feature.body }}</DzText>
            </DzCard>
          </li>
        </ul>
      </section>

      <!-- ── Testimonials ─────────────────────────────────────── -->
      <section id="testimonials" class="testimonials">
        <div class="section-head">
          <DzBadge variant="subtle" tone="primary" size="sm">Loved by teams</DzBadge>
          <h2 class="section-title">Don’t take our word for it</h2>
        </div>
        <DzCarousel :loop="true" aria-label="Customer testimonials" class="quote-carousel">
          <DzCarouselSlide v-for="t in TESTIMONIALS" :key="t.name">
            <figure class="quote">
              <div class="quote-stars" aria-label="Five out of five stars">
                <Star v-for="n in 5" :key="n" :size="18" fill="currentColor" />
              </div>
              <blockquote class="quote-body">{{ t.quote }}</blockquote>
              <figcaption class="quote-author">
                <DzAvatar :fallback="t.initials" size="md" />
                <span class="quote-meta">
                  <DzText weight="semibold" as="span">{{ t.name }}</DzText>
                  <DzText size="sm" tone="muted" as="span">{{ t.role }}</DzText>
                </span>
              </figcaption>
            </figure>
          </DzCarouselSlide>
          <DzCarouselDots class="quote-dots" />
        </DzCarousel>
      </section>

      <!-- ── Pricing teaser ───────────────────────────────────── -->
      <section id="pricing" class="pricing">
        <DzCard variant="elevated" padding="lg" class="pricing-card">
          <div class="pricing-head">
            <DzBadge variant="solid" tone="primary" size="sm">Most popular</DzBadge>
            <DzHeading :level="2" size="lg" weight="semibold">Team</DzHeading>
            <p class="price">
              <span class="price-amount">$49</span>
              <span class="price-period">/ month</span>
            </p>
            <DzText size="sm" tone="muted" as="p">Billed annually · per workspace</DzText>
          </div>
          <ul class="plan-list">
            <li v-for="f in planFeatures" :key="f">
              <Check :size="16" aria-hidden="true" /><span>{{ f }}</span>
            </li>
          </ul>
          <DzButton variant="solid" tone="primary" size="lg" class="pricing-cta">
            Start your free trial
          </DzButton>
        </DzCard>
      </section>

      <!-- ── FAQ ──────────────────────────────────────────────── -->
      <section id="faq" class="faq">
        <div class="section-head">
          <DzBadge variant="subtle" tone="primary" size="sm">FAQ</DzBadge>
          <h2 class="section-title">Questions, answered</h2>
        </div>
        <div class="faq-wrap">
          <DzAccordion type="single" collapsible variant="separated">
            <DzAccordionItem v-for="f in FAQS" :key="f.value" :value="f.value">
              <DzAccordionTrigger>{{ f.q }}</DzAccordionTrigger>
              <DzAccordionContent>
                <DzText size="sm" tone="muted" as="p">{{ f.a }}</DzText>
              </DzAccordionContent>
            </DzAccordionItem>
          </DzAccordion>
        </div>
      </section>

      <!-- ── Closing CTA ──────────────────────────────────────── -->
      <section class="cta">
        <div class="cta-inner">
          <h2 class="cta-title">Ship your first dashboard today</h2>
          <DzText size="lg" as="p" class="cta-lede">
            Join thousands of teams making faster decisions on live data.
          </DzText>
          <div class="cta-actions">
            <DzButton variant="solid" tone="neutral" size="lg">Start free</DzButton>
            <DzButton variant="outline" tone="neutral" size="lg">Book a demo</DzButton>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="16" /></span>
        <span class="brand-name">Northwind</span>
      </span>
      <DzText size="sm" tone="muted">© 2026 Northwind Analytics, Inc. All rights reserved.</DzText>
    </footer>
  </div>
</template>

<style scoped>
.lp {
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
.logos,
.features,
.testimonials,
.pricing,
.faq,
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

/* ── Hero ─────────────────────────────────────────────────────── */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(24px, 4vw, 56px);
  align-items: center;
  padding-top: clamp(48px, 7vw, 96px);
  padding-bottom: clamp(48px, 7vw, 96px);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 4.4vw, 3.25rem);
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

.hero-note {
  margin: 0;
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

/* ── Logos ────────────────────────────────────────────────────── */
.logos {
  padding-top: 16px;
  padding-bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.logos-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--dz-font-semibold);
}

.logos-row {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: clamp(20px, 5vw, 52px);
}

.logos-row li {
  font-size: var(--dz-text-xl);
  font-weight: var(--dz-font-bold);
  letter-spacing: -0.01em;
  color: var(--dz-muted-foreground);
  opacity: 0.75;
}

/* ── Shared section heads ─────────────────────────────────────── */
.section-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  margin-bottom: 40px;
}

.section-title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: var(--dz-font-semibold);
}

.section-lede {
  margin: 0;
  max-width: 52ch;
}

.features {
  padding-top: clamp(40px, 6vw, 72px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.feature-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-card {
  height: 100%;
}

.feature-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-bottom: 14px;
  border-radius: var(--dz-radius-lg);
  background: var(--dz-primary-muted);
  color: var(--dz-primary);
}

.feature-title {
  margin-bottom: 6px;
}

/* ── Testimonials ─────────────────────────────────────────────── */
.testimonials {
  padding-top: clamp(40px, 6vw, 72px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.quote-carousel {
  max-width: 720px;
  margin: 0 auto;
}

.quote {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  margin: 0;
  padding: clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px) 8px;
}

.quote-stars {
  display: inline-flex;
  gap: 3px;
  color: var(--dz-warning);
}

.quote-body {
  margin: 0;
  font-size: clamp(1.05rem, 2vw, 1.4rem);
  line-height: 1.5;
  font-weight: var(--dz-font-medium);
  max-width: 52ch;
}

.quote-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quote-meta {
  display: flex;
  flex-direction: column;
  text-align: left;
  line-height: 1.3;
}

.quote-dots {
  margin-top: 18px;
}

/* ── Pricing ──────────────────────────────────────────────────── */
.pricing {
  padding-top: clamp(40px, 6vw, 72px);
  padding-bottom: clamp(40px, 6vw, 72px);
  display: flex;
  justify-content: center;
}

.pricing-card {
  width: 100%;
  max-width: 420px;
}

.pricing-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 6px 0 0;
}

.price-amount {
  font-size: var(--dz-text-4xl);
  font-weight: var(--dz-font-bold);
  letter-spacing: -0.02em;
}

.price-period {
  font-size: var(--dz-text-base);
  color: var(--dz-muted-foreground);
}

.plan-list {
  list-style: none;
  margin: 22px 0;
  padding: 22px 0;
  border-top: 1px solid var(--dz-border);
  border-bottom: 1px solid var(--dz-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: var(--dz-text-sm);
}

.plan-list svg {
  color: var(--dz-success);
  flex: none;
}

.pricing-cta {
  width: 100%;
}

/* ── FAQ ──────────────────────────────────────────────────────── */
.faq {
  padding-top: clamp(40px, 6vw, 72px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.faq-wrap {
  max-width: 720px;
  margin: 0 auto;
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

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-media {
    order: -1;
  }
  .nav-links {
    display: none;
  }
}

@media (max-width: 560px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
