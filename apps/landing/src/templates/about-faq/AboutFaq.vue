<script setup lang="ts">
/**
 * About & FAQ — Marketing template (docs/templates.md §6.2).
 *
 * A chromeless company page: a mission hero with headline stats, a founding-to-
 * today story on a DzTimeline, a values card grid, a leadership grid of DzAvatar
 * cards with a DzAvatarGroup for the wider team, and a DzAccordion FAQ. Built only
 * from free `@dzup-ui/core` components, token-styled (no `lp-*`), correct in light
 * + dark from 390px up, and asset-free (initials- and token-driven, no artwork).
 */
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzAvatar,
  DzAvatarGroup,
  DzCard,
  DzDivider,
  DzHeading,
  DzText,
  DzTimeline,
  DzTimelineItem,
} from '@dzup-ui/core'
import type { Component } from 'vue'
import {
  Boxes,
  Compass,
  HeartHandshake,
  Leaf,
  Shapes,
  Sparkles,
} from 'lucide-vue-next'
import { MILESTONES, STATS, TEAM, VALUES, WIDER_TEAM, FAQS } from './data.ts'

/** Local map from a value's Lucide key to its component (data stays import-free). */
const VALUE_ICONS: Record<string, Component> = { Compass, HeartHandshake, Sparkles, Leaf }
</script>

<template>
  <div class="about">
    <!-- ── Sticky nav ───────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Boxes :size="18" /></span>
          <span class="brand-name">Northwind</span>
        </span>
        <nav class="nav-links" aria-label="Primary">
          <a class="nav-link" href="#story">Story</a>
          <a class="nav-link" href="#team">Team</a>
          <a class="nav-link" href="#faq">FAQ</a>
        </nav>
      </div>
    </header>

    <main>
      <!-- ── Mission hero ─────────────────────────────────────────── -->
      <section class="hero">
        <span class="eyebrow">
          <Shapes :size="14" aria-hidden="true" />
          About Northwind
        </span>
        <DzHeading :level="1" size="3xl" weight="bold" class="hero-title">
          We make work feel like one place, not nine tabs.
        </DzHeading>
        <DzText size="lg" tone="muted" as="p" class="hero-lede">
          Northwind is the connected workspace 12,000 teams trust to plan, build
          and ship together — calm software for people with real deadlines.
        </DzText>

        <ul class="stats" aria-label="Company at a glance">
          <li v-for="stat in STATS" :key="stat.label" class="stat">
            <DzHeading :level="2" size="2xl" weight="bold" class="stat-value">
              {{ stat.value }}
            </DzHeading>
            <DzText size="sm" tone="muted" as="span">{{ stat.label }}</DzText>
          </li>
        </ul>
      </section>

      <!-- ── Story timeline ───────────────────────────────────────── -->
      <section id="story" class="section" aria-labelledby="story-heading">
        <header class="section-head">
          <DzHeading id="story-heading" :level="2" size="xl" weight="semibold">
            Our story
          </DzHeading>
          <DzText size="md" tone="muted" as="p">
            From two laptops to four continents — the short version.
          </DzText>
        </header>

        <DzTimeline class="timeline">
          <DzTimelineItem
            v-for="milestone in MILESTONES"
            :key="milestone.year"
            :tone="milestone.current ? 'primary' : 'neutral'"
            :status="milestone.year"
          >
            <DzCard variant="outlined" padding="lg" class="milestone">
              <DzHeading :level="3" size="md" weight="semibold">
                {{ milestone.title }}
              </DzHeading>
              <DzText size="sm" tone="muted" as="p" class="milestone-detail">
                {{ milestone.detail }}
              </DzText>
            </DzCard>
          </DzTimelineItem>
        </DzTimeline>
      </section>

      <DzDivider class="band-rule" />

      <!-- ── Values ───────────────────────────────────────────────── -->
      <section class="section" aria-labelledby="values-heading">
        <header class="section-head">
          <DzHeading id="values-heading" :level="2" size="xl" weight="semibold">
            What we optimise for
          </DzHeading>
          <DzText size="md" tone="muted" as="p">
            Four values that act as the tie-breaker when decisions get hard.
          </DzText>
        </header>

        <ul class="value-grid">
          <li v-for="value in VALUES" :key="value.title">
            <DzCard variant="outlined" padding="lg" class="value">
              <span class="value-icon" aria-hidden="true">
                <component :is="VALUE_ICONS[value.icon]" :size="22" />
              </span>
              <DzHeading :level="3" size="md" weight="semibold">{{ value.title }}</DzHeading>
              <DzText size="sm" tone="muted" as="p" class="value-detail">
                {{ value.detail }}
              </DzText>
            </DzCard>
          </li>
        </ul>
      </section>

      <DzDivider class="band-rule" />

      <!-- ── Team ─────────────────────────────────────────────────── -->
      <section id="team" class="section" aria-labelledby="team-heading">
        <header class="section-head">
          <DzHeading id="team-heading" :level="2" size="xl" weight="semibold">
            The people behind it
          </DzHeading>
          <DzText size="md" tone="muted" as="p">
            A small, senior team — and the wider crew that keeps it all moving.
          </DzText>
        </header>

        <ul class="team-grid">
          <li v-for="member in TEAM" :key="member.name">
            <DzCard variant="outlined" padding="lg" class="member">
              <DzAvatar :fallback="member.initials" size="lg" class="member-avatar" />
              <div class="member-body">
                <DzHeading :level="3" size="md" weight="semibold">{{ member.name }}</DzHeading>
                <DzText size="sm" tone="muted" as="span" class="member-role">
                  {{ member.role }}
                </DzText>
                <DzText size="sm" tone="muted" as="p" class="member-blurb">
                  {{ member.blurb }}
                </DzText>
              </div>
            </DzCard>
          </li>
        </ul>

        <DzCard variant="flat" padding="lg" class="wider">
          <DzAvatarGroup :max="6" size="md" aria-label="The wider Northwind team">
            <DzAvatar v-for="initials in WIDER_TEAM" :key="initials" :fallback="initials" />
          </DzAvatarGroup>
          <div class="wider-copy">
            <DzText weight="semibold" as="span">…and 60 more across the company</DzText>
            <DzText size="sm" tone="muted" as="p" class="wider-detail">
              Engineering, design, support and operations in 14 countries — all
              remote, all building in the open.
            </DzText>
          </div>
        </DzCard>
      </section>

      <DzDivider class="band-rule" />

      <!-- ── FAQ ──────────────────────────────────────────────────── -->
      <section id="faq" class="section section--faq" aria-labelledby="faq-heading">
        <header class="section-head">
          <DzHeading id="faq-heading" :level="2" size="xl" weight="semibold">
            Frequently asked
          </DzHeading>
          <DzText size="md" tone="muted" as="p">
            The questions we hear most about the company.
          </DzText>
        </header>

        <DzAccordion type="single" collapsible variant="separated" class="faq-list">
          <DzAccordionItem v-for="faq in FAQS" :key="faq.value" :value="faq.value">
            <DzAccordionTrigger>{{ faq.q }}</DzAccordionTrigger>
            <DzAccordionContent>
              <DzText size="sm" tone="muted" as="p" class="faq-answer">{{ faq.a }}</DzText>
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Boxes :size="16" /></span>
        <span class="brand-name">Northwind</span>
      </span>
      <DzText size="sm" tone="muted">© 2026 Northwind. Built with @dzup-ui/core.</DzText>
    </footer>
  </div>
</template>

<style scoped>
.about {
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
.section,
.footer {
  max-width: 1040px;
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
  align-items: center;
  gap: 22px;
}

.nav-link {
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-medium);
  color: var(--dz-muted-foreground);
  text-decoration: none;
}

.nav-link:hover {
  color: var(--dz-foreground);
}

/* ── Hero ─────────────────────────────────────────────────────── */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding-top: clamp(48px, 7vw, 96px);
  padding-bottom: clamp(32px, 5vw, 56px);
  background: radial-gradient(circle at 50% -8%, color-mix(in oklch, var(--dz-primary) 12%, transparent), transparent 58%);
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: var(--dz-radius-full, 999px);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
  color: var(--dz-primary);
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-semibold);
  letter-spacing: 0.02em;
}

.hero-title {
  margin: 0;
  max-width: 18ch;
  font-size: clamp(2.1rem, 5vw, 3.25rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.hero-lede {
  margin: 0;
  max-width: 56ch;
  line-height: 1.6;
}

.stats {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: clamp(24px, 5vw, 56px);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.stat-value {
  margin: 0;
  letter-spacing: -0.02em;
}

/* ── Sections ─────────────────────────────────────────────────── */
.section {
  padding-top: clamp(40px, 6vw, 72px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.section--faq {
  padding-bottom: clamp(48px, 7vw, 88px);
}

.section-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 28px;
  max-width: 60ch;
}

.band-rule {
  max-width: 1040px;
  margin: 0 auto;
}

/* ── Timeline ─────────────────────────────────────────────────── */
.timeline {
  max-width: 760px;
}

.milestone {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.milestone-detail {
  margin: 0;
  line-height: 1.6;
}

/* ── Values ───────────────────────────────────────────────────── */
.value-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.value {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.value-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--dz-radius-lg);
  background: color-mix(in oklch, var(--dz-primary) 12%, transparent);
  color: var(--dz-primary);
  margin-bottom: 2px;
}

.value-detail {
  margin: 0;
  line-height: 1.6;
}

/* ── Team ─────────────────────────────────────────────────────── */
.team-grid {
  list-style: none;
  margin: 0 0 20px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.member {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.member-avatar {
  flex: none;
}

.member-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.member-role {
  color: var(--dz-primary);
  font-weight: var(--dz-font-medium);
}

.member-blurb {
  margin: 6px 0 0;
  line-height: 1.55;
}

.wider {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  background: var(--dz-muted);
}

.wider-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.wider-detail {
  margin: 0;
  line-height: 1.55;
}

/* ── FAQ ──────────────────────────────────────────────────────── */
.faq-list {
  max-width: 760px;
}

.faq-answer {
  margin: 0;
  line-height: 1.6;
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
@media (max-width: 760px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px 16px;
    width: 100%;
  }
  .value-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .nav-links {
    gap: 16px;
  }
  .member {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
