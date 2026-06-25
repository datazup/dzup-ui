<script setup lang="ts">
/**
 * Newsroom / Press — Content template (docs/templates.md §6.5).
 *
 * A chromeless press hub, distinct from the editorial blog pair: a sticky nav, a
 * header with a media-contact line, a pinned-announcement DzCard, a row of "as
 * featured in" wordmarks, a grid of downloadable press-kit DzCards, and a dated
 * DzList of releases with category DzBadges. Leans on the `danger` tone (a rose
 * accent exposed as a local `--accent` token) so it reads in a different colour
 * family than the indigo blog templates. Built only from free `@dzup-ui/core`
 * components, token-styled (no `lp-*`), correct in light + dark from 390px up,
 * and asset-free (icon- and token-driven, no painted artwork).
 */
import {
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzDivider,
  DzHeading,
  DzList,
  DzListItem,
  DzText,
} from '@dzup-ui/core'
import type { Component } from 'vue'
import { ArrowRight, Download, Mail, Megaphone } from 'lucide-vue-next'
import { ICONS } from '../../icons.ts'
import { MEDIA_LOGOS, NEWS, PINNED, PRESS_KITS } from './data.ts'

/** Resolve a registry icon key to its component, falling back to a generic one. */
function iconFor(key: string): Component {
  return ICONS[key] ?? Megaphone
}
</script>

<template>
  <div class="nr">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><Megaphone :size="18" /></span>
          <span class="brand-name">Northwind Newsroom</span>
        </span>
        <DzButton variant="solid" tone="danger" size="sm">
          <template #prefix><Download :size="15" aria-hidden="true" /></template>
          Press kit
        </DzButton>
      </div>
    </header>

    <main class="wrap">
      <!-- ── Header ───────────────────────────────────────────── -->
      <header class="head">
        <div class="head-main">
          <DzBadge variant="subtle" tone="danger" size="sm">Newsroom</DzBadge>
          <DzHeading :level="1" size="3xl" weight="bold" class="head-title">
            News & press
          </DzHeading>
          <DzText size="lg" tone="muted" as="p" class="head-lede">
            Announcements, milestones and media resources from the Northwind team.
          </DzText>
        </div>
        <DzCard variant="outlined" padding="md" class="contact">
          <DzText size="xs" tone="muted" as="div" class="contact-label">Media contact</DzText>
          <div class="contact-row">
            <DzAvatar fallback="PR" size="sm" />
            <div class="contact-meta">
              <DzText size="sm" weight="semibold" as="span">Priya Raman</DzText>
              <DzText size="xs" tone="muted" as="span">Head of Communications</DzText>
            </div>
          </div>
          <DzButton variant="outline" tone="danger" size="sm" class="contact-btn">
            <template #prefix><Mail :size="15" aria-hidden="true" /></template>
            press@northwind.io
          </DzButton>
        </DzCard>
      </header>

      <!-- ── Pinned announcement ──────────────────────────────── -->
      <section aria-label="Featured announcement">
        <DzCard variant="elevated" padding="lg" class="pinned">
          <div class="pinned-meta">
            <DzBadge variant="solid" tone="danger" size="sm">{{ PINNED.badge }}</DzBadge>
            <DzText size="sm" tone="muted" as="span">{{ PINNED.date }}</DzText>
          </div>
          <DzHeading :level="2" size="2xl" weight="bold" class="pinned-title">
            {{ PINNED.title }}
          </DzHeading>
          <DzText size="lg" tone="muted" as="p" class="pinned-excerpt">
            {{ PINNED.excerpt }}
          </DzText>
          <DzButton variant="solid" tone="danger" size="md" class="pinned-cta">
            Read the release
            <template #suffix><ArrowRight :size="16" aria-hidden="true" /></template>
          </DzButton>
        </DzCard>
      </section>

      <!-- ── As featured in ───────────────────────────────────── -->
      <section class="featured-in" aria-label="Media coverage">
        <DzText size="xs" tone="muted" as="div" class="featured-label">As featured in</DzText>
        <ul class="logos">
          <li v-for="logo in MEDIA_LOGOS" :key="logo" class="logo">{{ logo }}</li>
        </ul>
      </section>

      <!-- ── Press resources ──────────────────────────────────── -->
      <section class="kits" aria-label="Press resources">
        <ul class="kit-grid">
          <li v-for="kit in PRESS_KITS" :key="kit.title">
            <DzCard variant="outlined" padding="lg" class="kit">
              <span class="kit-icon" aria-hidden="true">
                <component :is="iconFor(kit.icon)" :size="22" />
              </span>
              <DzText weight="semibold" as="div" class="kit-title">{{ kit.title }}</DzText>
              <DzText size="sm" tone="muted" as="p" class="kit-desc">{{ kit.description }}</DzText>
              <div class="kit-foot">
                <DzText size="xs" tone="muted" as="span">{{ kit.meta }}</DzText>
                <span class="kit-link">
                  Download <Download :size="13" aria-hidden="true" />
                </span>
              </div>
            </DzCard>
          </li>
        </ul>
      </section>

      <!-- ── Recent releases ──────────────────────────────────── -->
      <section class="releases" aria-label="Recent press releases">
        <div class="releases-head">
          <DzHeading :level="2" size="lg" weight="semibold">Recent releases</DzHeading>
          <DzButton variant="ghost" tone="neutral" size="sm">View all →</DzButton>
        </div>

        <DzList variant="divided" interactive class="news-list">
          <DzListItem v-for="(item, i) in NEWS" :key="i">
            <template #prefix>
              <span class="news-date">{{ item.date }}</span>
            </template>
            <div class="news-body">
              <DzBadge :tone="item.tone" variant="subtle" size="sm" class="news-cat">
                {{ item.category }}
              </DzBadge>
              <DzText size="sm" weight="medium" as="span" class="news-title">
                {{ item.title }}
              </DzText>
            </div>
            <template #suffix>
              <ArrowRight :size="16" aria-hidden="true" class="news-arrow" />
            </template>
          </DzListItem>
        </DzList>
      </section>

      <DzDivider />

      <!-- ── Subscribe ────────────────────────────────────────── -->
      <section class="subscribe">
        <div class="subscribe-copy">
          <DzHeading :level="2" size="md" weight="semibold">Stay in the loop</DzHeading>
          <DzText size="sm" tone="muted" as="p">
            Get company news the moment it’s published.
          </DzText>
        </div>
        <DzButton variant="solid" tone="danger" size="md">Subscribe to updates</DzButton>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><Megaphone :size="16" /></span>
        <span class="brand-name">Northwind</span>
      </span>
      <DzText size="sm" tone="muted">© 2026 Northwind. Built with @dzup-ui/core.</DzText>
    </footer>
  </div>
</template>

<style scoped>
.nr {
  /* Local accent — a rose/danger family that sets this page apart from the
     indigo blog templates, while staying theme-aware. */
  --accent: var(--dz-danger, #e11d48);
  --accent-foreground: var(--dz-danger-foreground, #fff);
  --accent-soft: color-mix(in oklch, var(--accent) 13%, transparent);

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
.wrap,
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
  background: var(--accent);
  color: var(--accent-foreground);
}

/* ── Header ───────────────────────────────────────────────────── */
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 28px;
  padding-top: clamp(36px, 5vw, 64px);
  padding-bottom: clamp(24px, 4vw, 40px);
}

.head-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.head-title {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.head-lede {
  margin: 0;
  max-width: 46ch;
  line-height: 1.6;
}

.contact {
  flex: none;
  width: 264px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: var(--dz-font-semibold);
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
}

.contact-btn {
  margin-top: 2px;
  width: 100%;
}

/* ── Pinned ───────────────────────────────────────────────────── */
.pinned {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 100% 0%, var(--accent-soft), transparent 52%),
    var(--dz-card, var(--dz-background));
}

.pinned-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.pinned-title {
  margin: 0 0 12px;
  line-height: 1.18;
  letter-spacing: -0.02em;
  max-width: 24ch;
}

.pinned-excerpt {
  margin: 0 0 20px;
  max-width: 62ch;
  line-height: 1.6;
}

.pinned-cta {
  align-self: flex-start;
}

/* ── As featured in ───────────────────────────────────────────── */
.featured-in {
  padding-top: clamp(32px, 5vw, 48px);
  padding-bottom: clamp(8px, 2vw, 16px);
  text-align: center;
}

.featured-label {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: var(--dz-font-semibold);
  margin-bottom: 14px;
}

.logos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 5vw, 48px);
}

.logo {
  font-family: var(--dz-font-serif, Georgia, serif);
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--dz-muted-foreground);
  opacity: 0.8;
}

/* ── Press kits ───────────────────────────────────────────────── */
.kits {
  padding-top: clamp(32px, 5vw, 56px);
}

.kit-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.kit {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.kit:hover {
  border-color: var(--accent);
  box-shadow: var(--dz-shadow-md);
  transform: translateY(-2px);
}

.kit-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--dz-radius-lg);
  background: var(--accent-soft);
  color: var(--accent);
  margin-bottom: 2px;
}

.kit-title {
  line-height: 1.3;
}

.kit-desc {
  margin: 0;
  line-height: 1.5;
  flex: 1;
}

.kit-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}

.kit-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-semibold);
  color: var(--accent);
}

/* ── Releases ─────────────────────────────────────────────────── */
.releases {
  padding-top: clamp(36px, 5vw, 56px);
}

.releases-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.news-date {
  flex: none;
  width: 48px;
  font-family: var(--dz-font-mono);
  font-size: var(--dz-text-xs);
  font-weight: var(--dz-font-semibold);
  color: var(--accent);
}

.news-body {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.news-cat {
  flex: none;
}

.news-title {
  line-height: 1.4;
}

.news-arrow {
  color: var(--dz-muted-foreground);
}

/* ── Subscribe ────────────────────────────────────────────────── */
.subscribe {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  padding: clamp(28px, 4vw, 40px) 0 clamp(40px, 6vw, 64px);
}

.subscribe-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  .kit-grid {
    grid-template-columns: 1fr;
  }
  .head {
    flex-direction: column;
  }
  .contact {
    width: 100%;
  }
}

@media (max-width: 560px) {
  .news-arrow {
    display: none;
  }
}
</style>
