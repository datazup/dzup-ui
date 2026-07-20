<script setup lang="ts">
import type { Component } from 'vue'
/**
 * Help Center / FAQ — Content template (docs/templates.md §6.5).
 *
 * A chromeless support hub, deliberately distinct from the editorial blog pair:
 * a sticky nav, a centered search hero with popular-query chips, a topic grid of
 * DzCards, a live-filtered DzAccordion of FAQs and a DzAlert "still need help"
 * panel with the support team. Leans on the `info` tone (a teal accent, exposed
 * as a local `--accent` token) so the page reads in a different colour family
 * than the indigo blog templates while staying theme-aware. Built only from free
 * `@dzup-ui/core` components, token-styled (no `lp-*`), correct in light + dark
 * from 390px up, and asset-free (icon- and token-driven, no painted artwork).
 */
import {
  DzAccordion,
  DzAccordionContent,
  DzAccordionItem,
  DzAccordionTrigger,
  DzAlert,
  DzAvatar,
  DzBadge,
  DzButton,
  DzCard,
  DzHeading,
  DzSearchInput,
  DzTag,
  DzText,
} from '@dzup-ui/core'
import { ArrowRight, LifeBuoy, MessageCircle, Search } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { ICONS } from '../../icons.ts'
import { CATEGORIES, FAQS, POPULAR_SEARCHES } from './data.ts'

const query = ref('')

/** Resolve a registry icon key to its component, falling back to a generic one. */
function iconFor(key: string): Component {
  return ICONS[key] ?? LifeBuoy
}

/** FAQs narrowed by the hero search query (matches question + answer). */
const visibleFaqs = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q)
    return FAQS
  return FAQS.filter(
    f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="hc">
    <!-- ── Sticky nav ─────────────────────────────────────────── -->
    <header class="nav">
      <div class="nav-inner">
        <span class="brand">
          <span class="brand-mark" aria-hidden="true"><LifeBuoy :size="18" /></span>
          <span class="brand-name">Beacon Support</span>
        </span>
        <DzButton variant="solid" tone="info" size="sm">
          <template #prefix>
            <MessageCircle :size="15" aria-hidden="true" />
          </template>
          Contact support
        </DzButton>
      </div>
    </header>

    <main>
      <!-- ── Search hero ──────────────────────────────────────── -->
      <section class="hero">
        <DzTag variant="subtle" tone="info" size="sm">
          Help Center
        </DzTag>
        <DzHeading :level="1" size="3xl" weight="bold" class="hero-title">
          How can we help?
        </DzHeading>
        <DzText size="lg" tone="muted" as="p" class="hero-lede">
          Search our guides, browse a topic or reach the team — most questions are
          answered in a couple of clicks.
        </DzText>

        <div class="hero-search">
          <DzSearchInput
            v-model="query"
            placeholder="Search for answers…"
            clearable
            size="lg"
            aria-label="Search the help center"
          />
        </div>

        <div class="suggests">
          <DzText size="sm" tone="muted" as="span" class="suggests-label">
            Popular:
          </DzText>
          <DzTag
            v-for="term in POPULAR_SEARCHES"
            :key="term"
            variant="outline"
            tone="neutral"
            size="sm"
            role="button"
            tabindex="0"
            class="suggest"
            @click="query = term"
            @keydown.enter.prevent="query = term"
            @keydown.space.prevent="query = term"
          >
            {{ term }}
          </DzTag>
        </div>
      </section>

      <!-- ── Topic grid ───────────────────────────────────────── -->
      <section class="topics" aria-label="Browse by topic">
        <ul class="topic-grid">
          <li v-for="cat in CATEGORIES" :key="cat.title">
            <DzCard variant="outlined" padding="lg" class="topic">
              <span class="topic-icon" aria-hidden="true">
                <component :is="iconFor(cat.icon)" :size="22" />
              </span>
              <div class="topic-head">
                <DzText weight="semibold" as="span">
                  {{ cat.title }}
                </DzText>
                <DzBadge variant="subtle" tone="info" size="sm">
                  {{ cat.articles }}
                </DzBadge>
              </div>
              <DzText size="sm" tone="muted" as="p" class="topic-desc">
                {{ cat.description }}
              </DzText>
              <span class="topic-link">
                Browse articles <ArrowRight :size="14" aria-hidden="true" />
              </span>
            </DzCard>
          </li>
        </ul>
      </section>

      <!-- ── FAQ ──────────────────────────────────────────────── -->
      <section class="faq" aria-label="Frequently asked questions">
        <div class="faq-head">
          <DzHeading :level="2" size="xl" weight="semibold">
            Frequently asked
          </DzHeading>
          <DzText size="sm" tone="muted" as="p">
            The quick answers people reach for most.
          </DzText>
        </div>

        <DzAccordion
          v-if="visibleFaqs.length"
          type="single"
          collapsible
          variant="separated"
          class="faq-list"
        >
          <DzAccordionItem v-for="f in visibleFaqs" :key="f.value" :value="f.value">
            <DzAccordionTrigger>{{ f.q }}</DzAccordionTrigger>
            <DzAccordionContent>
              <DzText size="sm" tone="muted" as="p" class="faq-answer">
                {{ f.a }}
              </DzText>
            </DzAccordionContent>
          </DzAccordionItem>
        </DzAccordion>

        <div v-else class="faq-empty">
          <span class="faq-empty-icon" aria-hidden="true"><Search :size="22" /></span>
          <DzText tone="muted" as="p">
            No articles match “{{ query }}”.
          </DzText>
          <DzButton variant="outline" tone="info" size="sm" @click="query = ''">
            Clear search
          </DzButton>
        </div>
      </section>

      <!-- ── Still need help ──────────────────────────────────── -->
      <section class="cta" aria-label="Contact the support team">
        <DzAlert
          tone="info"
          variant="subtle"
          title="Still can’t find what you need?"
          class="cta-alert"
        >
          <DzText size="sm" tone="muted" as="p" class="cta-text">
            Our support team is on hand and typically replies within a couple of
            hours, every day of the week.
          </DzText>
          <template #actions>
            <div class="cta-actions">
              <div class="team" aria-hidden="true">
                <DzAvatar fallback="EI" size="sm" class="team-avatar" />
                <DzAvatar fallback="MP" size="sm" class="team-avatar" />
                <DzAvatar fallback="LN" size="sm" class="team-avatar" />
              </div>
              <DzButton variant="solid" tone="info" size="sm">
                <template #prefix>
                  <MessageCircle :size="15" aria-hidden="true" />
                </template>
                Message the team
              </DzButton>
            </div>
          </template>
        </DzAlert>
      </section>
    </main>

    <footer class="footer">
      <span class="brand">
        <span class="brand-mark" aria-hidden="true"><LifeBuoy :size="16" /></span>
        <span class="brand-name">Beacon Support</span>
      </span>
      <DzText size="sm" tone="muted">
        © 2026 Beacon. Built with @dzup-ui/core.
      </DzText>
    </footer>
  </div>
</template>

<style scoped>
.hc {
  /* Local accent — a teal/info family that sets this page apart from the
     indigo blog templates, yet stays theme-aware (re-themes with the tokens). */
  --accent: var(--dz-info, #0ea5e9);
  --accent-foreground: var(--dz-info-foreground, #fff);
  --accent-soft: color-mix(in oklch, var(--accent) 14%, transparent);

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
.topics,
.faq,
.cta,
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

/* ── Hero ─────────────────────────────────────────────────────── */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14px;
  padding-top: clamp(40px, 6vw, 80px);
  padding-bottom: clamp(28px, 4vw, 48px);
  background:
    radial-gradient(circle at 50% -10%, var(--accent-soft), transparent 55%);
}

.hero-title {
  margin: 0;
  font-size: clamp(2rem, 4.6vw, 3rem);
  line-height: 1.08;
  letter-spacing: -0.025em;
}

.hero-lede {
  margin: 0;
  max-width: 52ch;
  line-height: 1.6;
}

.hero-search {
  width: min(560px, 100%);
  margin-top: 10px;
}

.suggests {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.suggests-label {
  font-weight: var(--dz-font-medium);
}

.suggest {
  cursor: pointer;
  user-select: none;
}

/* ── Topic grid ───────────────────────────────────────────────── */
.topics {
  padding-top: clamp(20px, 3vw, 32px);
}

.topic-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.topic {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.topic:hover {
  border-color: var(--accent);
  box-shadow: var(--dz-shadow-md);
  transform: translateY(-2px);
}

.topic-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--dz-radius-lg);
  background: var(--accent-soft);
  color: var(--accent);
  margin-bottom: 2px;
}

.topic-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.topic-desc {
  margin: 0;
  line-height: 1.55;
  flex: 1;
}

.topic-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--dz-text-sm);
  font-weight: var(--dz-font-semibold);
  color: var(--accent);
}

/* ── FAQ ──────────────────────────────────────────────────────── */
.faq {
  padding-top: clamp(40px, 6vw, 72px);
}

.faq-head {
  text-align: center;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.faq-list {
  max-width: 760px;
  margin: 0 auto;
}

.faq-answer {
  margin: 0;
  line-height: 1.6;
}

.faq-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: clamp(32px, 6vw, 56px) 24px;
  text-align: center;
}

.faq-empty-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--dz-radius-full);
  background: var(--dz-muted);
  color: var(--dz-muted-foreground);
}

/* ── Still need help ──────────────────────────────────────────── */
.cta {
  padding-top: clamp(40px, 6vw, 64px);
  padding-bottom: clamp(40px, 6vw, 72px);
}

.cta-alert {
  max-width: 760px;
  margin: 0 auto;
}

.cta-text {
  margin: 4px 0 0;
  line-height: 1.55;
}

.cta-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.team {
  display: inline-flex;
}

.team-avatar {
  outline: 2px solid var(--dz-background);
  border-radius: var(--dz-radius-full);
}

.team-avatar + .team-avatar {
  margin-left: -10px;
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
  .topic-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .topic-grid {
    grid-template-columns: 1fr;
  }
}
</style>
